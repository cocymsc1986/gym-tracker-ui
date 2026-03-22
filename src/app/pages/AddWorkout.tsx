import { Link, useLocation } from "wouter";
import { useState } from "react";

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.error || "An error occurred");
      console.error("Add workout error:", err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Hero */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
              New Session
            </span>
            <h1 className="font-headline font-extrabold text-5xl md:text-7xl tracking-tighter leading-none uppercase">
              CREATE<br />
              <span className="text-primary-dark">SESSION</span>
            </h1>
            <p className="font-sans text-muted-foreground text-base leading-relaxed pt-1">
              Name your session and set the date to get started.
            </p>
          </div>
          <Link
            href="/workouts"
            className="font-sans font-bold text-xs uppercase tracking-widest text-primary-dark underline hover:text-foreground transition-colors self-start md:self-auto"
          >
            &larr; Workouts
          </Link>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} data-testid="add-workout-form">
          <div className="space-y-6 max-w-lg">

            <div className="space-y-2">
              <Label
                htmlFor="workout-name"
                className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold"
              >
                Session Name
              </Label>
              <Input
                id="workout-name"
                name="workout-name"
                type="text"
                placeholder="e.g. Leg Day: Power Focus"
                autoComplete="off"
                required
                onChange={() => setError(null)}
                className="bg-surface-high border-0 focus-visible:ring-0 focus-visible:bg-surface-highest font-sans placeholder:text-muted-foreground/50 h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="workout-date"
                className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold"
              >
                Date
              </Label>
              <Input
                id="workout-date"
                name="workout-date"
                type="date"
                autoComplete="off"
                required
                onChange={() => setError(null)}
                className="bg-surface-high border-0 focus-visible:ring-0 focus-visible:bg-surface-highest font-sans h-12 rounded-xl"
              />
            </div>

            {error && (
              <div className="p-4 text-sm font-sans bg-destructive/10 text-destructive rounded-xl">
                {error}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={busy}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-headline font-bold uppercase tracking-wider transition-all active:scale-95 shadow-lg disabled:opacity-60"
              >
                {busy ? "Creating..." : "Add Workout"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
