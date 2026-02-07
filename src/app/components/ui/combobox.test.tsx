import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Combobox } from "./combobox";

describe("Combobox", () => {
  const mockOptions = ["Bench Press", "Squats", "Deadlift", "Pull-ups"];
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("renders with placeholder text", () => {
    render(
      <Combobox
        name="test-combobox"
        options={mockOptions}
        value=""
        onChange={mockOnChange}
        placeholder="Select an option..."
      />
    );

    const input = screen.getByPlaceholderText("Select an option...");
    expect(input).toBeInTheDocument();
  });

  it("renders with default placeholder when not provided", () => {
    render(
      <Combobox
        name="test-combobox"
        options={mockOptions}
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByPlaceholderText("Type or select...");
    expect(input).toBeInTheDocument();
  });

  it("displays current value in input", () => {
    render(
      <Combobox
        name="test-combobox"
        options={mockOptions}
        value="Bench Press"
        onChange={mockOnChange}
      />
    );

    const input = screen.getByDisplayValue("Bench Press");
    expect(input).toBeInTheDocument();
  });

  it("opens dropdown on focus", async () => {
    const user = userEvent.setup();
    render(
      <Combobox
        name="test-combobox"
        options={mockOptions}
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole("textbox");
    await user.click(input);

    await waitFor(() => {
      expect(screen.getByText("Bench Press")).toBeInTheDocument();
      expect(screen.getByText("Squats")).toBeInTheDocument();
      expect(screen.getByText("Deadlift")).toBeInTheDocument();
      expect(screen.getByText("Pull-ups")).toBeInTheDocument();
    });
  });

  it("opens dropdown on click", async () => {
    const user = userEvent.setup();
    render(
      <Combobox
        name="test-combobox"
        options={mockOptions}
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole("textbox");
    await user.click(input);

    await waitFor(() => {
      expect(screen.getByText("Bench Press")).toBeInTheDocument();
    });
  });

  it("filters options based on input text", async () => {
    const user = userEvent.setup();
    render(
      <Combobox
        name="test-combobox"
        options={mockOptions}
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole("textbox");
    await user.type(input, "squat");

    await waitFor(() => {
      expect(screen.getByText("Squats")).toBeInTheDocument();
      expect(screen.queryByText("Bench Press")).not.toBeInTheDocument();
      expect(screen.queryByText("Deadlift")).not.toBeInTheDocument();
    });
  });

  it("filters options case-insensitively", async () => {
    const user = userEvent.setup();
    render(
      <Combobox
        name="test-combobox"
        options={mockOptions}
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole("textbox");
    await user.type(input, "BENCH");

    await waitFor(() => {
      expect(screen.getByText("Bench Press")).toBeInTheDocument();
    });
  });

  it("calls onChange when typing", async () => {
    const user = userEvent.setup();
    render(
      <Combobox
        name="test-combobox"
        options={mockOptions}
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole("textbox");
    await user.type(input, "New Exercise");

    expect(mockOnChange).toHaveBeenCalledTimes(12); // Once per character
    expect(mockOnChange).toHaveBeenLastCalledWith("New Exercise");
  });

  it("selects an option when clicked", async () => {
    const user = userEvent.setup();
    render(
      <Combobox
        name="test-combobox"
        options={mockOptions}
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole("textbox");
    await user.click(input);

    await waitFor(() => {
      expect(screen.getByText("Bench Press")).toBeInTheDocument();
    });

    const option = screen.getByText("Bench Press");
    await user.click(option);

    expect(mockOnChange).toHaveBeenCalledWith("Bench Press");
  });

  it("closes dropdown after selecting an option", async () => {
    const user = userEvent.setup();
    render(
      <Combobox
        name="test-combobox"
        options={mockOptions}
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole("textbox");
    await user.click(input);

    await waitFor(() => {
      expect(screen.getByText("Bench Press")).toBeInTheDocument();
    });

    const option = screen.getByText("Squats");
    await user.click(option);

    await waitFor(() => {
      expect(screen.queryByText("Deadlift")).not.toBeInTheDocument();
    });
  });

  it("displays check icon for selected value", async () => {
    const user = userEvent.setup();
    render(
      <Combobox
        name="test-combobox"
        options={mockOptions}
        value="Bench Press"
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole("textbox");
    await user.click(input);

    await waitFor(() => {
      const selectedOption = screen.getByText("Bench Press").parentElement;
      expect(selectedOption?.querySelector("svg")).toBeInTheDocument();
    });
  });

  it("shows 'no matches found' message when no options match", async () => {
    const user = userEvent.setup();
    render(
      <Combobox
        name="test-combobox"
        options={mockOptions}
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole("textbox");
    await user.type(input, "xyz");

    await waitFor(() => {
      expect(
        screen.getByText(/No matches found. Press Enter to use "xyz"/i)
      ).toBeInTheDocument();
    });
  });

  it("allows custom text entry when no matches", async () => {
    const user = userEvent.setup();
    render(
      <Combobox
        name="test-combobox"
        options={mockOptions}
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole("textbox");
    await user.type(input, "Custom Exercise");

    expect(mockOnChange).toHaveBeenLastCalledWith("Custom Exercise");
  });

  it("updates input value when value prop changes", () => {
    const { rerender } = render(
      <Combobox
        name="test-combobox"
        options={mockOptions}
        value="Squats"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByDisplayValue("Squats")).toBeInTheDocument();

    rerender(
      <Combobox
        name="test-combobox"
        options={mockOptions}
        value="Deadlift"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByDisplayValue("Deadlift")).toBeInTheDocument();
  });

  it("renders input with correct name attribute", () => {
    render(
      <Combobox
        name="exercise-name"
        options={mockOptions}
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.name).toBe("exercise-name");
  });

  it("displays all options when input is empty", async () => {
    const user = userEvent.setup();
    render(
      <Combobox
        name="test-combobox"
        options={mockOptions}
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole("textbox");
    await user.click(input);

    await waitFor(() => {
      mockOptions.forEach((option) => {
        expect(screen.getByText(option)).toBeInTheDocument();
      });
    });
  });

  it("handles empty options array", async () => {
    const user = userEvent.setup();
    render(
      <Combobox
        name="test-combobox"
        options={[]}
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole("textbox");
    await user.click(input);

    await waitFor(() => {
      expect(
        screen.getByText(/No matches found. Press Enter to use ""/i)
      ).toBeInTheDocument();
    });
  });

  it("re-opens dropdown when typing after selection", async () => {
    const user = userEvent.setup();
    render(
      <Combobox
        name="test-combobox"
        options={mockOptions}
        value=""
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole("textbox");
    await user.click(input);

    await waitFor(() => {
      expect(screen.getByText("Bench Press")).toBeInTheDocument();
    });

    const option = screen.getByText("Bench Press");
    await user.click(option);

    await waitFor(() => {
      expect(screen.queryByText("Squats")).not.toBeInTheDocument();
    });

    await user.type(input, " Modified");

    await waitFor(() => {
      expect(
        screen.getByText(/No matches found. Press Enter to use/)
      ).toBeInTheDocument();
    });
  });
});
