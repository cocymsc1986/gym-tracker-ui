import { Link, useLocation } from "wouter";
import { useState } from "react";

import { Button } from "@/components/ui/button";
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
        <section className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary font-bold">
              Start Training
            </span>
            <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter text-foreground leading-none">
              NEW<br />
              <span className="text-primary-dark">SESSION</span>
            </h1>
          </div>
          <Button
            variant="link"
            asChild
            className="text-primary-dark font-bold text-xs uppercase tracking-widest underline p-0 h-auto self-start md:self-auto"
          >
            <Link href="/">&larr; Dashboard</Link>
          </Button>
        </section>

        {/* Form */}
        <form onSubmit={handleSubmit} data-testid="add-workout-form">
          <div className="space-y-6 max-w-lg">

            <div className="space-y-2">
              <Label
                htmlFor="workout-name"
                className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary font-bold"
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
                className="bg-surface-container-high border-0 focus-visible:ring-0 focus-visible:bg-surface-container-highest font-body placeholder:text-secondary/50 text-foreground h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="workout-date"
                className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary font-bold"
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
                className="bg-surface-container-high border-0 focus-visible:ring-0 focus-visible:bg-surface-container-highest font-body text-foreground h-12 rounded-xl"
              />
            </div>

            {error && (
              <div className="p-4 text-sm font-body bg-error/10 text-error rounded-xl">
                {error}
              </div>
            )}

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                disabled={busy}
                className="group bg-primary-container hover:bg-primary-container/90 text-on-primary-container px-8 py-4 h-auto rounded-xl font-headline font-bold uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-primary/10"
              >
                {busy ? "Creating..." : "Create Session"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
