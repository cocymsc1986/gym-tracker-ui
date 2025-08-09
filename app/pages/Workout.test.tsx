import { render, screen } from "@testing-library/react";
import {
  createMemoryRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router";
import { Workout } from "./Workout";
import {
  DistanceUnits,
  ExerciseType,
  WeightUnits,
  type Exercise,
} from "@/types/Exercise";

const mockExercises: Exercise[] = [
  {
    exerciseID: "1",
    name: "Bench Press",
    exerciseType: ExerciseType.WEIGHTS,
    time: "00:10:00",
    distance: 0,
    distanceUnit: undefined,
    level: 1,
    sets: [
      { weight: 80, unit: WeightUnits.KG, reps: 10 },
      { weight: 85, unit: WeightUnits.KG, reps: 8 },
    ],
  },
  {
    exerciseID: "2",
    name: "Running",
    exerciseType: ExerciseType.CARDIO,
    time: "00:30:00",
    distance: 5,
    distanceUnit: DistanceUnits.KM,
    level: 1,
    sets: [],
  },
  {
    exerciseID: "3",
    name: "Stretching",
    exerciseType: ExerciseType.OTHER,
    time: "00:15:00",
    distance: 0,
    distanceUnit: undefined,
    level: 1,
    sets: [],
  },
];

const mockWorkout = {
  id: 1,
  name: "Morning Workout",
  exercises: mockExercises,
};

const setupRouter = (workout: any) => {
  const routes = createRoutesFromElements(
    <Route path="/" element={<Workout loaderData={workout} />} />
  );

  return createMemoryRouter(routes, {
    initialEntries: ["/"],
  });
};

describe("Workout", () => {
  it("renders exercises grouped by exercise type", () => {
    const router = setupRouter(mockWorkout);
    render(<RouterProvider router={router} />);

    // Check that all exercise types are displayed
    expect(screen.getByText("Weights")).toBeInTheDocument();
    expect(screen.getByText("Cardio")).toBeInTheDocument();
    expect(screen.getByText("Other")).toBeInTheDocument();

    // Check that exercise names are displayed
    expect(screen.getByText("Bench Press")).toBeInTheDocument();
    expect(screen.getByText("Running")).toBeInTheDocument();
    expect(screen.getByText("Stretching")).toBeInTheDocument();
  });

  it("displays loading state when no workout data", () => {
    const router = setupRouter(null);
    render(<RouterProvider router={router} />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders workout without exercises", () => {
    const workoutWithoutExercises = {
      id: 1,
      name: "Empty Workout",
      exercises: [],
    };

    const router = setupRouter(workoutWithoutExercises);
    render(<RouterProvider router={router} />);

    expect(screen.getByText("Empty Workout")).toBeInTheDocument();
    expect(screen.queryByText("Weights")).not.toBeInTheDocument();
  });
});
