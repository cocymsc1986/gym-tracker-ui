import { type Workout } from "@/types/Workout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Activities } from "@/components/Activities";

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
          {/* <Tracker /> */}
          <Activities workouts={workouts} />
        </CardContent>
      </Card>
    </div>
  );
}
