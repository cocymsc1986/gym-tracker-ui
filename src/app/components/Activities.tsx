import { Link } from "wouter";
import { MoreHorizontal, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { type Workout } from "@/types/Workout";

export const Activities = ({
  workouts,
  onDeleteWorkout,
}: {
  workouts: Workout[];
  onDeleteWorkout: (workoutId: number) => Promise<void>;
}) => {
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
              <div
                key={workout.workoutId}
                className="border-b pb-2 mb-4 flex items-start justify-between gap-2"
              >
                <div>
                  <h2 className="text-xl font-semibold">
                    <Link href={`/workout/${workout.workoutId}`}>
                      {workout.name}
                    </Link>
                  </h2>
                  <p className="text-gray-600 text-xs">
                    {new Date(workout.date).toLocaleDateString()}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Workout options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDeleteWorkout(workout.workoutId)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
        )}
      </CardContent>
    </Card>
  );
};
