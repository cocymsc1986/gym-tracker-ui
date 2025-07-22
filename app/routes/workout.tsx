import { Workout } from "@/pages/Workout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getUserId } from "@/lib/getUserId";
import type { Exercise } from "@/types/Exercise";
import type { Route } from "./+types/workout";
import { apiClient } from "@/lib/apiClient";

export async function clientLoader(_args: Route.LoaderArgs) {
  const userId = getUserId();
  if (!userId) {
    console.warn("User ID not found or invalid token");
    return null;
  }

  try {
    const url = `/workouts/${userId}/${_args.params.id}`;
    const response = await apiClient.get(url);

    if (response.status !== 200) {
      console.error("Failed to fetch workout data:", response.statusText);
      return null;
    }

    return response.data;
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
  loaderData: { id: number; name: string; exercises: Exercise[] } | null;
}) {
  return (
    <ProtectedRoute>
      <Workout loaderData={loaderData} />
    </ProtectedRoute>
  );
}
