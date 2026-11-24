package com.unicert.cyberincident.model;

/**
 * Predefined Cybersecurity Incident Categories
 * Fulfills System Objective 2: Incident Classification
 */
public enum IncidentCategory {
    PHISHING("Phishing & Social Engineering", 6.0, "KENET-CAT-01", "DETECT / RESPOND"),
    MALWARE("Malware & Ransomware", 8.5, "KENET-CAT-02", "PROTECT / RESPOND"),
    UNAUTHORIZED_ACCESS("Unauthorized Access & Account Takeover", 7.5, "KENET-CAT-03", "DETECT / RESPOND"),
    DATA_BREACH("Data Breach & Confidentiality Leak", 9.0, "KENET-CAT-04", "PROTECT / RESPOND / GOVERN"),
    DENIAL_OF_SERVICE("Denial of Service (DoS / DDoS)", 7.0, "KENET-CAT-05", "PROTECT / RESPOND"),
    NETWORK_INTRUSION("Network Intrusion & Scanning", 6.5, "KENET-CAT-06", "DETECT / RESPOND"),
    INSIDER_THREAT("Insider Threat & Policy Violation", 6.0, "KENET-CAT-07", "GOVERN / PROTECT"),
    PHYSICAL_SECURITY("Physical Security & Hardware Theft", 5.5, "KENET-CAT-08", "PROTECT / DETECT");

    private final String displayName;
    private final double baseSeverity;
    private final String kenetCategory;
    private final String nistFunction;

    IncidentCategory(String displayName, double baseSeverity, String kenetCategory, String nistFunction) {
        this.displayName = displayName;
        this.baseSeverity = baseSeverity;
        this.kenetCategory = kenetCategory;
        this.nistFunction = nistFunction;
    }

    public String getDisplayName() { return displayName; }
    public double getBaseSeverity() { return baseSeverity; }
    public String getKenetCategory() { return kenetCategory; }
    public String getNistFunction() { return nistFunction; }
}

