import { apiClient } from './client';

export interface WorkoutActivity {
  workoutId: string;
  date: string;
}

export type WeeklyActivityMap = Record<string, WorkoutActivity | undefined>;

export async function getWeeklyActivity(): Promise<WeeklyActivityMap> {
  const response = await apiClient.get<{ activities: WorkoutActivity[] }>(
    '/workouts/weekly'
  );
  return response.data.activities.reduce<WeeklyActivityMap>((acc, activity) => {
    if (!acc[activity.date]) {
      acc[activity.date] = activity;
    }
    return acc;
  }, {});
}

export async function getWorkout(id: string) {
  const response = await apiClient.get(`/workouts/${id}`);
  return response.data;
}

export async function createWorkout(data: Record<string, unknown>) {
  const response = await apiClient.post('/workouts', data);
  return response.data;
}
