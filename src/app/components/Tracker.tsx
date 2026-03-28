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

  return (
    <div className="bg-card p-4 rounded-xl h-full">
      <h3 className="font-headline font-bold text-xl mb-4">WEEKLY FLOW</h3>
      <div className="flex flex-row md:flex-col gap-2">
        {weekDays.map(({ dateStr, dayName, workedOut }) => (
          <div
            key={dateStr}
            className={`flex flex-col md:flex-row items-center md:justify-between p-2 md:p-3 rounded-lg flex-1 md:flex-none ${
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
        ))}
      </div>
    </div>
  );
};
