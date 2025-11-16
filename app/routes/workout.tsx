import { Workout } from "@/pages/Workout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getUserId } from "@/lib/getUserId";
import type { Workout as WorkoutType } from "@/types/Workout";
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
      apiClient.get<WorkoutType>(getWorkoutDataUrl),
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

    if (
      workoutResponse.data.exercises &&
      workoutResponse.data.exercises.length > 0
    ) {
      const workoutExercises = exercisesResponse.data.filter(
        (exercise: Exercise) =>
          workoutResponse.data.exercises.includes(exercise.exerciseId)
      );

      workoutResponse.data.exercises = workoutExercises;
    }

    return {
      workout: workoutResponse.data,
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
  loaderData: WorkoutType | null;
}) {
  return (
    <ProtectedRoute>
      <Workout loaderData={loaderData} />
    </ProtectedRoute>
  );
}
