import { VLSFO_LCV_MJ_PER_TONNE, getGhgTarget, PENALTY_RATE_EUR } from "../../shared/constants";

/**
 * FuelEU Compliance Balance Formula:
 * CB = (GHGtarget - GHGactual) × EnergyInScope
 * Where EnergyInScope = fuelConsumption × LCV
 */
export function computeComplianceBalance(
  ghgActual: number,
  year: number,
  fuelConsumptionTonnes: number
): { cb: number; target: number; energyInScope: number } {
  const target = getGhgTarget(year);
  const energyInScope = fuelConsumptionTonnes * VLSFO_LCV_MJ_PER_TONNE;
  const cb = (target - ghgActual) * energyInScope;
  return { cb, target, energyInScope };
}

/**
 * Calculate penalty for non-compliance
 * Penalty only applies when CB is negative (deficit)
 */
export function computePenalty(cb: number, ghgActual: number): number {
  if (cb >= 0) return 0;
  return Math.abs(cb) * ghgActual * PENALTY_RATE_EUR;
}

/**
 * Calculate percentage difference between actual and baseline GHG intensity
 */
export function computePercentDiff(actual: number, baseline: number): number {
  if (baseline === 0) return 0;
  return ((actual - baseline) / baseline) * 100;
}

/**
 * Check if a ship is compliant (CB >= 0 means compliant)
 */
export function isCompliant(cb: number): boolean {
  return cb >= 0;
}

/**
 * Pool allocation algorithm (Article 21)
 * Transfers surplus from surplus ships to cover deficits
 */
export function allocatePool(
  members: { shipId: string; adjustedCB: number }[]
): { shipId: string; cbBefore: number; cbAfter: number }[] {
  const surplusShips = members
    .filter((m) => m.adjustedCB > 0)
    .map((m) => ({ ...m, remaining: m.adjustedCB }));
  
  const deficitShips = members
    .filter((m) => m.adjustedCB < 0)
    .map((m) => ({ ...m, needed: Math.abs(m.adjustedCB) }));
  
  const zeroShips = members.filter((m) => m.adjustedCB === 0);

  const result: { shipId: string; cbBefore: number; cbAfter: number }[] = [];

  for (const deficit of deficitShips) {
    let needed = deficit.needed;
    
    for (const surplus of surplusShips) {
      if (needed <= 0) break;
      if (surplus.remaining <= 0) continue;

      const transfer = Math.min(needed, surplus.remaining);
      surplus.remaining -= transfer;
      needed -= transfer;
    }

    result.push({
      shipId: deficit.shipId,
      cbBefore: deficit.adjustedCB,
      cbAfter: deficit.adjustedCB + (deficit.needed - needed),
    });
  }

  for (const surplus of surplusShips) {
    result.push({
      shipId: surplus.shipId,
      cbBefore: surplus.adjustedCB,
      cbAfter: surplus.remaining,
    });
  }

  for (const zero of zeroShips) {
    result.push({
      shipId: zero.shipId,
      cbBefore: 0,
      cbAfter: 0,
    });
  }

  return result;
}
