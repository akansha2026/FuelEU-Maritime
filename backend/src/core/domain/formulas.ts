/**
 * Core FuelEU Maritime compliance formulas
 * Based on Regulation (EU) 2023/1805, Annex IV
 * 
 * Note: All calculations use gCO2eq as the base unit.
 * Energy is in MJ, intensity is in gCO2eq/MJ.
 */

import {
  VLSFO_LCV_MJ_PER_TONNE,
  PENALTY_RATE_EUR,
  getGhgTarget,
} from "../../shared/constants";

/**
 * Calculate energy in scope (MJ) from fuel consumption.
 * Using simplified VLSFO LCV of 41,000 MJ/tonne.
 * 
 * In reality, different fuels have different LCVs, but the assignment
 * uses this simplified approach.
 */
export function computeEnergyInScope(fuelConsumptionTonnes: number): number {
  return fuelConsumptionTonnes * VLSFO_LCV_MJ_PER_TONNE;
}

/**
 * Compute Compliance Balance per Annex IV Part A.
 * 
 * Formula: CB = (GHGIEtarget - GHGIEactual) × energyInScope
 * 
 * Positive CB = surplus (ship is below target) ✓
 * Negative CB = deficit (ship exceeds target, penalty applies) ✗
 * 
 * Example for R001 in 2025:
 *   Target = 89.3368 gCO2eq/MJ
 *   Actual = 91.0 gCO2eq/MJ  
 *   Energy = 5000t × 41000 = 205,000,000 MJ
 *   CB = (89.3368 - 91.0) × 205,000,000 = -341,096,000 gCO2eq (deficit)
 */
export function computeComplianceBalance(
  ghgIntensityActual: number,
  year: number,
  fuelConsumptionTonnes: number,
): { cb: number; target: number; energyInScope: number } {
  const target = getGhgTarget(year);
  const energyInScope = computeEnergyInScope(fuelConsumptionTonnes);
  const cb = (target - ghgIntensityActual) * energyInScope;
  return { cb, target, energyInScope };
}

/**
 * Compute penalty in EUR for deficit compliance balance.
 * Per Annex IV Part B.
 * 
 * Formula: Penalty = |CB| / (GHGIEactual × 41,000) × 2,400 EUR
 * 
 * Only applies when CB < 0 (deficit).
 * The 2,400 EUR is the penalty rate per tonne VLSFO-equivalent.
 */
export function computePenalty(
  cb: number,
  ghgIntensityActual: number,
): number {
  if (cb >= 0) return 0; // No penalty for surplus
  
  return (
    (Math.abs(cb) / (ghgIntensityActual * VLSFO_LCV_MJ_PER_TONNE)) *
    PENALTY_RATE_EUR
  );
}

/**
 * Calculate percent difference between two GHG intensities.
 * Used for comparing routes against baseline.
 * 
 * Formula: percentDiff = ((comparison / baseline) - 1) × 100
 * 
 * Negative = better than baseline
 * Positive = worse than baseline
 */
export function computePercentDiff(
  comparisonIntensity: number,
  baselineIntensity: number,
): number {
  return ((comparisonIntensity / baselineIntensity) - 1) * 100;
}

/**
 * Check if a GHG intensity value is compliant for a given year.
 * Simply compares against the year's target intensity.
 */
export function isCompliant(ghgIntensity: number, year: number): boolean {
  return ghgIntensity <= getGhgTarget(year);
}

/**
 * Pool allocation algorithm per Article 21.
 * 
 * Rules from the regulation:
 * 1. Sum of all CB in pool must be >= 0
 * 2. A deficit ship cannot exit with a worse deficit than entry
 * 3. A surplus ship cannot exit with negative CB
 * 
 * Algorithm: Greedy transfer from surplus to deficit ships.
 * - Sort surplus ships by CB descending (biggest givers first)
 * - Sort deficit ships by CB ascending (biggest needs first)
 * - Transfer from surplus to deficit until deficit reaches 0 or surplus exhausted
 * 
 * IMPORTANT: We create a new result array to preserve cbBefore values.
 * Earlier version had a bug where we mutated the original array.
 */
export function allocatePool(
  members: { shipId: string; adjustedCB: number }[],
): { shipId: string; cbBefore: number; cbAfter: number }[] {
  // Create result array with cbBefore preserved
  // This was a bug fix - original code mutated the input array
  const result = members.map((m) => ({
    shipId: m.shipId,
    cbBefore: m.adjustedCB,
    cbAfter: m.adjustedCB,
  }));

  // Separate into surplus (givers) and deficit (receivers)
  const surplusMembers = result
    .filter((m) => m.cbAfter > 0)
    .sort((a, b) => b.cbAfter - a.cbAfter); // Biggest surplus first

  const deficitMembers = result
    .filter((m) => m.cbAfter < 0)
    .sort((a, b) => a.cbAfter - b.cbAfter); // Biggest deficit first

  // Greedy transfer
  for (const deficit of deficitMembers) {
    for (const surplus of surplusMembers) {
      // Stop if deficit is covered
      if (deficit.cbAfter >= 0) break;
      // Skip exhausted surplus
      if (surplus.cbAfter <= 0) continue;

      const needed = Math.abs(deficit.cbAfter);
      const available = surplus.cbAfter;
      const transfer = Math.min(needed, available);

      deficit.cbAfter += transfer;
      surplus.cbAfter -= transfer;
    }
  }

  return result;
}
