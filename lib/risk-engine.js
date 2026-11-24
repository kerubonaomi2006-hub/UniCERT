/**
 * Rule-Based Cybersecurity Risk Assessment Engine
 * Aligned with NIST CSF 2.0 Risk Management & KENET-CERT Guidelines
 * 
 * Computes:
 * - Composite Quantitative Risk Score (1 to 100)
 * - Qualitative Risk Level: LOW, MEDIUM, HIGH, CRITICAL
 * - Target Incident Response SLA (Service Level Agreement)
 * - Factor Analysis (Base Severity, Asset Criticality, Data Sensitivity, Scope, Exploit Status)
 */

const {
  CATEGORIES,
  ASSETS,
  DATA_SENSITIVITY,
  SCOPE_LEVELS,
  ATTACK_STATUS
} = require('./classification');

const RISK_LEVELS = {
  LOW: {
    level: 'LOW',
    label: 'Low Risk',
    color: '#10b981', // green
    badgeClass: 'badge-low',
    slaHours: 72,
    slaLabel: '72 Hours (Routine Investigation)',
    description: 'Minor threat with localized or no operational impact. No sensitive student or institutional data compromised.'
  },
  MEDIUM: {
    level: 'MEDIUM',
    label: 'Medium Risk',
    color: '#f59e0b', // amber
    badgeClass: 'badge-medium',
    slaHours: 24,
    slaLabel: '24 Hours (Standard Escalation)',
    description: 'Moderate threat affecting isolated non-critical systems or individual user accounts. Potential to spread if uncontained.'
  },
  HIGH: {
    level: 'HIGH',
    label: 'High Risk',
    color: '#f97316', // orange
    badgeClass: 'badge-high',
    slaHours: 4,
    slaLabel: '4 Hours (Urgent Incident Response)',
    description: 'Significant security event involving confidential student records, elevated credentials, or critical campus service disruption.'
  },
  CRITICAL: {
    level: 'CRITICAL',
    label: 'Critical Risk',
    color: '#ef4444', // red
    badgeClass: 'badge-critical',
    slaHours: 1,
    slaLabel: '1 Hour (Immediate Emergency Protocol)',
    description: 'Catastrophic event: active ransomware, examination leak, financial breach, or widespread campus network compromise. Requires immediate KENET-CERT escalation.'
  }
};

/**
 * Perform full risk assessment calculation
 * @param {Object} params
 * @param {string} params.categoryId
 * @param {string} params.subcategoryId
 * @param {string} params.assetId
 * @param {string} params.sensitivityId
 * @param {string} params.scopeId
 * @param {string} params.statusId
 * @param {boolean} params.financialLossSuspected
 * @param {boolean} params.credentialsCompromised
 * @returns {Object} Full Risk Assessment result
 */
function assessRisk(params) {
  const category = CATEGORIES[params.categoryId] || CATEGORIES.PHISHING;
  const subcategory = category.subcategories.find(s => s.id === params.subcategoryId) || category.subcategories[0];
  const asset = ASSETS[params.assetId] || ASSETS.PERSONAL_STUDENT_DEVICE;
  const sensitivity = DATA_SENSITIVITY[params.sensitivityId] || DATA_SENSITIVITY.OPERATIONAL;
  const scope = SCOPE_LEVELS[params.scopeId] || SCOPE_LEVELS.INDIVIDUAL_ONLY;
  const status = ATTACK_STATUS[params.statusId] || ATTACK_STATUS.SUSPECTED_ATTEMPT;

  // Base calculation components
  const baseScore = category.baseSeverity * (subcategory.riskWeight || 1.0);
  const assetWeight = asset.criticalityWeight;
  const dataMultiplier = sensitivity.multiplier;
  const scopeMultiplier = scope.multiplier;
  const statusModifier = status.modifier;

  // Additional university impact modifiers
  let impactModifier = 0;
  if (params.credentialsCompromised) {
    impactModifier += 8;
  }
  if (params.financialLossSuspected) {
    impactModifier += 10;
  }

  // Calculate raw composite score
  // Normalized formula calibrated to 1-100 range:
  // Base threat (approx 6-12) * Asset (0.85-1.5) * Data (0.85-1.5) * Scope (0.95-1.4) * scaling factor (4.2)
  const productComponent = (baseScore * assetWeight * dataMultiplier * scopeMultiplier) * 3.8;
  let rawScore = Math.round(productComponent + statusModifier + impactModifier);

  // Safety boundaries
  rawScore = Math.max(5, Math.min(100, rawScore));

  // Determine Risk Level
  let levelInfo;
  if (rawScore >= 85) {
    levelInfo = RISK_LEVELS.CRITICAL;
  } else if (rawScore >= 70) {
    levelInfo = RISK_LEVELS.HIGH;
  } else if (rawScore >= 40) {
    levelInfo = RISK_LEVELS.MEDIUM;
  } else {
    levelInfo = RISK_LEVELS.LOW;
  }

  // Rule-based override safety checks:
  // 1. Any active ransomware is at minimum HIGH
  if (params.subcategoryId === 'RANSOMWARE' && (levelInfo.level === 'LOW' || levelInfo.level === 'MEDIUM')) {
    levelInfo = RISK_LEVELS.HIGH;
    rawScore = Math.max(78, rawScore);
  }
  // 2. Any Exam paper compromise is at minimum HIGH
  if (params.subcategoryId === 'EXAM_PAPER_LEAK' && (levelInfo.level === 'LOW' || levelInfo.level === 'MEDIUM')) {
    levelInfo = RISK_LEVELS.CRITICAL;
    rawScore = Math.max(90, rawScore);
  }
  // 3. Active ongoing attack on Finance or Exam system is automatically CRITICAL
  if ((params.assetId === 'EXAM_GRADING_SYSTEM' || params.assetId === 'FINANCE_ERP') && 
      (params.statusId === 'ACTIVE_ONGOING' || params.statusId === 'CONFIRMED_COMPROMISE')) {
    levelInfo = RISK_LEVELS.CRITICAL;
    rawScore = Math.max(88, rawScore);
  }

  // Build transparent factor contribution analysis
  const factorBreakdown = {
    baseThreat: {
      category: category.name,
      subcategory: subcategory.name,
      score: Number(baseScore.toFixed(2))
    },
    assetCriticality: {
      asset: asset.name,
      weight: assetWeight,
      type: asset.type
    },
    dataSensitivity: {
      classification: sensitivity.name,
      multiplier: dataMultiplier
    },
    incidentScope: {
      level: scope.name,
      multiplier: scopeMultiplier
    },
    exploitStatus: {
      status: status.name,
      modifierPoints: statusModifier
    },
    additionalFactors: {
      credentialsCompromised: !!params.credentialsCompromised,
      financialLossSuspected: !!params.financialLossSuspected,
      bonusPoints: impactModifier
    }
  };

  // Regulatory and escalation flags
  const kenetEscalationRequired = rawScore >= 70 || params.subcategoryId === 'RANSOMWARE' || params.subcategoryId === 'EXAM_PAPER_LEAK';
  const dataProtectionActNotice = params.sensitivityId === 'PII_FINANCIAL' && (params.statusId === 'CONFIRMED_COMPROMISE' || params.statusId === 'ACTIVE_ONGOING');

  return {
    score: rawScore,
    level: levelInfo.level,
    levelLabel: levelInfo.label,
    color: levelInfo.color,
    badgeClass: levelInfo.badgeClass,
    slaHours: levelInfo.slaHours,
    slaLabel: levelInfo.slaLabel,
    levelDescription: levelInfo.description,
    kenetEscalationRequired,
    dataProtectionActNotice,
    factorBreakdown,
    assessedAt: new Date().toISOString()
  };
}

module.exports = {
  RISK_LEVELS,
  assessRisk
};
