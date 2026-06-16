import { CircleCheck, Circle } from "lucide-react";
import { useLocation } from "wouter";
import { type Workout } from "@/types/Workout";

export const Tracker = ({ workouts }: { workouts: Workout[] }) => {
  const [, setLocation] = useLocation();

  const getWeekProgress = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      const dayName = date
        .toLocaleDateString("en-US", { weekday: "short" })
        .toUpperCase();
      const matchedWorkout = workouts.find((w) => w.date.startsWith(dateStr));
      const workedOut = !!matchedWorkout;
      const workoutId = matchedWorkout?.workoutId;
      return { dateStr, dayName, workedOut, workoutId };
    });
  };

  const weekDays = getWeekProgress();

  const handleDayClick = (workedOut: boolean, workoutId?: number) => {
    if (workedOut && workoutId != null) {
      setLocation(`/workout/${workoutId}`);
    } else {
      setLocation("/workout");
    }
  };

  return (
    <div className="bg-card p-4 rounded-xl h-full">
      <h3 className="font-headline font-bold text-xl mb-4">WEEKLY FLOW</h3>
      <div className="flex flex-row md:flex-col gap-2">
        {weekDays.map(({ dateStr, dayName, workedOut, workoutId }) => (
          <button
            key={dateStr}
            type="button"
            className="flex-1 md:flex-none text-left cursor-pointer rounded-lg"
            onClick={() => handleDayClick(workedOut, workoutId)}
            aria-label={workedOut ? `View workout for ${dayName}` : `Add workout for ${dayName}`}
          >
            <div
              className={`flex flex-col md:flex-row items-center md:justify-between p-2 md:p-3 rounded-lg ${
                workedOut
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <span className="font-headline font-bold text-xs md:text-sm">{dayName}</span>
              {workedOut ? (
                <CircleCheck className="h-4 w-4 mt-1 md:mt-0" />
              ) : (
                <Circle className="h-4 w-4 mt-1 md:mt-0 opacity-40" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
