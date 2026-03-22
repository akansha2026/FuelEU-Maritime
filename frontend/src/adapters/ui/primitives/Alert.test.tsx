import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Alert } from "./Alert";

describe("Alert", () => {
  it("should render alert content", () => {
    render(<Alert>This is an alert</Alert>);
    expect(screen.getByText("This is an alert")).toBeInTheDocument();
  });

  it("should render with title", () => {
    render(<Alert title="Warning">Content here</Alert>);
    expect(screen.getByText("Warning")).toBeInTheDocument();
    expect(screen.getByText("Content here")).toBeInTheDocument();
  });

  it("should have alert role", () => {
    render(<Alert>Alert message</Alert>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("should apply info variant styles by default", () => {
    render(<Alert>Info alert</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert.className).toContain("text-info");
  });

  it("should apply success variant styles", () => {
    render(<Alert variant="success">Success!</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert.className).toContain("text-success");
  });

  it("should apply warning variant styles", () => {
    render(<Alert variant="warning">Warning!</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert.className).toContain("text-warning");
  });

  it("should apply error variant styles", () => {
    render(<Alert variant="error">Error!</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert.className).toContain("text-destructive");
  });

  it("should merge custom className", () => {
    render(<Alert className="my-custom-class">Alert</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert.className).toContain("my-custom-class");
  });
});
