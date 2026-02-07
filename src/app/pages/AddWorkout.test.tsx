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

const submitForm = async () => {
  await userEvent.type(screen.getByLabelText(/name/i), "Morning Workout");
  await userEvent.type(screen.getByLabelText(/date/i), "2023-10-01");
  await userEvent.click(
    screen.getByRole("button", { name: /Create Workout/i })
  );
};

describe("AddWorkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders workout name and date fields", () => {
    render(<AddWorkout />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
  });

  it("submits form and calls API with correct data", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      status: 201,
      data: { workoutId: "123" },
    });

    render(<AddWorkout />);
    await submitForm();

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith("/workouts/test-user-id", {
        name: "Morning Workout",
        date: "2023-10-01",
      });
    });
  });

  it("navigates to workout page on success", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      status: 201,
      data: { workoutId: "123" },
    });

    render(<AddWorkout />);
    await submitForm();

    await waitFor(() => {
      expect(mockSetLocation).toHaveBeenCalledWith("/workout/123");
    });
  });

  it("displays error when API call fails", async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce({
      response: { data: { error: "Failed to create workout" } },
    });

    render(<AddWorkout />);
    await submitForm();

    await waitFor(() => {
      expect(screen.getByText("Failed to create workout")).toBeInTheDocument();
    });
  });
});
