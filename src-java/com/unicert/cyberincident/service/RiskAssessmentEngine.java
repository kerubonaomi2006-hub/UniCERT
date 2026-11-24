package com.unicert.cyberincident.service;

import com.unicert.cyberincident.model.AssetType;
import com.unicert.cyberincident.model.Incident;
import com.unicert.cyberincident.model.IncidentCategory;
import com.unicert.cyberincident.model.RiskAssessment;
import com.unicert.cyberincident.model.RiskLevel;

/**
 * Core Rule-Based Risk Assessment Engine
 * Fulfills System Objective 3
 */
public class RiskAssessmentEngine {

    public RiskAssessment evaluate(Incident incident) {
        IncidentCategory cat = incident.getCategory();
        AssetType asset = incident.getTargetAsset();

        double baseScore = cat.getBaseSeverity();
        double assetWeight = asset.getCriticalityWeight();

        // Calculate product component scaled to 1-100
        double product = (baseScore * assetWeight) * 6.5;

        int modifiers = 0;
        if (incident.isActiveAttack()) {
            modifiers += 15;
        }
        if (incident.isCredentialsCompromised()) {
            modifiers += 8;
        }
        if (incident.isFinancialLossSuspected()) {
            modifiers += 10;
        }

        int rawScore = (int) Math.round(product + modifiers);
        rawScore = Math.max(5, Math.min(100, rawScore));

        // Assign Risk Level
        RiskLevel level;
        if (rawScore >= 85) {
            level = RiskLevel.CRITICAL;
        } else if (rawScore >= 70) {
            level = RiskLevel.HIGH;
        } else if (rawScore >= 40) {
            level = RiskLevel.MEDIUM;
        } else {
            level = RiskLevel.LOW;
        }

        // Domain Rule Overrides
        if (cat == IncidentCategory.MALWARE && incident.isActiveAttack() && (level == RiskLevel.LOW || level == RiskLevel.MEDIUM)) {
            level = RiskLevel.HIGH;
            rawScore = Math.max(78, rawScore);
        }

        if (cat == IncidentCategory.DATA_BREACH && asset == AssetType.EXAM_GRADING_SYSTEM) {
            level = RiskLevel.CRITICAL;
            rawScore = Math.max(92, rawScore);
        }

        boolean kenetRequired = rawScore >= 70 || cat == IncidentCategory.MALWARE || asset == AssetType.EXAM_GRADING_SYSTEM;
        boolean dataProtectionNotice = (cat == IncidentCategory.DATA_BREACH || incident.isCredentialsCompromised()) && 
                                       (asset == AssetType.STUDENT_PORTAL || asset == AssetType.FINANCE_ERP);

        String summary = String.format("Base Threat: %.1f, Asset Weight: %.2fx, Impact Modifiers: +%d pts", 
                baseScore, assetWeight, modifiers);

        return new RiskAssessment(rawScore, level, kenetRequired, dataProtectionNotice, summary);
    }
}

