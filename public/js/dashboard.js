/**
 * Multi-Role Dashboard & SOC Analytics Controller
 * Supports 3-Tier Institutional Role Hierarchy (Proposal Section 2.3):
 * 1. General User Dashboard (Students, Lecturers, Staff)
 * 2. IT Personnel / Technical Team Crisis Command Center
 * 3. Administrator Governance & User Access Management Console
 */

async function refreshAllDashboards() {
  const user = window.Auth ? window.Auth.getCurrentUser() : { role: 'GENERAL_USER' };

  try {
    const stats = await API.getStats();
    const allInc = await API.getIncidents();

    // 1. Render General User Dashboard
    renderUserDashboard(allInc.incidents, user);

    // 2. Render Technical Team Supervisor Dashboard
    renderTechSupervisorDashboard(stats, allInc.incidents);

    // 3. Render Administrator Executive Dashboard
    renderAdminDashboard(stats, allInc.incidents);

    // 4. Load & Synchronize Campus Threat Alert Bulletin
    await loadCampusAlert();
  } catch (err) {
    console.error('Failed to load dashboard metrics:', err);
  }
}

// -----------------------------------------------------------------------------
// 1. GENERAL USER DASHBOARD (Students, Lecturers, Staff)
// -----------------------------------------------------------------------------
function renderUserDashboard(allIncidents, user) {
  const container = document.getElementById('userReportsTableBody') || document.getElementById('studentReportsTableBody');
  const countBadge = document.getElementById('userActiveCount') || document.getElementById('studentActiveCount');
  if (!container) return;

  const userEmail = (user?.email || '').toLowerCase();
  const userName = (user?.name || '').toLowerCase();

  // Filter incidents reported by this user or general community reports
  let myReports = allIncidents.filter(i => {
    const rEmail = (i.reporter?.email || '').toLowerCase();
    const rName = (i.reporter?.name || '').toLowerCase();
    const rRole = (i.reporter?.role || i.reporter?.type || '').toUpperCase();
    return (rEmail && rEmail === userEmail) || (rName && rName === userName) || rRole === 'STUDENT' || rRole === 'STAFF';
  });

  if (countBadge) {
    countBadge.textContent = `${myReports.length} Submitted Incident(s)`;
  }

  container.innerHTML = '';
  if (myReports.length === 0) {
    container.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">You have not reported any incidents yet. Click "Report Incident" if you notice suspicious campus cyber activity.</td></tr>`;
    return;
  }

  myReports.slice(0, 8).forEach(inc => {
    const tr = document.createElement('tr');
    tr.addEventListener('click', () => {
      if (window.openIncidentModal) window.openIncidentModal(inc.id);
    });

    const d = new Date(inc.createdAt).toLocaleDateString('en-KE', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    tr.innerHTML = `
      <td><span class="ticket-tag">${inc.id}</span></td>
      <td style="font-weight: 600; max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${inc.title}</td>
      <td><span class="badge ${inc.assessment?.badgeClass || ''}">${inc.assessment?.level || 'N/A'}</span></td>
      <td><span class="badge badge-status ${inc.status}">${inc.status.replace(/_/g, ' ')}</span></td>
      <td style="color: var(--text-muted); font-size: 0.8rem;">${d}</td>
    `;
    container.appendChild(tr);
  });
}

// Backwards-compatible alias
const renderStudentDashboard = renderUserDashboard;

// -----------------------------------------------------------------------------
// 2. IT PERSONNEL / TECHNICAL TEAM SUPERVISOR DASHBOARD
// -----------------------------------------------------------------------------
function renderTechSupervisorDashboard(stats, allIncidents) {
  // KPI Elements
  const elTotal = document.getElementById('kpiTotal');
  const elCritical = document.getElementById('kpiCritical');
  const elHigh = document.getElementById('kpiHigh');
  const elInvestigating = document.getElementById('kpiInvestigating');
  const elResolved = document.getElementById('kpiResolved');

  if (elTotal) elTotal.textContent = stats.total || 0;
  if (elCritical) elCritical.textContent = stats.byRiskLevel?.CRITICAL || 0;
  if (elHigh) elHigh.textContent = stats.byRiskLevel?.HIGH || 0;
  if (elInvestigating) elInvestigating.textContent = (stats.byStatus?.UNDER_INVESTIGATION || 0) + (stats.byStatus?.NEW || 0);
  if (elResolved) elResolved.textContent = (stats.byStatus?.RESOLVED || 0) + (stats.byStatus?.CONTAINED || 0);

  // Category Distribution Bar Chart
  renderCategoryChart(stats.byCategory, stats.total);

  // Risk Distribution Matrix
  renderRiskDistribution(stats.byRiskLevel, stats.total);

  // Target Assets Chart
  renderAssetChart(stats.byAsset, stats.total);

  // Recent Incidents Threat Stream
  renderRecentIncidents(stats.recentIncidents);
}

function renderCategoryChart(categoryData, total) {
  const container = document.getElementById('categoryChartContainer');
  if (!container || !categoryData) return;

  container.innerHTML = '';
  const entries = Object.entries(categoryData);
  entries.sort((a, b) => b[1].count - a[1].count);

  entries.forEach(([key, val]) => {
    const pct = total > 0 ? Math.round((val.count / total) * 100) : 0;
    const row = document.createElement('div');
    row.className = 'bar-chart-row';
    row.innerHTML = `
      <div class="bar-label" title="${val.name}">${val.name}</div>
      <div class="bar-track">
        <div class="bar-fill" style="width: ${pct}%"></div>
      </div>
      <div class="bar-value">${val.count}</div>
    `;
    container.appendChild(row);
  });
}

function renderRiskDistribution(riskData, total) {
  const container = document.getElementById('riskPillGrid');
  if (!container || !riskData) return;

  const crit = riskData.CRITICAL || 0;
  const high = riskData.HIGH || 0;
  const med = riskData.MEDIUM || 0;
  const low = riskData.LOW || 0;

  const getPct = (val) => total > 0 ? Math.round((val / total) * 100) : 0;

  container.innerHTML = `
    <div class="risk-pill-box critical">
      <div class="risk-pill-title" style="color: var(--risk-critical)">🔴 Critical Risk</div>
      <div class="risk-pill-count" style="color: var(--risk-critical)">${crit} <span style="font-size: 0.85rem; font-weight: normal">(${getPct(crit)}%)</span></div>
      <div class="risk-pill-sla">SLA: &lt; 1 Hour | Mandatory SOC Isolation</div>
    </div>
    <div class="risk-pill-box high">
      <div class="risk-pill-title" style="color: var(--risk-high)">🟠 High Risk</div>
      <div class="risk-pill-count" style="color: var(--risk-high)">${high} <span style="font-size: 0.85rem; font-weight: normal">(${getPct(high)}%)</span></div>
      <div class="risk-pill-sla">SLA: &lt; 4 Hours | Urgent Technical Response</div>
    </div>
    <div class="risk-pill-box medium">
      <div class="risk-pill-title" style="color: var(--risk-medium)">🟡 Medium Risk</div>
      <div class="risk-pill-count" style="color: var(--risk-medium)">${med} <span style="font-size: 0.85rem; font-weight: normal">(${getPct(med)}%)</span></div>
      <div class="risk-pill-sla">SLA: &lt; 24 Hours | Standard Triage SOP</div>
    </div>
    <div class="risk-pill-box low">
      <div class="risk-pill-title" style="color: var(--risk-low)">🟢 Low Risk</div>
      <div class="risk-pill-count" style="color: var(--risk-low)">${low} <span style="font-size: 0.85rem; font-weight: normal">(${getPct(low)}%)</span></div>
      <div class="risk-pill-sla">SLA: &lt; 72 Hours | Routine Verification</div>
    </div>
  `;
}

function renderAssetChart(assetData, total) {
  const container = document.getElementById('assetChartContainer');
  if (!container || !assetData) return;

  container.innerHTML = '';
  const entries = Object.entries(assetData);
  entries.sort((a, b) => b[1].count - a[1].count);

  entries.slice(0, 6).forEach(([key, val]) => {
    const pct = total > 0 ? Math.round((val.count / total) * 100) : 0;
    const row = document.createElement('div');
    row.className = 'bar-chart-row';
    row.innerHTML = `
      <div class="bar-label" title="${val.name}">${val.name}</div>
      <div class="bar-track">
        <div class="bar-fill purple-fill" style="width: ${pct}%"></div>
      </div>
      <div class="bar-value">${val.count}</div>
    `;
    container.appendChild(row);
  });
}

function renderRecentIncidents(recentList) {
  const tbody = document.getElementById('recentIncidentsTableBody');
  if (!tbody || !recentList) return;

  tbody.innerHTML = '';
  recentList.forEach(inc => {
    const tr = document.createElement('tr');
    tr.addEventListener('click', () => {
      if (window.openIncidentModal) window.openIncidentModal(inc.id);
    });

    const formattedDate = new Date(inc.createdAt).toLocaleDateString('en-KE', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    tr.innerHTML = `
      <td><span class="ticket-tag">${inc.id}</span></td>
      <td style="font-weight: 600; max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${inc.title}</td>
      <td><span class="badge ${inc.assessment?.badgeClass || ''}">${inc.assessment?.level || 'N/A'}</span></td>
      <td><span class="badge badge-status ${inc.status}">${inc.status.replace(/_/g, ' ')}</span></td>
      <td style="color: var(--text-muted); font-size: 0.8rem">${formattedDate}</td>
    `;
    tbody.appendChild(tr);
  });
}

// -----------------------------------------------------------------------------
// 3. ADMINISTRATOR GOVERNANCE DASHBOARD
// -----------------------------------------------------------------------------
function renderAdminDashboard(stats, allIncidents) {
  const elTotal = document.getElementById('adminKpiTotalIncidents');
  const elStatutory = document.getElementById('adminKpiStatutoryBreaches');
  const elScore = document.getElementById('adminKpiComplianceScore');

  if (elTotal) elTotal.textContent = stats.total || 0;

  // Calculate statutory notifications (Critical incidents requiring KENET or ODPC 72-hr escalation)
  const statutoryCount = allIncidents.filter(i => 
    i.assessment?.kenetEscalationRequired || i.assessment?.dataProtectionActNotice
  ).length;

  if (elStatutory) elStatutory.textContent = statutoryCount;
  if (elScore) elScore.textContent = '98.4%';

  // Render Department Risk Distribution
  renderAdminDeptBreakdown(allIncidents);

  // Render Executive Incidents Archive Table
  renderAdminExecutiveTable(allIncidents);
}

function renderAdminDeptBreakdown(allIncidents) {
  const container = document.getElementById('adminDeptBreakdownContainer');
  if (!container) return;

  const depts = {};
  allIncidents.forEach(inc => {
    const dept = inc.reporter?.department || 'General Campus';
    depts[dept] = (depts[dept] || 0) + 1;
  });

  const sorted = Object.entries(depts).sort((a, b) => b[1] - a[1]);
  const total = allIncidents.length || 1;

  container.innerHTML = '';
  sorted.slice(0, 6).forEach(([name, count]) => {
    const pct = Math.round((count / total) * 100);
    const row = document.createElement('div');
    row.className = 'bar-chart-row';
    row.innerHTML = `
      <div class="bar-label" title="${name}">${name}</div>
      <div class="bar-track">
        <div class="bar-fill" style="width: ${pct}%; background: linear-gradient(90deg, #d97706, #f59e0b);"></div>
      </div>
      <div class="bar-value">${count}</div>
    `;
    container.appendChild(row);
  });
}

function renderAdminExecutiveTable(allIncidents) {
  const tbody = document.getElementById('adminExecutiveIncidentsTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  allIncidents.slice(0, 10).forEach(inc => {
    const tr = document.createElement('tr');
    tr.addEventListener('click', () => {
      if (window.openIncidentModal) window.openIncidentModal(inc.id);
    });

    const d = new Date(inc.createdAt).toLocaleDateString('en-KE', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    tr.innerHTML = `
      <td><span class="ticket-tag">${inc.id}</span></td>
      <td style="font-weight: 600;">${inc.title}</td>
      <td><span class="badge ${inc.assessment?.badgeClass || ''}">${inc.assessment?.level || 'N/A'}</span></td>
      <td><span class="badge badge-status ${inc.status}">${inc.status.replace(/_/g, ' ')}</span></td>
      <td>${inc.reporter?.name || 'Anonymous'} (${inc.reporter?.role || 'General'})</td>
      <td style="color: var(--text-muted); font-size: 0.8rem;">${d}</td>
    `;
    tbody.appendChild(tr);
  });
}

// -----------------------------------------------------------------------------
// 4. USER ACCESS MANAGEMENT (FOR ADMINISTRATOR ROLE)
// -----------------------------------------------------------------------------
async function refreshUserManagement() {
  const tbody = document.getElementById('userManagementTableBody');
  const countBadge = document.getElementById('adminTotalUsersBadge');
  const kpiUsers = document.getElementById('adminKpiTotalUsers');
  if (!tbody) return;

  try {
    const res = await API.getUsers();
    const users = res.users || [];

    if (countBadge) countBadge.textContent = `${users.length} Authorized Users`;
    if (kpiUsers) kpiUsers.textContent = users.length;

    tbody.innerHTML = '';
    users.forEach(u => {
      const tr = document.createElement('tr');
      const roleBadge = u.role === 'ADMIN' ? 'badge-admin' : (u.role === 'IT_PERSONNEL' ? 'badge-tech' : 'badge-user');
      const roleLabel = u.role === 'ADMIN' ? 'Administrator' : (u.role === 'IT_PERSONNEL' ? 'IT Personnel' : 'General User');
      const isSuspended = u.status === 'SUSPENDED';

      tr.innerHTML = `
        <td><strong style="color: var(--accent-blue); font-family: monospace;">${u.id}</strong></td>
        <td><strong>${u.name}</strong></td>
        <td style="color: var(--text-secondary);">${u.email}</td>
        <td>${u.identifier || 'N/A'}</td>
        <td>${u.department || 'General'}</td>
        <td><span class="role-pill-badge ${roleBadge}">${roleLabel}</span></td>
        <td>
          <span class="badge" style="background: ${isSuspended ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)'}; color: ${isSuspended ? '#ef4444' : '#10b981'}; border: 1px solid ${isSuspended ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'};">
            ${u.status || 'ACTIVE'}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 0.35rem;">
            <button class="btn btn-secondary" style="padding: 3px 8px; font-size: 0.72rem;" onclick="toggleUserStatus('${u.id}', '${u.status}')">
              ${isSuspended ? 'Activate' : 'Suspend'}
            </button>
            <button class="btn btn-secondary" style="padding: 3px 8px; font-size: 0.72rem;" onclick="cycleUserRole('${u.id}', '${u.role}')">
              Role ⇄
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Failed to load users for management:', err);
  }
}

async function toggleUserStatus(userId, currentStatus) {
  const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
  try {
    await API.updateUser(userId, { status: nextStatus });
    refreshUserManagement();
  } catch (err) {
    alert('Failed to update user status: ' + err.message);
  }
}

async function cycleUserRole(userId, currentRole) {
  let nextRole = 'GENERAL_USER';
  if (currentRole === 'GENERAL_USER') nextRole = 'IT_PERSONNEL';
  else if (currentRole === 'IT_PERSONNEL') nextRole = 'ADMIN';
  else nextRole = 'GENERAL_USER';

  try {
    await API.updateUser(userId, { role: nextRole });
    refreshUserManagement();
  } catch (err) {
    alert('Failed to update user role: ' + err.message);
  }
}

// -----------------------------------------------------------------------------
// Campus Threat Alert Bulletin Management (Administrator & General User)
// -----------------------------------------------------------------------------
async function loadCampusAlert() {
  try {
    const alert = await API.getCampusAlert();
    const box = document.getElementById('campusAlertBulletinBox');

    if (box) {
      if (!alert || alert.isActive === false) {
        box.style.display = 'none';
      } else {
        box.style.display = 'flex';
        const titleEl = document.getElementById('campusAlertTitle');
        const descEl = document.getElementById('campusAlertDescription');
        const badgeEl = document.getElementById('campusAlertBadge');
        const iconEl = document.getElementById('campusAlertIcon');
        const metaEl = document.getElementById('campusAlertMeta');

        if (titleEl) titleEl.textContent = alert.title;
        if (descEl) descEl.textContent = alert.description;
        if (badgeEl) {
          badgeEl.textContent = alert.badgeLabel || 'Active Threat';
          const sevClass = alert.severity === 'CRITICAL' ? 'badge-critical' :
                           alert.severity === 'HIGH' ? 'badge-high' :
                           alert.severity === 'MEDIUM' ? 'badge-medium' : 'badge-low';
          badgeEl.className = `badge ${sevClass}`;
        }
        if (iconEl) {
          iconEl.textContent = alert.severity === 'CRITICAL' ? '⚠️' :
                               alert.severity === 'HIGH' ? '🚨' :
                               alert.severity === 'MEDIUM' ? '📢' : 'ℹ️';
        }
        if (metaEl && alert.updatedAt) {
          const timeFormatted = new Date(alert.updatedAt).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' });
          metaEl.textContent = `Published: ${timeFormatted} by ${alert.updatedBy || 'Security Administrator'}`;
        }
      }
    }

    populateAdminAlertForm(alert);
    return alert;
  } catch (err) {
    console.warn('Could not load campus threat alert:', err);
  }
}

function populateAdminAlertForm(alert) {
  if (!alert) return;
  const titleInput = document.getElementById('adminAlertTitle');
  const descInput = document.getElementById('adminAlertDescription');
  const sevSelect = document.getElementById('adminAlertSeverity');
  const badgeInput = document.getElementById('adminAlertBadgeLabel');
  const activeCheck = document.getElementById('adminAlertIsActive');
  const lastUpdated = document.getElementById('adminAlertLastUpdated');
  const liveBadge = document.getElementById('adminAlertLiveBadge');

  if (titleInput && (!titleInput.value || document.activeElement !== titleInput)) {
    titleInput.value = alert.title || '';
  }
  if (descInput && (!descInput.value || document.activeElement !== descInput)) {
    descInput.value = alert.description || '';
  }
  if (sevSelect) sevSelect.value = alert.severity || 'CRITICAL';
  if (badgeInput && (!badgeInput.value || document.activeElement !== badgeInput)) {
    badgeInput.value = alert.badgeLabel || 'Active Threat';
  }
  if (activeCheck) activeCheck.checked = alert.isActive !== false;
  if (lastUpdated && alert.updatedAt) {
    const d = new Date(alert.updatedAt).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' });
    lastUpdated.textContent = `Last published: ${d} by ${alert.updatedBy || 'Administrator'}`;
  }
  if (liveBadge) {
    liveBadge.textContent = alert.isActive ? (alert.badgeLabel || 'Active Threat') : 'Hidden / Inactive';
    const sevClass = alert.severity === 'CRITICAL' ? 'badge-critical' :
                     alert.severity === 'HIGH' ? 'badge-high' :
                     alert.severity === 'MEDIUM' ? 'badge-medium' : 'badge-low';
    liveBadge.className = `badge ${alert.isActive ? sevClass : 'badge-closed'}`;
  }
}

function initAdminAlertForm() {
  const form = document.getElementById('adminCampusAlertForm');
  if (!form || form.dataset.bound) return;
  form.dataset.bound = 'true';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('adminAlertTitle')?.value?.trim();
    const description = document.getElementById('adminAlertDescription')?.value?.trim();
    const severity = document.getElementById('adminAlertSeverity')?.value || 'CRITICAL';
    const badgeLabel = document.getElementById('adminAlertBadgeLabel')?.value?.trim() || 'Active Threat';
    const isActive = document.getElementById('adminAlertIsActive')?.checked;
    const currentUser = window.Auth?.getCurrentUser();
    const updatedBy = currentUser ? `${currentUser.name} (${currentUser.roleLabel || 'Administrator'})` : 'Administrator';

    if (!title || !description) {
      alert('Please provide both an alert headline and description.');
      return;
    }

    const btn = document.getElementById('saveCampusAlertBtn');
    if (btn) btn.disabled = true;

    try {
      const updated = await API.updateCampusAlert({
        title,
        description,
        severity,
        badgeLabel,
        isActive,
        updatedBy
      });

      populateAdminAlertForm(updated);
      await loadCampusAlert();
      alert('📢 Campus Threat Alert successfully published! Students and staff will now see the updated advisory.');
    } catch (err) {
      alert('Error updating campus alert: ' + err.message);
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}

window.refreshAllDashboards = refreshAllDashboards;
window.refreshDashboard = refreshAllDashboards;
window.renderUserDashboard = renderUserDashboard;
window.renderStudentDashboard = renderStudentDashboard;
window.renderTechSupervisorDashboard = renderTechSupervisorDashboard;
window.renderAdminDashboard = renderAdminDashboard;
window.refreshUserManagement = refreshUserManagement;
window.toggleUserStatus = toggleUserStatus;
window.cycleUserRole = cycleUserRole;
window.loadCampusAlert = loadCampusAlert;
window.initAdminAlertForm = initAdminAlertForm;
