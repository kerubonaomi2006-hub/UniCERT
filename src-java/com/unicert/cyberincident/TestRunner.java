package com.unicert.cyberincident;

import com.unicert.cyberincident.model.*;
import com.unicert.cyberincident.service.RiskAssessmentEngine;

/**
 * Automated Unit Test Suite in Java
 */
public class TestRunner {
    public static void main(String[] args) {
        System.out.println("Running Java Risk Engine Verification Tests...");

        RiskAssessmentEngine engine = new RiskAssessmentEngine();

        // Test 1: Low risk scenario
        Incident lowInc = new Incident("T-01", "Minor Spam", IncidentCategory.INSIDER_THREAT, AssetType.PERSONAL_STUDENT_DEVICE, "Unapproved software test");
        RiskAssessment raLow = engine.evaluate(lowInc);
        assertScore(raLow.getScore() < 60, "Low incident score should be moderate/low");

        // Test 2: Active ransomware lab scenario
        Incident rInc = new Incident("T-02", "Lab Ransomware", IncidentCategory.MALWARE, AssetType.COMPUTER_LAB_PC, "Files locked");
        rInc.setActiveAttack(true);
        rInc.setFinancialLossSuspected(true);
        RiskAssessment raRansom = engine.evaluate(rInc);
        assertScore(raRansom.getLevel() == RiskLevel.CRITICAL || raRansom.getLevel() == RiskLevel.HIGH, "Ransomware must be High/Critical");
        assertScore(raRansom.isKenetEscalationRequired(), "Ransomware must trigger KENET escalation");

        // Test 3: Exam leak scenario
        Incident examInc = new Incident("T-03", "Exam Leak", IncidentCategory.DATA_BREACH, AssetType.EXAM_GRADING_SYSTEM, "Exam leaked");
        examInc.setActiveAttack(true);
        RiskAssessment raExam = engine.evaluate(examInc);
        assertScore(raExam.getLevel() == RiskLevel.CRITICAL, "Exam breach must be CRITICAL");
        assertScore(raExam.getScore() >= 85, "Exam score must be >= 85");

        System.out.println("ALL JAVA UNIT TESTS PASSED SUCCESSFULLY! (3/3)");
    }

    private static void assertScore(boolean condition, String message) {
        if (!condition) {
            throw new AssertionError("Test assertion failed: " + message);
        }
        System.out.println("  PASSED: " + message);
    }
}

