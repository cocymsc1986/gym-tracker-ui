import { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { Plus } from "lucide-react";
import { type Workout } from "@/types/Workout";
import { WorkoutRow } from "@/components/Activities";

interface WorkoutsProps {
  workouts: Workout[];
  onDeleteWorkout: (workoutId: number) => Promise<void>;
}

function getWeeklyCount(workouts: Workout[]): number {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);
  return workouts.filter((w) => new Date(w.date) >= monday).length;
}

export function Workouts({ workouts, onDeleteWorkout }: WorkoutsProps) {
  const sorted = [...workouts].sort((a, b) => b.date.localeCompare(a.date));
  const weeklyCount = getWeeklyCount(workouts);

  const ctaRef = useRef<HTMLDivElement>(null);
  const [ctaOffScreen, setCtaOffScreen] = useState(false);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setCtaOffScreen(!entry.isIntersecting), { threshold: 0 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Hero */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-md">
            <h1 className="font-headline font-extrabold text-5xl md:text-7xl tracking-tighter leading-none mb-4 uppercase">
              WORK<br />
              <span className="text-primary-dark">OUTS</span>
            </h1>
            <p className="font-sans text-muted-foreground text-lg leading-relaxed">
              Track your velocity. Analyse your power. Push beyond the baseline.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end">
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
              This Week
            </span>
            <div className="font-headline font-bold text-4xl text-foreground">
              {weeklyCount}{" "}
              <span className="text-sm font-medium text-muted-foreground">
                SESSION{weeklyCount !== 1 ? "S" : ""}
              </span>
            </div>
          </div>
        </header>

        {/* Add Workout CTA */}
        <div ref={ctaRef} className="mb-10">
          <Link
            href="/workout"
            className="group w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl flex items-center justify-center md:inline-flex gap-3 transition-all active:scale-95 shadow-lg font-headline font-bold uppercase tracking-wider"
          >
            <Plus className="h-5 w-5" />
            Add Workout
          </Link>
        </div>

        {/* Recent Logs */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="font-headline font-bold text-xl uppercase tracking-widest text-foreground whitespace-nowrap">
              Recent Logs
            </h2>
            <div className="h-[2px] flex-grow bg-surface-highest" />
          </div>

          {sorted.length === 0 ? (
            <div className="bg-card rounded-xl p-12 text-center">
              <p className="font-sans text-muted-foreground text-sm">
                No sessions yet. Add your first workout to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sorted.map((workout, index) => (
                <WorkoutRow
                  key={workout.workoutId}
                  workout={workout}
                  highlight={index === 0}
                  onDelete={onDeleteWorkout}
                />
              ))}
            </div>
          )}
        </section>

      </div>

      {/* Floating action button — slides in when Add Workout CTA scrolls off-screen */}
      <Link href="/workout">
        <button
          className={`fixed bottom-[34px] right-[34px] w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl font-bold z-50 transition-all duration-300 ${ctaOffScreen ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0 pointer-events-none"}`}
          style={{ backgroundColor: "#e4f725", color: "#545c00" }}
          aria-label="Add Workout"
        >
          +
        </button>
      </Link>
    </div>
  );
}
