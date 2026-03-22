import { describe, it, expect } from "vitest";
import {
  computeComplianceBalance,
  computePenalty,
  computePercentDiff,
  isCompliant,
  allocatePool,
} from "./formulas";

describe("computeComplianceBalance", () => {
  it("should calculate positive CB when actual < target", () => {
    const result = computeComplianceBalance(85.0, 2025, 5000);
    expect(result.cb).toBeGreaterThan(0);
    expect(result.target).toBeCloseTo(89.34);
  });

  it("should calculate negative CB when actual > target", () => {
    const result = computeComplianceBalance(95.0, 2025, 5000);
    expect(result.cb).toBeLessThan(0);
  });

  it("should calculate zero CB when actual equals target", () => {
    // Target for 2025 is 91.16 * 0.98 = 89.3368
    const result = computeComplianceBalance(89.3368, 2025, 5000);
    expect(Math.abs(result.cb)).toBeLessThan(1000); // Small tolerance due to floating point
  });

  it("should scale with fuel consumption", () => {
    const result1 = computeComplianceBalance(85.0, 2025, 5000);
    const result2 = computeComplianceBalance(85.0, 2025, 10000);
    expect(result2.cb).toBeCloseTo(result1.cb * 2);
  });

  it("should apply correct target for different years", () => {
    const result2025 = computeComplianceBalance(85.0, 2025, 5000);
    const result2030 = computeComplianceBalance(85.0, 2030, 5000);
    expect(result2030.target).toBeLessThan(result2025.target);
  });
});

describe("computePenalty", () => {
  it("should return 0 for positive CB", () => {
    expect(computePenalty(1000000, 85.0)).toBe(0);
  });

  it("should return 0 for zero CB", () => {
    expect(computePenalty(0, 85.0)).toBe(0);
  });

  it("should calculate penalty for negative CB", () => {
    const penalty = computePenalty(-1000000, 91.0);
    expect(penalty).toBeGreaterThan(0);
  });

  it("should scale penalty with CB magnitude", () => {
    const penalty1 = computePenalty(-1000000, 91.0);
    const penalty2 = computePenalty(-2000000, 91.0);
    expect(penalty2).toBeCloseTo(penalty1 * 2);
  });

  it("should scale penalty with GHG intensity", () => {
    const penalty1 = computePenalty(-1000000, 91.0);
    const penalty2 = computePenalty(-1000000, 95.0);
    expect(penalty2).toBeGreaterThan(penalty1);
  });
});

describe("computePercentDiff", () => {
  it("should calculate positive diff when actual > baseline", () => {
    expect(computePercentDiff(110, 100)).toBe(10);
  });

  it("should calculate negative diff when actual < baseline", () => {
    expect(computePercentDiff(90, 100)).toBe(-10);
  });

  it("should return 0 when actual equals baseline", () => {
    expect(computePercentDiff(100, 100)).toBe(0);
  });

  it("should return 0 when baseline is 0", () => {
    expect(computePercentDiff(100, 0)).toBe(0);
  });

  it("should handle decimal values", () => {
    expect(computePercentDiff(105.5, 100)).toBeCloseTo(5.5);
  });
});

describe("isCompliant", () => {
  it("should return true for positive CB", () => {
    expect(isCompliant(1000)).toBe(true);
  });

  it("should return true for zero CB", () => {
    expect(isCompliant(0)).toBe(true);
  });

  it("should return false for negative CB", () => {
    expect(isCompliant(-1000)).toBe(false);
  });
});

describe("allocatePool", () => {
  it("should transfer surplus to cover deficit", () => {
    const members = [
      { shipId: "A", adjustedCB: 1000 },
      { shipId: "B", adjustedCB: -500 },
    ];
    const result = allocatePool(members);
    
    const shipB = result.find((m) => m.shipId === "B");
    expect(shipB?.cbAfter).toBe(0);
  });

  it("should reduce surplus ship CB accordingly", () => {
    const members = [
      { shipId: "A", adjustedCB: 1000 },
      { shipId: "B", adjustedCB: -500 },
    ];
    const result = allocatePool(members);
    
    const shipA = result.find((m) => m.shipId === "A");
    expect(shipA?.cbAfter).toBe(500);
  });

  it("should handle multiple surplus ships", () => {
    const members = [
      { shipId: "A", adjustedCB: 300 },
      { shipId: "B", adjustedCB: 300 },
      { shipId: "C", adjustedCB: -500 },
    ];
    const result = allocatePool(members);
    
    const shipC = result.find((m) => m.shipId === "C");
    expect(shipC?.cbAfter).toBe(0);
  });

  it("should handle multiple deficit ships", () => {
    const members = [
      { shipId: "A", adjustedCB: 1000 },
      { shipId: "B", adjustedCB: -300 },
      { shipId: "C", adjustedCB: -400 },
    ];
    const result = allocatePool(members);
    
    const totalDeficitCovered = result
      .filter((m) => m.cbBefore < 0)
      .every((m) => m.cbAfter >= m.cbBefore);
    expect(totalDeficitCovered).toBe(true);
  });

  it("should handle zero CB ships", () => {
    const members = [
      { shipId: "A", adjustedCB: 500 },
      { shipId: "B", adjustedCB: 0 },
      { shipId: "C", adjustedCB: -200 },
    ];
    const result = allocatePool(members);
    
    const shipB = result.find((m) => m.shipId === "B");
    expect(shipB?.cbAfter).toBe(0);
  });

  it("should handle insufficient surplus", () => {
    const members = [
      { shipId: "A", adjustedCB: 200 },
      { shipId: "B", adjustedCB: -500 },
    ];
    const result = allocatePool(members);
    
    const shipB = result.find((m) => m.shipId === "B");
    expect(shipB?.cbAfter).toBe(-300); // Still deficit after allocation
  });

  it("should preserve total CB in pool", () => {
    const members = [
      { shipId: "A", adjustedCB: 800 },
      { shipId: "B", adjustedCB: -300 },
      { shipId: "C", adjustedCB: -200 },
    ];
    const result = allocatePool(members);
    
    const totalBefore = members.reduce((sum, m) => sum + m.adjustedCB, 0);
    const totalAfter = result.reduce((sum, m) => sum + m.cbAfter, 0);
    expect(totalAfter).toBeCloseTo(totalBefore);
  });
});
