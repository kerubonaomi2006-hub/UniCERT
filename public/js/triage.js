/**
 * Incident Management & Triage Console Controller
 * Used by University IT Security Team to manage, investigate, and mitigate incidents
 */

let activeIncidentId = null;

async function refreshTriage() {
  const search = document.getElementById('triageSearch')?.value || '';
  const category = document.getElementById('triageCategoryFilter')?.value || 'ALL';
  const riskLevel = document.getElementById('triageRiskFilter')?.value || 'ALL';
  const status = document.getElementById('triageStatusFilter')?.value || 'ALL';

  try {
    const data = await API.getIncidents({ search, category, riskLevel, status });
    renderTriageTable(data.incidents);
    const countBadge = document.getElementById('triageCountBadge');
    if (countBadge) countBadge.textContent = `${data.count} Incident(s)`;
  } catch (err) {
    console.error('Failed to load triage incidents:', err);
  }
}

function renderTriageTable(incidents) {
  const tbody = document.getElementById('triageTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  if (!incidents || incidents.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">No incidents match the selected filter criteria.</td></tr>`;
    return;
  }

  incidents.forEach(inc => {
    const tr = document.createElement('tr');
    tr.addEventListener('click', () => openIncidentModal(inc.id));

    const dateStr = new Date(inc.createdAt).toLocaleDateString('en-KE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    tr.innerHTML = `
      <td><span class="ticket-id">${inc.id}</span></td>
      <td style="font-weight: 600; max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
        ${inc.title}
        ${inc.financialLossSuspected ? '<span title="Financial Loss Suspected"> 💳</span>' : ''}
        ${inc.credentialsCompromised ? '<span title="Credentials Compromised"> 🔑</span>' : ''}
      </td>
      <td><span style="font-size: 0.8rem; color: var(--accent-blue)">${inc.categoryId}</span></td>
      <td><span class="badge ${inc.assessment?.badgeClass || ''}">${inc.assessment?.level || 'N/A'} (${inc.assessment?.score || 0})</span></td>
      <td><span class="badge badge-status ${inc.status}">${inc.status.replace(/_/g, ' ')}</span></td>
      <td style="font-size: 0.8rem; color: var(--text-secondary)">${inc.reporter?.isAnonymous ? '<em>Anonymous</em>' : (inc.reporter?.name || 'Unknown')}</td>
      <td style="color: var(--text-muted); font-size: 0.8rem">${dateStr}</td>
    `;
    tbody.appendChild(tr);
  });
}

async function openIncidentModal(id) {
  activeIncidentId = id;
  const modal = document.getElementById('incidentDetailModal');
  if (!modal) return;

  try {
    const inc = await API.getIncidentById(id);
    populateModalData(inc);
    modal.classList.add('open');
  } catch (err) {
    alert('Error loading incident details: ' + err.message);
  }
}

function closeIncidentModal() {
  const modal = document.getElementById('incidentDetailModal');
  if (modal) modal.classList.remove('open');
  activeIncidentId = null;
}

function populateModalData(inc) {
  // Title & ID
  document.getElementById('modalTicketId').textContent = inc.id;
  document.getElementById('modalIncidentTitle').textContent = inc.title;

  // Badges
  const riskBadge = document.getElementById('modalRiskBadge');
  riskBadge.textContent = `${inc.assessment?.levelLabel} (Score: ${inc.assessment?.score}/100)`;
  riskBadge.className = `badge ${inc.assessment?.badgeClass}`;

  const statusBadge = document.getElementById('modalStatusBadge');
  statusBadge.textContent = inc.status.replace(/_/g, ' ');
  statusBadge.className = `badge badge-status ${inc.status}`;

  // Description & Indicators
  document.getElementById('modalDescription').textContent = inc.description || 'No detailed narrative provided.';
  document.getElementById('modalIndicators').textContent = inc.indicators || 'None recorded.';

  // Target Asset & Scope
  document.getElementById('modalAsset').textContent = inc.assetId;
  document.getElementById('modalScope').textContent = inc.scopeId;
  document.getElementById('modalSla').textContent = inc.assessment?.slaLabel;

  // Reporter Information
  const rep = inc.reporter || {};
  if (rep.isAnonymous) {
    document.getElementById('modalReporterDetails').innerHTML = `
      <p style="color: var(--text-muted)"><em>Whistleblower / Anonymous Student or Staff report</em></p>
    `;
  } else {
    document.getElementById('modalReporterDetails').innerHTML = `
      <p><strong>Name:</strong> ${rep.name} (${rep.type})</p>
      <p><strong>ID/Staff No:</strong> ${rep.identifier || 'N/A'}</p>
      <p><strong>Department:</strong> ${rep.department || 'N/A'}</p>
      <p><strong>Contact:</strong> ${rep.email || 'N/A'} ${rep.phone ? ' | ' + rep.phone : ''}</p>
    `;
  }

  // Triage Controls state
  const statusSelect = document.getElementById('modalStatusSelect');
  if (statusSelect) statusSelect.value = inc.status;

  const assigneeInput = document.getElementById('modalAssigneeInput');
  if (assigneeInput) assigneeInput.value = inc.assignedTo || '';

  // Recommendations: Reporter Actions
  const repList = document.getElementById('modalReporterActionsList');
  repList.innerHTML = '';
  if (inc.recommendations?.reporterActions) {
    inc.recommendations.reporterActions.forEach(a => {
      const li = document.createElement('li');
      li.className = 'rec-step-card';
      li.innerHTML = `
        <div class="rec-step-num">${a.step}</div>
        <div>
          <div class="rec-step-title">${a.action}</div>
          <div class="rec-step-detail">${a.details}</div>
        </div>
      `;
      repList.appendChild(li);
    });
  }

  // Recommendations: IT Playbook SOP
  const itList = document.getElementById('modalItPlaybookList');
  itList.innerHTML = '';
  if (inc.recommendations?.itTeamPlaybook) {
    inc.recommendations.itTeamPlaybook.forEach(a => {
      const li = document.createElement('li');
      li.className = 'rec-step-card';
      li.innerHTML = `
        <div class="rec-step-num" style="background: var(--accent-gold); color: #000">${a.step}</div>
        <div>
          <div class="rec-step-title"><span style="color: var(--accent-blue)">[${a.phase}]</span> ${a.action}</div>
          <div class="rec-step-detail">${a.details}</div>
        </div>
      `;
      itList.appendChild(li);
    });
  }

  // Compliance Notices
  const compBox = document.getElementById('modalComplianceNotice');
  if (compBox) {
    if (inc.recommendations?.complianceActions?.length > 0) {
      compBox.style.display = 'block';
      let html = '<div style="font-weight: 700; color: var(--risk-critical); margin-bottom: 0.5rem">⚠️ Statutory & KENET Regulatory Requirements:</div>';
      inc.recommendations.complianceActions.forEach(c => {
        html += `<div style="margin-bottom: 0.4rem"><strong>${c.entity}:</strong> ${c.action} (${c.channel}) - <span style="color: var(--text-secondary)">${c.details}</span></div>`;
      });
      compBox.innerHTML = html;
    } else {
      compBox.style.display = 'none';
    }
  }

  // Investigation Audit Log Notes
  renderAuditNotes(inc.triageNotes || []);

  // ── Role-based Visibility & Permissions Gate ──
  // General Users (Students, Lecturers, Staff) MUST NOT have access to:
  // 1. Technical Security Response Playbook (NIST CSF 2.0 Respond SOP)
  // 2. SOC Triage & Assignment Management
  // 3. Triage mutation controls (Save Changes, Generate Dossier)
  const currentUser = window.Auth ? window.Auth.getCurrentUser() : null;
  const isGeneralUser = !currentUser || currentUser.role === 'GENERAL_USER' || currentUser.role === 'STUDENT';

  const itPlaybookSection = document.getElementById('modalItPlaybookSection');
  const triageControlsSection = document.getElementById('modalTriageControlsSection');
  const saveChangesBtn = document.getElementById('saveModalChangesBtn');
  const exportKenetBtn = document.getElementById('exportKenetBtn');
  const closeBtn = document.getElementById('closeModalBtn');

  if (isGeneralUser) {
    if (itPlaybookSection) itPlaybookSection.style.display = 'none';
    if (triageControlsSection) triageControlsSection.style.display = 'none';
    if (saveChangesBtn) saveChangesBtn.style.display = 'none';
    if (exportKenetBtn) exportKenetBtn.style.display = 'none';
    if (closeBtn) closeBtn.textContent = 'Close';
  } else {
    if (itPlaybookSection) itPlaybookSection.style.display = 'block';
    if (triageControlsSection) triageControlsSection.style.display = 'block';
    if (saveChangesBtn) saveChangesBtn.style.display = 'inline-block';
    if (exportKenetBtn) exportKenetBtn.style.display = 'inline-block';
    if (closeBtn) closeBtn.textContent = 'Cancel';
  }
}

function renderAuditNotes(notes) {
  const container = document.getElementById('modalAuditNotesList');
  if (!container) return;

  container.innerHTML = '';
  if (notes.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.8rem">No investigation notes entered yet.</p>';
    return;
  }

  notes.forEach(n => {
    const d = new Date(n.timestamp).toLocaleDateString('en-KE', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const div = document.createElement('div');
    div.style.cssText = 'padding: 8px 10px; background: rgba(0,0,0,0.25); border-radius: 6px; margin-bottom: 6px; font-size: 0.8rem; border-left: 3px solid var(--accent-blue);';
    div.innerHTML = `
      <div style="display: flex; justify-content: space-between; color: var(--text-muted); font-size: 0.75rem">
        <strong>${n.author}</strong>
        <span>${d}</span>
      </div>
      <div style="margin-top: 3px; color: #e2e8f0">${n.text}</div>
    `;
    container.appendChild(div);
  });
}

async function handleUpdateIncident() {
  if (!activeIncidentId) return;

  const status = document.getElementById('modalStatusSelect').value;
  const assignedTo = document.getElementById('modalAssigneeInput').value;
  const newNote = document.getElementById('modalNewNoteInput').value;
  const author = document.getElementById('modalNoteAuthorInput')?.value || 'SOC Analyst';

  try {
    const updated = await API.updateIncident(activeIncidentId, {
      status,
      assignedTo,
      newNote: newNote.trim() ? newNote : undefined,
      noteAuthor: author
    });

    document.getElementById('modalNewNoteInput').value = '';
    populateModalData(updated);
    refreshTriage();
    if (window.refreshDashboard) window.refreshDashboard();
    alert('Incident successfully updated.');
  } catch (err) {
    alert('Failed to update incident: ' + err.message);
  }
}

function bindTriageControls() {
  ['triageSearch', 'triageCategoryFilter', 'triageRiskFilter', 'triageStatusFilter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', refreshTriage);
      el.addEventListener('change', refreshTriage);
    }
  });

  document.getElementById('saveModalChangesBtn')?.addEventListener('click', handleUpdateIncident);
  document.getElementById('closeModalBtn')?.addEventListener('click', closeIncidentModal);
  document.getElementById('modalCloseCrossBtn')?.addEventListener('click', closeIncidentModal);

  // KENET Dossier Button
  document.getElementById('exportKenetBtn')?.addEventListener('click', () => {
    if (activeIncidentId && window.openKenetDossier) {
      window.openKenetDossier(activeIncidentId);
    }
  });
}

window.refreshTriage = refreshTriage;
window.openIncidentModal = openIncidentModal;
window.closeIncidentModal = closeIncidentModal;
window.bindTriageControls = bindTriageControls;
