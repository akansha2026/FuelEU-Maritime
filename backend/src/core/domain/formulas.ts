import {
  VLSFO_LCV_MJ_PER_TONNE,
  PENALTY_RATE_EUR,
  getGhgTarget,
} from "../../shared/constants";

/**
 * Compute energy in scope in MJ.
 * Simplified: fuelConsumption (tonnes) x 41,000 (MJ/t)
 */
export function computeEnergyInScope(fuelConsumptionTonnes: number): number {
  return fuelConsumptionTonnes * VLSFO_LCV_MJ_PER_TONNE;
}

/**
 * Compute Compliance Balance (gCO2eq) per Annex IV Part A:
 * CB = (GHGIEtarget - GHGIEactual) * energyInScope
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
 * Compute penalty in EUR per Annex IV Part B:
 * Penalty = |CB| / (GHGIEactual * 41,000) * 2,400
 * Only applicable when CB < 0 (deficit).
 */
export function computePenalty(
  cb: number,
  ghgIntensityActual: number,
): number {
  if (cb >= 0) return 0;
  return (
    (Math.abs(cb) / (ghgIntensityActual * VLSFO_LCV_MJ_PER_TONNE)) *
    PENALTY_RATE_EUR
  );
}

/**
 * Compute percent difference for comparison:
 * percentDiff = ((comparison / baseline) - 1) * 100
 */
export function computePercentDiff(
  comparisonIntensity: number,
  baselineIntensity: number,
): number {
  return ((comparisonIntensity / baselineIntensity) - 1) * 100;
}

/**
 * Check if a GHG intensity is compliant for a given year.
 */
export function isCompliant(ghgIntensity: number, year: number): boolean {
  return ghgIntensity <= getGhgTarget(year);
}

/**
 * Greedy pool allocation: transfer surplus from surplus ships to deficit ships.
 * Rules:
 *   - A deficit ship cannot exit with an increased deficit
 *   - A surplus ship cannot exit negative
 */
export function allocatePool(
  members: { shipId: string; adjustedCB: number }[],
): { shipId: string; cbBefore: number; cbAfter: number }[] {
  const result = members.map((m) => ({
    shipId: m.shipId,
    cbBefore: m.adjustedCB,
    cbAfter: m.adjustedCB,
  }));

  const surplusMembers = result
    .filter((m) => m.cbAfter > 0)
    .sort((a, b) => b.cbAfter - a.cbAfter);

  const deficitMembers = result
    .filter((m) => m.cbAfter < 0)
    .sort((a, b) => a.cbAfter - b.cbAfter);

  for (const deficit of deficitMembers) {
    for (const surplus of surplusMembers) {
      if (deficit.cbAfter >= 0) break;
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
