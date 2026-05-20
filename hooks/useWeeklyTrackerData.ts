import { useCallback, useEffect, useState } from 'react';
import { getWeeklyActivity } from '../api/workouts';
import { buildWeekDays } from '../utils/dateUtils';
import { DayCellData } from '../components/WeeklyTracker/DayCell';

interface WeeklyTrackerState {
  days: DayCellData[];
  loading: boolean;
  refresh: () => void;
}

export function useWeeklyTrackerData(): WeeklyTrackerState {
  const [days, setDays] = useState<DayCellData[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const activityMap = await getWeeklyActivity();
        if (cancelled) return;

        const weekDays = buildWeekDays();
        const mapped: DayCellData[] = weekDays.map(({ date, label }) => {
          const activity = activityMap[date];
          return {
            date,
            label,
            hasActivity: Boolean(activity),
            workoutId: activity?.workoutId,
          };
        });

        setDays(mapped);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [tick]);

  return { days, loading, refresh };
}
