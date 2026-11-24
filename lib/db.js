/**
 * PostgreSQL Database Service for UniCERT Platform
 * Handles connection pooling, table migrations, data seeding,
 * and high-performance querying for users and incidents.
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { assessRisk } = require('./risk-engine');
const { generateRecommendations } = require('./recommendations');
const { CATEGORIES } = require('./classification');

// Load environment variables from .env if present
const ENV_PATH = path.join(__dirname, '..', '.env');
if (fs.existsSync(ENV_PATH)) {
  const envContent = fs.readFileSync(ENV_PATH, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...vals] = trimmed.split('=');
      const val = vals.join('=').trim();
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  });
}

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:12345678@localhost:5432/postgres';

const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

// JSON fallback file paths
const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');
const INCIDENTS_FILE = path.join(__dirname, '..', 'data', 'incidents.json');

/**
 * Initialize Database Schema and seed default data if empty
 */
async function initDatabase() {
  const client = await pool.connect();
  try {
    console.log('📦 Connecting to PostgreSQL at:', DATABASE_URL.replace(/:[^:@]+@/, ':****@'));

    // 1. Create Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(64) NOT NULL DEFAULT 'GENERAL_USER',
        identifier VARCHAR(128),
        department VARCHAR(255),
        status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 2. Create Incidents Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS incidents (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        category_id VARCHAR(128) NOT NULL,
        subcategory_id VARCHAR(128),
        asset_id VARCHAR(128) NOT NULL,
        sensitivity_id VARCHAR(128),
        scope_id VARCHAR(128),
        status_id VARCHAR(128),
        description TEXT NOT NULL,
        indicators TEXT,
        credentials_compromised BOOLEAN DEFAULT FALSE,
        financial_loss_suspected BOOLEAN DEFAULT FALSE,
        is_anonymous BOOLEAN DEFAULT FALSE,
        status VARCHAR(64) NOT NULL DEFAULT 'NEW',
        assigned_to VARCHAR(255),
        reporter JSONB,
        assessment JSONB,
        recommendations JSONB,
        triage_notes JSONB DEFAULT '[]'::jsonb,
        observed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Indexes for fast querying & filtering
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_incidents_category ON incidents(category_id);
      CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
      CREATE INDEX IF NOT EXISTS idx_incidents_created ON incidents(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    // 3. Create Campus Alerts Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS campus_alerts (
        id VARCHAR(50) PRIMARY KEY DEFAULT 'current',
        title VARCHAR(300) NOT NULL,
        description TEXT NOT NULL,
        severity VARCHAR(50) DEFAULT 'CRITICAL',
        badge_label VARCHAR(64) DEFAULT 'Active Threat',
        is_active BOOLEAN DEFAULT TRUE,
        updated_by VARCHAR(128) DEFAULT 'Administrator',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const alertCountRes = await client.query('SELECT COUNT(*) FROM campus_alerts');
    if (parseInt(alertCountRes.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO campus_alerts (id, title, description, severity, badge_label, is_active, updated_by, updated_at)
        VALUES (
          'current',
          'Active Campus Alert: Counterfeit Tuition Fee Phishing Scams Circulating',
          'Deceptive WhatsApp & SMS messages promising a 50% tuition subsidy via fake M-PESA links are actively circulating. Never enter your portal password outside official university domains. Report any suspicious messages immediately.',
          'CRITICAL',
          'Active Threat',
          TRUE,
          'Prof. David Mutua (Security Governance)',
          NOW()
        ) ON CONFLICT (id) DO NOTHING;
      `);
      console.log('✅ Seeded default campus threat alert.');
    }

    // 4. Seed Users if table is empty
    const usersCountRes = await client.query('SELECT COUNT(*) FROM users');
    const usersCount = parseInt(usersCountRes.rows[0].count, 10);

    if (usersCount === 0 && fs.existsSync(USERS_FILE)) {
      console.log('🌱 Seeding users into PostgreSQL...');
      const rawUsers = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
      for (const u of rawUsers) {
        await client.query(`
          INSERT INTO users (id, name, email, password, role, identifier, department, status, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO NOTHING;
        `, [
          u.id,
          u.name,
          u.email.toLowerCase(),
          u.password,
          u.role || 'GENERAL_USER',
          u.identifier || 'N/A',
          u.department || 'General',
          u.status || 'ACTIVE',
          u.createdAt || new Date().toISOString()
        ]);
      }
      console.log(`✅ Seeded ${rawUsers.length} users into PostgreSQL.`);
    }

    // 4. Seed Incidents if table is empty
    const incidentsCountRes = await client.query('SELECT COUNT(*) FROM incidents');
    const incidentsCount = parseInt(incidentsCountRes.rows[0].count, 10);

    if (incidentsCount === 0 && fs.existsSync(INCIDENTS_FILE)) {
      console.log('🌱 Seeding incidents into PostgreSQL...');
      const rawIncidents = JSON.parse(fs.readFileSync(INCIDENTS_FILE, 'utf8'));
      for (const inc of rawIncidents) {
        await client.query(`
          INSERT INTO incidents (
            id, title, category_id, subcategory_id, asset_id, sensitivity_id, scope_id, status_id,
            description, indicators, credentials_compromised, financial_loss_suspected, is_anonymous,
            status, assigned_to, reporter, assessment, recommendations, triage_notes, observed_at, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
          ) ON CONFLICT (id) DO NOTHING;
        `, [
          inc.id,
          inc.title,
          inc.categoryId,
          inc.subcategoryId,
          inc.assetId,
          inc.sensitivityId,
          inc.scopeId,
          inc.statusId,
          inc.description,
          inc.indicators || '',
          !!inc.credentialsCompromised,
          !!inc.financialLossSuspected,
          !!(inc.reporter && inc.reporter.isAnonymous),
          inc.status || 'NEW',
          inc.assignedTo || 'Unassigned (Awaiting SOC Triage)',
          JSON.stringify(inc.reporter || {}),
          JSON.stringify(inc.assessment || {}),
          JSON.stringify(inc.recommendations || {}),
          JSON.stringify(inc.triageNotes || []),
          inc.observedAt || inc.createdAt,
          inc.createdAt || new Date().toISOString(),
          inc.createdAt || new Date().toISOString()
        ]);
      }
      console.log(`✅ Seeded ${rawIncidents.length} incidents into PostgreSQL.`);
    }

    console.log('🚀 PostgreSQL database schema and initial data verified.');
    return true;
  } catch (err) {
    console.error('❌ Failed to initialize PostgreSQL database:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

// -----------------------------------------------------------------------------
// USER OPERATIONS (POSTGRESQL)
// -----------------------------------------------------------------------------

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

async function getAllUsers() {
  const res = await pool.query(`
    SELECT id, name, email, role, identifier, department, status, created_at as "createdAt"
    FROM users
    ORDER BY created_at ASC;
  `);
  return res.rows;
}

async function findUserByEmail(email) {
  if (!email) return null;
  const res = await pool.query(`
    SELECT id, name, email, password, role, identifier, department, status, created_at as "createdAt"
    FROM users
    WHERE LOWER(email) = LOWER($1);
  `, [email.trim()]);
  return res.rows[0] || null;
}

async function findUserById(id) {
  if (!id) return null;
  const res = await pool.query(`
    SELECT id, name, email, password, role, identifier, department, status, created_at as "createdAt"
    FROM users
    WHERE id = $1;
  `, [id]);
  return res.rows[0] || null;
}

async function validateCredentials(email, password) {
  const user = await findUserByEmail(email);
  if (!user) return null;
  if (user.password === password) {
    return sanitizeUser(user);
  }
  return null;
}

async function registerUser(data) {
  const email = (data.email || '').trim().toLowerCase();
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const roleUpper = (data.role || 'GENERAL_USER').toUpperCase();
  let role = 'GENERAL_USER';
  let prefix = 'USR-GEN';

  if (roleUpper === 'IT_PERSONNEL' || roleUpper === 'TECH_TEAM' || roleUpper === 'IT_STAFF') {
    role = 'IT_PERSONNEL';
    prefix = 'USR-IT';
  } else if (roleUpper === 'ADMIN' || roleUpper === 'ADMINISTRATOR') {
    role = 'ADMIN';
    prefix = 'USR-ADM';
  }

  const countRes = await pool.query('SELECT COUNT(*) FROM users');
  const count = parseInt(countRes.rows[0].count, 10);
  const id = `${prefix}-${String(count + 1).padStart(3, '0')}`;
  const now = new Date().toISOString();

  const insertRes = await pool.query(`
    INSERT INTO users (id, name, email, password, role, identifier, department, status, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id, name, email, role, identifier, department, status, created_at as "createdAt";
  `, [
    id,
    (data.name || 'Campus User').trim(),
    email,
    data.password || 'password123',
    role,
    (data.identifier || 'N/A').trim(),
    (data.department || 'General Campus').trim(),
    'ACTIVE',
    now
  ]);

  // Sync to local JSON as backup
  try {
    const allUsers = await getAllUsers();
    fs.writeFileSync(USERS_FILE, JSON.stringify(allUsers, null, 2), 'utf8');
  } catch (e) {
    // Non-fatal
  }

  return insertRes.rows[0];
}

async function updateUser(id, updateData) {
  const fields = [];
  const values = [];
  let idx = 1;

  if (updateData.role) {
    fields.push(`role = $${idx++}`);
    values.push(updateData.role);
  }
  if (updateData.status) {
    fields.push(`status = $${idx++}`);
    values.push(updateData.status);
  }
  if (updateData.department) {
    fields.push(`department = $${idx++}`);
    values.push(updateData.department.trim());
  }
  if (updateData.name) {
    fields.push(`name = $${idx++}`);
    values.push(updateData.name.trim());
  }

  if (fields.length === 0) return await findUserById(id);

  values.push(id);
  const query = `
    UPDATE users
    SET ${fields.join(', ')}
    WHERE id = $${idx}
    RETURNING id, name, email, role, identifier, department, status, created_at as "createdAt";
  `;

  const res = await pool.query(query, values);
  if (res.rows.length === 0) return null;

  // Sync to local JSON as backup
  try {
    const allUsers = await getAllUsers();
    fs.writeFileSync(USERS_FILE, JSON.stringify(allUsers, null, 2), 'utf8');
  } catch (e) {
    // Non-fatal
  }

  return res.rows[0];
}

async function deleteUser(id) {
  const res = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id;', [id]);
  return res.rows.length > 0;
}

// -----------------------------------------------------------------------------
// INCIDENT OPERATIONS (POSTGRESQL)
// -----------------------------------------------------------------------------

function mapIncidentRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    categoryId: row.category_id,
    subcategoryId: row.subcategory_id,
    assetId: row.asset_id,
    sensitivityId: row.sensitivity_id,
    scopeId: row.scope_id,
    statusId: row.status_id,
    description: row.description,
    indicators: row.indicators || '',
    credentialsCompromised: row.credentials_compromised,
    financialLossSuspected: row.financial_loss_suspected,
    status: row.status,
    assignedTo: row.assigned_to,
    reporter: typeof row.reporter === 'string' ? JSON.parse(row.reporter) : (row.reporter || {}),
    assessment: typeof row.assessment === 'string' ? JSON.parse(row.assessment) : (row.assessment || {}),
    recommendations: typeof row.recommendations === 'string' ? JSON.parse(row.recommendations) : (row.recommendations || {}),
    triageNotes: typeof row.triage_notes === 'string' ? JSON.parse(row.triage_notes) : (row.triage_notes || []),
    observedAt: row.observed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function generateTicketId() {
  const currentYear = new Date().getFullYear();
  const res = await pool.query('SELECT COUNT(*) FROM incidents');
  const count = parseInt(res.rows[0].count, 10) + 1;
  const padded = String(count).padStart(4, '0');
  return `EDU-CIR-${currentYear}-${padded}`;
}

async function getAllIncidents(filters = {}) {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (filters.category && filters.category !== 'ALL') {
    conditions.push(`category_id = $${idx++}`);
    values.push(filters.category);
  }
  if (filters.riskLevel && filters.riskLevel !== 'ALL') {
    conditions.push(`assessment->>'level' = $${idx++}`);
    values.push(filters.riskLevel);
  }
  if (filters.status && filters.status !== 'ALL') {
    conditions.push(`status = $${idx++}`);
    values.push(filters.status);
  }
  if (filters.search) {
    conditions.push(`(
      id ILIKE $${idx} OR
      title ILIKE $${idx} OR
      description ILIKE $${idx} OR
      reporter->>'name' ILIKE $${idx}
    )`);
    values.push(`%${filters.search.trim()}%`);
    idx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const query = `
    SELECT * FROM incidents
    ${whereClause}
    ORDER BY created_at DESC;
  `;

  const res = await pool.query(query, values);
  return res.rows.map(mapIncidentRow);
}

async function getIncidentById(id) {
  if (!id) return null;
  const res = await pool.query('SELECT * FROM incidents WHERE LOWER(id) = LOWER($1);', [id.trim()]);
  if (res.rows.length === 0) return null;

  const incident = mapIncidentRow(res.rows[0]);
  if (!incident.recommendations || !incident.recommendations.reporterActions) {
    incident.recommendations = generateRecommendations(incident, incident.assessment);
  }
  return incident;
}

async function createIncident(payload) {
  const id = await generateTicketId();

  // Run Risk Assessment Engine (System Objective 3)
  const assessment = assessRisk({
    categoryId: payload.categoryId,
    subcategoryId: payload.subcategoryId,
    assetId: payload.assetId,
    sensitivityId: payload.sensitivityId,
    scopeId: payload.scopeId,
    statusId: payload.statusId,
    financialLossSuspected: !!payload.financialLossSuspected,
    credentialsCompromised: !!payload.credentialsCompromised
  });

  const now = new Date().toISOString();

  const reporter = {
    type: payload.reporterType || 'STUDENT',
    name: payload.isAnonymous ? 'Anonymous' : (payload.reporterName || 'Unknown'),
    identifier: payload.isAnonymous ? 'ANON' : (payload.reporterId || 'N/A'),
    department: payload.reporterDepartment || 'General Campus',
    email: payload.isAnonymous ? '' : (payload.reporterEmail || ''),
    phone: payload.isAnonymous ? '' : (payload.reporterPhone || ''),
    isAnonymous: !!payload.isAnonymous
  };

  const initialTriageNotes = [
    {
      timestamp: now,
      author: 'System (Automated Risk Engine)',
      text: `Incident reported. Automated risk assessment evaluated ${assessment.levelLabel} (Score: ${assessment.score}/100, SLA: ${assessment.slaLabel}).`
    }
  ];

  const incidentEntity = {
    id,
    title: payload.title || 'Untitled Cyber Incident',
    categoryId: payload.categoryId,
    subcategoryId: payload.subcategoryId,
    assetId: payload.assetId,
    sensitivityId: payload.sensitivityId,
    scopeId: payload.scopeId,
    statusId: payload.statusId,
    description: payload.description || '',
    indicators: payload.indicators || '',
    credentialsCompromised: !!payload.credentialsCompromised,
    financialLossSuspected: !!payload.financialLossSuspected,
    isAnonymous: !!payload.isAnonymous,
    status: 'NEW',
    assignedTo: 'Unassigned (Awaiting SOC Triage)',
    reporter,
    assessment,
    triageNotes: initialTriageNotes
  };

  // Generate actionable dual-track containment recommendations
  const recommendations = generateRecommendations(incidentEntity, assessment);

  await pool.query(`
    INSERT INTO incidents (
      id, title, category_id, subcategory_id, asset_id, sensitivity_id, scope_id, status_id,
      description, indicators, credentials_compromised, financial_loss_suspected, is_anonymous,
      status, assigned_to, reporter, assessment, recommendations, triage_notes, observed_at, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
    );
  `, [
    id,
    incidentEntity.title,
    incidentEntity.categoryId,
    incidentEntity.subcategoryId,
    incidentEntity.assetId,
    incidentEntity.sensitivityId,
    incidentEntity.scopeId,
    incidentEntity.statusId,
    incidentEntity.description,
    incidentEntity.indicators,
    incidentEntity.credentialsCompromised,
    incidentEntity.financialLossSuspected,
    incidentEntity.isAnonymous,
    incidentEntity.status,
    incidentEntity.assignedTo,
    JSON.stringify(reporter),
    JSON.stringify(assessment),
    JSON.stringify(recommendations),
    JSON.stringify(initialTriageNotes),
    payload.observedAt || now,
    now,
    now
  ]);

  incidentEntity.recommendations = recommendations;
  incidentEntity.createdAt = now;
  incidentEntity.updatedAt = now;

  // Sync to local JSON backup
  try {
    const all = await getAllIncidents();
    fs.writeFileSync(INCIDENTS_FILE, JSON.stringify(all, null, 2), 'utf8');
  } catch (e) {
    // Non-fatal
  }

  return incidentEntity;
}

async function updateIncident(id, updates) {
  const current = await getIncidentById(id);
  if (!current) return null;

  const now = new Date().toISOString();
  let updatedStatus = current.status;
  let updatedAssignedTo = current.assignedTo;
  let updatedNotes = current.triageNotes || [];

  if (updates.status) {
    updatedStatus = updates.status;
  }
  if (updates.assignedTo) {
    updatedAssignedTo = updates.assignedTo;
  }
  if (updates.newNote) {
    updatedNotes.unshift({
      timestamp: now,
      author: updates.noteAuthor || 'Technical Supervisor',
      text: updates.newNote
    });
  }

  const res = await pool.query(`
    UPDATE incidents
    SET status = $1, assigned_to = $2, triage_notes = $3, updated_at = $4
    WHERE LOWER(id) = LOWER($5)
    RETURNING *;
  `, [
    updatedStatus,
    updatedAssignedTo,
    JSON.stringify(updatedNotes),
    now,
    id.trim()
  ]);

  if (res.rows.length === 0) return null;
  const updatedIncident = mapIncidentRow(res.rows[0]);

  // Sync to local JSON backup
  try {
    const all = await getAllIncidents();
    fs.writeFileSync(INCIDENTS_FILE, JSON.stringify(all, null, 2), 'utf8');
  } catch (e) {
    // Non-fatal
  }

  return updatedIncident;
}

async function getDashboardStats() {
  const incidents = await getAllIncidents();
  const total = incidents.length;

  const byRiskLevel = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  const byStatus = { NEW: 0, UNDER_INVESTIGATION: 0, CONTAINED: 0, RESOLVED: 0, CLOSED: 0 };
  const byCategory = {};
  const byAsset = {};

  Object.values(CATEGORIES).forEach(c => {
    byCategory[c.id] = { name: c.name, count: 0 };
  });

  incidents.forEach(inc => {
    const level = inc.assessment?.level;
    if (level && byRiskLevel[level] !== undefined) {
      byRiskLevel[level]++;
    }

    const st = inc.status;
    if (st && byStatus[st] !== undefined) {
      byStatus[st]++;
    }

    if (inc.categoryId) {
      if (!byCategory[inc.categoryId]) {
        byCategory[inc.categoryId] = { name: inc.categoryId, count: 0 };
      }
      byCategory[inc.categoryId].count++;
    }

    if (inc.assetId) {
      if (!byAsset[inc.assetId]) {
        byAsset[inc.assetId] = { name: inc.assetId.replace(/_/g, ' '), count: 0 };
      }
      byAsset[inc.assetId].count++;
    }
  });

  return {
    total,
    byRiskLevel,
    byStatus,
    byCategory,
    byAsset,
    recentIncidents: incidents.slice(0, 7)
  };
}

// -----------------------------------------------------------------------------
// Campus Threat Alert Operations (Updateable by Administrator)
// -----------------------------------------------------------------------------
async function getCampusAlert() {
  try {
    const res = await pool.query('SELECT * FROM campus_alerts WHERE id = $1', ['current']);
    if (res.rows.length === 0) {
      return {
        id: 'current',
        title: 'Active Campus Alert: Counterfeit Tuition Fee Phishing Scams Circulating',
        description: 'Deceptive WhatsApp & SMS messages promising a 50% tuition subsidy via fake M-PESA links are actively circulating. Never enter your portal password outside official university domains. Report any suspicious messages immediately.',
        severity: 'CRITICAL',
        badgeLabel: 'Active Threat',
        isActive: true,
        updatedBy: 'Administrator',
        updatedAt: new Date().toISOString()
      };
    }
    const r = res.rows[0];
    return {
      id: r.id,
      title: r.title,
      description: r.description,
      severity: r.severity,
      badgeLabel: r.badge_label,
      isActive: r.is_active,
      updatedBy: r.updated_by,
      updatedAt: r.updated_at
    };
  } catch (err) {
    console.error('Error fetching campus alert from DB:', err.message);
    return {
      id: 'current',
      title: 'Active Campus Alert: Counterfeit Tuition Fee Phishing Scams Circulating',
      description: 'Deceptive WhatsApp & SMS messages promising a 50% tuition subsidy via fake M-PESA links are actively circulating. Never enter your portal password outside official university domains. Report any suspicious messages immediately.',
      severity: 'CRITICAL',
      badgeLabel: 'Active Threat',
      isActive: true,
      updatedBy: 'Administrator',
      updatedAt: new Date().toISOString()
    };
  }
}

async function updateCampusAlert(data) {
  const title = (data.title || '').trim();
  const description = (data.description || '').trim();
  const severity = (data.severity || 'CRITICAL').toUpperCase();
  const badgeLabel = (data.badgeLabel || 'Active Threat').trim();
  const isActive = data.isActive !== false;
  const updatedBy = (data.updatedBy || 'Administrator').trim();

  const query = `
    INSERT INTO campus_alerts (id, title, description, severity, badge_label, is_active, updated_by, updated_at)
    VALUES ('current', $1, $2, $3, $4, $5, $6, NOW())
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      severity = EXCLUDED.severity,
      badge_label = EXCLUDED.badge_label,
      is_active = EXCLUDED.is_active,
      updated_by = EXCLUDED.updated_by,
      updated_at = NOW()
    RETURNING *;
  `;
  const res = await pool.query(query, [title, description, severity, badgeLabel, isActive, updatedBy]);
  const r = res.rows[0];
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    severity: r.severity,
    badgeLabel: r.badge_label,
    isActive: r.is_active,
    updatedBy: r.updated_by,
    updatedAt: r.updated_at
  };
}

module.exports = {
  pool,
  initDatabase,
  // User operations
  getAllUsers,
  findUserByEmail,
  findUserById,
  validateCredentials,
  registerUser,
  updateUser,
  deleteUser,
  sanitizeUser,
  // Incident operations
  getAllIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  getDashboardStats,
  generateTicketId,
  // Campus Alert operations
  getCampusAlert,
  updateCampusAlert
};
