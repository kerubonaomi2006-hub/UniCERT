/**
 * Incident Reporting Form Controller
 * Implements System Objective 1 (Reporting) & System Objective 2 (Classification)
 */

let taxonomies = null;

async function initReportingForm() {
  try {
    taxonomies = await API.getTaxonomies();
    populateFormOptions();
    bindFormEvents();
    triggerLivePreview();
  } catch (err) {
    console.error('Failed to initialize reporting form taxonomies:', err);
  }
}

function populateFormOptions() {
  const catSelect = document.getElementById('reportCategory');
  const assetSelect = document.getElementById('reportAsset');
  const sensitivitySelect = document.getElementById('reportSensitivity');
  const scopeSelect = document.getElementById('reportScope');
  const statusSelect = document.getElementById('reportStatus');

  if (!catSelect || !taxonomies) return;

  // Prepopulate reporter identity if user logged in
  if (window.Auth) {
    const user = window.Auth.getCurrentUser();
    const roleEl = document.getElementById('reportRole');
    const nameEl = document.getElementById('reportName');
    const idEl = document.getElementById('reportIdNum');
    const deptEl = document.getElementById('reportDept');
    const emailEl = document.getElementById('reportEmail');

    if (roleEl) {
      if (user.role === 'IT_PERSONNEL' || user.role === 'TECH_TEAM') roleEl.value = 'IT_STAFF';
      else if (user.role === 'ADMIN') roleEl.value = 'ADMIN_STAFF';
      else if (user.role === 'STAFF') roleEl.value = 'STAFF';
      else roleEl.value = 'STUDENT';
    }
    if (nameEl && !nameEl.value) nameEl.value = user.name;
    if (idEl && !idEl.value) idEl.value = user.identifier;
    if (deptEl && !deptEl.value) deptEl.value = user.department;
    if (emailEl && !emailEl.value) emailEl.value = user.email;
  }

  // Categories
  catSelect.innerHTML = '';
  Object.values(taxonomies.categories).forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.id;
    opt.textContent = `${cat.name}`;
    catSelect.appendChild(opt);
  });

  // Assets
  assetSelect.innerHTML = '';
  Object.values(taxonomies.assets).forEach(a => {
    const opt = document.createElement('option');
    opt.value = a.id;
    opt.textContent = `${a.name}`;
    assetSelect.appendChild(opt);
  });

  // Sensitivity
  sensitivitySelect.innerHTML = '';
  Object.values(taxonomies.dataSensitivity).forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = `${s.name}`;
    sensitivitySelect.appendChild(opt);
  });

  // Scope
  scopeSelect.innerHTML = '';
  Object.values(taxonomies.scopeLevels).forEach(sc => {
    const opt = document.createElement('option');
    opt.value = sc.id;
    opt.textContent = `${sc.name}`;
    scopeSelect.appendChild(opt);
  });

  // Status
  statusSelect.innerHTML = '';
  Object.values(taxonomies.attackStatus).forEach(st => {
    const opt = document.createElement('option');
    opt.value = st.id;
    opt.textContent = `${st.name}`;
    statusSelect.appendChild(opt);
  });

  updateSubcategories();
}

function updateSubcategories() {
  const catSelect = document.getElementById('reportCategory');
  const subcatSelect = document.getElementById('reportSubcategory');
  if (!catSelect || !subcatSelect || !taxonomies) return;

  const currentCatId = catSelect.value;
  const catData = taxonomies.categories[currentCatId];

  subcatSelect.innerHTML = '';
  if (catData && catData.subcategories) {
    catData.subcategories.forEach(sub => {
      const opt = document.createElement('option');
      opt.value = sub.id;
      opt.textContent = sub.name;
      subcatSelect.appendChild(opt);
    });
  }
}

function bindFormEvents() {
  const catSelect = document.getElementById('reportCategory');
  const form = document.getElementById('incidentReportForm');
  const anonCheckbox = document.getElementById('reportAnonymous');
  const reporterFields = document.getElementById('reporterIdentityFields');

  // Anonymous toggle
  if (anonCheckbox && reporterFields) {
    anonCheckbox.addEventListener('change', (e) => {
      reporterFields.style.opacity = e.target.checked ? '0.4' : '1';
      reporterFields.style.pointerEvents = e.target.checked ? 'none' : 'auto';
    });
  }

  // Update subcategories when category changes
  if (catSelect) {
    catSelect.addEventListener('change', () => {
      updateSubcategories();
      triggerLivePreview();
    });
  }

  // Live assessment triggers on any input change
  const inputs = document.querySelectorAll('#incidentReportForm input, #incidentReportForm select');
  inputs.forEach(input => {
    input.addEventListener('change', triggerLivePreview);
  });

  // Submission handler
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
}

let previewDebounceTimer = null;
function triggerLivePreview() {
  clearTimeout(previewDebounceTimer);
  previewDebounceTimer = setTimeout(async () => {
    const payload = gatherFormData();
    try {
      const assessment = await API.previewRiskAssessment(payload);
      renderLivePreview(assessment);
    } catch (err) {
      console.warn('Live preview failed:', err);
    }
  }, 200);
}

function gatherFormData() {
  return {
    title: document.getElementById('reportTitle')?.value || '',
    reporterType: document.getElementById('reportRole')?.value || 'STUDENT',
    reporterName: document.getElementById('reportName')?.value || '',
    reporterId: document.getElementById('reportIdNum')?.value || '',
    reporterDepartment: document.getElementById('reportDept')?.value || '',
    reporterEmail: document.getElementById('reportEmail')?.value || '',
    reporterPhone: document.getElementById('reportPhone')?.value || '',
    isAnonymous: !!document.getElementById('reportAnonymous')?.checked,
    categoryId: document.getElementById('reportCategory')?.value || 'PHISHING',
    subcategoryId: document.getElementById('reportSubcategory')?.value || '',
    assetId: document.getElementById('reportAsset')?.value || 'STUDENT_PORTAL',
    sensitivityId: document.getElementById('reportSensitivity')?.value || 'OPERATIONAL',
    scopeId: document.getElementById('reportScope')?.value || 'INDIVIDUAL_ONLY',
    statusId: document.getElementById('reportStatus')?.value || 'SUSPECTED_ATTEMPT',
    observedAt: document.getElementById('reportObservedAt')?.value || new Date().toISOString(),
    description: document.getElementById('reportDescription')?.value || '',
    indicators: document.getElementById('reportIndicators')?.value || '',
    financialLossSuspected: !!document.getElementById('reportFinancialLoss')?.checked,
    credentialsCompromised: !!document.getElementById('reportCredentials')?.checked,
    evidenceFileName: document.getElementById('reportEvidenceFile')?.files[0]?.name || null
  };
}

function renderLivePreview(assessment) {
  const scoreNum = document.getElementById('previewScoreNum');
  const levelText = document.getElementById('previewLevelText');
  const slaText = document.getElementById('previewSlaText');
  const barFill = document.getElementById('previewBarFill');
  const kenetAlert = document.getElementById('previewKenetAlert');
  const breakdownContainer = document.getElementById('previewBreakdown');

  if (!scoreNum || !assessment) return;

  scoreNum.textContent = assessment.score;
  scoreNum.style.color = assessment.color;
  levelText.textContent = assessment.levelLabel;
  levelText.style.color = assessment.color;
  slaText.textContent = `Response SLA: ${assessment.slaLabel}`;

  if (barFill) {
    barFill.style.width = `${assessment.score}%`;
    barFill.style.backgroundColor = assessment.color;
  }

  if (kenetAlert) {
    if (assessment.kenetEscalationRequired) {
      kenetAlert.style.display = 'block';
      kenetAlert.innerHTML = `⚠️ <strong>KENET-CERT Alert:</strong> High severity triggers automated national education escalation protocol.`;
    } else {
      kenetAlert.style.display = 'none';
    }
  }

  if (breakdownContainer && assessment.factorBreakdown) {
    const f = assessment.factorBreakdown;
    breakdownContainer.innerHTML = `
      <li class="breakdown-item">
        <span>Base Threat Severity:</span>
        <strong>${f.baseThreat.score} / 10</strong>
      </li>
      <li class="breakdown-item">
        <span>Asset Weight (${f.assetCriticality.type}):</span>
        <strong>${f.assetCriticality.weight}x</strong>
      </li>
      <li class="breakdown-item">
        <span>Data Sensitivity Multiplier:</span>
        <strong>${f.dataSensitivity.multiplier}x</strong>
      </li>
      <li class="breakdown-item">
        <span>Incident Scope Multiplier:</span>
        <strong>${f.incidentScope.multiplier}x</strong>
      </li>
      <li class="breakdown-item">
        <span>Exploit Status Modifier:</span>
        <strong>${f.exploitStatus.modifierPoints > 0 ? '+' : ''}${f.exploitStatus.modifierPoints} pts</strong>
      </li>
    `;
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('submitReportBtn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting & Assessing Risk...';
  }

  try {
    const payload = gatherFormData();
    if (!payload.title.trim()) {
      alert('Please enter an Incident Title.');
      return;
    }
    if (!payload.description.trim()) {
      alert('Please describe what happened in the incident description.');
      return;
    }

    const created = await API.createIncident(payload);

    // Show Confirmation Modal
    showSuccessConfirmation(created);

    // Reset Form
    e.target.reset();
    updateSubcategories();
    triggerLivePreview();

    // Refresh Dashboard and Triage tables
    if (window.refreshDashboard) window.refreshDashboard();
    if (window.refreshTriage) window.refreshTriage();
  } catch (err) {
    alert('Error submitting report: ' + err.message);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Cyber Incident Report';
    }
  }
}

function showSuccessConfirmation(incident) {
  const modal = document.getElementById('confirmationModal');
  const ticketSpan = document.getElementById('confirmTicketId');
  const levelBadge = document.getElementById('confirmRiskBadge');
  const reporterStepsList = document.getElementById('confirmReporterSteps');

  if (!modal) return;

  ticketSpan.textContent = incident.id;
  levelBadge.textContent = incident.assessment.levelLabel;
  levelBadge.className = `badge ${incident.assessment.badgeClass}`;

  // Populate immediate safety advice
  reporterStepsList.innerHTML = '';
  if (incident.recommendations && incident.recommendations.reporterActions) {
    incident.recommendations.reporterActions.forEach(action => {
      const li = document.createElement('li');
      li.className = 'rec-step-card';
      li.innerHTML = `
        <div class="rec-step-num">${action.step}</div>
        <div>
          <div class="rec-step-title">${action.action}</div>
          <div class="rec-step-detail">${action.details}</div>
        </div>
      `;
      reporterStepsList.appendChild(li);
    });
  }

  modal.classList.add('open');
}

window.initReportingForm = initReportingForm;
