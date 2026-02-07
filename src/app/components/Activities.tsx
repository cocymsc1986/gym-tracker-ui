import { Link, useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { type Workout } from "@/types/Workout";

export const Activities = ({ workouts }: { workouts: Workout[] }) => {
  return (
    <Card className="w-full md:w-1/2 mb-4">
      <CardHeader>
        <CardTitle>Workouts</CardTitle>
        <CardDescription>
          List of your recent workouts. Click on a workout to view details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!workouts || workouts.length === 0 ? (
          <div className="p-4 text-gray-500">
            No workouts found. Please add a workout to get started.
          </div>
        ) : (
          workouts
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((workout) => (
              <div key={workout.workoutId} className="border-b pb-2 mb-4">
                <h2 className="text-xl font-semibold">
                  <Link href={`/workout/${workout.workoutId}`}>
                    {workout.name}
                  </Link>
                </h2>
                <p className="text-gray-600 text-xs">
                  {new Date(workout.date).toLocaleDateString()}
                </p>
              </div>
            ))
        )}
      </CardContent>
    </Card>
  );
};
