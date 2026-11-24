package com.unicert.cyberincident.model;

/**
 * University and College Digital Assets with Criticality Weights
 */
public enum AssetType {
    EXAM_GRADING_SYSTEM("Examination & Grading System", 1.50, "CRITICAL_ACADEMIC"),
    FINANCE_ERP("Finance & Student Fee Collection ERP", 1.45, "CRITICAL_FINANCIAL"),
    STUDENT_PORTAL("Student Self-Service Portal (ERP)", 1.35, "CORE_SERVICE"),
    CAMPUS_NETWORK_CORE("Campus Core Network Switch & Firewall", 1.30, "INFRASTRUCTURE"),
    LMS_MOODLE("Learning Management System (Moodle)", 1.25, "ACADEMIC_PLATFORM"),
    UNIVERSITY_EMAIL("Institutional Email & Microsoft 365", 1.20, "COMMUNICATION"),
    COMPUTER_LAB_PC("Computer Science Lab Workstations", 1.05, "STUDENT_FACILITY"),
    CAMPUS_WIFI("Campus Student & Guest Wi-Fi", 1.00, "NETWORK"),
    PERSONAL_STUDENT_DEVICE("Personal Student / BYOD Device", 0.85, "ENDPOINT");

    private final String displayName;
    private final double criticalityWeight;
    private final String classification;

    AssetType(String displayName, double criticalityWeight, String classification) {
        this.displayName = displayName;
        this.criticalityWeight = criticalityWeight;
        this.classification = classification;
    }

    public String getDisplayName() { return displayName; }
    public double getCriticalityWeight() { return criticalityWeight; }
    public String getClassification() { return classification; }
}

