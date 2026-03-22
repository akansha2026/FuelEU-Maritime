import { describe, it, expect } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("should merge multiple class names", () => {
    expect(cn("class1", "class2")).toBe("class1 class2");
  });

  it("should handle undefined values", () => {
    expect(cn("class1", undefined, "class2")).toBe("class1 class2");
  });

  it("should handle null values", () => {
    expect(cn("class1", null, "class2")).toBe("class1 class2");
  });

  it("should handle conditional classes", () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn("base", isActive && "active", isDisabled && "disabled")).toBe(
      "base active"
    );
  });

  it("should handle false values", () => {
    expect(cn("class1", false, "class2")).toBe("class1 class2");
  });

  it("should handle empty inputs", () => {
    expect(cn()).toBe("");
  });

  it("should concatenate class strings", () => {
    expect(cn("px-4 py-2", "px-6")).toBe("px-4 py-2 px-6");
  });
});
