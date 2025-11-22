import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getUserId } from "@/lib/getUserId";
import { apiClient } from "@/lib/apiClient";
import { Dashboard } from "@/pages/Dashboard";
import type { Exercise } from "@/types/Exercise";

import type { Route } from "./+types/dashboard";

export async function clientLoader(_args: Route.LoaderArgs) {
  const userId = getUserId();
  if (!userId) {
    console.warn("User ID not found or invalid token");
    return null;
  }

  try {
    const workoutsUrl = `/workouts/${userId}`;
    const exercisesUrl = `/exercises/${userId}`;

    const [workoutsResponse, exercisesResponse] = await Promise.all([
      apiClient.get(workoutsUrl),
      apiClient.get<Exercise[]>(exercisesUrl),
    ]);

    if (workoutsResponse.status !== 200) {
      console.error("Failed to fetch workouts:", workoutsResponse.statusText);
      return null;
    }

    return {
      workouts: workoutsResponse.data,
      exercises: exercisesResponse.data,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Response("Failed to fetch data", {
      status: 500,
      statusText: "Internal Server Error",
    });
  }
}

export default function Component({ loaderData }: Route.ComponentProps) {
  return (
    <ProtectedRoute>
      <Dashboard workouts={loaderData?.workouts || []} exercises={loaderData?.exercises || []} />
    </ProtectedRoute>
  );
}
