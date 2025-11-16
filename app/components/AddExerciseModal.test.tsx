import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  createMemoryRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router";
import { AddExerciseModal } from "./AddExerciseModal";

const mockSetShowModal = vi.fn();

const setupRouter = (
  mockAction = vi.fn(),
  userExercises: string[] = []
) => {
  const routes = createRoutesFromElements(
    <>
      <Route
        path="/workout/:id"
        element={
          <AddExerciseModal
            showModal={true}
            setShowModal={mockSetShowModal}
            userExercises={userExercises}
          />
        }
      />
      <Route path="/api/add-exercise" action={mockAction} />
    </>
  );

  const router = createMemoryRouter(routes, {
    initialEntries: ["/workout/123"],
  });

  return router;
};

describe("AddExerciseModal", () => {
  beforeEach(() => {
    mockSetShowModal.mockClear();
  });

  it("renders modal with title and description", () => {
    const router = setupRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByRole("heading", { name: "Add Exercise" })).toBeInTheDocument();
    expect(screen.getByText("Add your exercise below")).toBeInTheDocument();
  });

  it("renders exercise type label", () => {
    const router = setupRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByText("Exercise Type")).toBeInTheDocument();
  });

  it("renders exercise name label", () => {
    const router = setupRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByText("Exercise Name")).toBeInTheDocument();
  });

  it("renders exercise name combobox with user exercises", () => {
    const userExercises = ["Bench Press", "Squats", "Deadlift"];
    const router = setupRouter(vi.fn(), userExercises);
    render(<RouterProvider router={router} />);

    expect(
      screen.getByPlaceholderText("Type or select a previous exercise name...")
    ).toBeInTheDocument();
  });

  it("displays message to select exercise type initially", () => {
    const router = setupRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByText("Select an exercise type")).toBeInTheDocument();
  });

  it("allows typing custom exercise name in combobox", async () => {
    const user = userEvent.setup();
    const router = setupRouter();
    render(<RouterProvider router={router} />);

    const exerciseNameInput = screen.getByPlaceholderText(
      "Type or select a previous exercise name..."
    );
    await user.type(exerciseNameInput, "New Custom Exercise");

    expect(exerciseNameInput).toHaveValue("New Custom Exercise");
  });

  it("filters and displays previous exercise names in combobox", async () => {
    const user = userEvent.setup();
    const userExercises = ["Bench Press", "Squats", "Deadlift"];
    const router = setupRouter(vi.fn(), userExercises);
    render(<RouterProvider router={router} />);

    const exerciseNameInput = screen.getByPlaceholderText(
      "Type or select a previous exercise name..."
    );
    await user.click(exerciseNameInput);

    await waitFor(() => {
      const benchPressButton = screen.getByRole("button", { name: /Bench Press/i });
      const squatsButton = screen.getByRole("button", { name: /Squats/i });
      const deadliftButton = screen.getByRole("button", { name: /Deadlift/i });

      expect(benchPressButton).toBeInTheDocument();
      expect(squatsButton).toBeInTheDocument();
      expect(deadliftButton).toBeInTheDocument();
    });
  });

  it("removes duplicate exercise names from options", async () => {
    const user = userEvent.setup();
    const userExercises = ["Bench Press", "Bench Press", "Squats"];
    const router = setupRouter(vi.fn(), userExercises);
    render(<RouterProvider router={router} />);

    const exerciseNameInput = screen.getByPlaceholderText(
      "Type or select a previous exercise name..."
    );
    await user.click(exerciseNameInput);

    await waitFor(() => {
      const benchPressButtons = screen.getAllByRole("button", { name: /Bench Press/i });
      // Should only have one Bench Press button in the dropdown despite duplicates
      expect(benchPressButtons).toHaveLength(1);
    });
  });

  it("selects previous exercise name from combobox options", async () => {
    const user = userEvent.setup();
    const userExercises = ["Bench Press", "Squats", "Deadlift"];
    const router = setupRouter(vi.fn(), userExercises);
    render(<RouterProvider router={router} />);

    const exerciseNameInput = screen.getByPlaceholderText(
      "Type or select a previous exercise name..."
    );
    await user.click(exerciseNameInput);

    await waitFor(async () => {
      const squatsButton = screen.getByRole("button", { name: /Squats/i });
      await user.click(squatsButton);
    });

    expect(exerciseNameInput).toHaveValue("Squats");
  });

  it("filters combobox options based on input", async () => {
    const user = userEvent.setup();
    const userExercises = ["Bench Press", "Squats", "Deadlift"];
    const router = setupRouter(vi.fn(), userExercises);
    render(<RouterProvider router={router} />);

    const exerciseNameInput = screen.getByPlaceholderText(
      "Type or select a previous exercise name..."
    );
    await user.type(exerciseNameInput, "bench");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Bench Press/i })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Squats/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Deadlift/i })).not.toBeInTheDocument();
    });
  });

  it("displays submit button", () => {
    const router = setupRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByRole("button", { name: /Add Exercise/i })).toBeInTheDocument();
  });

  it("renders form with correct method", () => {
    const router = setupRouter();
    render(<RouterProvider router={router} />);

    const form = screen.getByRole("dialog").querySelector("form");
    expect(form).toHaveAttribute("method", "post");
  });

  it("closes modal when closed button is clicked", async () => {
    const user = userEvent.setup();
    const router = setupRouter();
    render(<RouterProvider router={router} />);

    const closeButton = screen.getByRole("button", { name: /Close/i });
    await user.click(closeButton);

    expect(mockSetShowModal).toHaveBeenCalledWith(false);
  });

  it("has exercise name input with correct name attribute", () => {
    const router = setupRouter();
    render(<RouterProvider router={router} />);

    const exerciseNameInput = screen.getByPlaceholderText(
      "Type or select a previous exercise name..."
    ) as HTMLInputElement;
    expect(exerciseNameInput.name).toBe("exercise-name");
  });

  it("shows placeholder text in combobox when empty", () => {
    const router = setupRouter();
    render(<RouterProvider router={router} />);

    expect(
      screen.getByPlaceholderText("Type or select a previous exercise name...")
    ).toBeInTheDocument();
  });

  it("allows clearing and re-entering exercise name", async () => {
    const user = userEvent.setup();
    const router = setupRouter();
    render(<RouterProvider router={router} />);

    const exerciseNameInput = screen.getByPlaceholderText(
      "Type or select a previous exercise name..."
    );

    await user.type(exerciseNameInput, "First Exercise");
    expect(exerciseNameInput).toHaveValue("First Exercise");

    await user.clear(exerciseNameInput);
    expect(exerciseNameInput).toHaveValue("");

    await user.type(exerciseNameInput, "Second Exercise");
    expect(exerciseNameInput).toHaveValue("Second Exercise");
  });

  it("renders with empty user exercises array", () => {
    const router = setupRouter(vi.fn(), []);
    render(<RouterProvider router={router} />);

    const exerciseNameInput = screen.getByPlaceholderText(
      "Type or select a previous exercise name..."
    );
    expect(exerciseNameInput).toBeInTheDocument();
  });
});
