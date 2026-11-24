/**
 * Predefined Cybersecurity Incident Classification Taxonomy
 * Aligned with:
 * - NIST Cybersecurity Framework 2.0 (CSF 2.0)
 * - Kenya Education Network CERT (KENET-CERT)
 * - National KE-CIRT/CC (Communications Authority of Kenya)
 */

const CATEGORIES = {
  PHISHING: {
    id: 'PHISHING',
    name: 'Phishing & Social Engineering',
    baseSeverity: 6.0,
    icon: 'fish',
    description: 'Deceptive messages, malicious links, and spoofed communications intended to deceive university students or staff into revealing credentials or financial details.',
    subcategories: [
      { id: 'CREDENTIAL_HARVESTING', name: 'Student / Staff Portal Credential Harvesting', riskWeight: 1.15 },
      { id: 'FAKE_FEE_PAYMENT', name: 'Fake University Fee Payment / Bursary Scam', riskWeight: 1.3 },
      { id: 'EXECUTIVE_IMPERSONATION', name: 'Executive Impersonation (VC / Dean / HOD spoofing)', riskWeight: 1.25 },
      { id: 'MALICIOUS_ATTACHMENT', name: 'Malicious Email Attachment (Macro/Doc/Zip)', riskWeight: 1.2 },
      { id: 'SMS_WHATSAPP_SMISHING', name: 'WhatsApp / SMS Smishing targeting students', riskWeight: 1.05 }
    ],
    nistFunction: 'DETECT / RESPOND',
    kenetCategory: 'KENET-CAT-01 (Social Engineering)'
  },
  MALWARE: {
    id: 'MALWARE',
    name: 'Malware & Ransomware',
    baseSeverity: 8.5,
    icon: 'shield-alert',
    description: 'Malicious software designed to infiltrate, damage, lock, or harvest data from campus computer labs, faculty laptops, or university servers.',
    subcategories: [
      { id: 'RANSOMWARE', name: 'Ransomware / File Encryption Attack', riskWeight: 1.45 },
      { id: 'TROJAN_BACKDOOR', name: 'Trojan / Remote Access Trojan (RAT)', riskWeight: 1.3 },
      { id: 'KEYLOGGER_SPYWARE', name: 'Keylogger / Credential Stealer on Lab PCs', riskWeight: 1.35 },
      { id: 'CRYPTOMINER', name: 'Cryptominer utilizing Campus Computing Resources', riskWeight: 1.1 },
      { id: 'WORM_NETWORK_SPREAD', name: 'Self-replicating Network Worm / USB propagation', riskWeight: 1.25 }
    ],
    nistFunction: 'PROTECT / RESPOND',
    kenetCategory: 'KENET-CAT-02 (Malicious Code)'
  },
  UNAUTHORIZED_ACCESS: {
    id: 'UNAUTHORIZED_ACCESS',
    name: 'Unauthorized Access & Account Takeover',
    baseSeverity: 7.5,
    icon: 'lock',
    description: 'Gaining illicit access to student management systems, university email accounts, staff workstations, or administrative accounts.',
    subcategories: [
      { id: 'STUDENT_PORTAL_TAKEOVER', name: 'Student Portal Compromise (Course Registration / Fee Records)', riskWeight: 1.2 },
      { id: 'GRADE_TAMPERING_ATTEMPT', name: 'Attempted Grade Modification / Exam System Tampering', riskWeight: 1.45 },
      { id: 'ADMIN_PRIVILEGE_ESCALATION', name: 'Active Directory / System Admin Account Compromise', riskWeight: 1.4 },
      { id: 'BRUTE_FORCE_ATTACK', name: 'Brute-force / Credential Stuffing on University SSO', riskWeight: 1.15 },
      { id: 'STAFF_EMAIL_HIJACK', name: 'Staff / Faculty Email Hijack for Business Compromise', riskWeight: 1.25 }
    ],
    nistFunction: 'DETECT / RESPOND',
    kenetCategory: 'KENET-CAT-03 (Unauthorized Access)'
  },
  DATA_BREACH: {
    id: 'DATA_BREACH',
    name: 'Data Breach & Confidentiality Leak',
    baseSeverity: 9.0,
    icon: 'database',
    description: 'Unauthorized extraction, leakage, or exposure of sensitive academic records, examination papers, student personal data, or financial assets.',
    subcategories: [
      { id: 'EXAM_PAPER_LEAK', name: 'Upcoming Examination Paper Leak / Compromise', riskWeight: 1.5 },
      { id: 'STUDENT_PII_LEAK', name: 'Student PII & National ID / Admission Records Leak', riskWeight: 1.35 },
      { id: 'FINANCE_PAYROLL_EXPOSURE', name: 'University Financial Records / Payroll Data Disclosure', riskWeight: 1.4 },
      { id: 'RESEARCH_IP_THEFT', name: 'Intellectual Property / Academic Research Data Theft', riskWeight: 1.25 },
      { id: 'PUBLIC_CLOUD_MISCONFIG', name: 'Misconfigured Public S3 / Cloud Storage Bucket', riskWeight: 1.2 }
    ],
    nistFunction: 'PROTECT / RESPOND / GOVERN',
    kenetCategory: 'KENET-CAT-04 (Information Disclosure)'
  },
  DENIAL_OF_SERVICE: {
    id: 'DENIAL_OF_SERVICE',
    name: 'Denial of Service (DoS / DDoS)',
    baseSeverity: 7.0,
    icon: 'zap-off',
    description: 'Flooding university servers, gateways, or portals with traffic to render them unavailable to students and faculty during critical academic periods.',
    subcategories: [
      { id: 'PORTAL_EXAM_OUTAGE', name: 'Student Portal / Exam Platform Outage during Exams', riskWeight: 1.4 },
      { id: 'CAMPUS_WIFI_DISRUPTION', name: 'Campus Wi-Fi / Gateway Network Jamming', riskWeight: 1.15 },
      { id: 'DNS_SERVICE_OUTAGE', name: 'University DNS / Core Routing Service Disruption', riskWeight: 1.3 },
      { id: 'LMS_MOODLE_CRASH', name: 'Learning Management System (Moodle) Traffic Flooding', riskWeight: 1.25 }
    ],
    nistFunction: 'PROTECT / RESPOND',
    kenetCategory: 'KENET-CAT-05 (Availability & DoS)'
  },
  NETWORK_INTRUSION: {
    id: 'NETWORK_INTRUSION',
    name: 'Network Intrusion & Scanning',
    baseSeverity: 6.5,
    icon: 'network',
    description: 'Unauthorized penetration, reconnaissance, port scanning, or rogue wireless access points detected within the university network infrastructure.',
    subcategories: [
      { id: 'ROGUE_EVIL_TWIN_WIFI', name: 'Rogue "Evil Twin" Access Point impersonating Campus Wi-Fi', riskWeight: 1.35 },
      { id: 'PORT_SCANNING_RECON', name: 'Aggressive Internal Port Scanning / Network Reconnaissance', riskWeight: 1.1 },
      { id: 'MAN_IN_THE_MIDDLE', name: 'ARP Spoofing / Man-in-the-Middle (MitM) on Student Subnet', riskWeight: 1.3 },
      { id: 'UNAUTHORIZED_VPN_PROXY', name: 'Unauthorized Tunnel / Shadow Proxy bypassing Firewall', riskWeight: 1.15 }
    ],
    nistFunction: 'DETECT / RESPOND',
    kenetCategory: 'KENET-CAT-06 (Network Security)'
  },
  INSIDER_THREAT: {
    id: 'INSIDER_THREAT',
    name: 'Insider Threat & Policy Violation',
    baseSeverity: 6.0,
    icon: 'user-x',
    description: 'Deliberate or negligent misuse of authorized access by students, faculty, or technical staff contrary to university IT security policy.',
    subcategories: [
      { id: 'UNAUTHORIZED_SOFTWARE', name: 'Unapproved P2P / Tor / Hacking Tools on Lab Machines', riskWeight: 1.05 },
      { id: 'PRIVILEGE_ABUSE', name: 'Staff / Student Assistant Abusing System Administrative Rights', riskWeight: 1.35 },
      { id: 'POLICY_SECURITY_BYPASS', name: 'Disabling Campus Endpoint Antivirus / Firewall Controls', riskWeight: 1.15 },
      { id: 'SHARED_PASSWORD_ABUSE', name: 'Credential Sharing for Restricted Academic Resources', riskWeight: 1.1 }
    ],
    nistFunction: 'GOVERN / PROTECT',
    kenetCategory: 'KENET-CAT-07 (Policy & Insider)'
  },
  PHYSICAL_SECURITY: {
    id: 'PHYSICAL_SECURITY',
    name: 'Physical Security & Hardware Theft',
    baseSeverity: 5.5,
    icon: 'laptop',
    description: 'Physical theft, unauthorized physical entry to data centers or server rooms, or tampering with university computing hardware.',
    subcategories: [
      { id: 'STOLEN_LAB_COMPUTER', name: 'Stolen Desktop PC / Storage Media from Campus Labs', riskWeight: 1.1 },
      { id: 'STOLEN_STAFF_LAPTOP', name: 'Stolen Staff Laptop containing Unencrypted Student Records', riskWeight: 1.4 },
      { id: 'SERVER_ROOM_BREACH', name: 'Unauthorized Physical Access to University Server Room', riskWeight: 1.45 },
      { id: 'HARDWARE_KEYLOGGER', name: 'Physical Hardware Keylogger found plugged into Lab PC', riskWeight: 1.35 }
    ],
    nistFunction: 'PROTECT / DETECT',
    kenetCategory: 'KENET-CAT-08 (Physical & Hardware)'
  }
};

const ASSETS = {
  EXAM_GRADING_SYSTEM: { id: 'EXAM_GRADING_SYSTEM', name: 'Examination & Grading System', criticalityWeight: 1.5, type: 'CRITICAL_ACADEMIC' },
  FINANCE_ERP: { id: 'FINANCE_ERP', name: 'Finance & Student Fee Collection ERP', criticalityWeight: 1.45, type: 'CRITICAL_FINANCIAL' },
  STUDENT_PORTAL: { id: 'STUDENT_PORTAL', name: 'Student Self-Service Portal (ERP)', criticalityWeight: 1.35, type: 'CORE_SERVICE' },
  CAMPUS_NETWORK_CORE: { id: 'CAMPUS_NETWORK_CORE', name: 'Campus Core Network Switch & Firewall', criticalityWeight: 1.3, type: 'INFRASTRUCTURE' },
  LMS_MOODLE: { id: 'LMS_MOODLE', name: 'Learning Management System (Moodle/Virtual Campus)', criticalityWeight: 1.25, type: 'ACADEMIC_PLATFORM' },
  UNIVERSITY_EMAIL: { id: 'UNIVERSITY_EMAIL', name: 'Institutional Email & Microsoft 365 / Google Workspace', criticalityWeight: 1.2, type: 'COMMUNICATION' },
  COMPUTER_LAB_PC: { id: 'COMPUTER_LAB_PC', name: 'Computer Science Lab Workstations (Campus Labs)', criticalityWeight: 1.05, type: 'STUDENT_FACILITY' },
  CAMPUS_WIFI: { id: 'CAMPUS_WIFI', name: 'Campus Student & Guest Wi-Fi Network', criticalityWeight: 1.0, type: 'NETWORK' },
  PERSONAL_STUDENT_DEVICE: { id: 'PERSONAL_STUDENT_DEVICE', name: 'Personal Student / BYOD Laptop or Smartphone', criticalityWeight: 0.85, type: 'ENDPOINT' },
  LIBRARY_SYSTEM: { id: 'LIBRARY_SYSTEM', name: 'Digital Library & E-Resource Repository', criticalityWeight: 1.0, type: 'ACADEMIC_RESOURCE' }
};

const DATA_SENSITIVITY = {
  EXAM_PAPERS: { id: 'EXAM_PAPERS', name: 'Examination Papers & Marking Keys', multiplier: 1.5 },
  PII_FINANCIAL: { id: 'PII_FINANCIAL', name: 'Personal Identifiable Information (PII) & Fee Records', multiplier: 1.4 },
  INTERNAL_CONFIDENTIAL: { id: 'INTERNAL_CONFIDENTIAL', name: 'Internal University Communications & Minutes', multiplier: 1.15 },
  OPERATIONAL: { id: 'OPERATIONAL', name: 'Operational & Course Material Data', multiplier: 1.0 },
  PUBLIC: { id: 'PUBLIC', name: 'Public Directory & Marketing Information', multiplier: 0.85 }
};

const SCOPE_LEVELS = {
  CAMPUS_WIDE: { id: 'CAMPUS_WIDE', name: 'Campus-wide / Entire University Institution', multiplier: 1.4 },
  MULTIPLE_DEPARTMENTS: { id: 'MULTIPLE_DEPARTMENTS', name: 'Multiple Academic Departments / Faculties', multiplier: 1.25 },
  SINGLE_DEPARTMENT: { id: 'SINGLE_DEPARTMENT', name: 'Single Department / Lab / Office', multiplier: 1.1 },
  INDIVIDUAL_ONLY: { id: 'INDIVIDUAL_ONLY', name: 'Individual Student or Staff Member Only', multiplier: 0.95 }
};

const ATTACK_STATUS = {
  ACTIVE_ONGOING: { id: 'ACTIVE_ONGOING', name: 'Active & Ongoing Attack (Imminent / Present Damage)', modifier: 15 },
  CONFIRMED_COMPROMISE: { id: 'CONFIRMED_COMPROMISE', name: 'Confirmed System Compromise / Data Accessed', modifier: 10 },
  SUSPECTED_ATTEMPT: { id: 'SUSPECTED_ATTEMPT', name: 'Suspected Activity / Probe Detected', modifier: 0 },
  THWARTED_BLOCKED: { id: 'THWARTED_BLOCKED', name: 'Thwarted / Successfully Blocked by Defenses', modifier: -12 }
};

module.exports = {
  CATEGORIES,
  ASSETS,
  DATA_SENSITIVITY,
  SCOPE_LEVELS,
  ATTACK_STATUS
};
