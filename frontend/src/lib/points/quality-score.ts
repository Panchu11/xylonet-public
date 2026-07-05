// ============================================
// XYLONET POINTS SYSTEM V2 - QUALITY SCORE / SYBIL
// Simplified: Quality score removed, sybil detection kept
// ============================================

import {
  SYBIL_THRESHOLDS,
  SYBIL_RISK_THRESHOLDS,
  SYBIL_RISK_WEIGHTS,
  SYBIL_PENALTY,
  getSybilPenalty,
} from './config';

import type {
  SybilIndicators,
  SybilAnalysis,
  SybilRisk,
} from './types';

// ============================================
// SYBIL DETECTION
// ============================================

/**
 * Check for minimum threshold farming
 * 80%+ transactions at exact minimum = suspicious
 */
export function detectMinThresholdFarming(
  transactions: Array<{ volume: number; minThreshold: number }>,
  tolerance: number = 0.01
): boolean {
  const { percentage, minTransactions } = SYBIL_THRESHOLDS.minThresholdFarming;

  if (transactions.length < minTransactions) {
    return false;
  }

  let atMinCount = 0;
  for (const tx of transactions) {
    const minVolume = tx.minThreshold;
    const maxForMin = minVolume * (1 + tolerance);

    if (tx.volume >= minVolume && tx.volume <= maxForMin) {
      atMinCount++;
    }
  }

  const ratio = atMinCount / transactions.length;
  return ratio >= percentage;
}

/**
 * Check for burst activity
 * 90%+ volume in a single day = suspicious
 */
export function detectBurstActivity(
  dailyVolumes: Array<{ date: string; volume: number }>
): { isBurst: boolean; burstDate?: string; burstPercentage?: number } {
  const { percentage } = SYBIL_THRESHOLDS.burstActivity;

  if (dailyVolumes.length <= 1) {
    return { isBurst: false };
  }

  const totalVolume = dailyVolumes.reduce((sum, d) => sum + d.volume, 0);
  if (totalVolume <= 0) {
    return { isBurst: false };
  }

  for (const day of dailyVolumes) {
    const dayPercentage = day.volume / totalVolume;
    if (dayPercentage >= percentage) {
      return {
        isBurst: true,
        burstDate: day.date,
        burstPercentage: dayPercentage,
      };
    }
  }

  return { isBurst: false };
}

/**
 * Check for circular transactions (A->B->A pattern)
 */
export function detectCircularTransactions(
  transactions: Array<{
    from: string;
    to: string;
    amount: number;
    timestamp: number;
  }>
): { hasCircular: boolean; details?: string } {
  const { windowHours, minAmount } = SYBIL_THRESHOLDS.circularTransactions;
  const windowMs = windowHours * 60 * 60 * 1000;

  const pairMap = new Map<string, Array<{ amount: number; timestamp: number; direction: 'out' | 'in' }>>();

  for (const tx of transactions) {
    const pairKey = [tx.from, tx.to].sort().join('-');

    if (!pairMap.has(pairKey)) {
      pairMap.set(pairKey, []);
    }

    pairMap.get(pairKey)!.push({
      amount: tx.amount,
      timestamp: tx.timestamp,
      direction: tx.from < tx.to ? 'out' : 'in',
    });
  }

  for (const [pair, txs] of pairMap) {
    if (txs.length < 2) continue;

    txs.sort((a, b) => a.timestamp - b.timestamp);

    for (let i = 0; i < txs.length - 1; i++) {
      const current = txs[i];
      const next = txs[i + 1];

      if (
        current.direction !== next.direction &&
        next.timestamp - current.timestamp <= windowMs &&
        Math.min(current.amount, next.amount) >= minAmount
      ) {
        return {
          hasCircular: true,
          details: `Circular detected between ${pair} within ${windowHours}h`,
        };
      }
    }
  }

  return { hasCircular: false };
}

/**
 * Calculate overall sybil risk
 */
export function analyzeSybilRisk(indicators: SybilIndicators): SybilAnalysis {
  let riskScore = 0;
  const flags: string[] = [];

  if (indicators.minThresholdFarming) {
    riskScore += SYBIL_RISK_WEIGHTS.minThresholdFarming;
    flags.push('min_threshold_farming');
  }

  if (indicators.burstActivity) {
    riskScore += SYBIL_RISK_WEIGHTS.burstActivity;
    flags.push('burst_activity');
  }

  if (indicators.circularTransactions) {
    riskScore += SYBIL_RISK_WEIGHTS.circularTransactions;
    flags.push('circular_transactions');
  }

  if (indicators.cloneBehavior) {
    riskScore += SYBIL_RISK_WEIGHTS.cloneBehavior;
    flags.push('clone_behavior');
  }

  if (indicators.selfReferral) {
    riskScore += SYBIL_RISK_WEIGHTS.selfReferral;
    flags.push('self_referral');
  }

  let riskLevel: SybilRisk;
  if (riskScore >= SYBIL_RISK_THRESHOLDS.high) {
    riskLevel = 'high';
  } else if (riskScore >= SYBIL_RISK_THRESHOLDS.medium) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  return {
    riskLevel,
    riskScore,
    indicators,
    flags,
  };
}

/**
 * Get penalty multiplier based on sybil risk
 * V2: low=1.0, medium=0.5, high=0.0
 */
export function getSybilPenaltyMultiplier(riskLevel: SybilRisk): number {
  return getSybilPenalty(riskLevel);
}

// ============================================
// SYBIL STATUS DISPLAY HELPERS
// ============================================

export function getSybilStatusDisplay(risk: SybilRisk): {
  label: string;
  color: string;
  description: string;
  multiplier: number;
} {
  switch (risk) {
    case 'high':
      return {
        label: 'Flagged',
        color: 'red',
        description: 'Account flagged for suspicious activity - points suspended',
        multiplier: 0.0,
      };
    case 'medium':
      return {
        label: 'Under Review',
        color: 'yellow',
        description: 'Some suspicious indicators detected - 50% point reduction',
        multiplier: 0.5,
      };
    case 'low':
    default:
      return {
        label: 'Verified',
        color: 'green',
        description: 'Normal activity - full points',
        multiplier: 1.0,
      };
  }
}
