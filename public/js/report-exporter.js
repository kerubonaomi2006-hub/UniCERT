/**
 * Official KENET-CERT & University Report Exporter
 * Generates formatted formal incident dossiers for institutional compliance
 */

async function openKenetDossier(incidentId) {
  try {
    const dossier = await API.getKenetDossier(incidentId);
    renderKenetModal(dossier);
  } catch (err) {
    alert('Failed to generate KENET-CERT dossier: ' + err.message);
  }
}

function renderKenetModal(d) {
  const modal = document.getElementById('kenetDossierModal');
  const content = document.getElementById('kenetDossierContent');
  if (!modal || !content) return;

  const dateStr = new Date(d.generatedAt).toLocaleString('en-KE');

  let containmentRows = '';
  d.containmentActionsTaken.forEach(c => {
    containmentRows += `
      <tr>
        <td style="font-weight: 700; width: 140px; color: #1e3a8a;">[${c.phase}]</td>
        <td><strong>${c.action}</strong>: ${c.details}</td>
      </tr>
    `;
  });

  content.innerHTML = `
    <div style="border: 2px solid #0f172a; padding: 2rem; background: #ffffff; color: #000000; font-family: 'Times New Roman', serif;">
      <!-- Letterhead -->
      <div style="text-align: center; border-bottom: 2px double #000; padding-bottom: 1rem; margin-bottom: 1.5rem;">
        <h2 style="font-size: 1.4rem; font-weight: bold; text-transform: uppercase; margin: 0; color: #0d2040;">INSTITUTIONAL CYBER INCIDENT RESPONSE TEAM (UniCERT)</h2>
        <h3 style="font-size: 1.1rem; margin: 4px 0; color: #b45309;">DIRECTORATE OF ICT SERVICES - CYBER DEFENSE UNIT</h3>
        <p style="font-size: 0.85rem; margin: 0;">In Liaison with Kenya Education Network (KENET-CERT) & KE-CIRT/CC</p>
        <p style="font-size: 0.8rem; font-style: italic; margin-top: 4px;">Institutional Security Incident Response Coordination | cert@institution.ac.ke</p>
      </div>

      <div style="text-align: center; margin-bottom: 1.5rem;">
        <h2 style="font-size: 1.25rem; font-weight: bold; text-decoration: underline; margin: 0;">FORMAL CYBERSECURITY INCIDENT NOTIFICATION DOSSIER</h2>
        <p style="font-size: 0.9rem; margin-top: 4px;">Dossier Ref: <strong>${d.dossierReference}</strong> | Date: <strong>${dateStr}</strong></p>
      </div>

      <!-- Section 1 -->
      <h4 style="border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 0.5rem; text-transform: uppercase;">1. Incident Identification & Profile</h4>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 1.25rem; font-size: 0.9rem;">
        <tr>
          <td style="width: 30%; padding: 4px; font-weight: bold;">Ticket Reference:</td>
          <td style="padding: 4px;">${d.incidentOverview.ticketId}</td>
        </tr>
        <tr>
          <td style="padding: 4px; font-weight: bold;">Incident Summary:</td>
          <td style="padding: 4px;">${d.incidentOverview.summary}</td>
        </tr>
        <tr>
          <td style="padding: 4px; font-weight: bold;">KENET Category:</td>
          <td style="padding: 4px;">${d.incidentOverview.kenetCategory}</td>
        </tr>
        <tr>
          <td style="padding: 4px; font-weight: bold;">NIST CSF 2.0 Mapping:</td>
          <td style="padding: 4px;">${d.incidentOverview.nistFunction}</td>
        </tr>
        <tr>
          <td style="padding: 4px; font-weight: bold;">Impacted University Asset:</td>
          <td style="padding: 4px;">${d.incidentOverview.targetAsset}</td>
        </tr>
        <tr>
          <td style="padding: 4px; font-weight: bold;">Institutional Scope:</td>
          <td style="padding: 4px;">${d.incidentOverview.impactedScope}</td>
        </tr>
      </table>

      <!-- Section 2 -->
      <h4 style="border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 0.5rem; text-transform: uppercase;">2. Risk Assessment & Severity Quantification</h4>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 1.25rem; font-size: 0.9rem;">
        <tr>
          <td style="width: 30%; padding: 4px; font-weight: bold;">Quantitative Risk Score:</td>
          <td style="padding: 4px;"><strong>${d.riskQuantification.score} / 100</strong></td>
        </tr>
        <tr>
          <td style="padding: 4px; font-weight: bold;">Assigned Risk Level:</td>
          <td style="padding: 4px;"><strong style="color: ${d.riskQuantification.level === 'CRITICAL' ? '#b91c1c' : '#c2410c'};">${d.riskQuantification.level}</strong></td>
        </tr>
        <tr>
          <td style="padding: 4px; font-weight: bold;">Mitigation Target SLA:</td>
          <td style="padding: 4px;">${d.riskQuantification.targetSla}</td>
        </tr>
      </table>

      <!-- Section 3 -->
      <h4 style="border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 0.5rem; text-transform: uppercase;">3. Technical Indicators of Compromise (IoCs)</h4>
      <div style="background: #f1f5f9; padding: 0.75rem; border: 1px solid #cbd5e1; font-family: monospace; font-size: 0.85rem; margin-bottom: 1.25rem;">
        ${d.technicalIndicators.rawArtifacts || 'No IOC strings recorded.'}
        ${d.technicalIndicators.evidenceAttachment ? `<br>Attached Evidence: ${d.technicalIndicators.evidenceAttachment}` : ''}
      </div>

      <!-- Section 4 -->
      <h4 style="border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 0.5rem; text-transform: uppercase;">4. Containment SOPs & Mitigation Actions</h4>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 1.25rem; font-size: 0.85rem;">
        ${containmentRows}
      </table>

      <!-- Section 5 -->
      <h4 style="border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 0.5rem; text-transform: uppercase;">5. Statutory Compliance & Regulatory Escalation</h4>
      <p style="font-size: 0.85rem; margin-bottom: 0.5rem;">
        <strong>Recipient:</strong> Kenya Education Network CERT (KENET-CERT), Catholic University of Eastern Africa Complex, Bogani East Road, Nairobi.
      </p>
      <p style="font-size: 0.85rem;">
        <strong>Kenya Data Protection Notice:</strong> ${d.statutoryCompliance.odpcNotificationRequired ? 'MANDATORY (Breach involves student/staff PII under Sec 43 of Kenya Data Protection Act 2019)' : 'Not triggered (No unauthorized access to personal identifiable data detected)'}
      </p>

      <!-- Signature Block -->
      <div style="margin-top: 3rem; display: flex; justify-content: space-between;">
        <div style="border-top: 1px solid #000; width: 40%; text-align: center; padding-top: 0.5rem; font-size: 0.85rem;">
          <strong>Incident Handler / Lead Analyst</strong><br>
          Institutional Cyber Defense Unit
        </div>
        <div style="border-top: 1px solid #000; width: 40%; text-align: center; padding-top: 0.5rem; font-size: 0.85rem;">
          <strong>Chief Information Security Officer (CISO)</strong><br>
          Directorate of ICT Services
        </div>
      </div>
    </div>
  `;

  modal.classList.add('open');
}

function closeKenetModal() {
  const modal = document.getElementById('kenetDossierModal');
  if (modal) modal.classList.remove('open');
}

window.openKenetDossier = openKenetDossier;
window.closeKenetModal = closeKenetModal;
