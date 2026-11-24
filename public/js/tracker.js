/**
 * Incident Ticket Tracker
 * Dual-mode: (1) lookup by Ticket ID, (2) browseable list of all submissions
 * General Users see only their own reports; IT Personnel & Admin see all.
 */

let _allTrackerIncidents = [];

// ─── INIT ───────────────────────────────────────────────────────────────────
function initTracker() {
  // Wire up ticket-ID lookup form
  const form = document.getElementById('publicTrackerForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('trackerInputId')?.value?.trim();
      if (!id) return;
      await lookupTicketById(id);
    });
  }

  // Wire up search + status filter for the browseable list
  document.getElementById('myReportsSearch')?.addEventListener('input', renderMyReportsList);
  document.getElementById('myReportsStatusFilter')?.addEventListener('change', renderMyReportsList);

  // Load all incidents for the browseable list
  loadMyReports();
}

// ─── LOOKUP BY ID ────────────────────────────────────────────────────────────
async function lookupTicketById(id) {
  const resultBox = document.getElementById('trackerResultBox');
  if (!resultBox) return;

  resultBox.style.display = 'block';
  resultBox.innerHTML = `
    <p style="text-align: center; color: var(--text-secondary); padding: 1rem 0;">
      🔍 Looking up ticket <strong>${id}</strong> in the university incident registry...
    </p>`;

  try {
    const inc = await API.getIncidentById(id);
    renderTrackerResult(inc);
  } catch (err) {
    resultBox.innerHTML = `
      <div style="padding: 1.5rem; text-align: center; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px;">
        <div style="font-size: 1.75rem; margin-bottom: 0.5rem;">❌</div>
        <h3 style="color: var(--risk-critical);">Ticket Not Found</h3>
        <p style="color: var(--text-secondary); margin-top: 0.5rem; font-size: 0.87rem;">
          No incident was found matching Reference ID <strong>"${id}"</strong>.<br>
          Please verify the ticket number format, e.g. <span class="ticket-tag">EDU-CIR-2026-0001</span>
        </p>
      </div>`;
  }
}

// ─── RENDER LOOKUP RESULT ────────────────────────────────────────────────────
function renderTrackerResult(inc) {
  const resultBox = document.getElementById('trackerResultBox');
  if (!resultBox) return;

  const dateStr = new Date(inc.createdAt).toLocaleString('en-KE', {
    dateStyle: 'medium', timeStyle: 'short'
  });

  let recsHtml = '';
  if (inc.recommendations?.reporterActions?.length) {
    recsHtml = `<div style="margin-top: 1rem;">
      <strong style="font-size: 0.85rem; color: var(--accent-blue);">⚠️ Your Safety Instructions:</strong>
      <ul style="margin-top: 0.5rem; padding-left: 1.25rem;">`;
    inc.recommendations.reporterActions.forEach(a => {
      recsHtml += `<li style="margin-bottom: 0.4rem; color: var(--text-primary); font-size: 0.84rem;">
        <strong>${a.action}:</strong> ${a.details}</li>`;
    });
    recsHtml += '</ul></div>';
  }

  const statusClass = (inc.status || 'NEW').replace(/ /g, '_');

  resultBox.innerHTML = `
    <div class="ui-card" style="border-left: 4px solid ${inc.assessment?.color || 'var(--accent-blue)'}; margin: 0;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
        <div>
          <span class="ticket-tag" style="font-size: 1rem;">${inc.id}</span>
          <h2 style="font-size: 1.1rem; margin-top: 0.3rem; color: var(--text-primary);">${inc.title}</h2>
          <div style="color: var(--text-muted); font-size: 0.78rem; margin-top: 2px;">Reported on ${dateStr}</div>
        </div>
        <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
          <span class="badge ${inc.assessment?.badgeClass || ''}">${inc.assessment?.levelLabel || inc.assessment?.level || 'N/A'}</span>
          <span class="badge badge-status ${statusClass}">${statusClass.replace(/_/g, ' ')}</span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem;
                  font-size: 0.84rem; padding: 0.9rem; background: rgba(0,0,0,0.15); border-radius: 8px; margin-bottom: 0.9rem;">
        <div><strong style="color: var(--text-secondary);">Category:</strong><br>${inc.categoryId || '—'}</div>
        <div><strong style="color: var(--text-secondary);">Target Asset:</strong><br>${inc.assetId || '—'}</div>
        <div><strong style="color: var(--text-secondary);">Response SLA:</strong><br>${inc.assessment?.slaLabel || '—'}</div>
        <div><strong style="color: var(--text-secondary);">Investigating Unit:</strong><br>${inc.assignedTo || 'Pending Assignment'}</div>
      </div>

      ${recsHtml}

      <div style="margin-top: 1rem; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.9rem; font-size: 0.82rem; color: var(--text-secondary);">
        🏛️ <strong style="color: var(--accent-blue);">Official ICT Security Notice:</strong>
        This incident is actively logged under institutional Cyber Incident Management protocols.
        If you have additional evidence or notice further anomalies, update your department ICT officer.
      </div>
    </div>`;
}

// ─── LOAD MY REPORTS (BROWSEABLE LIST) ───────────────────────────────────────
async function loadMyReports() {
  const listEl = document.getElementById('myReportsList');
  const badge  = document.getElementById('myReportsCountBadge');
  if (!listEl) return;

  try {
    const incidents = await API.getIncidents();
    _allTrackerIncidents = Array.isArray(incidents) ? incidents : [];
    renderMyReportsList();
  } catch (err) {
    _allTrackerIncidents = [];
    if (listEl) listEl.innerHTML = `
      <div style="text-align:center; padding:2rem; color:var(--text-muted);">
        ⚠️ Unable to load reports. Please check server connection.
      </div>`;
    if (badge) badge.textContent = '0 Reports';
  }
}

function renderMyReportsList() {
  const listEl  = document.getElementById('myReportsList');
  const badge   = document.getElementById('myReportsCountBadge');
  const search  = (document.getElementById('myReportsSearch')?.value || '').toLowerCase().trim();
  const status  = document.getElementById('myReportsStatusFilter')?.value || 'ALL';

  if (!listEl) return;

  // Filter: General Users see only reports submitted with their email (or all if name matches)
  const currentUser = window.Auth?.getCurrentUser();
  const userRole = currentUser?.role || 'GENERAL_USER';

  let filtered = _allTrackerIncidents.filter(inc => {
    // Status filter
    if (status !== 'ALL' && inc.status !== status) return false;
    // Search filter
    if (search) {
      const haystack = [
        inc.id, inc.title, inc.categoryId, inc.status,
        inc.reporter?.name, inc.reporter?.email
      ].join(' ').toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    // Role-based visibility: General Users see reports linked to their email
    if (userRole === 'GENERAL_USER' && currentUser?.email) {
      const repEmail = (inc.reporter?.email || '').toLowerCase();
      if (repEmail && repEmail !== currentUser.email.toLowerCase()) return false;
    }
    return true;
  });

  // Sort: newest first
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (badge) badge.textContent = `${filtered.length} Report${filtered.length !== 1 ? 's' : ''}`;

  if (!filtered.length) {
    listEl.innerHTML = `
      <div style="text-align:center; padding:3rem 1rem; color:var(--text-muted);">
        <div style="font-size:2rem; margin-bottom:0.75rem; opacity:0.4;">📋</div>
        <div>${_allTrackerIncidents.length === 0
          ? 'No incident reports have been submitted yet.<br><br><a href="#" onclick="window.switchTab(\'reportPane\')" style="color:var(--accent-blue);">Report your first incident →</a>'
          : 'No reports match your current filter. Try adjusting the search or status filter.'
        }</div>
      </div>`;
    return;
  }

  listEl.innerHTML = filtered.map(inc => buildReportCard(inc)).join('');
}

function buildReportCard(inc) {
  const dateStr = new Date(inc.createdAt).toLocaleString('en-KE', {
    dateStyle: 'medium', timeStyle: 'short'
  });
  const level     = inc.assessment?.level || 'N/A';
  const badgeCls  = inc.assessment?.badgeClass || 'badge-low';
  const statusCls = (inc.status || 'NEW').replace(/ /g, '_');
  const statusLbl = statusCls.replace(/_/g, ' ');
  const updated   = inc.updatedAt ? new Date(inc.updatedAt).toLocaleString('en-KE', { dateStyle: 'short', timeStyle: 'short' }) : '—';

  // Timeline bar colour
  const colorMap = {
    CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#eab308', LOW: '#22c55e'
  };
  const barColor = colorMap[level] || '#64748b';

  return `
  <div class="ui-card" style="margin-bottom: 1rem; border-left: 4px solid ${barColor}; padding: 1.1rem 1.25rem;">
    <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem;">
      <div>
        <span class="ticket-tag" style="font-size:0.88rem; cursor:pointer;"
          onclick="document.getElementById('trackerInputId').value='${inc.id}'; window.lookupTicketById('${inc.id}'); document.getElementById('trackerResultBox').scrollIntoView({behavior:'smooth'});">
          ${inc.id}
        </span>
        <div style="font-size:0.95rem; font-weight:700; color:var(--text-primary); margin-top:0.3rem;">${inc.title}</div>
        <div style="font-size:0.76rem; color:var(--text-muted); margin-top:2px;">
          📅 Submitted: ${dateStr} &nbsp;|&nbsp; 🔄 Last Updated: ${updated}
        </div>
      </div>
      <div style="display:flex; gap:0.4rem; align-items:center; flex-wrap:wrap;">
        <span class="badge ${badgeCls}">${level}</span>
        <span class="badge badge-status ${statusCls}">${statusLbl}</span>
      </div>
    </div>

    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap:0.6rem;
                margin-top:0.85rem; font-size:0.8rem; padding:0.75rem;
                background:rgba(148,163,184,0.06); border-radius:8px; border:1px solid var(--border-light);">
      <div><span style="color:var(--text-secondary);">Category:</span><br><strong>${inc.categoryId || '—'}</strong></div>
      <div><span style="color:var(--text-secondary);">Asset:</span><br><strong>${inc.assetId || '—'}</strong></div>
      <div><span style="color:var(--text-secondary);">SLA:</span><br><strong>${inc.assessment?.slaLabel || '—'}</strong></div>
      <div><span style="color:var(--text-secondary);">Assigned To:</span><br><strong>${inc.assignedTo || 'Pending'}</strong></div>
    </div>

    <div style="display:flex; gap:0.5rem; margin-top:0.85rem; flex-wrap:wrap; align-items:center;">
      <button class="btn btn-secondary" style="font-size:0.76rem; padding:5px 12px;"
        onclick="if (window.openIncidentModal) { window.openIncidentModal('${inc.id}'); } else { document.getElementById('trackerInputId').value='${inc.id}'; window.lookupTicketById('${inc.id}'); document.getElementById('trackerResultBox').scrollIntoView({behavior:'smooth'}); }">
        🔍 View Full Report
      </button>
      ${inc.assessment?.reporterActions?.length ? `
      <span style="font-size:0.76rem; color:var(--accent-blue);">
        ✅ ${inc.assessment.reporterActions.length} safety instruction${inc.assessment.reporterActions.length !== 1 ? 's' : ''} issued
      </span>` : ''}
    </div>
  </div>`;
}

// ─── PUBLIC API ──────────────────────────────────────────────────────────────
window.initTracker = initTracker;
window.lookupTicketById = lookupTicketById;
window.refreshTracker = function() {
  _allTrackerIncidents = [];
  document.getElementById('trackerResultBox') && (document.getElementById('trackerResultBox').style.display = 'none');
  document.getElementById('trackerInputId') && (document.getElementById('trackerInputId').value = '');
  loadMyReports();
};
