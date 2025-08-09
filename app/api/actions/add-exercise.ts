import { apiClient } from "@/lib/apiClient";
import { type Route } from "../../+types/root";
import { getUserId } from "@/lib/getUserId";
import { ExerciseType } from "@/types/Exercise";
import {
  validateWeights,
  validateCardio,
  validateOther,
  type ValidatedExercise,
} from "@/api/utils/exerciseValidator";
import { parseError } from "../utils/parseError";

export async function clientAction({ request }: Route.ActionArgs) {
  const userId = await getUserId();
  const formData = await request.formData();

  const workoutId = formData.get("workout-id") as string;
  const exerciseId = formData.get("exercise-id") as string;
  const exerciseType = formData.get("exercise-type") as ExerciseType;

  if (!workoutId || !exerciseId || !exerciseType) {
    return {
      status: 400,
      error: "Workout ID, Exercise ID, and Exercise Type are required",
    };
  }

  let validatedFields: ValidatedExercise | false = false;

  switch (exerciseType) {
    case ExerciseType.WEIGHTS:
      validatedFields = validateWeights(formData);
      break;
    case ExerciseType.CARDIO:
      validatedFields = validateCardio(formData);
      break;
    case ExerciseType.OTHER:
      validatedFields = validateOther(formData);
      break;
    default:
      return {
        status: 400,
        error: "Invalid exercise type",
      };
  }

  if (!validatedFields) {
    return {
      status: 400,
      error: "Required fields are missing or invalid",
    };
  }

  try {
    let response;

    try {
      response = await apiClient.post(`/exercises/${userId}`, validatedFields, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status !== 201) {
        throw {
          status: response.status,
          error: response.statusText || "Failed to create exercise",
        };
      }
    } catch (error) {
      console.error("Add exercise error:", error);
      const parsedError = parseError(error);
      throw parsedError;
    }

    try {
      const addToWorkoutPath = `/workouts/${userId}/${workoutId}/exercises/${exerciseId}`;
      const addToWorkoutResponse = await apiClient.post(addToWorkoutPath);

      if (addToWorkoutResponse.status !== 201) {
        throw {
          status: addToWorkoutResponse.status,
          error:
            addToWorkoutResponse.statusText ||
            "Failed to add exercise to workout",
        };
      }
    } catch (error) {
      console.error("Add exercise to workout error:", error);
      const parsedError = parseError(error);
      throw parsedError;
    }

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Add exercise error:", error);
    const parsedError = parseError(error);
    return {
      status: parsedError.status,
      error: parsedError.error || "An error occurred while adding the exercise",
    };
  }
}
