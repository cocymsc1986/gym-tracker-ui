import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/apiClient";
import { getUserId } from "@/lib/getUserId";
import type { Workout } from "@/types/Workout";
import type { Exercise } from "@/types/Exercise";

interface DuplicateWorkoutModalProps {
  workout: Workout | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DuplicateWorkoutModal({
  workout,
  open,
  onOpenChange,
}: DuplicateWorkoutModalProps) {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (workout) {
      setName(workout.name);
      setDate(new Date().toISOString().split("T")[0]);
      setError(null);
    }
  }, [workout]);

  const handleProceed = async () => {
    if (!workout) return;
    const userId = getUserId();
    if (!userId) return;

    setBusy(true);
    setError(null);

    try {
      const workoutResponse = await apiClient.post(`/workouts/${userId}`, {
        name,
        date,
      });

      if (workoutResponse.status !== 201 || !workoutResponse.data.workoutId) {
        setError(workoutResponse.data.error || "Failed to create workout");
        return;
      }

      const newWorkoutId = workoutResponse.data.workoutId;

      const [sourceWorkoutResponse, allExercisesResponse] = await Promise.all([
        apiClient.get(`/workouts/${userId}/${workout.workoutId}`),
        apiClient.get(`/exercises/${userId}`),
      ]);

      const sourceExerciseIds: string[] =
        sourceWorkoutResponse.data.exercises ?? [];
      const allExercises: Exercise[] = allExercisesResponse.data;
      const exercisesToCopy = allExercises.filter((e) =>
        sourceExerciseIds.includes(e.exerciseId)
      );

      for (const exercise of exercisesToCopy) {
        const newExerciseId = crypto.randomUUID();
        await apiClient.post(`/exercises/${userId}`, {
          ...exercise,
          exerciseId: newExerciseId,
        });
        await apiClient.post(
          `/workouts/${userId}/${newWorkoutId}/exercises/${newExerciseId}`
        );
      }

      onOpenChange(false);
      setLocation(`/workout/${newWorkoutId}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.error || "An error occurred");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline font-bold uppercase tracking-wider text-xl">
            Duplicate Workout
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label
              htmlFor="duplicate-workout-name"
              className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold"
            >
              Session Name
            </Label>
            <Input
              id="duplicate-workout-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="Session name"
              className="bg-surface-high border-0 focus-visible:ring-0 focus-visible:bg-surface-highest font-sans h-12 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="duplicate-workout-date"
              className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold"
            >
              Date
            </Label>
            <Input
              id="duplicate-workout-date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setError(null);
              }}
              className="bg-surface-high border-0 focus-visible:ring-0 focus-visible:bg-surface-highest font-sans h-12 rounded-xl"
            />
          </div>

          {error && (
            <div className="p-4 text-sm font-sans bg-destructive/10 text-destructive rounded-xl">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={busy}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleProceed}
            disabled={busy || !name || !date}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-headline font-bold uppercase tracking-wider rounded-xl"
          >
            {busy ? "Duplicating..." : "Proceed"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
