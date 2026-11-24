/**
 * Interactive Risk Assessment Simulator Sandbox
 * Allows evaluators and students to test hypothetical scenarios and explore the risk formula
 */

function initSimulator() {
  const runBtn = document.getElementById('runSimBtn');
  if (runBtn) {
    runBtn.addEventListener('click', runSimulation);
  }

  // Predefined scenario buttons
  document.querySelectorAll('.scenario-preset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const scenario = e.currentTarget.dataset.scenario;
      loadScenarioPreset(scenario);
    });
  });
}

function loadScenarioPreset(type) {
  if (type === 'ransomware-lab') {
    document.getElementById('simCategory').value = 'MALWARE';
    document.getElementById('simAsset').value = 'COMPUTER_LAB_PC';
    document.getElementById('simSensitivity').value = 'INTERNAL_CONFIDENTIAL';
    document.getElementById('simScope').value = 'SINGLE_DEPARTMENT';
    document.getElementById('simStatus').value = 'ACTIVE_ONGOING';
    document.getElementById('simCredentials').checked = false;
    document.getElementById('simFinancial').checked = true;
  } else if (type === 'exam-leak') {
    document.getElementById('simCategory').value = 'DATA_BREACH';
    document.getElementById('simAsset').value = 'EXAM_GRADING_SYSTEM';
    document.getElementById('simSensitivity').value = 'EXAM_PAPERS';
    document.getElementById('simScope').value = 'MULTIPLE_DEPARTMENTS';
    document.getElementById('simStatus').value = 'ACTIVE_ONGOING';
    document.getElementById('simCredentials').checked = true;
    document.getElementById('simFinancial').checked = false;
  } else if (type === 'phishing-blocked') {
    document.getElementById('simCategory').value = 'PHISHING';
    document.getElementById('simAsset').value = 'UNIVERSITY_EMAIL';
    document.getElementById('simSensitivity').value = 'PUBLIC';
    document.getElementById('simScope').value = 'INDIVIDUAL_ONLY';
    document.getElementById('simStatus').value = 'THWARTED_BLOCKED';
    document.getElementById('simCredentials').checked = false;
    document.getElementById('simFinancial').checked = false;
  }
  runSimulation();
}

async function runSimulation() {
  const payload = {
    categoryId: document.getElementById('simCategory')?.value || 'PHISHING',
    assetId: document.getElementById('simAsset')?.value || 'STUDENT_PORTAL',
    sensitivityId: document.getElementById('simSensitivity')?.value || 'OPERATIONAL',
    scopeId: document.getElementById('simScope')?.value || 'INDIVIDUAL_ONLY',
    statusId: document.getElementById('simStatus')?.value || 'SUSPECTED_ATTEMPT',
    credentialsCompromised: !!document.getElementById('simCredentials')?.checked,
    financialLossSuspected: !!document.getElementById('simFinancial')?.checked
  };

  try {
    const res = await API.previewRiskAssessment(payload);
    renderSimResults(res);
  } catch (err) {
    console.error('Simulation error:', err);
  }
}

function renderSimResults(res) {
  const resultCard = document.getElementById('simResultContainer');
  if (!resultCard || !res) return;

  resultCard.innerHTML = `
    <div style="text-align: center; margin-bottom: 1rem;">
      <div style="font-size: 0.85rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700">Calculated Risk Level</div>
      <div style="font-size: 3rem; font-weight: 900; color: ${res.color}; margin: 0.25rem 0;">${res.score} / 100</div>
      <span class="badge ${res.badgeClass}" style="font-size: 1rem; padding: 6px 14px;">${res.levelLabel}</span>
      <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem">Target SLA: <strong>${res.slaLabel}</strong></div>
    </div>

    <div style="margin: 1.25rem 0; padding: 1rem; background: rgba(0,0,0,0.25); border-radius: 8px;">
      <div style="font-size: 0.85rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem">Scoring Contribution Breakdown:</div>
      <ul class="breakdown-list" style="margin: 0;">
        <li class="breakdown-item">
          <span>Base Threat: ${res.factorBreakdown.baseThreat.category}</span>
          <strong>${res.factorBreakdown.baseThreat.score} pts</strong>
        </li>
        <li class="breakdown-item">
          <span>Asset Criticality: ${res.factorBreakdown.assetCriticality.asset}</span>
          <strong>${res.factorBreakdown.assetCriticality.weight}x</strong>
        </li>
        <li class="breakdown-item">
          <span>Data Classification: ${res.factorBreakdown.dataSensitivity.classification}</span>
          <strong>${res.factorBreakdown.dataSensitivity.multiplier}x</strong>
        </li>
        <li class="breakdown-item">
          <span>Incident Scope: ${res.factorBreakdown.incidentScope.level}</span>
          <strong>${res.factorBreakdown.incidentScope.multiplier}x</strong>
        </li>
        <li class="breakdown-item">
          <span>Attack State: ${res.factorBreakdown.exploitStatus.status}</span>
          <strong>${res.factorBreakdown.exploitStatus.modifierPoints > 0 ? '+' : ''}${res.factorBreakdown.exploitStatus.modifierPoints} pts</strong>
        </li>
      </ul>
    </div>

    ${res.kenetEscalationRequired ? `
      <div style="padding: 10px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 6px; font-size: 0.85rem; color: #fca5a5;">
        🚨 <strong>KENET-CERT Threshold Exceeded:</strong> This scenario automatically prompts a notification to Kenya Education Network CERT.
      </div>
    ` : ''}

    ${res.dataProtectionActNotice ? `
      <div style="margin-top: 0.5rem; padding: 10px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 6px; font-size: 0.85rem; color: #fde68a;">
        ⚖️ <strong>Kenya ODPC Notice:</strong> Compromise of personal data requires statutory report within 72 hours under Data Protection Act 2019.
      </div>
    ` : ''}
  `;
}

window.initSimulator = initSimulator;
