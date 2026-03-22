import { describe, it, expect } from "vitest";
import {
  computeEnergyInScope,
  computeComplianceBalance,
  computePenalty,
  computePercentDiff,
  isCompliant,
  allocatePool,
} from "./formulas";

describe("computeEnergyInScope", () => {
  it("should calculate energy in MJ from fuel consumption", () => {
    const result = computeEnergyInScope(5000);
    expect(result).toBe(5000 * 41_000);
  });

  it("should return 0 for zero fuel consumption", () => {
    expect(computeEnergyInScope(0)).toBe(0);
  });
});

describe("computeComplianceBalance", () => {
  it("should return positive CB when actual is below target (surplus)", () => {
    const result = computeComplianceBalance(88.0, 2025, 5000);
    expect(result.cb).toBeGreaterThan(0);
    expect(result.target).toBeCloseTo(89.3368, 2);
  });

  it("should return negative CB when actual is above target (deficit)", () => {
    const result = computeComplianceBalance(93.5, 2025, 5000);
    expect(result.cb).toBeLessThan(0);
  });

  it("should calculate energy in scope correctly", () => {
    const result = computeComplianceBalance(91.0, 2025, 5000);
    expect(result.energyInScope).toBe(5000 * 41_000);
  });
});

describe("computePenalty", () => {
  it("should return 0 for positive CB (surplus)", () => {
    expect(computePenalty(1000000, 90)).toBe(0);
  });

  it("should return 0 for zero CB", () => {
    expect(computePenalty(0, 90)).toBe(0);
  });

  it("should calculate penalty for negative CB (deficit)", () => {
    const penalty = computePenalty(-1000000, 91);
    expect(penalty).toBeGreaterThan(0);
  });
});

describe("computePercentDiff", () => {
  it("should return 0 when values are equal", () => {
    expect(computePercentDiff(91.0, 91.0)).toBe(0);
  });

  it("should return negative when comparison is lower than baseline", () => {
    const result = computePercentDiff(88.0, 91.0);
    expect(result).toBeLessThan(0);
  });

  it("should return positive when comparison is higher than baseline", () => {
    const result = computePercentDiff(93.5, 91.0);
    expect(result).toBeGreaterThan(0);
  });
});

describe("isCompliant", () => {
  it("should return true when intensity is below target", () => {
    expect(isCompliant(88.0, 2025)).toBe(true);
  });

  it("should return false when intensity is above target", () => {
    expect(isCompliant(93.5, 2025)).toBe(false);
  });

  it("should return true when intensity equals target", () => {
    const target = 91.16 * 0.98;
    expect(isCompliant(target, 2025)).toBe(true);
  });
});

describe("allocatePool", () => {
  it("should not change values when all members have surplus", () => {
    const members = [
      { shipId: "A", adjustedCB: 100 },
      { shipId: "B", adjustedCB: 200 },
    ];
    const result = allocatePool(members);
    expect(result).toHaveLength(2);
    expect(result.find((m) => m.shipId === "A")?.cbAfter).toBe(100);
    expect(result.find((m) => m.shipId === "B")?.cbAfter).toBe(200);
  });

  it("should transfer surplus to deficit members", () => {
    const members = [
      { shipId: "A", adjustedCB: 500 },
      { shipId: "B", adjustedCB: -300 },
    ];
    const result = allocatePool(members);
    const a = result.find((m) => m.shipId === "A");
    const b = result.find((m) => m.shipId === "B");

    expect(b?.cbAfter).toBe(0);
    expect(a?.cbAfter).toBe(200);
  });

  it("should preserve cbBefore values", () => {
    const members = [
      { shipId: "A", adjustedCB: 500 },
      { shipId: "B", adjustedCB: -300 },
    ];
    const result = allocatePool(members);
    expect(result.find((m) => m.shipId === "A")?.cbBefore).toBe(500);
    expect(result.find((m) => m.shipId === "B")?.cbBefore).toBe(-300);
  });

  it("should handle partial deficit coverage", () => {
    const members = [
      { shipId: "A", adjustedCB: 100 },
      { shipId: "B", adjustedCB: -300 },
    ];
    const result = allocatePool(members);
    const a = result.find((m) => m.shipId === "A");
    const b = result.find((m) => m.shipId === "B");

    expect(a?.cbAfter).toBe(0);
    expect(b?.cbAfter).toBe(-200);
  });
});
