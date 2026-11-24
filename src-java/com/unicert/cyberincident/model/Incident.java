package com.unicert.cyberincident.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Domain entity representing a reported cybersecurity incident
 */
public class Incident {
    private String id;
    private String title;
    private String reporterName;
    private String reporterId;
    private String reporterEmail;
    private boolean isAnonymous;
    
    private IncidentCategory category;
    private AssetType targetAsset;
    private String description;
    private String indicators;
    
    private boolean credentialsCompromised;
    private boolean financialLossSuspected;
    private boolean activeAttack;
    
    private String status; // NEW, UNDER_INVESTIGATION, CONTAINED, RESOLVED, CLOSED
    private String assignedOfficer;
    private LocalDateTime createdAt;
    private RiskAssessment assessment;
    private List<String> auditLog;

    public Incident(String id, String title, IncidentCategory category, AssetType targetAsset, String description) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.targetAsset = targetAsset;
        this.description = description;
        this.status = "NEW";
        this.assignedOfficer = "Unassigned";
        this.createdAt = LocalDateTime.now();
        this.auditLog = new ArrayList<>();
        this.auditLog.add(LocalDateTime.now() + ": Incident record initialized.");
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getReporterName() { return reporterName; }
    public void setReporterName(String reporterName) { this.reporterName = reporterName; }

    public String getReporterId() { return reporterId; }
    public void setReporterId(String reporterId) { this.reporterId = reporterId; }

    public String getReporterEmail() { return reporterEmail; }
    public void setReporterEmail(String reporterEmail) { this.reporterEmail = reporterEmail; }

    public boolean isAnonymous() { return isAnonymous; }
    public void setAnonymous(boolean anonymous) { isAnonymous = anonymous; }

    public IncidentCategory getCategory() { return category; }
    public void setCategory(IncidentCategory category) { this.category = category; }

    public AssetType getTargetAsset() { return targetAsset; }
    public void setTargetAsset(AssetType targetAsset) { this.targetAsset = targetAsset; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIndicators() { return indicators; }
    public void setIndicators(String indicators) { this.indicators = indicators; }

    public boolean isCredentialsCompromised() { return credentialsCompromised; }
    public void setCredentialsCompromised(boolean credentialsCompromised) { this.credentialsCompromised = credentialsCompromised; }

    public boolean isFinancialLossSuspected() { return financialLossSuspected; }
    public void setFinancialLossSuspected(boolean financialLossSuspected) { this.financialLossSuspected = financialLossSuspected; }

    public boolean isActiveAttack() { return activeAttack; }
    public void setActiveAttack(boolean activeAttack) { this.activeAttack = activeAttack; }

    public String getStatus() { return status; }
    public void setStatus(String status) { 
        this.status = status; 
        this.auditLog.add(LocalDateTime.now() + ": Status changed to " + status);
    }

    public String getAssignedOfficer() { return assignedOfficer; }
    public void setAssignedOfficer(String assignedOfficer) { this.assignedOfficer = assignedOfficer; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public RiskAssessment getAssessment() { return assessment; }
    public void setAssessment(RiskAssessment assessment) { this.assessment = assessment; }

    public List<String> getAuditLog() { return auditLog; }
    public void addAuditNote(String note) { this.auditLog.add(LocalDateTime.now() + ": " + note); }
}

