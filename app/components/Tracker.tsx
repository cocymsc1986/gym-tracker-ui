import { Link } from "react-router";

import { type Workout } from "@/types/Workout";

export const Activities = ({ workouts }: { workouts: Workout[] }) => {
  if (!workouts || workouts.length === 0) {
    return (
      <div className="p-4 text-gray-500">
        No workouts found. Please add a workout to get started.
      </div>
    );
  }

  return workouts.map((workout) => (
    <div key={workout.workoutId} className="border-b pb-2 mb-4">
      <h2 className="text-xl font-semibold">
        <Link to={`/workout/${workout.workoutId}`}>{workout.name}</Link>
      </h2>
      <p className="text-gray-600 text-xs">
        {new Date(workout.date).toLocaleDateString()}
      </p>
    </div>
  ));
};
