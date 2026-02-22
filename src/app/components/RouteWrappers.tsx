import { useCallback, useEffect, useState } from "react";
import { Dashboard } from "../pages/Dashboard";
import { Workout } from "../pages/Workout";
import { getUserId } from "../lib/getUserId";
import { apiClient } from "../lib/apiClient";
import type { Workout as WorkoutType } from "@/types/Workout";
import type { Exercise as ExerciseType } from "@/types/Exercise";

/**
 * Wrapper component that fetches dashboard data
 */
export function DashboardWithData() {
  const [data, setData] = useState<{
    workouts: WorkoutType[];
    exercises: ExerciseType[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const userId = getUserId();
      if (!userId) {
        console.warn("User ID not found or invalid token");
        setLoading(false);
        return;
      }

      try {
        const [workoutsResponse, exercisesResponse] = await Promise.all([
          apiClient.get(`/workouts/${userId}`),
          apiClient.get(`/exercises/${userId}`),
        ]);

        if (workoutsResponse.status === 200) {
          setData({
            workouts: workoutsResponse.data,
            exercises: exercisesResponse.data,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleDeleteWorkout = async (workoutId: number) => {
    const userId = getUserId();
    if (!userId) return;

    const workout = data?.workouts.find((w) => w.workoutId === workoutId);
    const exerciseIds = (workout?.exercises ?? []) as unknown as string[];

    await apiClient.delete(`/workouts/${userId}/${workoutId}`);
    await Promise.all(
      exerciseIds.map((exerciseId) =>
        apiClient.delete(`/exercises/${userId}/${exerciseId}`)
      )
    );

    setData((prev) =>
      prev
        ? {
            ...prev,
            workouts: prev.workouts.filter((w) => w.workoutId !== workoutId),
            exercises: prev.exercises.filter(
              (e) => !exerciseIds.includes(e.exerciseId)
            ),
          }
        : prev,
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Dashboard
      workouts={data?.workouts || []}
      exercises={data?.exercises || []}
      onDeleteWorkout={handleDeleteWorkout}
    />
  );
}

/**
 * Wrapper component that fetches workout detail data
 */
export function WorkoutWithData({ workoutId }: { workoutId: string }) {
  const [data, setData] = useState<{
    workout: WorkoutType;
    userExercises: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const userId = getUserId();
    if (!userId) {
      console.warn("User ID not found or invalid token");
      setLoading(false);
      return;
    }

    try {
      const [workoutResponse, exercisesResponse] = await Promise.all([
        apiClient.get(`/workouts/${userId}/${workoutId}`),
        apiClient.get(`/exercises/${userId}`),
      ]);

      if (workoutResponse.status === 200) {
        const userExercises = exercisesResponse.data.map(
          (e: ExerciseType) => e.name,
        );

        const workoutData = {
          workoutId: workoutResponse.data.workoutId,
          name: workoutResponse.data.name,
          date: workoutResponse.data.date,
          exercises: exercisesResponse.data.filter((exercise: ExerciseType) =>
            (workoutResponse.data.exercises ?? []).includes(
              exercise.exerciseId,
            ),
          ),
        };

        setData({ workout: workoutData, userExercises });
      }
    } catch (error) {
      console.error("Error fetching workout data:", error);
    } finally {
      setLoading(false);
    }
  }, [workoutId]);

  const handleDeleteExercise = async (exerciseId: string) => {
    const userId = getUserId();
    if (!userId) return;

    await apiClient.delete(`/exercises/${userId}/${exerciseId}`);
    setData((prev) =>
      prev
        ? {
            ...prev,
            workout: {
              ...prev.workout,
              exercises: prev.workout.exercises.filter(
                (e) => e.exerciseId !== exerciseId,
              ),
            },
          }
        : prev,
    );
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading workout...</p>
        </div>
      </div>
    );
  }

  return (
    <Workout
      loaderData={data || { workout: null, userExercises: [] }}
      onDeleteExercise={handleDeleteExercise}
      onRefresh={loadData}
    />
  );
}
