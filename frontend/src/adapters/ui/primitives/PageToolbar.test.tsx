import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageToolbar, ToolbarRow } from "./PageToolbar";

const MockIcon = ({ className }: { className?: string }) => (
  <svg data-testid="icon" className={className}>
    <circle />
  </svg>
);

describe("PageToolbar", () => {
  it("should render title", () => {
    render(<PageToolbar title="Page Title" />);
    expect(screen.getByRole("heading", { name: "Page Title" })).toBeInTheDocument();
  });

  it("should render description when provided", () => {
    render(<PageToolbar title="Title" description="Page description" />);
    expect(screen.getByText("Page description")).toBeInTheDocument();
  });

  it("should not render description when not provided", () => {
    const { container } = render(<PageToolbar title="Title" />);
    expect(container.querySelector(".text-muted-foreground")).not.toBeInTheDocument();
  });

  it("should render icon when provided", () => {
    render(<PageToolbar title="Title" icon={MockIcon} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("should not render icon when not provided", () => {
    render(<PageToolbar title="Title" />);
    expect(screen.queryByTestId("icon")).not.toBeInTheDocument();
  });

  it("should render meta content", () => {
    render(<PageToolbar title="Title" meta={<span>v1.0</span>} />);
    expect(screen.getByText("v1.0")).toBeInTheDocument();
  });

  it("should render actions content", () => {
    render(
      <PageToolbar
        title="Title"
        actions={<button>Action</button>}
      />
    );
    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
  });

  it("should merge custom className", () => {
    const { container } = render(
      <PageToolbar title="Title" className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should apply flex layout styles", () => {
    const { container } = render(<PageToolbar title="Title" />);
    expect(container.firstChild).toHaveClass("flex", "flex-col", "gap-4");
  });
});

describe("ToolbarRow", () => {
  it("should render children", () => {
    render(
      <ToolbarRow>
        <button>Button 1</button>
        <button>Button 2</button>
      </ToolbarRow>
    );
    expect(screen.getByRole("button", { name: "Button 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Button 2" })).toBeInTheDocument();
  });

  it("should apply flex layout styles", () => {
    const { container } = render(
      <ToolbarRow>
        <span>Content</span>
      </ToolbarRow>
    );
    expect(container.firstChild).toHaveClass("flex", "flex-wrap", "items-end", "gap-3");
  });

  it("should merge custom className", () => {
    const { container } = render(
      <ToolbarRow className="my-custom">
        <span>Content</span>
      </ToolbarRow>
    );
    expect(container.firstChild).toHaveClass("my-custom");
  });
});
