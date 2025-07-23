import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getUserId } from "@/lib/getUserId";
import { apiClient } from "@/lib/apiClient";
import { Dashboard } from "@/pages/Dashboard";

import type { Route } from "./+types/dashboard";

export async function clientLoader(_args: Route.LoaderArgs) {
  const userId = getUserId();
  if (!userId) {
    console.warn("User ID not found or invalid token");
    return null;
  }

  try {
    const url = `/workouts/${userId}`;
    const response = await apiClient.get(url);

    if (response.status !== 200) {
      console.error("Failed to fetch workouts:", response.statusText);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching workouts:", error);
    throw new Response("Failed to fetch workouts", {
      status: 500,
      statusText: "Internal Server Error",
    });
  }
}

export default function Component({ loaderData }: Route.ComponentProps) {
  return (
    <ProtectedRoute>
      <Dashboard workouts={loaderData} />
    </ProtectedRoute>
  );
}
