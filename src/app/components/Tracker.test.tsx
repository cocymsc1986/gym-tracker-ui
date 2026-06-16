import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tracker } from "./Tracker";
import { type Workout } from "@/types/Workout";

const mockSetLocation = vi.fn();

vi.mock("wouter", () => ({
  useLocation: () => ["/", mockSetLocation],
}));

const getMonday = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  return monday;
};

const toDateStr = (date: Date) => date.toISOString().split("T")[0];

describe("Tracker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 7 day buttons", () => {
    render(<Tracker workouts={[]} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(7);
  });

  it("renders WEEKLY FLOW heading", () => {
    render(<Tracker workouts={[]} />);
    expect(screen.getByText("WEEKLY FLOW")).toBeInTheDocument();
  });

  it("navigates to /workout when clicking a day with no activity", async () => {
    const user = userEvent.setup();
    render(<Tracker workouts={[]} />);

    const buttons = screen.getAllByRole("button");
    await user.click(buttons[0]);

    expect(mockSetLocation).toHaveBeenCalledWith("/workout");
  });

  it("navigates to /workout/:id when clicking a day with a logged workout", async () => {
    const user = userEvent.setup();
    const monday = getMonday();
    const mondayStr = toDateStr(monday);

    const workouts: Workout[] = [
      {
        workoutId: 42,
        date: mondayStr,
        name: "Monday Session",
        exercises: [],
      },
    ];

    render(<Tracker workouts={workouts} />);

    const buttons = screen.getAllByRole("button");
    await user.click(buttons[0]);

    expect(mockSetLocation).toHaveBeenCalledWith("/workout/42");
  });

  it("navigates to /workout for a day with no workout even when other days have workouts", async () => {
    const user = userEvent.setup();
    const monday = getMonday();
    const mondayStr = toDateStr(monday);

    const workouts: Workout[] = [
      {
        workoutId: 42,
        date: mondayStr,
        name: "Monday Session",
        exercises: [],
      },
    ];

    render(<Tracker workouts={workouts} />);

    const buttons = screen.getAllByRole("button");
    // Tuesday (index 1) has no workout
    await user.click(buttons[1]);

    expect(mockSetLocation).toHaveBeenCalledWith("/workout");
  });

  it("shows CircleCheck icon for days with workouts", () => {
    const monday = getMonday();
    const mondayStr = toDateStr(monday);

    const workouts: Workout[] = [
      {
        workoutId: 1,
        date: mondayStr,
        name: "Session",
        exercises: [],
      },
    ];

    render(<Tracker workouts={workouts} />);

    // The button for Monday should have aria-label indicating view
    const mondayButton = screen.getByRole("button", { name: /view workout for/i });
    expect(mondayButton).toBeInTheDocument();
  });

  it("shows add workout aria-label for days with no workout", () => {
    render(<Tracker workouts={[]} />);

    const addButtons = screen.getAllByRole("button", { name: /add workout for/i });
    expect(addButtons).toHaveLength(7);
  });

  it("each day has cursor-pointer class on the button", () => {
    render(<Tracker workouts={[]} />);
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => {
      expect(btn).toHaveClass("cursor-pointer");
    });
  });
});
