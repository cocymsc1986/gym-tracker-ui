import { Link } from "react-router";

import { type Workout } from "@/types/Workout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DashboardProps {
  workouts: Workout[];
}

export function Dashboard({ workouts }: DashboardProps) {
  return (
    <div className="min-h-screen flex justify-center p-4 md:p-8 w-full">
      <Card className="w-full border-none shadow-none">
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>
            Workout tracking data. Add as many exercises as you want.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Card className="w-full md:w-1/2">
            <CardHeader>
              <CardTitle>Workouts</CardTitle>
              <CardDescription>
                List of your recent workouts. Click on a workout to view
                details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!workouts || workouts.length === 0 ? (
                <div className="p-4 text-gray-500">
                  No workouts found. Please add a workout to get started.
                </div>
              ) : (
                workouts.map((workout) => (
                  <div key={workout.workoutId} className="border-b pb-2 mb-4">
                    <h2 className="text-xl font-semibold">
                      <Link to={`/workout/${workout.workoutId}`}>
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
        </CardContent>
      </Card>
    </div>
  );
}
