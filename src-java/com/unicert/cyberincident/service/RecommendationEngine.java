package com.unicert.cyberincident.service;

import com.unicert.cyberincident.model.Incident;
import com.unicert.cyberincident.model.IncidentCategory;
import com.unicert.cyberincident.model.RiskLevel;

import java.util.ArrayList;
import java.util.List;

/**
 * Generates Actionable Recommendations
 * Fulfills System Objective 4
 */
public class RecommendationEngine {

    public List<String> getReporterActions(Incident incident) {
        List<String> steps = new ArrayList<>();
        IncidentCategory cat = incident.getCategory();

        if (cat == IncidentCategory.PHISHING) {
            steps.add("Do not click links or enter passwords in the suspicious email or SMS.");
            if (incident.isCredentialsCompromised()) {
                steps.add("Change your student or staff portal password immediately from a secure device.");
                steps.add("Sign out of all active web and Microsoft 365 sessions.");
            }
            steps.add("Forward full email headers to cert@campus.ac.ke.");
        } else if (cat == IncidentCategory.MALWARE) {
            steps.add("Disconnect the affected device from campus Wi-Fi or unplug the network Ethernet cable immediately.");
            steps.add("Do NOT power off or reboot the machine, as RAM holds critical volatile forensic evidence.");
            steps.add("Do NOT pay any ransom demands.");
        } else if (cat == IncidentCategory.UNAUTHORIZED_ACCESS) {
            steps.add("Trigger an emergency session revocation in the student portal.");
            steps.add("Review registered course units and fee balances for unauthorized changes.");
        } else {
            steps.add("Document symptoms with photos or screenshots.");
            steps.add("Report directly to the University ICT Helpdesk.");
        }

        return steps;
    }

    public List<String> getItResponsePlaybook(Incident incident) {
        List<String> playbook = new ArrayList<>();
        RiskLevel level = incident.getAssessment().getLevel();

        playbook.add("[IDENTIFICATION] Validate telemetry, correlate syslog with SIEM, and confirm impacted subnet.");
        
        if (level == RiskLevel.CRITICAL || level == RiskLevel.HIGH) {
            playbook.add("[CONTAINMENT] Enforce network quarantine on target switch port / isolate target VLAN.");
            playbook.add("[CONTAINMENT] Push perimeter edge firewall block rule on identified malicious IP/domain.");
            playbook.add("[CONTAINMENT] Invalidate Active Directory Kerberos tickets for affected user accounts.");
        } else {
            playbook.add("[CONTAINMENT] Schedule automated endpoint EDR scan and inspect anomalous outbound connections.");
        }

        playbook.add("[ERADICATION] Remove persistent malware artifacts / quarantine malicious inbox items.");
        playbook.add("[RECOVERY] Restore affected volumes from clean offline immutable snapshot.");
        playbook.add("[POST-INCIDENT] Complete Root Cause Analysis (RCA) and file compliance report with KENET-CERT.");

        return playbook;
    }
}

