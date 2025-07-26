import { Link } from "react-router";

import { type Workout } from "@/types/Workout";

interface DashboardProps {
  workouts: Workout[];
}

export function Dashboard({ workouts }: DashboardProps) {
  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      <div className="bg-white">
        {workouts.map((workout) => (
          <div
            key={workout.workoutId}
            className="bg-white p-4 mb-4 rounded shadow"
          >
            <h2 className="text-xl font-semibold">
              <Link to={`/workout/${workout.workoutId}`}>{workout.name}</Link>
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}
