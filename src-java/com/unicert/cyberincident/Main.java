package com.unicert.cyberincident;

import com.unicert.cyberincident.model.*;
import com.unicert.cyberincident.service.RecommendationEngine;
import com.unicert.cyberincident.service.RiskAssessmentEngine;

import java.util.ArrayList;
import java.util.List;

/**
 * Main Demonstration Application for University Unit STU 3101
 * Author: Naomi Kerubo Onyambu (Reg No: 24/05290)
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("======================================================================");
        System.out.println(" University - SCHOOL OF TECHNOLOGY");
        System.out.println(" STU 3101 PROGRAMMING PROJECT: CYBER INCIDENT SYSTEM");
        System.out.println(" Author: Naomi Kerubo Onyambu (Reg: 24/05290)");
        System.out.println("======================================================================\n");

        RiskAssessmentEngine riskEngine = new RiskAssessmentEngine();
        RecommendationEngine recEngine = new RecommendationEngine();
        List<Incident> registry = new ArrayList<>();

        // Incident 1: Critical Ransomware in Lab
        Incident inc1 = new Incident(
                "EDU-CIR-2026-0001",
                "LockBit Ransomware Outbreak in Computer Science Lab 4",
                IncidentCategory.MALWARE,
                AssetType.COMPUTER_LAB_PC,
                "18 workstations displaying black ransom screens demanding 0.5 BTC. File extensions locked."
        );
        inc1.setActiveAttack(true);
        inc1.setFinancialLossSuspected(true);
        inc1.setAssessment(riskEngine.evaluate(inc1));
        registry.add(inc1);

        // Incident 2: Exam Paper Compromise
        Incident inc2 = new Incident(
                "EDU-CIR-2026-0002",
                "STU 3101 Exam Draft Leaked on Telegram Group",
                IncidentCategory.DATA_BREACH,
                AssetType.EXAM_GRADING_SYSTEM,
                "PDF draft of upcoming exam papers leaked on public student chat."
        );
        inc2.setActiveAttack(true);
        inc2.setCredentialsCompromised(true);
        inc2.setAssessment(riskEngine.evaluate(inc2));
        registry.add(inc2);

        // Incident 3: Phishing Email
        Incident inc3 = new Incident(
                "EDU-CIR-2026-0003",
                "Spoofed Bursary Email Targeting Students",
                IncidentCategory.PHISHING,
                AssetType.STUDENT_PORTAL,
                "Email claiming to offer 50% bursary discount via malicious URL."
        );
        inc3.setCredentialsCompromised(true);
        inc3.setAssessment(riskEngine.evaluate(inc3));
        registry.add(inc3);

        // Display Incident Evaluation Results
        for (Incident inc : registry) {
            RiskAssessment ra = inc.getAssessment();
            System.out.println("----------------------------------------------------------------------");
            System.out.printf("TICKET: %s | %s%n", inc.getId(), inc.getTitle());
            System.out.printf("Category: %s | Target: %s%n", inc.getCategory().getDisplayName(), inc.getTargetAsset().getDisplayName());
            System.out.printf("RISK ASSESSMENT: %s (Score: %d/100, SLA: %d hrs)%n", 
                    ra.getLevel().getLabel(), ra.getScore(), ra.getLevel().getSlaHours());
            System.out.printf("KENET Escalation Required: %s | Data Protection Act Notice: %s%n", 
                    ra.isKenetEscalationRequired() ? "YES [Mandatory]" : "NO",
                    ra.isDataProtectionActNotice() ? "YES [72-hr notice]" : "NO");

            System.out.println("\nImmediate Reporter Instructions:");
            for (String step : recEngine.getReporterActions(inc)) {
                System.out.println("  * " + step);
            }

            System.out.println("\nIT Security Team Playbook (NIST CSF 2.0 Respond):");
            for (String step : recEngine.getItResponsePlaybook(inc)) {
                System.out.println("  - " + step);
            }
            System.out.println();
        }

        System.out.println("======================================================================");
        System.out.println("SUMMARY METRICS:");
        long criticalCount = registry.stream().filter(i -> i.getAssessment().getLevel() == RiskLevel.CRITICAL).count();
        long highCount = registry.stream().filter(i -> i.getAssessment().getLevel() == RiskLevel.HIGH).count();
        System.out.printf("Total Evaluated: %d | Critical: %d | High: %d%n", registry.size(), criticalCount, highCount);
        System.out.println("System operational and compliant with NIST CSF 2.0 & KENET-CERT standards.");
        System.out.println("======================================================================");
    }
}

