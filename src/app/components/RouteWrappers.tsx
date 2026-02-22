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
          (e: ExerciseType) => e.name
        );

        const workoutData = {
          workoutId: workoutResponse.data.workoutId,
          name: workoutResponse.data.name,
          date: workoutResponse.data.date,
          exercises: exercisesResponse.data.filter((exercise: ExerciseType) =>
            workoutResponse.data.exercises.includes(exercise.exerciseId)
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

  return <Workout loaderData={data || { workout: null, userExercises: [] }} onRefresh={loadData} />;
}
