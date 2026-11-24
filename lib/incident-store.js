/**
 * Incident Storage & Data Management Service
 * Handles persistence to data/incidents.json, search/filter operations,
 * ticket generation, and analytics aggregation.
 */

const fs = require('fs');
const path = require('path');
const { assessRisk } = require('./risk-engine');
const { generateRecommendations } = require('./recommendations');
const { CATEGORIES, ASSETS, DATA_SENSITIVITY, SCOPE_LEVELS, ATTACK_STATUS } = require('./classification');

const DATA_FILE = path.join(__dirname, '..', 'data', 'incidents.json');

function readIncidents() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading incidents file:', err);
    return [];
  }
}

function saveIncidents(incidents) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(incidents, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving incidents file:', err);
    return false;
  }
}

function generateTicketId() {
  const incidents = readIncidents();
  const currentYear = new Date().getFullYear();
  const count = incidents.length + 1;
  const padded = String(count).padStart(4, '0');
  return `EDU-CIR-${currentYear}-${padded}`;
}

function getAllIncidents(filters = {}) {
  let list = readIncidents();

  if (filters.category && filters.category !== 'ALL') {
    list = list.filter(i => i.categoryId === filters.category);
  }
  if (filters.riskLevel && filters.riskLevel !== 'ALL') {
    list = list.filter(i => i.assessment && i.assessment.level === filters.riskLevel);
  }
  if (filters.status && filters.status !== 'ALL') {
    list = list.filter(i => i.status === filters.status);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(i => 
      (i.id && i.id.toLowerCase().includes(q)) ||
      (i.title && i.title.toLowerCase().includes(q)) ||
      (i.description && i.description.toLowerCase().includes(q)) ||
      (i.reporter && i.reporter.name && i.reporter.name.toLowerCase().includes(q))
    );
  }

  // Sort newest first
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return list;
}

function getIncidentById(id) {
  const incidents = readIncidents();
  const found = incidents.find(i => i.id.toLowerCase() === id.toLowerCase());
  if (!found) return null;

  // Enrich with live recommendations if not already present
  if (!found.recommendations) {
    found.recommendations = generateRecommendations(found, found.assessment);
  }
  return found;
}

function createIncident(payload) {
  const incidents = readIncidents();
  const id = generateTicketId();

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

  const newIncident = {
    id,
    title: payload.title || 'Untitled Cyber Incident',
    reporter: {
      type: payload.reporterType || 'STUDENT',
      name: payload.isAnonymous ? 'Anonymous' : (payload.reporterName || 'Unknown'),
      identifier: payload.isAnonymous ? 'ANON' : (payload.reporterId || 'N/A'),
      department: payload.reporterDepartment || 'General Campus',
      email: payload.isAnonymous ? '' : (payload.reporterEmail || ''),
      phone: payload.isAnonymous ? '' : (payload.reporterPhone || ''),
      isAnonymous: !!payload.isAnonymous
    },
    categoryId: payload.categoryId,
    subcategoryId: payload.subcategoryId,
    assetId: payload.assetId,
    sensitivityId: payload.sensitivityId,
    scopeId: payload.scopeId,
    statusId: payload.statusId,
    observedAt: payload.observedAt || now,
    createdAt: now,
    status: 'NEW',
    assignedTo: 'Unassigned (Awaiting SOC Triage)',
    description: payload.description || '',
    indicators: payload.indicators || '',
    financialLossSuspected: !!payload.financialLossSuspected,
    credentialsCompromised: !!payload.credentialsCompromised,
    evidenceFileName: payload.evidenceFileName || null,
    assessment,
    triageNotes: [
      {
        timestamp: now,
        author: 'System (Rule Engine)',
        text: `Incident reported. Automated risk assessment assigned ${assessment.levelLabel} (Score: ${assessment.score}/100, SLA: ${assessment.slaLabel}).`
      }
    ]
  };

  // Generate actionable recommendations (System Objective 4)
  newIncident.recommendations = generateRecommendations(newIncident, assessment);

  incidents.push(newIncident);
  saveIncidents(incidents);

  return newIncident;
}

function updateIncident(id, updates) {
  const incidents = readIncidents();
  const index = incidents.findIndex(i => i.id.toLowerCase() === id.toLowerCase());
  if (index === -1) return null;

  const current = incidents[index];
  const now = new Date().toISOString();

  if (updates.status) {
    current.status = updates.status;
  }
  if (updates.assignedTo) {
    current.assignedTo = updates.assignedTo;
  }
  if (updates.newNote) {
    if (!current.triageNotes) current.triageNotes = [];
    current.triageNotes.push({
      timestamp: now,
      author: updates.noteAuthor || 'IT Security Staff',
      text: updates.newNote
    });
  }

  incidents[index] = current;
  saveIncidents(incidents);
  return current;
}

function getDashboardStats() {
  const incidents = readIncidents();

  const total = incidents.length;
  const critical = incidents.filter(i => i.assessment && i.assessment.level === 'CRITICAL').length;
  const high = incidents.filter(i => i.assessment && i.assessment.level === 'HIGH').length;
  const medium = incidents.filter(i => i.assessment && i.assessment.level === 'MEDIUM').length;
  const low = incidents.filter(i => i.assessment && i.assessment.level === 'LOW').length;

  const statusCounts = {
    NEW: incidents.filter(i => i.status === 'NEW').length,
    UNDER_INVESTIGATION: incidents.filter(i => i.status === 'UNDER_INVESTIGATION').length,
    CONTAINED: incidents.filter(i => i.status === 'CONTAINED').length,
    RESOLVED: incidents.filter(i => i.status === 'RESOLVED').length,
    CLOSED: incidents.filter(i => i.status === 'CLOSED').length
  };

  // Category distribution
  const categoryCounts = {};
  Object.keys(CATEGORIES).forEach(k => {
    categoryCounts[k] = {
      name: CATEGORIES[k].name,
      count: incidents.filter(i => i.categoryId === k).length
    };
  });

  // Target Assets distribution
  const assetCounts = {};
  Object.keys(ASSETS).forEach(k => {
    assetCounts[k] = {
      name: ASSETS[k].name,
      count: incidents.filter(i => i.assetId === k).length
    };
  });

  return {
    total,
    byRiskLevel: {
      CRITICAL: critical,
      HIGH: high,
      MEDIUM: medium,
      LOW: low
    },
    byStatus: statusCounts,
    byCategory: categoryCounts,
    byAsset: assetCounts,
    recentIncidents: incidents.slice(-5).reverse()
  };
}

module.exports = {
  getAllIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  getDashboardStats,
  generateTicketId
};
