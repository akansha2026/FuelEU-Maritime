/** FuelEU reference GHG intensity (gCO2eq/MJ) per Article 4(2) */
export const GHG_REFERENCE_VALUE = 91.16;

/** Reduction targets by year range per Article 4(2) */
export const REDUCTION_TARGETS: Record<number, number> = {
  2025: 0.02,
  2026: 0.02,
  2027: 0.02,
  2028: 0.02,
  2029: 0.02,
  2030: 0.06,
  2031: 0.06,
  2032: 0.06,
  2033: 0.06,
  2034: 0.06,
  2035: 0.145,
  2040: 0.31,
  2045: 0.62,
  2050: 0.8,
};

/** Simplified LCV for VLSFO (MJ/t) used in penalty formula per Annex IV Part B */
export const VLSFO_LCV_MJ_PER_TONNE = 41_000;

/** Penalty rate (EUR/t VLSFO-equivalent) per Annex IV Part B */
export const PENALTY_RATE_EUR = 2_400;

/**
 * Get the GHG intensity target for a given year.
 * Falls back to nearest lower year bracket if exact year not listed.
 */
export function getGhgTarget(year: number): number {
  const sortedYears = Object.keys(REDUCTION_TARGETS)
    .map(Number)
    .sort((a, b) => a - b);

  let reduction = 0;
  for (const y of sortedYears) {
    if (y <= year) {
      reduction = REDUCTION_TARGETS[y];
    }
  }

  return GHG_REFERENCE_VALUE * (1 - reduction);
}
