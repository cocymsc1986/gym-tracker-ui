import { type Workout } from "@/types/Workout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { CircleCheck, CircleX } from "lucide-react";

export const Tracker = ({ workouts }: { workouts: Workout[] }) => {
  const calculateDailyProgressForWeek = () => {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      return date.toISOString().split("T")[0];
    });

    const progress = last7Days.map((date) => {
      const dailyWorkouts = workouts.filter((workout) =>
        workout.date.startsWith(date)
      );
      return { date, workedOut: dailyWorkouts.length > 0 };
    });
    return progress.sort((a, b) => a.date.localeCompare(b.date));
  };

  return (
    <Card className="w-full md:w-1/2">
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        <CardDescription>Your weekly progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {calculateDailyProgressForWeek().map(({ date, workedOut }) => (
            <div className="flex flex-col items-center" key={date}>
              {new Date(date).toLocaleDateString("en-US", { weekday: "short" })}
              <div key={date} className="mt-2" title={date}>
                {workedOut ? (
                  <CircleCheck color="green" />
                ) : (
                  <CircleX color="grey" />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
