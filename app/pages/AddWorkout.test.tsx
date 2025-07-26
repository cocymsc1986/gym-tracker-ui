import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  createMemoryRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router";
import { AddWorkout } from "./AddWorkout";

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const setupRouter = (mockAction = vi.fn()) => {
  const routes = createRoutesFromElements(
    <>
      <Route path="/workout" element={<AddWorkout />} />
      <Route path="/api/add-workout" action={mockAction} />
    </>
  );

  const router = createMemoryRouter(routes, {
    initialEntries: ["/workout"],
  });

  return router;
};

const submitForm = async () => {
  const nameInput = screen.getByLabelText(/name/i);
  const dateInput = screen.getByLabelText(/date/i);
  const createButton = screen.getByRole("button", { name: /Create Workout/i });

  await userEvent.type(nameInput, "Morning Workout");
  await userEvent.type(dateInput, "2023-10-01");
  await userEvent.click(createButton);
};

describe("AddWorkout", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders workout name and date fields", () => {
    const router = setupRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
  });

  it("submits form with correct action and method", async () => {
    const actionSpy = vi.fn(async () => new Response(null, { status: 201 }));

    const router = setupRouter(actionSpy);
    render(<RouterProvider router={router} />);

    await submitForm();

    await waitFor(() => {
      expect(actionSpy).toHaveBeenCalled();
    });
  });

  it("navigates to workout page when fetcher returns success data", async () => {
    const actionSpy = vi.fn(async () => ({
      status: 201,
      data: { workoutId: "123" },
    }));

    const router = setupRouter(actionSpy);
    render(<RouterProvider router={router} />);

    await submitForm();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(`/workout/123`, {
        replace: true,
      });
    });
  });

  it("displays error when fetcher returns error", async () => {
    const actionSpy = vi.fn(async () => ({
      status: 500,
      error: "Failed to create workout",
    }));

    const router = setupRouter(actionSpy);
    render(<RouterProvider router={router} />);

    await submitForm();

    await waitFor(() => {
      expect(screen.getByText("Failed to create workout")).toBeInTheDocument();
    });
  });
});
