import type { Route } from "./+types/dashboard";
import { Dashboard } from "@/pages/Dashboard";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export async function clientLoader(_args: Route.LoaderArgs) {
  return {
    workouts: [
      { id: 1, name: "Push-ups" },
      { id: 2, name: "Squats" },
      { id: 3, name: "Lunges" },
    ],
  };
}

export default function Component({ loaderData }: Route.ComponentProps) {
  return (
    <ProtectedRoute>
      <Dashboard workouts={loaderData.workouts} />
    </ProtectedRoute>
  );
}
