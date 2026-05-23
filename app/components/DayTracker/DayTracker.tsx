import { useNavigate } from 'wouter';
import { format, startOfWeek, addDays } from 'date-fns';
import { Check } from 'lucide-react';

interface Workout {
  id: string;
  date: string;
  [key: string]: unknown;
}

interface DayTrackerProps {
  workouts: Workout[];
}

export function DayTracker({ workouts }: DayTrackerProps) {
  const [, navigate] = useNavigate();
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  const getWorkoutForDay = (date: Date): Workout | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return workouts.find(w => w.date === dateStr);
  };
  
  const handleDayClick = (date: Date) => {
    const workout = getWorkoutForDay(date);
    if (workout) {
      navigate(`/workouts/${workout.id}`);
    } else {
      const dateStr = format(date, 'yyyy-MM-dd');
      navigate(`/workouts/create?date=${dateStr}`);
    }
  };
  
  return (
    <div className="flex gap-2 justify-center">
      {days.map((date) => {
        const workout = getWorkoutForDay(date);
        const dayLabel = format(date, 'EEE');
        const hasActivity = !!workout;
        
        return (
          <button
            key={format(date, 'yyyy-MM-dd')}
            onClick={() => handleDayClick(date)}
            className="cursor-pointer flex flex-col items-center gap-1 p-2 rounded hover:bg-gray-100 transition-colors"
            aria-label={`${dayLabel} ${hasActivity ? 'completed' : 'no activity'}`}
          >
            <div className="text-sm font-medium text-gray-600">{dayLabel}</div>
            <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center">
              {hasActivity && (
                <Check className="w-4 h-4 text-green-500" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
