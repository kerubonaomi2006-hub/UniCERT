# CYBER INCIDENT REPORTING AND RISK ASSESSMENT SYSTEM FOR UNIVERSITIES AND COLLEGES

**Academic Project Documentation**  
**Course:** Bachelor of Science in Information Technology  
**Unit:** STU 3101 Programming Project  
**Candidate Name:** Naomi Kerubo Onyambu  
**Registration Number:** 24/05290  
**Email:** naomikerubo2006@gmail.com  
**Submission Date:** September 30, 2026  

---

## DECLARATION

I, **Naomi Kerubo Onyambu**, declare that this project documentation, titled **“Cyber Incident Reporting and Risk Assessment System for Universities and Colleges”**, is my original work. It has not been submitted to any other college, institution, or university for academic credit or qualification.

**Signature:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  
**Date:** September 30, 2026  

---

## TABLE OF CONTENTS

- **CHAPTER ONE: INTRODUCTION**
  - 1.1 Background of the Study
  - 1.2 Problem Statement
  - 1.3 Aim of the Project
  - 1.4 Objectives of the Study
    - 1.4.1 Main Objective
    - 1.4.2 Research Objectives
    - 1.4.3 System Objectives
  - 1.5 Significance of the Study
  - 1.6 Scope of the System
- **CHAPTER TWO: LITERATURE REVIEW**
  - 2.1 The Cybersecurity Landscape in Higher Education Institutions
  - 2.2 NIST Cybersecurity Framework 2.0 (2024)
  - 2.3 National Research and Education Network Coordination (KENET-CERT Model)
  - 2.4 National Incident Coordination (KE-CIRT/CC) and Regulatory Standards (ODPC 2019)
  - 2.5 Review of Existing Cyber Incident Systems and Triage Tools
  - 2.6 Research Gap Analysis
- **REFERENCES**

---

# CHAPTER ONE: INTRODUCTION

### 1.1 Background of the Study

Modern higher education institutions—including universities, polytechnics, and tertiary colleges—increasingly rely on digital platforms to deliver academic curricula, administer examinations, manage student admissions, and conduct financial operations. Digital assets such as Enterprise Resource Planning (ERP) databases, Learning Management Systems (LMS), campus-wide Wi-Fi infrastructures, digital repositories, and computerized laboratory workstations have become fundamental to day-to-day institutional life.

However, the rapid digitization of higher learning environments has exposed universities and colleges to escalating cybersecurity threats. Higher education environments operate under inherently open networking paradigms designed to facilitate academic collaboration, research exchanges, and ubiquitous access for thousands of transient personal laptops and smartphones (Bring Your Own Device – BYOD). These characteristics render campus infrastructures lucrative targets for cyber threats, including sophisticated spear-phishing campaigns targeting student loan disbursements, ransomware infections disabling computer laboratories, Distributed Denial of Service (DDoS) disruptions during examination windows, and credential harvesting leading to unauthorized access to confidential student grades and personal data.

In conventional university administrative setups, cybersecurity incident reporting and threat evaluation are executed primarily through fragmented, manual mechanisms. When a student, lecturer, or administrative staff member encounters a suspicious incident—such as a deceptive phishing SMS, an unverified portal link, or an encrypted hard drive—they typically report via ad-hoc emails, verbal walk-ins to departmental ICT helpdesks, or generic administrative ticketing systems not engineered for cybersecurity triage. 

Manual reporting processes present several operational deficiencies:
1. **Reporting Friction:** Users without specialized cybersecurity knowledge struggle to articulate technical indicators of compromise (IoCs), resulting in vague, incomplete reports.
2. **Delayed Risk Assessment:** Manual triaging requires ICT personnel to manually investigate raw text descriptions before assessing the severity of the threat, introducing delays that allow fast-propagating malware or active data exfiltration to expand across campus subnets.
3. **Absence of Immediate Containment Guidance:** Reporters rarely receive automated, real-time safety instructions at the moment of submission, leaving compromised accounts vulnerable while waiting for manual review.
4. **Lack of Governance Oversight:** University administrators lack institutional-level visibility into threat recurrence patterns, statutory data breach notification compliance windows, and resource allocation requirements.

To address these vulnerabilities, this project develops a centralized, web-based **Cyber Incident Reporting and Risk Assessment System for Universities and Colleges (UniCERT)**. The system provides a multi-tier platform facilitating structured incident reporting for general users, automated rule-based risk evaluation using National Institute of Standards and Technology (NIST) CSF 2.0 principles, actionable containment recommendations, a Security Operations Centre (SOC) triage console for IT personnel, and governance telemetry for institutional administrators.

---

### 1.2 Problem Statement

Higher education institutions handle vast volumes of sensitive institutional, academic, financial, and personally identifiable information (PII). Despite this critical responsibility, existing incident reporting mechanisms in universities and colleges remain largely informal, decentralized, and manual.

When cybersecurity incidents occur, campus community members (students, teaching faculty, and administrative staff) face significant barriers in reporting threats effectively. Standard institutional email helpdesks lack guided, structured categorization taxonomies, preventing reporters from capturing essential indicators such as suspicious sender addresses, malicious uniform resource locators (URLs), or affected asset categories. Consequently, submitted reports frequently omit technical context required for immediate analysis.

Furthermore, manual assessment of incident severity creates severe operational latency. IT technical teams are forced to manually sift through disparate tickets without standardized risk-scoring criteria, making it challenging to differentiate between minor localized anomalies (such as a solitary spam message) and severe institutional crises (such as an active ransomware attack traversing finance ERP servers). This lack of real-time prioritization delays containment actions during critical initial response windows, exposing institutions to severe data loss, financial fraud, exam integrity compromises, and legal liabilities under statutory regulations such as the Kenya Data Protection Act, 2019, which mandates breach notification within 72 hours.

There is a distinct necessity for an automated, accessible, and mathematically grounded web application that simplifies incident reporting for non-technical users, categorizes threats systematically, automatically computes objective multi-factor risk scores, provides immediate containment steps, and arms technical teams with structured triage workflows.

---

### 1.3 Aim of the Project

The aim of this project is to develop and implement a comprehensive, web-based **Cyber Incident Reporting and Risk Assessment System for Universities and Colleges** that streamlines incident reporting for the academic community, executes real-time multi-factor risk assessments, delivers automated containment instructions, and equips IT experts and administrators with proactive triage and governance tools.

---

### 1.4 Objectives of the Study

#### 1.4.1 Main Objective
To design, develop, and evaluate a multi-tier Cyber Incident Reporting and Risk Assessment System for Universities and Colleges that assists in reporting, categorizing, prioritizing, and assessing cybersecurity incidents in higher education environments.

#### 1.4.2 Research Objectives
1. To identify the primary cybersecurity threats and attack vectors currently affecting higher education institutions in Kenya and internationally.
2. To examine the operational challenges, delays, and structural deficiencies associated with existing manual incident reporting and threat triage procedures within university environments.
3. To investigate how standardized categorization taxonomies, digital asset weighting, and rule-based risk assessment algorithms (aligned with NIST CSF 2.0) enhance incident prioritization and response accuracy.
4. To establish suitable containment actions and mitigation workflows tailored to specific user roles (students, faculty, IT response teams, and executive management).

#### 1.4.3 System Objectives
1. **Interactive Reporting Interface:** To develop a responsive web portal allowing students, lecturers, and staff to report cyber incidents easily using guided taxonomies and optional anonymous/whistleblower reporting.
2. **Automated Incident Classification:** To implement a structured taxonomy engine classifying submissions across predefined institutional threat categories (Phishing, Ransomware, Unauthorized Access, Data Breach, DoS, Network Intrusion, Insider Threat, and Physical Asset Theft).
3. **Multi-Factor Risk Assessment Engine:** To construct a quantitative, rule-based scoring engine calculating real-time risk scores ($1 - 100$) and assigning standardized severity tiers (CRITICAL, HIGH, MEDIUM, LOW) based on base threat weight, target asset criticality, data classification, operational blast radius, and active exploitation modifiers.
4. **Automated Recommendation & Playbook Generation:** To generate real-time containment instructions for incident reporters alongside technical Standard Operating Procedure (SOP) playbooks for IT responders.
5. **Technical SOC Triage Console:** To provide technical personnel with filtering, searching, technician assignment, status updating, forensic note recording, and exportable regulatory notification dossiers.
6. **Executive Governance & Live Telemetry:** To provide institutional administrators with bird's-eye metrics on departmental threat distributions, statutory notification compliance tracking (ODPC 72-hour notice), user access control, and broadcast management for live campus threat advisories.
7. **Persistent PostgreSQL Storage:** To build a robust relational database layer ensuring persistent storage, ACID compliance, and query performance for all incident records, audit logs, and user credentials.

---

### 1.5 Significance of the Study

The development and deployment of this system offers substantial practical, operational, and academic value across multiple institutional stakeholders:

1. **For General Users (Students, Lecturers, and Campus Staff):**
   - Eliminates technical intimidation by providing an intuitive reporting wizard with guided category selection.
   - Provides immediate confirmation and actionable, step-by-step containment instructions upon submission (e.g., disconnecting Wi-Fi, changing compromised passwords, isolating suspicious emails), mitigating panic and secondary damage before IT personnel intervene.
   - Enables end-to-end transparency through the public ticket tracking module, allowing users to monitor investigation progress without administrative privilege escalations.

2. **For IT Personnel & Technical Incident Responders:**
   - Automates the initial triage burden by converting raw reports into mathematically scored, prioritized tickets with calculated Response Service Level Agreements (SLAs).
   - Provides structured forensic workflows, technical containment checklists mapped to NIST CSF 2.0 response functions, and unified investigation audit trails.
   - Drastically shortens Mean Time to Detect (MTTD) and Mean Time to Respond (MTTR), allowing technical specialists to isolate high-risk threats before lateral spread occurs across university networks.

3. **For University Management and Administrators:**
   - Delivers real-time institutional risk intelligence via interactive KPI telemetry, highlighting targeted faculties, vulnerable digital assets, and recurring threat patterns.
   - Safeguards institutional compliance with legal data protection mandates (e.g., Section 43 of the Kenya Data Protection Act 2019 and KENET-CERT directives) by automatically identifying breaches involving sensitive student or financial records requiring formal external notification.
   - Enables institutional broadcast management, allowing administrators to publish urgent threat advisories across campus dashboards instantly when emergent attack campaigns are discovered.

4. **For Academic Researchers and the Computing Discipline:**
   - Establishes a concrete, open-source architectural reference demonstrating how international cybersecurity standards (NIST CSF 2.0) can be adapted practically for educational environments.
   - Contributes an empirical implementation model combining front-end responsive design, rule-based inference engines, and relational database persistence for computer security education.

---

### 1.6 Scope of the System

- **Target Environment:** Higher education institutions (universities, colleges, and polytechnics) operating decentralized student and staff user populations.
- **Threat Categories Covered:** Phishing and social engineering, malware and ransomware infections, unauthorized portal access, confidential student/staff data breaches, Denial of Service (DoS/DDoS) on academic systems, campus Wi-Fi rogue access points/network scanning, insider threat/grade tampering, and laboratory hardware theft.
- **Operational Boundaries:** The system operates as a software-level reporting, risk assessment, and incident management orchestration layer. It integrates with institutional workflows but does not replace physical network firewalls, endpoint antivirus software, or Deep Packet Inspection (DPI) appliances; rather, it coordinates human telemetry with technical response procedures.

---

# CHAPTER TWO: LITERATURE REVIEW

### 2.1 The Cybersecurity Landscape in Higher Education Institutions

Higher education institutions possess unique operational characteristics that make them exceptionally vulnerable to cyber threats compared to traditional corporate enterprises. In corporate settings, IT environments are strictly regimented: employee workstations are centrally managed, software installations are restricted, and perimeter network defenses enforce stringent firewall filtering. Conversely, academic environments prioritize academic freedom, decentralized departmental autonomy, open scientific data exchange, and high user turnover.

According to empirical research by EDUCAUSE (2024), higher education institutions consistently rank among the most frequently attacked sectors worldwide. Threats in academic settings are characterized by several predominant vectors:
- **Social Engineering & Financial Phishing:** Deceptive SMS and email phishing scams targeting tuition payments, scholarship disbursements, and student portal credentials represent over 60% of reported higher education security incidents.
- **Ransomware & Laboratory Infrastructure Sabotage:** Ransomware operators deliberately exploit unpatched laboratory computers, encrypting local disks and demanding extortion payments while disrupting teaching and research schedules.
- **Academic & Credential Integrity Compromises:** Unauthorized account takeovers driven by weak authentication protocols frequently result in illegal grade alterations, intellectual property theft, and leakages of confidential examination papers.
- **Distributed Denial of Service (DDoS):** Malicious flood attacks timed to coincide with high-traffic milestones—such as semester course registrations, fee payment deadlines, and online examinations—routinely degrade university availability.

The literature underscores that the primary bottleneck in campus cyber defense is not merely perimeter technological defense, but **human reporting velocity**. Without a centralized, frictionless reporting platform, security teams remain unaware of active breaches until substantial damage has materialized.

---

### 2.2 NIST Cybersecurity Framework 2.0 (2024)

The National Institute of Standards and Technology (NIST) published the **Cybersecurity Framework (CSF) 2.0** in February 2024, expanding upon its widely adopted framework to encompass all organizational types, regardless of sector or size. NIST CSF 2.0 organizes cybersecurity outcomes into six fundamental, continuous functions: **Govern, Identify, Protect, Detect, Respond, and Recover** (NIST, 2024; Nelson et al., 2025).

The architecture of the proposed system directly operationalizes these six core functions within the university context:

| NIST CSF 2.0 Function | Description & Institutional Mandate | UniCERT System Implementation |
| :--- | :--- | :--- |
| **GOVERN (GV)** | Establishing organizational cybersecurity risk management policies, oversight, and statutory compliance. | Administrative governance dashboard, role-based access management, and statutory breach audit trails (ODPC 72-hour notification tracking). |
| **IDENTIFY (ID)** | Understanding digital assets, critical data repositories, and potential risk factors. | Digital asset taxonomy registry (Student ERP, Exam Servers, Wi-Fi, LMS, Lab PCs) with criticality weighting coefficients ($W_A$). |
| **PROTECT (PR)** | Enforcing safeguards to support system resilience and secure computing practices. | Role-based navigation tiers (General User, IT Personnel, Admin), automated account credential isolation, and secure user session management. |
| **DETECT (DE)** | Identifying the occurrence of cybersecurity events and suspicious network activity. | Guided incident reporting portal for students and staff with structured Indicator of Compromise (IoC) capture and real-time category tagging. |
| **RESPOND (RS)** | Executing containment, triage, mitigation, and playbooks once an event is discovered. | Quantitative rule-based risk calculation ($1-100$), automated SLA timer assignment, reporter safety checklists, and IT SOC response playbooks. |
| **RECOVER (RC)** | Restoring compromised services, maintaining resilience, and recording lessons learned. | Investigation lifecycle tracking (`NEW` $\rightarrow$ `CLOSED`), timestamped audit trails, and formal post-incident dossier exports. |

NIST Special Publication 800-61 Revision 3 (*Incident Response Recommendations and Considerations for Cybersecurity Risk Management*) emphasizes that effective incident triage requires combining qualitative threat indicators with quantitative scoring rules to eliminate subjectivity during emergency triage (Cichonski et al., 2012; Nelson et al., 2025). This recommendation provides direct theoretical foundation for the quantitative formula adopted in this project.

---

### 2.3 National Research and Education Network Coordination (KENET-CERT Model)

In Kenya, higher education and research institutions operate under the umbrella of the **Kenya Education Network (KENET)**, which serves as the National Research and Education Network (NREN). KENET operates **KENET-CERT**, a specialized Computer Emergency Response Team dedicated to monitoring, coordinating, and mitigating cybersecurity incidents across universities, university colleges, and tertiary research institutions.

KENET-CERT provides operational threat intelligence feeds, conducts vulnerability assessments, and assists member institutions in resolving advanced security incidents. However, KENET-CERT's official guidelines require member universities to maintain internal incident management readiness. Specifically, KENET-CERT mandates that:
1. Member institutions must operate internal Computer Security Incident Response Teams (CSIRTs) or designated incident handlers.
2. High-severity incidents affecting core academic connectivity or involving extortion/ransomware must be reported to KENET-CERT within **2 hours** of discovery.
3. Incident notifications submitted to the external CERT must contain structured forensic evidence, including verified timestamps, affected IP addresses, raw message headers, and containment steps already initiated.

The literature reveals a prominent operational challenge: while KENET-CERT exists at the consortium level, individual member campuses lack internal automation to collect, structure, and export incident dossiers adhering to KENET standards. The system developed in this project directly bridges this operational interface by incorporating an automated **KENET-CERT Notification Dossier Exporter**, producing standardized formal notification reports ready for immediate regulatory dispatch.

---

### 2.4 National Incident Coordination (KE-CIRT/CC) and Regulatory Standards (ODPC 2019)

At the national level, cybersecurity response in Kenya is governed by the **National Kenya Computer Incident Response Team – Coordination Centre (KE-CIRT/CC)**, hosted by the Communications Authority of Kenya under the Computer Misuse and Cybercrimes Act, 2018. KE-CIRT/CC coordinates cybersecurity response across public, private, and educational sectors.

Concurrently, the enactment of the **Kenya Data Protection Act, 2019**, enforced by the Office of the Data Protection Commissioner (ODPC), established stringent legal obligations for educational institutions handling personal information. Under **Section 43 (1)** of the Act:
> *"A data controller or data processor that has suffered a personal data breach shall notify the Data Commissioner of the breach within seventy-two (72) hours of becoming aware of the breach."*

Furthermore, **Section 43 (2)** dictates that where the breach is likely to result in a high risk to the rights and freedoms of data subjects (e.g., student PII, medical records, or banking details), the institution must communicate the breach to the affected individuals without undue delay. Non-compliance attracts statutory penalties of up to KES 5 million or 1% of annual gross revenue.

Existing literature notes that universities frequently fail to meet the 72-hour notification threshold due to internal triage delays. Incident reports logged manually often remain unreviewed for days before IT personnel identify that personal data was leaked. The system designed in this project incorporates automated statutory compliance rules that instantly flag breaches involving PII and start regulatory notification clocks.

---

### 2.5 Review of Existing Cyber Incident Systems and Triage Tools

A comprehensive review of existing cybersecurity incident reporting and management platforms highlights several paradigms, each possessing strengths and notable limitations within higher education:

| System / Tool | Architecture & Primary Focus | Strengths | Limitations in Higher Education Context |
| :--- | :--- | :--- | :--- |
| **KE-CIRT/CC Public Portal** | National web reporting form operated by Communications Authority. | Direct link to national law enforcement and cross-sector advisories. | Designed for national scale; does not integrate into internal university campus networks, localized asset structures, or internal IT workflows. |
| **Jira Service Management / ServiceNow** | Enterprise IT Service Management (ITSM) ticketing platforms. | Highly configurable workflows, enterprise ticketing, and asset management. | Extremely high licensing costs; overly complex for ordinary students reporting phishing; lacks built-in NIST CSF quantitative cyber risk scoring engines. |
| **TheHive / Cortex** | Dedicated Open-Source Security Incident Response Platform (SIRP) for SOCs. | Excellent dynamic analysis, observable tracking, and forensic integration. | Targeted exclusively at senior SOC analysts; completely inaccessible to non-technical students and academic staff seeking to submit simple threat reports. |
| **General University Helpdesk Ticketing (OS Ticket, RT)** | Generic helpdesk software for IT repairs, email issues, and hardware requests. | Simple user submission forms, open-source accessibility. | Treats cyber incidents as regular IT repair tickets; lacks automated threat prioritization, IoC extraction, regulatory timers, or role-adaptive views. |

---

### 2.6 Research Gap Analysis

The literature synthesis reveals a critical operational void:

```
┌─────────────────────────────────────────────────────────────┐
│                    EXISTING PARADIGMS                       │
├───────────────────────────────┬─────────────────────────────┤
│   High-End SOC Tools          │   Generic Helpdesks         │
│   (TheHive, Cortex, Splunk)   │   (OS Ticket, Email Queues) │
│   • Built for expert analysts │   • Accessible to students  │
│   • High complexity & cost    │   • No cyber risk scoring   │
│   • No end-user submission    │   • No automated playbooks  │
│     interface for students    │   • No statutory SLA alerts │
└───────────────────────────────┴─────────────────────────────┘
                               ▲
                               │
            ┌──────────────────┴──────────────────┐
            │        IDENTIFIED RESEARCH GAP      │
            ├─────────────────────────────────────┤
            │  Absence of a unified, lightweight, │
            │  role-adaptive cyber incident       │
            │  platform specifically tailored for │
            │  higher education institutions.     │
            └─────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   PROPOSED SOLUTION: UniCERT                │
├─────────────────────────────────────────────────────────────┤
│  ✓ 3-Tier Access Hierarchy: General User | IT | Admin       │
│  ✓ Guided 2-minute student reporting + anonymous mode       │
│  ✓ Automated NIST CSF 2.0 rule-based multi-factor risk score│
│  ✓ Immediate reporter containment checklist                 │
│  ✓ Technical SOC triage & response playbooks                │
│  ✓ Live Campus Threat Alert Bulletin updateable by Admin    │
│  ✓ Relational PostgreSQL persistence & audit logging        │
└─────────────────────────────────────────────────────────────┘
```

Existing systems operate either at the macroscopic national level (KE-CIRT/CC, KENET-CERT) or at extreme ends of the tooling spectrum (overly complex commercial SOC suites vs. primitive email queues). There is an absence of an open, cost-effective, unified system designed specifically for the higher education sector that:
1. Empowers non-technical general users (students and lecturers) with simple, guided reporting forms.
2. Executes real-time mathematical risk evaluation without requiring manual initial inspection.
3. Disables access to sensitive technical response playbooks and triage management controls for general users while preserving transparency.
4. Allows administrators to broadcast live campus threat alerts immediately when emergent cyber scams are detected.
5. Employs modern relational database architecture (PostgreSQL) ensuring robust query performance, referential integrity, and persistent forensic archiving.

This project addresses this exact gap, delivering an integrated, standards-compliant, and practical software platform tailored for higher education cybersecurity.

---

# REFERENCES

- Cichonski, P., Millar, T., Grance, T., & Scarfone, K. (2012). *Computer security incident handling guide* (NIST Special Publication 800-61 Revision 2). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.SP.800-61r2
- Communications Authority of Kenya. (n.d.). *National Kenya Computer Incident Response Team–Coordination Centre (KE-CIRT/CC): Report an incident*. https://ke-cirt.go.ke/report-an-incident/
- Data Protection Act. (2019). *The Data Protection Act, 2019 (No. 24 of 2019)*. Kenya Gazette Supplement No. 181 (Acts No. 24). Government of Kenya.
- EDUCAUSE. (2024). *2024 EDUCAUSE Top 10: Cybersecurity and privacy in higher education*. EDUCAUSE Review. https://www.educause.edu/
- International Organization for Standardization. (2023). *Information technology — Security techniques — Information security incident management* (ISO/IEC Standard No. 27035:2023). https://www.iso.org/standard/79012.html
- Kenya Education Network. (n.d.). *KENET-CERT: Cybersecurity Emergency Response Team*. https://cert.kenet.net/
- National Institute of Standards and Technology. (2024). *The NIST Cybersecurity Framework (CSF) 2.0* (NIST Cybersecurity White Paper 29). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.CSWP.29
- Nelson, A., Rekhi, S., Scarfone, K., & Souppaya, M. (2025). *Incident response recommendations and considerations for cybersecurity risk management: A CSF 2.0 community profile* (NIST Special Publication 800-61 Revision 3). National Institute of Standards and Technology. https://doi.org/10.6028/NIST.SP.800-61r3
- Schwaber, K., & Sutherland, J. (2020). *The Scrum guide: The definitive guide to Scrum: The rules of the game*. https://scrumguides.org/scrum-guide.html
