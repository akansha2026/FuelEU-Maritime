import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KpiCard } from "./KpiCard";

describe("KpiCard", () => {
  it("should render label and value", () => {
    render(<KpiCard label="Test Label" value="123" />);
    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByText("123")).toBeInTheDocument();
  });

  it("should render sublabel when provided", () => {
    render(<KpiCard label="Label" value="Value" sublabel="Sub text" />);
    expect(screen.getByText("Sub text")).toBeInTheDocument();
  });

  it("should not render sublabel when not provided", () => {
    const { container } = render(<KpiCard label="Label" value="Value" />);
    expect(container.querySelectorAll("p").length).toBe(2);
  });

  it("should apply success variant styles", () => {
    const { container } = render(
      <KpiCard label="Label" value="Value" variant="success" />,
    );
    expect(container.firstChild).toHaveClass("border-l-success");
  });

  it("should apply danger variant styles", () => {
    const { container } = render(
      <KpiCard label="Label" value="Value" variant="danger" />,
    );
    expect(container.firstChild).toHaveClass("border-l-destructive");
  });
});
