/**
 * Cyber Incident Reporting and Risk Assessment System
 * University and College Cyber Defense Platform
 * Higher Education Cyber Incident Reporting & Risk Assessment System (UniCERT)
 * Prepared by: Naomi Kerubo Onyambu (Reg No: 24/05290)
 * 
 * HTTP Server & PostgreSQL REST API
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const {
  CATEGORIES,
  ASSETS,
  DATA_SENSITIVITY,
  SCOPE_LEVELS,
  ATTACK_STATUS
} = require('./lib/classification');

const { assessRisk } = require('./lib/risk-engine');
const { generateRecommendations } = require('./lib/recommendations');
const db = require('./lib/db');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// MIME types for static assets
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 5 * 1024 * 1024) { // 5MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // ----------------------------------------------------------------
  // REST API ROUTES (POSTGRESQL BACKED)
  // ----------------------------------------------------------------

  // POST /api/auth/register - Register User (General User, IT Personnel, Admin)
  if (method === 'POST' && pathname === '/api/auth/register') {
    try {
      const payload = await parseBody(req);
      if (!payload.email || !payload.password || !payload.name) {
        return sendJSON(res, 400, { error: 'Name, email, and password are required.' });
      }
      const user = await db.registerUser(payload);
      return sendJSON(res, 201, { success: true, user });
    } catch (err) {
      return sendJSON(res, 400, { error: err.message });
    }
  }

  // POST /api/auth/login - Login User
  if (method === 'POST' && pathname === '/api/auth/login') {
    try {
      const payload = await parseBody(req);
      const user = await db.validateCredentials(payload.email, payload.password);
      if (!user) {
        return sendJSON(res, 401, { error: 'Invalid email or password.' });
      }
      return sendJSON(res, 200, { success: true, user });
    } catch (err) {
      return sendJSON(res, 400, { error: 'Login request failed: ' + err.message });
    }
  }

  // GET /api/users - List all users (for Administrator Access Management)
  if (method === 'GET' && pathname === '/api/users') {
    try {
      const users = await db.getAllUsers();
      return sendJSON(res, 200, { count: users.length, users });
    } catch (err) {
      return sendJSON(res, 500, { error: 'Failed to retrieve users: ' + err.message });
    }
  }

  // POST /api/users - Create new authorized user (Administrator Access Management)
  if (method === 'POST' && pathname === '/api/users') {
    try {
      const payload = await parseBody(req);
      if (!payload.email || !payload.password || !payload.name) {
        return sendJSON(res, 400, { error: 'Name, email, and password are required.' });
      }
      const user = await db.registerUser(payload);
      return sendJSON(res, 201, { success: true, user });
    } catch (err) {
      return sendJSON(res, 400, { error: err.message });
    }
  }

  // Match /api/users/:id
  const userMatch = pathname.match(/^\/api\/users\/([a-zA-Z0-9\-_]+)$/);
  if (userMatch) {
    const userId = userMatch[1];
    if (method === 'PATCH') {
      try {
        const payload = await parseBody(req);
        const updated = await db.updateUser(userId, payload);
        if (!updated) {
          return sendJSON(res, 404, { error: `User ${userId} not found` });
        }
        return sendJSON(res, 200, { success: true, user: updated });
      } catch (err) {
        return sendJSON(res, 500, { error: 'Failed to update user: ' + err.message });
      }
    }
    if (method === 'DELETE') {
      try {
        const success = await db.deleteUser(userId);
        if (!success) {
          return sendJSON(res, 404, { error: `User ${userId} not found` });
        }
        return sendJSON(res, 200, { success: true, message: `User ${userId} removed` });
      } catch (err) {
        return sendJSON(res, 500, { error: 'Failed to delete user: ' + err.message });
      }
    }
  }

  // GET /api/taxonomies - Form and taxonomy definitions
  if (method === 'GET' && pathname === '/api/taxonomies') {
    return sendJSON(res, 200, {
      categories: CATEGORIES,
      assets: ASSETS,
      dataSensitivity: DATA_SENSITIVITY,
      scopeLevels: SCOPE_LEVELS,
      attackStatus: ATTACK_STATUS
    });
  }

  // GET /api/stats - Dashboard KPI metrics and distributions (from PostgreSQL)
  if (method === 'GET' && pathname === '/api/stats') {
    try {
      const stats = await db.getDashboardStats();
      return sendJSON(res, 200, stats);
    } catch (err) {
      return sendJSON(res, 500, { error: 'Failed to fetch dashboard stats: ' + err.message });
    }
  }

  // POST /api/assess-preview - Real-time Risk Assessment preview for form
  if (method === 'POST' && pathname === '/api/assess-preview') {
    try {
      const payload = await parseBody(req);
      const assessment = assessRisk(payload);
      return sendJSON(res, 200, assessment);
    } catch (err) {
      return sendJSON(res, 400, { error: 'Invalid assessment request: ' + err.message });
    }
  }

  // GET /api/incidents - List incidents with filters & search (from PostgreSQL)
  if (method === 'GET' && pathname === '/api/incidents') {
    try {
      const { category, riskLevel, status, search } = parsedUrl.query;
      const incidents = await db.getAllIncidents({ category, riskLevel, status, search });
      return sendJSON(res, 200, {
        count: incidents.length,
        incidents
      });
    } catch (err) {
      return sendJSON(res, 500, { error: 'Failed to retrieve incidents: ' + err.message });
    }
  }

  // POST /api/incidents - Submit new incident report (stores in PostgreSQL)
  if (method === 'POST' && pathname === '/api/incidents') {
    try {
      const payload = await parseBody(req);
      if (!payload.title || !payload.categoryId || !payload.assetId) {
        return sendJSON(res, 400, { error: 'Missing mandatory fields: title, categoryId, assetId' });
      }
      const created = await db.createIncident(payload);
      return sendJSON(res, 201, created);
    } catch (err) {
      return sendJSON(res, 500, { error: 'Failed to create incident: ' + err.message });
    }
  }

  // Match /api/incidents/:id
  const incidentMatch = pathname.match(/^\/api\/incidents\/([a-zA-Z0-9\-_]+)$/);
  if (incidentMatch) {
    const incidentId = incidentMatch[1];

    if (method === 'GET') {
      try {
        const incident = await db.getIncidentById(incidentId);
        if (!incident) {
          return sendJSON(res, 404, { error: `Incident ${incidentId} not found` });
        }
        return sendJSON(res, 200, incident);
      } catch (err) {
        return sendJSON(res, 500, { error: 'Failed to fetch incident: ' + err.message });
      }
    }

    if (method === 'PATCH') {
      try {
        const payload = await parseBody(req);
        const updated = await db.updateIncident(incidentId, payload);
        if (!updated) {
          return sendJSON(res, 404, { error: `Incident ${incidentId} not found` });
        }
        return sendJSON(res, 200, updated);
      } catch (err) {
        return sendJSON(res, 500, { error: 'Failed to update incident: ' + err.message });
      }
    }
  }

  // GET /api/export/csv - Export CSV of all incidents from PostgreSQL
  if (method === 'GET' && pathname === '/api/export/csv') {
    try {
      const incidents = await db.getAllIncidents();
      let csv = 'Incident ID,Title,Category,Asset,Risk Level,Risk Score,Status,Reporter,Reported Date\n';
      incidents.forEach(inc => {
        const line = [
          `"${inc.id}"`,
          `"${(inc.title || '').replace(/"/g, '""')}"`,
          `"${inc.categoryId}"`,
          `"${inc.assetId}"`,
          `"${inc.assessment?.level || 'N/A'}"`,
          `"${inc.assessment?.score || 0}"`,
          `"${inc.status}"`,
          `"${inc.reporter?.name || 'Anonymous'}"`,
          `"${inc.createdAt}"`
        ].join(',');
        csv += line + '\n';
      });

      res.writeHead(200, {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="unicert_cyber_incidents_report.csv"'
      });
      return res.end(csv);
    } catch (err) {
      return sendJSON(res, 500, { error: 'Failed to export CSV: ' + err.message });
    }
  }

  // GET /api/export/kenet-cert/:id - Export formal KENET-CERT Incident Dossier from PostgreSQL
  const kenetMatch = pathname.match(/^\/api\/export\/kenet-cert\/([a-zA-Z0-9\-_]+)$/);
  if (method === 'GET' && kenetMatch) {
    try {
      const incidentId = kenetMatch[1];
      const inc = await db.getIncidentById(incidentId);
      if (!inc) {
        return sendJSON(res, 404, { error: `Incident ${incidentId} not found` });
      }

      const dossier = {
        reportingAgency: 'Higher Education Institution Computer Emergency Response Team (UniCERT)',
        recipientAgency: 'Kenya Education Network CERT (KENET-CERT) & National KE-CIRT/CC',
        dossierReference: `KENET-NOTIF-${inc.id}`,
        generatedAt: new Date().toISOString(),
        incidentOverview: {
          ticketId: inc.id,
          summary: inc.title,
          kenetCategory: CATEGORIES[inc.categoryId]?.kenetCategory || inc.categoryId,
          nistFunction: CATEGORIES[inc.categoryId]?.nistFunction || 'RESPOND',
          targetAsset: ASSETS[inc.assetId]?.name || inc.assetId,
          impactedScope: SCOPE_LEVELS[inc.scopeId]?.name || inc.scopeId,
          observedTimestamp: inc.observedAt
        },
        riskQuantification: {
          score: inc.assessment.score,
          level: inc.assessment.level,
          targetSla: inc.assessment.slaLabel,
          factorBreakdown: inc.assessment.factorBreakdown
        },
        technicalIndicators: {
          rawArtifacts: inc.indicators,
          evidenceAttachment: inc.evidenceFileName
        },
        containmentActionsTaken: inc.recommendations?.itTeamPlaybook || [],
        statutoryCompliance: {
          odpcNotificationRequired: inc.assessment.dataProtectionActNotice,
          odpcCitation: 'Kenya Data Protection Act 2019 Section 43 (72-hour notice)'
        }
      };
      return sendJSON(res, 200, dossier);
    } catch (err) {
      return sendJSON(res, 500, { error: 'Failed to export KENET dossier: ' + err.message });
    }
  }

  // ----------------------------------------------------------------
  // GET /api/alerts/campus - Get active campus threat alert
  // ----------------------------------------------------------------
  if (req.method === 'GET' && pathname === '/api/alerts/campus') {
    try {
      const alert = await db.getCampusAlert();
      return sendJSON(res, 200, { alert });
    } catch (err) {
      return sendJSON(res, 500, { error: err.message });
    }
  }

  // ----------------------------------------------------------------
  // POST or PUT /api/alerts/campus - Update active campus threat alert (Admin)
  // ----------------------------------------------------------------
  if ((req.method === 'POST' || req.method === 'PUT') && pathname === '/api/alerts/campus') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const alert = await db.updateCampusAlert(payload);
        return sendJSON(res, 200, { success: true, alert });
      } catch (err) {
        return sendJSON(res, 500, { error: err.message });
      }
    });
    return;
  }

  // ----------------------------------------------------------------
  // STATIC ASSETS SERVING (public/ folder)
  // ----------------------------------------------------------------
  let safePath = pathname === '/' ? '/landing.html' : pathname;
  const resolvedPath = path.normalize(path.join(PUBLIC_DIR, safePath));
  if (!resolvedPath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Access Denied');
  }

  fs.stat(resolvedPath, (err, stats) => {
    if (err || !stats.isFile()) {
      const indexPath = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(indexPath, (readErr, content) => {
        if (readErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          return res.end('404 Not Found');
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(content);
      });
      return;
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(resolvedPath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('Internal Server Error');
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

let currentPort = process.env.PORT || 3000;

async function startServer(port) {
  try {
    // Initialize PostgreSQL Database Schema & Seeds
    await db.initDatabase();
  } catch (err) {
    console.error('Warning: PostgreSQL initialization failed, continuing with fallback:', err.message);
  }

  server.listen(port, () => {
    console.log(`================================================================`);
    console.log(` UniCERT | CYBER INCIDENT REPORTING & RISK ASSESSMENT SYSTEM`);
    console.log(` Multi-Institution Higher Education Cyber Defense Platform`);
    console.log(` Database: PostgreSQL (Connected & Active)`);
    console.log(` System live at: http://localhost:${port}`);
    console.log(`================================================================`);
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${currentPort} in use, trying port ${Number(currentPort) + 1}...`);
    currentPort = Number(currentPort) + 1;
    startServer(currentPort);
  } else {
    console.error('Server error:', err);
  }
});

startServer(currentPort);

module.exports = server;
