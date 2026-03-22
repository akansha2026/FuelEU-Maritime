import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner, CenteredSpinner } from "./Spinner";

describe("Spinner", () => {
  it("should render with loading status", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("should have accessible label", () => {
    render(<Spinner />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should apply small size styles", () => {
    const { container } = render(<Spinner size="sm" />);
    expect(container.firstChild).toHaveClass("h-4", "w-4");
  });

  it("should apply medium size styles by default", () => {
    const { container } = render(<Spinner />);
    expect(container.firstChild).toHaveClass("h-6", "w-6");
  });

  it("should apply large size styles", () => {
    const { container } = render(<Spinner size="lg" />);
    expect(container.firstChild).toHaveClass("h-8", "w-8");
  });

  it("should merge custom className", () => {
    const { container } = render(<Spinner className="custom-spinner" />);
    expect(container.firstChild).toHaveClass("custom-spinner");
  });
});

describe("CenteredSpinner", () => {
  it("should render centered container", () => {
    const { container } = render(<CenteredSpinner />);
    expect(container.firstChild).toHaveClass("flex", "items-center", "justify-center");
  });

  it("should render large spinner", () => {
    render(<CenteredSpinner />);
    const spinner = screen.getByRole("status");
    expect(spinner).toHaveClass("h-8", "w-8");
  });
});
