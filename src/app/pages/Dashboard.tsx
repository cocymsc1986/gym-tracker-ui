import { type Workout } from "@/types/Workout";
import { type Exercise } from "@/types/Exercise";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Activities } from "@/components/Activities";
import { Tracker } from "@/components/Tracker";
import { ProgressChart } from "@/components/ProgressChart";

interface DashboardProps {
  workouts: Workout[];
  exercises: Exercise[];
  onDeleteWorkout: (workoutId: number) => Promise<void>;
}

export function Dashboard({ workouts, exercises, onDeleteWorkout }: DashboardProps) {
  return (
    <div className="min-h-screen flex justify-center p-4 md:p-8 w-full">
      <Card className="w-full border-none shadow-none">
        <CardHeader>
          <CardTitle>Welcome!</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ProgressChart workouts={workouts} exercises={exercises} />
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <Activities workouts={workouts} onDeleteWorkout={onDeleteWorkout} />
            <Tracker workouts={workouts} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
