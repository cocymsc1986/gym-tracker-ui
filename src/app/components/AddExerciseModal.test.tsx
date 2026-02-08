import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddExerciseModal } from "./AddExerciseModal";

vi.mock("wouter", () => ({
  useParams: () => ({ id: "123" }),
}));

vi.mock("@/lib/getUserId", () => ({
  getUserId: () => "test-user-id",
}));

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

const mockSetShowModal = vi.fn();

const renderModal = (userExercises: string[] = []) => {
  render(
    <AddExerciseModal
      showModal={true}
      setShowModal={mockSetShowModal}
      userExercises={userExercises}
    />
  );
};

describe("AddExerciseModal", () => {
  beforeEach(() => {
    mockSetShowModal.mockClear();
  });

  it("renders modal with title and description", () => {
    renderModal();

    expect(
      screen.getByRole("heading", { name: "Add Exercise" })
    ).toBeInTheDocument();
    expect(screen.getByText("Add your exercise below")).toBeInTheDocument();
  });

  it("renders exercise type label", () => {
    renderModal();

    expect(screen.getByText("Exercise Type")).toBeInTheDocument();
  });

  it("renders exercise name label", () => {
    renderModal();

    expect(screen.getByText("Exercise Name")).toBeInTheDocument();
  });

  it("renders exercise name combobox with user exercises", () => {
    renderModal(["Bench Press", "Squats", "Deadlift"]);

    expect(
      screen.getByPlaceholderText("Type or select a previous exercise name...")
    ).toBeInTheDocument();
  });

  it("displays message to select exercise type initially", () => {
    renderModal();

    expect(screen.getByText("Select an exercise type")).toBeInTheDocument();
  });

  it("allows typing custom exercise name in combobox", async () => {
    const user = userEvent.setup();
    renderModal();

    const exerciseNameInput = screen.getByPlaceholderText(
      "Type or select a previous exercise name..."
    );
    await user.type(exerciseNameInput, "New Custom Exercise");

    expect(exerciseNameInput).toHaveValue("New Custom Exercise");
  });

  it("filters and displays previous exercise names in combobox", async () => {
    const user = userEvent.setup();
    renderModal(["Bench Press", "Squats", "Deadlift"]);

    const exerciseNameInput = screen.getByPlaceholderText(
      "Type or select a previous exercise name..."
    );
    await user.click(exerciseNameInput);

    await waitFor(() => {
      const benchPressButton = screen.getByRole("button", {
        name: /Bench Press/i,
      });
      const squatsButton = screen.getByRole("button", { name: /Squats/i });
      const deadliftButton = screen.getByRole("button", {
        name: /Deadlift/i,
      });

      expect(benchPressButton).toBeInTheDocument();
      expect(squatsButton).toBeInTheDocument();
      expect(deadliftButton).toBeInTheDocument();
    });
  });

  it("removes duplicate exercise names from options", async () => {
    const user = userEvent.setup();
    renderModal(["Bench Press", "Bench Press", "Squats"]);

    const exerciseNameInput = screen.getByPlaceholderText(
      "Type or select a previous exercise name..."
    );
    await user.click(exerciseNameInput);

    await waitFor(() => {
      const benchPressButtons = screen.getAllByRole("button", {
        name: /Bench Press/i,
      });
      expect(benchPressButtons).toHaveLength(1);
    });
  });

  it("selects previous exercise name from combobox options", async () => {
    const user = userEvent.setup();
    renderModal(["Bench Press", "Squats", "Deadlift"]);

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
    renderModal(["Bench Press", "Squats", "Deadlift"]);

    const exerciseNameInput = screen.getByPlaceholderText(
      "Type or select a previous exercise name..."
    );
    await user.type(exerciseNameInput, "bench");

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Bench Press/i })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /Squats/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /Deadlift/i })
      ).not.toBeInTheDocument();
    });
  });

  it("displays submit button", () => {
    renderModal();

    expect(
      screen.getByRole("button", { name: /Add Exercise/i })
    ).toBeInTheDocument();
  });

  it("renders form with correct method", () => {
    renderModal();

    const form = screen.getByRole("dialog").querySelector("form");
    expect(form).toHaveAttribute("method", "post");
  });

  it("closes modal when close button is clicked", async () => {
    const user = userEvent.setup();
    renderModal();

    const closeButton = screen.getByRole("button", { name: /Close/i });
    await user.click(closeButton);

    expect(mockSetShowModal).toHaveBeenCalledWith(false);
  });

  it("has exercise name input with correct name attribute", () => {
    renderModal();

    const exerciseNameInput = screen.getByPlaceholderText(
      "Type or select a previous exercise name..."
    ) as HTMLInputElement;
    expect(exerciseNameInput.name).toBe("exercise-name");
  });

  it("shows placeholder text in combobox when empty", () => {
    renderModal();

    expect(
      screen.getByPlaceholderText("Type or select a previous exercise name...")
    ).toBeInTheDocument();
  });

  it("allows clearing and re-entering exercise name", async () => {
    const user = userEvent.setup();
    renderModal();

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
    renderModal([]);

    const exerciseNameInput = screen.getByPlaceholderText(
      "Type or select a previous exercise name..."
    );
    expect(exerciseNameInput).toBeInTheDocument();
  });
});
