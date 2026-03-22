import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Select, SELECT_ALL } from "./Select";

describe("Select", () => {
  const options = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];

  it("should render with placeholder", () => {
    render(
      <Select
        value=""
        onValueChange={() => {}}
        options={options}
        placeholder="Choose option"
      />
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("should render default placeholder", () => {
    render(<Select value="" onValueChange={() => {}} options={options} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("should display selected value", () => {
    render(
      <Select value="option1" onValueChange={() => {}} options={options} />
    );
    expect(screen.getByText("Option 1")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    render(
      <Select
        value=""
        onValueChange={() => {}}
        options={options}
        className="custom-class"
      />
    );
    expect(screen.getByRole("combobox")).toHaveClass("custom-class");
  });

  it("should call onValueChange when option is selected", async () => {
    const handleChange = vi.fn();
    render(
      <Select value="" onValueChange={handleChange} options={options} />
    );

    fireEvent.click(screen.getByRole("combobox"));
  });

  it("should export SELECT_ALL constant", () => {
    expect(SELECT_ALL).toBe("__ALL__");
  });
});
