import { Workout } from "@/pages/Workout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getUserId } from "@/lib/getUserId";
import type { WorkoutResponse, Workout as WorkoutType } from "@/types/Workout";
import type { Route } from "./+types/workout";
import { apiClient } from "@/lib/apiClient";
import type { Exercise } from "@/types/Exercise";

export async function clientLoader(_args: Route.LoaderArgs) {
  const userId = getUserId();
  if (!userId) {
    console.warn("User ID not found or invalid token");
    return null;
  }

  try {
    const getWorkoutDataUrl = `/workouts/${userId}/${_args.params.id}`;
    const getAllUserExercisesUrl = `/exercises/${userId}`;

    const [workoutResponse, exercisesResponse] = await Promise.all([
      apiClient.get<WorkoutResponse>(getWorkoutDataUrl),
      apiClient.get<Exercise[]>(getAllUserExercisesUrl),
    ]);

    if (workoutResponse.status !== 200) {
      console.error(
        "Failed to fetch workout data:",
        workoutResponse.statusText
      );
      return null;
    }

    const userExercises = exercisesResponse.data.map((e: Exercise) => e.name);

    const workoutData: WorkoutType = {
      workoutId: workoutResponse.data.workoutId,
      name: workoutResponse.data.name,
      date: workoutResponse.data.date,
      exercises: [],
    };

    if (
      workoutResponse.data.exercises &&
      workoutResponse.data.exercises.length > 0
    ) {
      workoutData.exercises = exercisesResponse.data.filter(
        (exercise: Exercise) =>
          workoutResponse.data.exercises.includes(exercise.exerciseId)
      );
    }

    return {
      workout: workoutData,
      userExercises,
    };
  } catch (error) {
    console.error("Error fetching workout data:", error);
    throw new Response("Failed to fetch workout data", {
      status: 500,
      statusText: "Internal Server Error",
    });
  }
}

export default function Component({
  loaderData,
}: {
  loaderData: {
    workout: WorkoutType | null;
    userExercises: string[];
  };
}) {
  return (
    <ProtectedRoute>
      <Workout loaderData={loaderData} />
    </ProtectedRoute>
  );
}
