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
import { type Workout as WorkoutType } from "@/types/Workout";

const mockExercises: Exercise[] = [
  {
    exerciseId: "1",
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
    exerciseId: "2",
    name: "Running",
    exerciseType: ExerciseType.CARDIO,
    time: "00:30:00",
    distance: 5,
    distanceUnit: DistanceUnits.KM,
    level: 1,
    sets: [],
  },
  {
    exerciseId: "3",
    name: "Stretching",
    exerciseType: ExerciseType.OTHER,
    time: "00:15:00",
    distance: 0,
    distanceUnit: undefined,
    level: 1,
    sets: [],
  },
];

const mockWorkout: WorkoutType = {
  workoutId: 1,
  date: "2024-06-15",
  name: "Morning Workout",
  exercises: mockExercises,
};

const setupRouter = (workout?: WorkoutType, userExercises: string[] = []) => {
  const loaderData = workout
    ? { workout, userExercises }
    : { workout: null, userExercises };

  const routes = createRoutesFromElements(
    <Route path="/" element={<Workout loaderData={loaderData} />} />
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
    const router = setupRouter();
    render(<RouterProvider router={router} />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders workout without exercises", () => {
    const workoutWithoutExercises = {
      workoutId: 1,
      date: "2024-06-16",
      name: "Empty Workout",
      exercises: [],
    };

    const router = setupRouter(workoutWithoutExercises);
    render(<RouterProvider router={router} />);

    expect(screen.getByText("Empty Workout")).toBeInTheDocument();
    expect(screen.queryByText("Weights")).not.toBeInTheDocument();
  });
});
