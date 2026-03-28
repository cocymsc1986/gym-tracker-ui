import { type Workout } from "@/types/Workout";
import { type Exercise } from "@/types/Exercise";

import { Activities } from "@/components/Activities";
import { Tracker } from "@/components/Tracker";
import { ProgressChart } from "@/components/ProgressChart";

interface DashboardProps {
  workouts: Workout[];
  exercises: Exercise[];
  onDeleteWorkout: (workoutId: number) => Promise<void>;
}

export function Dashboard({ workouts, exercises, onDeleteWorkout }: DashboardProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Hero */}
        <section className="mb-10">
          <span className="font-headline font-bold tracking-widest uppercase text-xs text-primary-dark mb-2 block">
            Performance Overview
          </span>
          <h2 className="font-headline text-5xl md:text-6xl font-bold tracking-tight text-foreground">
            DASHBOARD
          </h2>
        </section>

        {/* Bento grid */}
        <div className="flex flex-col gap-6 mb-12">
          <section>
            <Tracker workouts={workouts} />
          </section>
          <section>
            <ProgressChart workouts={workouts} exercises={exercises} />
          </section>
        </div>

        {/* Recent Sessions */}
        <Activities workouts={workouts} onDeleteWorkout={onDeleteWorkout} />
      </div>
    </div>
  );
}
