import { useLocation } from "wouter";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/apiClient";
import { getUserId } from "@/lib/getUserId";

export function AddWorkout() {
  const [, setLocation] = useLocation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("workout-name") as string;
    const date = formData.get("workout-date") as string;
    const userId = getUserId();

    if (!userId) {
      setError("User not authenticated");
      setBusy(false);
      return;
    }

    try {
      const response = await apiClient.post(`/workouts/${userId}`, {
        name,
        date,
      });

      if (response.status === 201 && response.data.workoutId) {
        setLocation(`/workout/${response.data.workoutId}`);
      } else {
        setError(response.data.error || "Failed to create workout");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "An error occurred");
      console.error("Add workout error:", err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create your workout</CardTitle>
          <CardDescription>Enter workout details below</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} data-testid="add-workout-form">
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="workout-name">Name</Label>
                <Input
                  id="workout-name"
                  name="workout-name"
                  type="text"
                  placeholder="Enter a workout name (optional)"
                  autoComplete="workout-name"
                  required
                  onChange={() => setError(null)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="workout-date">Date</Label>
                <Input
                  id="workout-date"
                  name="workout-date"
                  type="date"
                  autoComplete="workout-date"
                  required
                  onChange={() => setError(null)}
                />
              </div>
            </div>
            {error && (
              <div className="mt-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-2 mt-4">
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Creating workout..." : "Create Workout"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
