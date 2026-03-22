import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FieldGroup } from "./Field";

describe("FieldGroup", () => {
  it("should render label text", () => {
    render(
      <FieldGroup label="Email">
        <input type="email" />
      </FieldGroup>
    );
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("should render children", () => {
    render(
      <FieldGroup label="Name">
        <input data-testid="input" type="text" />
      </FieldGroup>
    );
    expect(screen.getByTestId("input")).toBeInTheDocument();
  });

  it("should apply default styles", () => {
    const { container } = render(
      <FieldGroup label="Field">
        <input />
      </FieldGroup>
    );
    expect(container.firstChild).toHaveClass("flex", "flex-col", "gap-1.5");
  });

  it("should merge custom className", () => {
    const { container } = render(
      <FieldGroup label="Field" className="my-custom-class">
        <input />
      </FieldGroup>
    );
    expect(container.firstChild).toHaveClass("my-custom-class");
  });

  it("should apply label styles", () => {
    render(
      <FieldGroup label="Label">
        <input />
      </FieldGroup>
    );
    const label = screen.getByText("Label");
    expect(label).toHaveClass("text-xs", "font-medium");
  });
});
