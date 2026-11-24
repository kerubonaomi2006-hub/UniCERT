/**
 * Action Recommendation Engine
 * Fulfills System Objective 4:
 * "To provide recommended actions based on the type and risk level of each incident."
 * 
 * Generates tailored recommendations for:
 * 1. Incident Reporter (Immediate Containment for Students / Staff)
 * 2. IT Security Team / CERT Responder (NIST SP 800-61 Containment & Remediation SOP)
 * 3. Institutional Governance & Regulatory Notice (KENET-CERT & Kenya ODPC Compliance)
 */

function generateRecommendations(incident, assessment) {
  const categoryId = incident.categoryId;
  const subcategoryId = incident.subcategoryId;
  const riskLevel = assessment.level;
  const assetId = incident.assetId;

  const reporterActions = [];
  const itTeamPlaybook = [];
  const complianceActions = [];

  // 1. REPORTER IMMEDIATE ACTIONS (For student/staff safety)
  if (categoryId === 'PHISHING') {
    reporterActions.push({
      priority: 'HIGH',
      step: 1,
      action: 'Do not click any embedded links, verify sender identity',
      details: 'Do not click links or open attachments in the suspicious email/SMS. Official university emails always end with your institutional domain (e.g., @campus.ac.ke).'
    });
    if (incident.credentialsCompromised) {
      reporterActions.push({
        priority: 'CRITICAL',
        step: 2,
        action: 'Reset Student / Staff Portal Password immediately',
        details: 'Go to the official university password reset portal (from a clean, uncompromised device) and change your password. Enable Multi-Factor Authentication (MFA) if not already active.'
      });
      reporterActions.push({
        priority: 'HIGH',
        step: 3,
        action: 'Revoke active sessions',
        details: 'In your Microsoft 365 or Google Workspace account settings, select "Sign out of all sessions" to disconnect attackers.'
      });
    }
    reporterActions.push({
      priority: 'MEDIUM',
      step: 4,
      action: 'Export original email headers',
      details: 'Save the email as an .eml or .msg file or copy Internet Headers so the campus IT Security team can extract malicious server IPs and envelope addresses.'
    });
  } else if (categoryId === 'MALWARE') {
    reporterActions.push({
      priority: 'CRITICAL',
      step: 1,
      action: 'Physically disconnect from Campus Network',
      details: 'Immediately unplug the Ethernet network cable or turn off Wi-Fi on the affected computer. Do NOT power off the computer as volatile RAM contains critical forensic evidence.'
    });
    if (subcategoryId === 'RANSOMWARE') {
      reporterActions.push({
        priority: 'CRITICAL',
        step: 2,
        action: 'DO NOT pay any ransom or communicate with extortionists',
        details: 'Paying ransom never guarantees decryption and violates university cybersecurity policy. IT retains offline backups.'
      });
      reporterActions.push({
        priority: 'HIGH',
        step: 3,
        action: 'Photograph the ransom note screen',
        details: 'Take a clear photograph of the ransom screen showing the exact Bitcoin address, extension, and transaction ID for the forensic dossier.'
      });
    }
    reporterActions.push({
      priority: 'HIGH',
      step: 4,
      action: 'Do not plug in USB flash drives',
      details: 'Avoid connecting personal flash drives or external hard drives to avoid spreading malware to other computers or home devices.'
    });
  } else if (categoryId === 'UNAUTHORIZED_ACCESS') {
    reporterActions.push({
      priority: 'CRITICAL',
      step: 1,
      action: 'Immediately terminate all active sessions',
      details: 'Log out of all devices and trigger an emergency session revocation via the student/staff self-service portal.'
    });
    reporterActions.push({
      priority: 'HIGH',
      step: 2,
      action: 'Check recent fee and course transaction history',
      details: 'Review registered units, exam bookings, and fee balances for unauthorized alterations or unapproved requests.'
    });
  } else if (categoryId === 'DENIAL_OF_SERVICE') {
    reporterActions.push({
      priority: 'MEDIUM',
      step: 1,
      action: 'Avoid continuous rapid page refreshing',
      details: 'Refreshing pages repeatedly exacerbates server queue congestion. Check the official University ICT status page for updates.'
    });
    reporterActions.push({
      priority: 'LOW',
      step: 2,
      action: 'Switch to alternative campus network gateway',
      details: 'If accessing via Wi-Fi, test access via wired lab connection or alternative faculty AP.'
    });
  } else if (categoryId === 'DATA_BREACH') {
    reporterActions.push({
      priority: 'CRITICAL',
      step: 1,
      action: 'Cease any forwarding or redistribution of leaked records',
      details: 'Possession and redistribution of leaked exam papers or student PII violates the University Code of Conduct and Kenya Cybercrimes Act.'
    });
    reporterActions.push({
      priority: 'HIGH',
      step: 2,
      action: 'Document the source of the leaked link/document',
      details: 'Record URL, WhatsApp group name, or forum where the unauthorized files were discovered.'
    });
  } else {
    reporterActions.push({
      priority: 'MEDIUM',
      step: 1,
      action: 'Preserve system state and contact campus ICT support',
      details: 'Leave hardware undisturbed and take notes of any unusual error dialogues or alert messages.'
    });
  }

  // 2. IT SECURITY TEAM / CERT PLAYBOOK (NIST SP 800-61 Rev 2/3)
  itTeamPlaybook.push({
    phase: 'IDENTIFICATION & TRIAGE',
    step: 1,
    action: `Validate Incident Scope (${assessment.slaLabel})`,
    details: `Assigned SLA is ${assessment.slaHours} hour(s). Verify reporter identity, check SIEM / syslog correlation for affected asset [${assetId}].`
  });

  if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
    itTeamPlaybook.push({
      phase: 'CONTAINMENT',
      step: 2,
      action: 'Network Isolation & Perimeter Quarantine',
      details: 'Place affected IP / MAC on the isolated quarantine VLAN. Push dynamic firewall block rule at campus perimeter edge gateway.'
    });
    itTeamPlaybook.push({
      phase: 'CONTAINMENT',
      step: 3,
      action: 'Credential Invalidation & Kerberos Ticket Purge',
      details: 'Force Kerberos ticket-granting service (TGS) reset in Active Directory and revoke refresh tokens on Azure AD / Office 365 tenant.'
    });
  } else {
    itTeamPlaybook.push({
      phase: 'CONTAINMENT',
      step: 2,
      action: 'Targeted Endpoint Verification',
      details: 'Run automated EDR endpoint scan and check for anomalous outbound connections to suspicious autonomous systems.'
    });
  }

  if (categoryId === 'PHISHING') {
    itTeamPlaybook.push({
      phase: 'ERADICATION',
      step: 4,
      action: 'Campus-wide Mailbox Purge (Hard Delete)',
      details: 'Execute PowerShell compliance search on Exchange/Google Workspace to quarantine matching Message-ID across all student/staff mailboxes.'
    });
    itTeamPlaybook.push({
      phase: 'ERADICATION',
      step: 5,
      action: 'DNS Sinkhole / Edge Web Filter Blacklist',
      details: 'Add phishing domain and IP to local DNS RPZ (Response Policy Zone) and FortiGuard / Palo Alto URL categorization.'
    });
  } else if (categoryId === 'MALWARE') {
    itTeamPlaybook.push({
      phase: 'ERADICATION & FORENSICS',
      step: 4,
      action: 'Volatile RAM & Master Boot Record (MBR) Extraction',
      details: 'Capture memory dump using LiME / FTK Imager CLI before re-imaging. Extract sample hash and cross-reference with VirusTotal / Hybrid-Analysis.'
    });
    itTeamPlaybook.push({
      phase: 'RECOVERY',
      step: 5,
      action: 'Restore from Immutable Offline Snapshot',
      details: 'Verify shadow copies and restore affected partition from verified offline backup taken prior to initial compromise date.'
    });
  } else if (categoryId === 'UNAUTHORIZED_ACCESS' || categoryId === 'DATA_BREACH') {
    itTeamPlaybook.push({
      phase: 'INVESTIGATION',
      step: 4,
      action: 'Audit Log Forensics & Database Query Trace',
      details: 'Inspect SQL query logs, transaction commit journals, and proxy access logs for unauthorized SELECT / UPDATE statements on student records.'
    });
  }

  itTeamPlaybook.push({
    phase: 'POST-INCIDENT',
    step: 6,
    action: 'Lessons Learned & Root Cause Analysis (RCA)',
    details: 'Compile Root Cause Analysis report within 5 business days. Update firewall rules and schedule targeted cybersecurity awareness training.'
  });

  // 3. REGULATORY, KENET-CERT & LEGAL COMPLIANCE
  if (assessment.kenetEscalationRequired) {
    complianceActions.push({
      entity: 'KENET-CERT',
      urgency: 'HIGH',
      channel: 'Email: cert@kenet.or.ke / Hotline: +254 703 044 000',
      action: 'Submit Higher Education Incident Notification Form',
      details: 'KENET-CERT facilitates inter-university threat telemetry sharing and ISP coordination. Submit incident artifact dossier.'
    });
  }

  if (assessment.dataProtectionActNotice) {
    complianceActions.push({
      entity: 'Office of the Data Protection Commissioner (ODPC Kenya)',
      urgency: 'STATUTORY REQUIREMENT',
      channel: 'complaints@odpc.go.ke / Portal: odpc.go.ke',
      action: 'Formal Breach Notification under Kenya Data Protection Act 2019',
      details: 'Section 43 mandates notifying the Data Protection Commissioner within 72 hours of becoming aware of a breach involving personal data of students or staff.'
    });
  }

  if (riskLevel === 'CRITICAL') {
    complianceActions.push({
      entity: 'National KE-CIRT/CC',
      urgency: 'MANDATORY',
      channel: 'incidents@ke-cirt.go.ke',
      action: 'National Cybersecurity Center Incident Filing',
      details: 'Escalate to the National Kenya Computer Incident Response Team under the Communications Authority of Kenya (CA).'
    });
  }

  return {
    reporterActions,
    itTeamPlaybook,
    complianceActions
  };
}

module.exports = {
  generateRecommendations
};
