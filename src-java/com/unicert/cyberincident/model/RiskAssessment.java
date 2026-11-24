package com.unicert.cyberincident.model;

import java.time.LocalDateTime;

/**
 * Output of the Risk Assessment Feature
 * Fulfills System Objective 3
 */
public class RiskAssessment {
    private final int score;
    private final RiskLevel level;
    private final boolean kenetEscalationRequired;
    private final boolean dataProtectionActNotice;
    private final LocalDateTime assessedAt;
    private final String factorSummary;

    public RiskAssessment(int score, RiskLevel level, boolean kenetEscalationRequired, 
                          boolean dataProtectionActNotice, String factorSummary) {
        this.score = score;
        this.level = level;
        this.kenetEscalationRequired = kenetEscalationRequired;
        this.dataProtectionActNotice = dataProtectionActNotice;
        this.assessedAt = LocalDateTime.now();
        this.factorSummary = factorSummary;
    }

    public int getScore() { return score; }
    public RiskLevel getLevel() { return level; }
    public boolean isKenetEscalationRequired() { return kenetEscalationRequired; }
    public boolean isDataProtectionActNotice() { return dataProtectionActNotice; }
    public LocalDateTime getAssessedAt() { return assessedAt; }
    public String getFactorSummary() { return factorSummary; }

    @Override
    public String toString() {
        return String.format("[%s (Score: %d/100, SLA: %d hrs, KENET: %s)]", 
                level.getLabel(), score, level.getSlaHours(), kenetEscalationRequired ? "YES" : "NO");
    }
}

