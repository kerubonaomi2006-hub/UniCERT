# Cyber Incident Reporting and Risk Assessment System for Universities and Colleges

**Higher Education Cyber Incident Reporting & Risk Assessment Platform**  
**Bachelor of Science in Information Technology**  
**Course Unit:** STU 3101 Programming Project  
**Author:** Naomi Kerubo Onyambu (Reg No: 24/05290)  
**Supervisor / Reviewer:** School of Technology Project Committee  
**Standards Alignment:** NIST CSF 2.0 &bull; KENET-CERT &bull; KE-CIRT/CC &bull; Kenya Data Protection Act 2019

---

## 🌟 Executive Summary & Project Purpose

Universities and colleges face escalating cybersecurity threats—including phishing scams, student portal credential harvesting, ransomware targeting campus computer labs, examination paper leaks, and distributed denial-of-service (DDoS) attacks. Manual reporting and ad-hoc assessment result in delayed responses to critical incidents.

This project delivers a **centralized, automated Cyber Incident Reporting and Risk Assessment System** tailored specifically for higher education institutions. It fulfills all objectives set out in the project proposal:

1. **System Objective 1 (Reporting):** A modern, responsive web application enabling students, academic faculty, administrative staff, and anonymous whistleblowers to report cybersecurity incidents through structured forms.
2. **System Objective 2 (Classification):** Automated incident categorization into standardized taxonomies aligned with NIST CSF 2.0 and KENET-CERT (Phishing, Malware/Ransomware, Unauthorized Access, Data Breach, DoS, Network Intrusion, Insider Threat, and Physical Security).
3. **System Objective 3 (Risk Assessment):** A rule-based risk calculation engine computing quantitative scores (1–100), assigning qualitative risk levels (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), and enforcing response SLAs.
4. **System Objective 4 (Recommended Actions):** Generates dual-track action recommendations—immediate containment guidance for the reporter, and NIST SP 800-61 Standard Operating Procedure (SOP) playbooks for the campus ICT Security Operations Center (SOC) team.
5. **Monitoring & Triage Dashboard:** Real-time threat intelligence dashboard displaying KPI metrics, category breakdowns, risk matrices, and official KENET-CERT report generation.

---

## 🚀 Quickstart Guide

### Prerequisites

- **Node.js** (v18.0.0 or higher recommended, tested on Node v24)
- Web browser (Chrome, Edge, Firefox, Safari)
- _(Optional for Java components)_ Java Development Kit (JDK 17 or higher) & IntelliJ IDEA / Eclipse

### 1. Launch the Web Application

Open your terminal in the `cyber-incident-reporting-system` directory:

```bash
cd cyber-incident-reporting-system
node server.js
```

_(Or run `npm start`)_

### 2. Access the Application

Open your browser and navigate to:

```
http://localhost:3000
```

---

## 🖥️ System Modules & Features

### 1. 📊 Security Operations Center (SOC) Dashboard

- **Real-time KPI Counters:** Total incidents logged, active Critical threats, High risk alerts, open investigations, and resolved/contained count.
- **Incident Classification Chart:** Horizontal distribution chart visualizing incident frequency across all 8 predefined categories.
- **Risk Severity & SLA Matrix:** Color-coded breakdown with percentage allocations and target response timelines.
- **Target Asset Analysis:** Identifies vulnerable university systems (Student ERP, Computer Labs, Campus Wi-Fi, Exam Servers).
- **Live Threat Stream:** Real-time log of recent security incidents with direct click-to-view triage access.

### 2. 📝 Incident Reporting Wizard (Students & Staff)

- **Structured Fields:** Title, Category, Subcategory, Target Asset, Data Classification, Scope of Impact, Narrative Description, and Technical Indicators (URLs, IPs, email senders, hashes).
- **Whistleblower / Anonymous Mode:** Checkbox toggle to protect the identity of student/staff whistleblowers when reporting sensitive breaches (e.g. exam leaks or staff misconduct).
- **Live Dynamic Risk Engine Preview:** Real-time calculation showing predicted Risk Score, Risk Level color badge, SLA, and factor breakdown _as the user fills out the form_.
- **Post-Submission Confirmation:** Instantly issues a unique Ticket ID (e.g. `EDU-CIR-2026-0001`) and displays immediate containment steps for the reporter.

### 3. 🛡️ Incident Triage & Management Console (IT Security Staff)

- **Multi-Filter & Search:** Real-time filtering by Incident Category, Risk Level (`LOW` to `CRITICAL`), and Lifecycle Status (`NEW`, `UNDER_INVESTIGATION`, `CONTAINED`, `RESOLVED`, `CLOSED`).
- **Full Incident Detail Modal:**
  - Detailed narrative and technical IoCs.
  - Complete mathematical factor score breakdown.
  - Reporter Containment Checklist.
  - IT SOC Response Playbook (Identification, Containment, Eradication, Recovery, Lessons Learned).
  - Statutory compliance alerts (Kenya Data Protection Act 72-hour notice).
  - Lifecycle status updater & officer assignment.
  - Investigation audit trail & findings notes.
- **Data Export:** Instant CSV export of all logged incidents.

### 4. 🔍 Public Ticket Tracker

- Allows any student or faculty member to enter their Incident Tracking ID (e.g. `EDU-CIR-2026-0001`) to check investigation progress and official ICT security notices without accessing administrative panels.

### 5. 🧪 Interactive Risk Assessment Simulator

- Educational sandbox allowing university evaluators and cybersecurity students to test hypothetical threat scenarios (e.g., Computer Lab Ransomware vs Thwarted Phishing) and observe the mathematical formula in action.

### 6. 📄 Official KENET-CERT Incident Dossier Exporter

- Generates a formally formatted, printable notification document with institutional letterhead, chain-of-custody timestamps, IoCs, and statutory notices ready for submission to `cert@kenet.or.ke` and `incidents@ke-cirt.go.ke`.

---

## 🧮 Rule-Based Risk Assessment Formula

The quantitative risk score $R \in [1, 100]$ is computed as follows:

$$R = \min\left(100, \max\left(5, \left[\left(S_{\text{base}} \times W_{\text{asset}} \times M_{\text{data}} \times M_{\text{scope}}\right) \times 3.8\right] + \Delta_{\text{status}} + \Delta_{\text{impact}}\right)\right)$$

| Factor                   | Description                                   | Range / Values                                                |
| :----------------------- | :-------------------------------------------- | :------------------------------------------------------------ |
| $S_{\text{base}}$        | Category Severity $\times$ Subcategory Weight | 5.5 to 13.5 (Data Breach: 9.0, Ransomware: 8.5)               |
| $W_{\text{asset}}$       | Target University Asset Criticality           | 0.85 (Personal BYOD) to 1.50 (Exam/Grading Server)            |
| $M_{\text{data}}$        | Data Classification Involved                  | 0.85 (Public) to 1.50 (Exam Papers / Marking Keys)            |
| $M_{\text{scope}}$       | Operational Blast Radius                      | 0.95 (Individual) to 1.40 (Campus-Wide)                       |
| $\Delta_{\text{status}}$ | Attack State Modifier                         | $+15$ (Active Ongoing), $+10$ (Compromised), $-12$ (Thwarted) |
| $\Delta_{\text{impact}}$ | Impact Modifiers                              | $+8$ (Credentials Entered), $+10$ (Financial Loss/Extortion)  |

### Assigned Risk Levels & Response SLAs:

- **CRITICAL ($85 - 100$):** SLA: **< 1 Hour** | Immediate isolation & mandatory KENET-CERT escalation.
- **HIGH ($70 - 84$):** SLA: **< 4 Hours** | Urgent response & VLAN quarantine.
- **MEDIUM ($40 - 69$):** SLA: **< 24 Hours** | Standard department investigation.
- **LOW ($1 - 39$):** SLA: **< 72 Hours** | Routine review & awareness update.

---

## ☕ Java OOP Architecture (STU 3101 Alignment)

As budgeted in Table 3.1 of the project proposal (Java Development Kit & IntelliJ IDEA / Eclipse), the system includes a complete object-oriented Java domain model:

- `com.unicert.cyberincident.model.Incident`: Core incident entity.
- `com.unicert.cyberincident.model.IncidentCategory`: Enum of 8 predefined incident categories with KENET codes.
- `com.unicert.cyberincident.model.RiskLevel`: Enum of 4 risk tiers with SLA mappings.
- `com.unicert.cyberincident.model.AssetType`: University digital assets with criticality weights.
- `com.unicert.cyberincident.service.RiskAssessmentEngine`: Java implementation of the rule-based scoring engine.
- `com.unicert.cyberincident.service.RecommendationEngine`: Java recommendation generator for reporters and IT staff.
- `com.unicert.cyberincident.Main`: Standalone demonstration CLI.
- `com.unicert.cyberincident.TestRunner`: Pure Java assertion test suite.

---

## 🧪 Automated Verification & Testing

To execute the automated verification test suite:

```bash
node test/test-engine.js
```

### Verification Test Results:

```
🧪 Starting Cyber Incident System Verification Suite...

Test 1: Verifying Predefined Taxonomy Structure...
  ✅ Taxonomy integrity verified.
Test 2: Verifying Low Risk calculation...
  Calculated Score: 5, Level: LOW
  ✅ Low Risk calculation verified.
Test 3: Verifying Critical Ransomware calculation & safety override...
  Calculated Score: 87, Level: CRITICAL
  ✅ Ransomware safety overrides verified.
Test 4: Verifying Exam Paper Compromise escalation...
  Calculated Score: 100, Level: CRITICAL
  ✅ Exam breach escalation verified.
Test 5: Verifying Action Recommendations generation...
  ✅ Action Recommendations verified.
Test 6: Verifying Incident Store filtering & stats...
  Total Incidents: 8, Critical: 4, High: 2
  ✅ Store operations verified.

✨ ALL 6 VERIFICATION TEST SUITES PASSED SUCCESSFULLY! ✨
```

---

## 📂 Project Directory Structure

```
cyber-incident-reporting-system/
├── package.json                          # Project manifest & npm scripts
├── server.js                             # Full-Stack HTTP Server & REST API
├── data/
│   └── incidents.json                    # Persistent pre-seeded & newly submitted incident store
├── lib/
│   ├── classification.js                 # Predefined categories & asset taxonomies
│   ├── risk-engine.js                    # Rule-based risk assessment algorithm
│   ├── recommendations.js               # Action recommendation generator
│   └── incident-store.js                 # Storage, search, filter, and analytics engine
├── public/
│   ├── index.html                        # Single-Page Web Application UI
│   ├── css/
│   │   └── style.css                     # Modern, cybersecurity SOC dark theme styling
│   └── js/
│       ├── api.js                        # REST API client
│       ├── reporting-form.js             # Reporting wizard & live risk preview
│       ├── dashboard.js                  # SOC metrics & dynamic SVG/Canvas charts
│       ├── triage.js                     # Incident management & audit log console
│       ├── tracker.js                    # Public Ticket ID lookup
│       ├── simulator.js                  # Interactive risk simulation sandbox
│       ├── report-exporter.js            # Formal KENET-CERT printable dossier
│       └── app.js                        # Main router and tab coordinator
├── src-java/                             # Complete Java OOP package (STU 3101)
│   └── com/unicert/cyberincident/
│       ├── model/                        # Incident, RiskLevel, IncidentCategory, AssetType
│       ├── service/                      # RiskAssessmentEngine, RecommendationEngine
│       ├── Main.java                     # Java execution demo
│       └── TestRunner.java               # Java unit test suite
├── test/
│   ├── test-engine.js                    # Automated JS verification suite
│   └── test-server.js                    # Server endpoint testing script
├── docs/
│   ├── SRS_DOCUMENTATION.md              # Software Requirements Specification (Task 2 deliverable)
│   ├── SYSTEM_DESIGN_AND_ERD.md          # Architecture, DFD & ERD Specification (Task 3 deliverable)
│   └── KENET_NIST_COMPLIANCE.md          # Compliance with NIST CSF 2.0 & Kenya Data Protection Act
└── README.md                             # Comprehensive project documentation
```

---

## 📜 Academic Deliverables Mapping (Proposal Table 3.2)

| Task       | Key Deliverable                           | System Coverage                                                                                                                                                                  |
| :--------- | :---------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Task 1** | Approved Proposal Document                | Formulates all 4 core system objectives.                                                                                                                                         |
| **Task 2** | Software Requirements Specification (SRS) | [SRS_DOCUMENTATION.md](file:///c:/Users/HP%20840%20G6/OneDrive/Desktop/Projects/Smart%20Farm/cyber-incident-reporting-system/docs/SRS_DOCUMENTATION.md)                          |
| **Task 3** | UI/UX Prototypes & ERD Specification      | [SYSTEM_DESIGN_AND_ERD.md](file:///c:/Users/HP%20840%20G6/OneDrive/Desktop/Projects/Smart%20Farm/cyber-incident-reporting-system/docs/SYSTEM_DESIGN_AND_ERD.md) & interactive UI |
| **Task 4** | Core Functional System Code               | Web app + REST API + Java domain models                                                                                                                                          |
| **Task 5** | Test Evaluation & Audit Report            | [test-engine.js](file:///c:/Users/HP%20840%20G6/OneDrive/Desktop/Projects/Smart%20Farm/cyber-incident-reporting-system/test/test-engine.js) (All 6 test suites passed)           |
| **Task 6** | Final Project Report & Demo               | Complete runnable application at `http://localhost:3000`                                                                                                                         |

# UniCERT
