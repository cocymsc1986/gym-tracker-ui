import { AddWorkout } from "@/pages/AddWorkout";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function Component() {
  return (
    <ProtectedRoute>
      <AddWorkout />
    </ProtectedRoute>
  );
}
