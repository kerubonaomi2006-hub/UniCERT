/**
 * Automated Verification & Unit Test Suite
 * Tests Risk Assessment Engine, Classification Taxonomy, and Recommendations
 */

const assert = require('assert');
const { CATEGORIES, ASSETS, DATA_SENSITIVITY, SCOPE_LEVELS, ATTACK_STATUS } = require('../lib/classification');
const { assessRisk } = require('../lib/risk-engine');
const { generateRecommendations } = require('../lib/recommendations');
const store = require('../lib/incident-store');

console.log('🧪 Starting Cyber Incident System Verification Suite...\n');

// TEST 1: Taxonomy Integrity
console.log('Test 1: Verifying Predefined Taxonomy Structure...');
assert(Object.keys(CATEGORIES).length >= 8, 'Should have at least 8 incident categories');
assert(CATEGORIES.PHISHING.subcategories.length >= 4, 'Phishing should have subcategories');
assert(CATEGORIES.MALWARE.baseSeverity >= 8.0, 'Malware should have high base severity');
console.log('  ✅ Taxonomy integrity verified.');

// TEST 2: Low Risk Incident Calculation
console.log('\nTest 2: Verifying Low Risk calculation...');
const lowRiskResult = assessRisk({
  categoryId: 'INSIDER_THREAT',
  subcategoryId: 'UNAUTHORIZED_SOFTWARE',
  assetId: 'PERSONAL_STUDENT_DEVICE',
  sensitivityId: 'PUBLIC',
  scopeId: 'INDIVIDUAL_ONLY',
  statusId: 'THWARTED_BLOCKED',
  financialLossSuspected: false,
  credentialsCompromised: false
});
console.log(`  Calculated Score: ${lowRiskResult.score}, Level: ${lowRiskResult.level}`);
assert(lowRiskResult.level === 'LOW', `Expected LOW risk, got ${lowRiskResult.level}`);
assert(lowRiskResult.slaHours === 72, 'LOW risk should have 72 hour SLA');
console.log('  ✅ Low Risk calculation verified.');

// TEST 3: Critical Ransomware Incident Calculation & Override
console.log('\nTest 3: Verifying Critical Ransomware calculation & safety override...');
const ransomwareResult = assessRisk({
  categoryId: 'MALWARE',
  subcategoryId: 'RANSOMWARE',
  assetId: 'COMPUTER_LAB_PC',
  sensitivityId: 'INTERNAL_CONFIDENTIAL',
  scopeId: 'SINGLE_DEPARTMENT',
  statusId: 'ACTIVE_ONGOING',
  financialLossSuspected: true,
  credentialsCompromised: false
});
console.log(`  Calculated Score: ${ransomwareResult.score}, Level: ${ransomwareResult.level}`);
assert(ransomwareResult.score >= 85, 'Active ransomware should score >= 85');
assert(ransomwareResult.level === 'CRITICAL', 'Active ransomware should be CRITICAL');
assert(ransomwareResult.kenetEscalationRequired === true, 'KENET escalation must be required');
console.log('  ✅ Ransomware safety overrides verified.');

// TEST 4: Exam Paper Leak Breach Test
console.log('\nTest 4: Verifying Exam Paper Compromise escalation...');
const examLeakResult = assessRisk({
  categoryId: 'DATA_BREACH',
  subcategoryId: 'EXAM_PAPER_LEAK',
  assetId: 'EXAM_GRADING_SYSTEM',
  sensitivityId: 'EXAM_PAPERS',
  scopeId: 'MULTIPLE_DEPARTMENTS',
  statusId: 'ACTIVE_ONGOING',
  financialLossSuspected: false,
  credentialsCompromised: true
});
console.log(`  Calculated Score: ${examLeakResult.score}, Level: ${examLeakResult.level}`);
assert(examLeakResult.level === 'CRITICAL', 'Exam leak must be CRITICAL');
assert(examLeakResult.score >= 90, 'Exam leak should score >= 90');
console.log('  ✅ Exam breach escalation verified.');

// TEST 5: Action Recommendation Generation
console.log('\nTest 5: Verifying Action Recommendations generation...');
const dummyIncident = {
  id: 'TEST-001',
  categoryId: 'PHISHING',
  subcategoryId: 'CREDENTIAL_HARVESTING',
  assetId: 'STUDENT_PORTAL',
  credentialsCompromised: true
};
const recs = generateRecommendations(dummyIncident, { level: 'HIGH', slaHours: 4, slaLabel: '4 Hours', kenetEscalationRequired: true, dataProtectionActNotice: true });
assert(recs.reporterActions.length >= 2, 'Should provide multiple immediate reporter actions');
assert(recs.itTeamPlaybook.length >= 3, 'Should provide structured IT response playbook');
assert(recs.complianceActions.some(c => c.entity.includes('KENET-CERT')), 'Should include KENET-CERT recommendation');
assert(recs.complianceActions.some(c => c.entity.includes('Data Protection')), 'Should include Kenya Data Protection notice');
console.log('  ✅ Action Recommendations verified.');

// TEST 6: Store Filtering and Triage Updates
console.log('\nTest 6: Verifying Incident Store filtering & stats...');
const stats = store.getDashboardStats();
assert(stats.total >= 8, 'Pre-seeded incidents should be >= 8');
assert(stats.byRiskLevel.CRITICAL >= 1, 'Should have critical incidents');
const filtered = store.getAllIncidents({ riskLevel: 'CRITICAL' });
assert(filtered.length === stats.byRiskLevel.CRITICAL, 'Filtered list should match stats count');
console.log(`  Total Incidents: ${stats.total}, Critical: ${stats.byRiskLevel.CRITICAL}, High: ${stats.byRiskLevel.HIGH}`);
console.log('  ✅ Store operations verified.');

// TEST 7: 3-Tier User Hierarchy & Access Control (Proposal Section 2.3)
console.log('\nTest 7: Verifying 3-Tier User Access Hierarchy (General User, IT, Administrator)...');
const userStore = require('../lib/user-store');
const allUsers = userStore.getAllUsers();
assert(allUsers.length >= 3, 'Must have at least 3 pre-seeded users');

const generalUser = userStore.findUserByEmail('student@campus.ac.ke');
const itPersonnel = userStore.findUserByEmail('tech@campus.ac.ke');
const administrator = userStore.findUserByEmail('admin@campus.ac.ke');

assert(generalUser, 'General User must exist');
assert(itPersonnel, 'IT Personnel must exist');
assert(administrator, 'Administrator must exist');

assert.strictEqual(generalUser.role, 'GENERAL_USER', 'General User role mismatch');
assert.strictEqual(itPersonnel.role, 'IT_PERSONNEL', 'IT Personnel role mismatch');
assert.strictEqual(administrator.role, 'ADMIN', 'Administrator role mismatch');

// Verify credential checks
assert(userStore.validateCredentials('student@campus.ac.ke', 'student123'), 'General user login should succeed');
assert(userStore.validateCredentials('tech@campus.ac.ke', 'tech123'), 'IT personnel login should succeed');
assert(userStore.validateCredentials('admin@campus.ac.ke', 'admin123'), 'Administrator login should succeed');
assert(!userStore.validateCredentials('student@campus.ac.ke', 'wrongpass'), 'Invalid password should fail');

console.log(`  Users verified: ${generalUser.name} (${generalUser.role}), ${itPersonnel.name} (${itPersonnel.role}), ${administrator.name} (${administrator.role})`);
console.log('  ✅ 3-Tier User Access Hierarchy verified.');

console.log('\n✨ ALL 7 VERIFICATION TEST SUITES PASSED SUCCESSFULLY! ✨\n');
