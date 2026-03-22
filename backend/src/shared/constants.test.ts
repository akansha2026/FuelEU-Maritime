import { describe, it, expect } from "vitest";
import {
  GHG_REFERENCE_VALUE,
  REDUCTION_TARGETS,
  VLSFO_LCV_MJ_PER_TONNE,
  PENALTY_RATE_EUR,
  getGhgTarget,
} from "./constants";

describe("Constants", () => {
  it("should have correct GHG reference value per EU regulation", () => {
    expect(GHG_REFERENCE_VALUE).toBe(91.16);
  });

  it("should have correct VLSFO LCV value in MJ/tonne", () => {
    expect(VLSFO_LCV_MJ_PER_TONNE).toBe(41000);
  });

  it("should have correct penalty rate (2400 EUR per tonne)", () => {
    expect(PENALTY_RATE_EUR).toBe(2400);
  });

  it("should have all reduction targets as per EU regulation", () => {
    expect(REDUCTION_TARGETS[2025]).toBe(0.02);
    expect(REDUCTION_TARGETS[2030]).toBe(0.06);
    expect(REDUCTION_TARGETS[2035]).toBe(0.145);
    expect(REDUCTION_TARGETS[2040]).toBe(0.31);
    expect(REDUCTION_TARGETS[2045]).toBe(0.62);
    expect(REDUCTION_TARGETS[2050]).toBe(0.8);
  });
});

describe("getGhgTarget", () => {
  it("should return reference value for years before 2025", () => {
    expect(getGhgTarget(2024)).toBe(GHG_REFERENCE_VALUE);
    expect(getGhgTarget(2020)).toBe(GHG_REFERENCE_VALUE);
  });

  it("should apply 2% reduction for 2025", () => {
    const expected = GHG_REFERENCE_VALUE * 0.98;
    expect(getGhgTarget(2025)).toBeCloseTo(expected, 4);
  });

  it("should apply 6% reduction for 2030", () => {
    const expected = GHG_REFERENCE_VALUE * 0.94;
    expect(getGhgTarget(2030)).toBeCloseTo(expected, 4);
  });

  it("should apply 14.5% reduction for 2035", () => {
    const expected = GHG_REFERENCE_VALUE * 0.855;
    expect(getGhgTarget(2035)).toBeCloseTo(expected, 4);
  });

  it("should apply 31% reduction for 2040", () => {
    const expected = GHG_REFERENCE_VALUE * 0.69;
    expect(getGhgTarget(2040)).toBeCloseTo(expected, 4);
  });

  it("should apply 62% reduction for 2045", () => {
    const expected = GHG_REFERENCE_VALUE * 0.38;
    expect(getGhgTarget(2045)).toBeCloseTo(expected, 4);
  });

  it("should apply 80% reduction for 2050", () => {
    const expected = GHG_REFERENCE_VALUE * 0.2;
    expect(getGhgTarget(2050)).toBeCloseTo(expected, 4);
  });

  it("should use nearest lower bracket for intermediate years", () => {
    expect(getGhgTarget(2027)).toBe(getGhgTarget(2025));
    expect(getGhgTarget(2033)).toBe(getGhgTarget(2030));
    expect(getGhgTarget(2042)).toBe(getGhgTarget(2040));
  });

  it("should use 2050 target for years beyond 2050", () => {
    expect(getGhgTarget(2060)).toBe(getGhgTarget(2050));
    expect(getGhgTarget(2100)).toBe(getGhgTarget(2050));
  });
});
