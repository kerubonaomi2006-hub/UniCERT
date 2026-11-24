package com.unicert.cyberincident.model;

/**
 * Risk Levels for Cybersecurity Incidents
 * Aligned with NIST CSF 2.0 & KENET-CERT Guidelines
 */
public enum RiskLevel {
    LOW("Low Risk", "#10b981", 72, "72 Hours (Routine Review)"),
    MEDIUM("Medium Risk", "#f59e0b", 24, "24 Hours (Standard Escalation)"),
    HIGH("High Risk", "#f97316", 4, "4 Hours (Urgent Incident Response)"),
    CRITICAL("Critical Risk", "#ef4444", 1, "1 Hour (Immediate Emergency Protocol)");

    private final String label;
    private final String hexColor;
    private final int slaHours;
    private final String slaDescription;

    RiskLevel(String label, String hexColor, int slaHours, String slaDescription) {
        this.label = label;
        this.hexColor = hexColor;
        this.slaHours = slaHours;
        this.slaDescription = slaDescription;
    }

    public String getLabel() { return label; }
    public String getHexColor() { return hexColor; }
    public int getSlaHours() { return slaHours; }
    public String getSlaDescription() { return slaDescription; }
}

