import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddWorkout } from "./AddWorkout";

const mockSetLocation = vi.fn();

vi.mock("wouter", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Link: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  useLocation: () => ["/workout", mockSetLocation],
}));

vi.mock("@/lib/getUserId", () => ({
  getUserId: () => "test-user-id",
}));

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

import { apiClient } from "@/lib/apiClient";

describe("AddWorkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders workout name and date fields", () => {
    render(<AddWorkout />);

    expect(screen.getByLabelText(/session name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
  });

  it("defaults date field to today's date", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00'));

    render(<AddWorkout />);
    const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement;

    expect(dateInput.value).toBe('2024-06-15');

    vi.useRealTimers();
  });

  it("allows changing the date from the default", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00'));

    render(<AddWorkout />);
    const user = userEvent.setup({ delay: null });
    const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement;

    expect(dateInput.value).toBe('2024-06-15');

    await user.clear(dateInput);
    await user.type(dateInput, '2024-06-20');

    expect(dateInput.value).toBe('2024-06-20');

    vi.useRealTimers();
  });

  it("submits form and calls API with correct data", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      status: 201,
      data: { workoutId: "123" },
    });

    render(<AddWorkout />);
    const user = userEvent.setup({ delay: null });
    
    await user.type(screen.getByLabelText(/session name/i), "Morning Workout");
    const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement;
    await user.clear(dateInput);
    await user.type(dateInput, "2024-06-15");
    await user.click(screen.getByRole("button", { name: /Add Workout/i }));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith("/workouts/test-user-id", {
        name: "Morning Workout",
        date: "2024-06-15",
      });
    });
  });

  it("navigates to workout page on success", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      status: 201,
      data: { workoutId: "123" },
    });

    render(<AddWorkout />);
    const user = userEvent.setup({ delay: null });
    
    await user.type(screen.getByLabelText(/session name/i), "Morning Workout");
    const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement;
    await user.clear(dateInput);
    await user.type(dateInput, "2024-06-15");
    await user.click(screen.getByRole("button", { name: /Add Workout/i }));

    await waitFor(() => {
      expect(mockSetLocation).toHaveBeenCalledWith("/workout/123");
    });
  });

  it("displays error when API call fails", async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce({
      response: { data: { error: "Failed to create workout" } },
    });

    render(<AddWorkout />);
    const user = userEvent.setup({ delay: null });
    
    await user.type(screen.getByLabelText(/session name/i), "Morning Workout");
    const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement;
    await user.clear(dateInput);
    await user.type(dateInput, "2024-06-15");
    await user.click(screen.getByRole("button", { name: /Add Workout/i }));

    await waitFor(() => {
      expect(screen.getByText("Failed to create workout")).toBeInTheDocument();
    });
  });
});
