import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  DataTableShell,
  DataTable,
  THead,
  TH,
  TBody,
  TR,
  TD,
  Chip,
  Pill,
} from "./DataTable";

describe("DataTableShell", () => {
  it("should render children", () => {
    render(<DataTableShell>Table content</DataTableShell>);
    expect(screen.getByText("Table content")).toBeInTheDocument();
  });

  it("should apply default styles", () => {
    const { container } = render(<DataTableShell>Content</DataTableShell>);
    expect(container.firstChild).toHaveClass("overflow-x-auto", "rounded-xl");
  });

  it("should merge custom className", () => {
    const { container } = render(
      <DataTableShell className="custom-class">Content</DataTableShell>
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});

describe("DataTable", () => {
  it("should render as table element", () => {
    render(
      <DataTable>
        <tbody>
          <tr>
            <td>Content</td>
          </tr>
        </tbody>
      </DataTable>
    );
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("should apply default styles", () => {
    render(
      <DataTable>
        <tbody>
          <tr>
            <td>Content</td>
          </tr>
        </tbody>
      </DataTable>
    );
    expect(screen.getByRole("table")).toHaveClass("w-full", "text-sm");
  });
});

describe("THead", () => {
  it("should render children", () => {
    render(
      <table>
        <THead>
          <th>Header</th>
        </THead>
      </table>
    );
    expect(screen.getByText("Header")).toBeInTheDocument();
  });

  it("should apply header styles", () => {
    const { container } = render(
      <table>
        <THead>
          <th>Header</th>
        </THead>
      </table>
    );
    const thead = container.querySelector("thead");
    expect(thead).toHaveClass("border-b", "uppercase");
  });
});

describe("TH", () => {
  it("should render children", () => {
    render(
      <table>
        <thead>
          <tr>
            <TH>Column</TH>
          </tr>
        </thead>
      </table>
    );
    expect(screen.getByRole("columnheader")).toBeInTheDocument();
  });

  it("should apply padding styles", () => {
    render(
      <table>
        <thead>
          <tr>
            <TH>Column</TH>
          </tr>
        </thead>
      </table>
    );
    expect(screen.getByRole("columnheader")).toHaveClass("px-4", "py-3");
  });
});

describe("TBody", () => {
  it("should render children", () => {
    render(
      <table>
        <TBody>
          <tr>
            <td>Cell</td>
          </tr>
        </TBody>
      </table>
    );
    expect(screen.getByText("Cell")).toBeInTheDocument();
  });

  it("should apply divider styles", () => {
    const { container } = render(
      <table>
        <TBody>
          <tr>
            <td>Cell</td>
          </tr>
        </TBody>
      </table>
    );
    expect(container.querySelector("tbody")).toHaveClass("divide-y");
  });
});

describe("TR", () => {
  it("should render children", () => {
    render(
      <table>
        <tbody>
          <TR>
            <td>Cell data</td>
          </TR>
        </tbody>
      </table>
    );
    expect(screen.getByText("Cell data")).toBeInTheDocument();
  });

  it("should apply hover styles", () => {
    render(
      <table>
        <tbody>
          <TR data-testid="row">
            <td>Cell</td>
          </TR>
        </tbody>
      </table>
    );
    expect(screen.getByTestId("row")).toHaveClass("hover:bg-secondary/30");
  });
});

describe("TD", () => {
  it("should render children", () => {
    render(
      <table>
        <tbody>
          <tr>
            <TD>Cell content</TD>
          </tr>
        </tbody>
      </table>
    );
    expect(screen.getByRole("cell")).toBeInTheDocument();
  });

  it("should apply padding styles", () => {
    render(
      <table>
        <tbody>
          <tr>
            <TD>Content</TD>
          </tr>
        </tbody>
      </table>
    );
    expect(screen.getByRole("cell")).toHaveClass("px-4", "py-3");
  });
});

describe("Chip", () => {
  it("should render children", () => {
    render(<Chip>Label</Chip>);
    expect(screen.getByText("Label")).toBeInTheDocument();
  });

  it("should apply chip styles", () => {
    const { container } = render(<Chip>Label</Chip>);
    expect(container.firstChild).toHaveClass("rounded-md", "bg-secondary");
  });
});

describe("Pill", () => {
  it("should render children", () => {
    render(<Pill>Status</Pill>);
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("should apply pill styles", () => {
    const { container } = render(<Pill>Status</Pill>);
    expect(container.firstChild).toHaveClass("rounded-full", "text-primary");
  });
});
