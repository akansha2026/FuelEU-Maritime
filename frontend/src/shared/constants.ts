export const GHG_REFERENCE_VALUE = 91.16;

export const REDUCTION_TARGETS: Record<number, number> = {
  2025: 0.02,
  2030: 0.06,
  2035: 0.145,
  2040: 0.31,
  2045: 0.62,
  2050: 0.8,
};

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

export const API_BASE_URL = "/api";
