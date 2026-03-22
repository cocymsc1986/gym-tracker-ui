import { CircleCheck, Circle } from "lucide-react";
import { type Workout } from "@/types/Workout";

export const Tracker = ({ workouts }: { workouts: Workout[] }) => {
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
      const workedOut = workouts.some((w) => w.date.startsWith(dateStr));
      return { dateStr, dayName, workedOut };
    });
  };

  const weekDays = getWeekProgress();
  const weekdays = weekDays.slice(0, 5);
  const weekend = weekDays.slice(5);

  return (
    <div className="bg-card p-6 rounded-xl h-full">
      <h3 className="font-headline font-bold text-xl mb-6">WEEKLY FLOW</h3>
      <div className="flex flex-col gap-3">
        {weekdays.map(({ dateStr, dayName, workedOut }) => (
          <div
            key={dateStr}
            className={`flex items-center justify-between p-3 rounded-lg ${
              workedOut
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <span className="font-headline font-bold text-sm">{dayName}</span>
            {workedOut ? (
              <CircleCheck className="h-5 w-5" />
            ) : (
              <Circle className="h-5 w-5 opacity-40" />
            )}
          </div>
        ))}
        <div className="grid grid-cols-2 gap-3">
          {weekend.map(({ dateStr, dayName, workedOut }) => (
            <div
              key={dateStr}
              className={`flex flex-col items-center justify-center p-3 rounded-lg aspect-square ${
                workedOut
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <span className="font-headline font-bold text-sm mb-1">
                {dayName}
              </span>
              {workedOut ? (
                <CircleCheck className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5 opacity-40" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
