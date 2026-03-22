import { describe, it, expect } from "vitest";
import { getGhgTarget, GHG_REFERENCE_VALUE } from "./constants";

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

  it("should use nearest lower bracket for intermediate years", () => {
    const target2027 = getGhgTarget(2027);
    const target2025 = getGhgTarget(2025);
    expect(target2027).toBe(target2025);
  });
});
