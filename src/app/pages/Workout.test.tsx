import { render, screen } from "@testing-library/react";
import { Workout } from "./Workout";
import {
  DistanceUnits,
  ExerciseType,
  WeightUnits,
  type Exercise,
} from "@/types/Exercise";
import { type Workout as WorkoutType } from "@/types/Workout";

vi.mock("wouter", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Link: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  useLocation: () => ["/", vi.fn()],
  useParams: () => ({}),
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

const mockExercises: Exercise[] = [
  {
    exerciseId: "1",
    name: "Bench Press",
    exerciseType: ExerciseType.WEIGHTS,
    time: 600,
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
    time: 1800,
    distance: 5,
    distanceUnit: DistanceUnits.KM,
    level: 1,
    sets: [],
  },
  {
    exerciseId: "3",
    name: "Stretching",
    exerciseType: ExerciseType.OTHER,
    time: 900,
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

describe("Workout", () => {
  it("renders exercises grouped by exercise type", () => {
    render(
      <Workout loaderData={{ workout: mockWorkout, userExercises: [] }} onDeleteExercise={vi.fn()} onRefresh={vi.fn()} />
    );

    expect(screen.getByText("Weights")).toBeInTheDocument();
    expect(screen.getByText("Cardio")).toBeInTheDocument();
    expect(screen.getByText("Other")).toBeInTheDocument();

    expect(screen.getByText("Bench Press")).toBeInTheDocument();
    expect(screen.getByText("Running")).toBeInTheDocument();
    expect(screen.getByText("Stretching")).toBeInTheDocument();
  });

  it("displays loading state when no workout data", () => {
    render(<Workout loaderData={{ workout: null, userExercises: [] }} onDeleteExercise={vi.fn()} onRefresh={vi.fn()} />);

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("renders workout without exercises", () => {
    const workoutWithoutExercises = {
      workoutId: 1,
      date: "2024-06-16",
      name: "Empty Workout",
      exercises: [],
    };

    render(
      <Workout
        loaderData={{ workout: workoutWithoutExercises, userExercises: [] }}
        onDeleteExercise={vi.fn()}
        onRefresh={vi.fn()}
      />
    );

    expect(screen.getByText("Empty Workout", { exact: false })).toBeInTheDocument();
    expect(screen.queryByText("Weights")).not.toBeInTheDocument();
  });
});
