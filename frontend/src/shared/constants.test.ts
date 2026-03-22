import { describe, it, expect } from "vitest";
import {
  getGhgTarget,
  GHG_REFERENCE_VALUE,
  REDUCTION_TARGETS,
  VLSFO_LCV_MJ_PER_TONNE,
  PENALTY_RATE_EUR,
} from "./constants";

describe("getGhgTarget", () => {
  it("should return reference value for years before 2025", () => {
    expect(getGhgTarget(2024)).toBe(GHG_REFERENCE_VALUE);
  });

  it("should apply 2% reduction for 2025", () => {
    const target = getGhgTarget(2025);
    expect(target).toBeCloseTo(GHG_REFERENCE_VALUE * 0.98, 4);
  });

  it("should apply 6% reduction for 2030", () => {
    const target = getGhgTarget(2030);
    expect(target).toBeCloseTo(GHG_REFERENCE_VALUE * 0.94, 4);
  });

  it("should apply 14.5% reduction for 2035", () => {
    const target = getGhgTarget(2035);
    expect(target).toBeCloseTo(GHG_REFERENCE_VALUE * 0.855, 4);
  });

  it("should apply 31% reduction for 2040", () => {
    const target = getGhgTarget(2040);
    expect(target).toBeCloseTo(GHG_REFERENCE_VALUE * 0.69, 4);
  });

  it("should apply 62% reduction for 2045", () => {
    const target = getGhgTarget(2045);
    expect(target).toBeCloseTo(GHG_REFERENCE_VALUE * 0.38, 4);
  });

  it("should apply 80% reduction for 2050", () => {
    const target = getGhgTarget(2050);
    expect(target).toBeCloseTo(GHG_REFERENCE_VALUE * 0.2, 4);
  });

  it("should use nearest lower bracket for intermediate years", () => {
    const target2027 = getGhgTarget(2027);
    const target2025 = getGhgTarget(2025);
    expect(target2027).toBe(target2025);
  });

  it("should use 2050 target for years after 2050", () => {
    const target2060 = getGhgTarget(2060);
    const target2050 = getGhgTarget(2050);
    expect(target2060).toBe(target2050);
  });
});

describe("Constants", () => {
  it("should have correct GHG reference value", () => {
    expect(GHG_REFERENCE_VALUE).toBe(91.16);
  });

  it("should have correct VLSFO LCV value", () => {
    expect(VLSFO_LCV_MJ_PER_TONNE).toBe(40200);
  });

  it("should have correct penalty rate", () => {
    expect(PENALTY_RATE_EUR).toBeCloseTo(0.0024);
  });

  it("should have all reduction targets defined", () => {
    expect(REDUCTION_TARGETS[2025]).toBe(0.02);
    expect(REDUCTION_TARGETS[2030]).toBe(0.06);
    expect(REDUCTION_TARGETS[2035]).toBe(0.145);
    expect(REDUCTION_TARGETS[2040]).toBe(0.31);
    expect(REDUCTION_TARGETS[2045]).toBe(0.62);
    expect(REDUCTION_TARGETS[2050]).toBe(0.8);
  });
});
