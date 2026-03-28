import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddSets } from "./AddSets";
import { WeightUnits } from "@/types/Exercise";

describe("AddSets", () => {
  it("renders one set row by default", () => {
    render(<AddSets />);

    expect(screen.getByLabelText("Duplicate set 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Remove set 1")).toBeInTheDocument();
  });

  it("renders weight and reps inputs for weighted sets", () => {
    render(<AddSets />);

    expect(screen.getByPlaceholderText("Weight")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Reps")).toBeInTheDocument();
  });

  it("renders reps and duration inputs for bodyweight sets", () => {
    render(<AddSets bodyWeight />);

    expect(screen.getByPlaceholderText("Reps")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. 60")).toBeInTheDocument();
  });

  it("adds a new blank set when Add Set is clicked", async () => {
    const user = userEvent.setup();
    render(<AddSets />);

    await user.click(screen.getByRole("button", { name: /add set/i }));

    expect(screen.getByLabelText("Duplicate set 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Remove set 2")).toBeInTheDocument();
  });

  it("removes a set when the delete button is clicked", async () => {
    const user = userEvent.setup();
    render(<AddSets />);

    await user.click(screen.getByRole("button", { name: /add set/i }));
    expect(screen.getByLabelText("Remove set 2")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Remove set 1"));

    expect(screen.queryByLabelText("Remove set 2")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Remove set 1")).toBeInTheDocument();
  });

  it("duplicates a set when the copy button is clicked", async () => {
    const user = userEvent.setup();
    render(<AddSets />);

    await user.click(screen.getByLabelText("Duplicate set 1"));

    expect(screen.getByLabelText("Duplicate set 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Remove set 2")).toBeInTheDocument();
  });

  it("inserts duplicated set directly after the original", async () => {
    const user = userEvent.setup();
    render(<AddSets />);

    // Add a second set so we have set 1 and set 2
    await user.click(screen.getByRole("button", { name: /add set/i }));

    // Duplicate set 1 — should insert a copy between set 1 and set 2
    await user.click(screen.getByLabelText("Duplicate set 1"));

    // We should now have 3 sets
    expect(screen.getByLabelText("Duplicate set 3")).toBeInTheDocument();
  });

  it("copies the weight value when duplicating a weighted set", async () => {
    const user = userEvent.setup();
    render(<AddSets />);

    const weightInput = screen.getByPlaceholderText("Weight") as HTMLInputElement;
    await user.clear(weightInput);
    await user.type(weightInput, "80");

    await user.click(screen.getByLabelText("Duplicate set 1"));

    const weightInputs = screen.getAllByPlaceholderText("Weight") as HTMLInputElement[];
    expect(weightInputs).toHaveLength(2);
    expect(weightInputs[1].value).toBe("80");
  });

  it("renders initialSets when provided", () => {
    const initialSets = [
      { weight: 60, unit: WeightUnits.KG, reps: 10 },
      { weight: 70, unit: WeightUnits.KG, reps: 8 },
    ];
    render(<AddSets initialSets={initialSets} />);

    expect(screen.getByLabelText("Duplicate set 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Duplicate set 2")).toBeInTheDocument();
    expect(screen.queryByLabelText("Duplicate set 3")).not.toBeInTheDocument();
  });
});
