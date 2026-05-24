import { Link } from "wouter";
import { ChevronDown, Copy, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { type Exercise, ExerciseType } from "@/types/Exercise";
import { AddExerciseModal } from "@/components/AddExerciseModal";
import { EditExerciseModal } from "@/components/EditExerciseModal";
import type { Workout } from "@/types/Workout";

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
}

function formatExerciseType(type: ExerciseType): string {
  return type.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-low rounded-lg px-4 py-3 flex flex-col items-center min-w-[80px]">
      <span className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
        {label}
      </span>
      <span className="font-headline font-bold text-foreground">{value}</span>
    </div>
  );
}

function ExerciseExpandedDetail({ exercise }: { exercise: Exercise }) {
  const hasSets =
    (exercise.exerciseType === ExerciseType.WEIGHTS ||
      exercise.exerciseType === ExerciseType.BODY_WEIGHT) &&
    exercise.sets &&
    exercise.sets.length > 0;

  if (hasSets) {
    const showWeight = exercise.sets.some((s) => s.weight > 0);
    const showReps = exercise.sets.some((s) => !isNaN(s.reps) && s.reps > 0);
    const showDuration = exercise.sets.some((s) => s.duration != null && s.duration > 0);
    const colCount = 1 + (showWeight ? 1 : 0) + (showReps ? 1 : 0) + (showDuration ? 1 : 0);
    const gridClass = ({ 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" } as Record<number, string>)[colCount] ?? "grid-cols-3";
    return (
      <div className="space-y-2 px-4 pb-4">
        <div className={`grid ${gridClass} gap-3 px-3 font-sans text-[10px] font-bold uppercase tracking-widest text-muted-foreground`}>
          <span>Set</span>
          {showWeight && <span className="text-center">{exercise.sets[0]?.unit?.toUpperCase() ?? "KG"}</span>}
          {showReps && <span className="text-center">Reps</span>}
          {showDuration && <span className="text-center">Duration</span>}
        </div>
        {exercise.sets.map((set, i) => (
          <div key={i} className={`bg-surface-low rounded-lg px-3 py-2 grid ${gridClass} gap-3 items-center`}>
            <span className="font-headline font-bold text-base text-primary-dark">{i + 1}</span>
            {showWeight && (
              <div className="bg-muted rounded p-1.5 text-center font-headline font-bold text-sm">{set.weight}</div>
            )}
            {showReps && (
              <div className="bg-muted rounded p-1.5 text-center font-headline font-bold text-sm">
                {!isNaN(set.reps) && set.reps > 0 ? set.reps : "—"}
              </div>
            )}
            {showDuration && (
              <div className="bg-muted rounded p-1.5 text-center font-headline font-bold text-sm">
                {set.duration != null && set.duration > 0 ? formatDuration(set.duration) : "—"}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 px-4 pb-4">
      {exercise.time && (
        <MetricChip
          label="Time"
          value={`${Math.floor(Number(exercise.time) / 60)}m ${Number(exercise.time) % 60}s`}
        />
      )}
      {exercise.distance != null && exercise.distance > 0 && (
        <MetricChip
          label="Distance"
          value={`${exercise.distance} ${exercise.distanceUnit ?? ""}`}
        />
      )}
      {exercise.level != null && exercise.level > 0 && (
        <MetricChip label="Level" value={String(exercise.level)} />
      )}
      {exercise.rpm != null && exercise.rpm > 0 && (
        <MetricChip label="RPM" value={String(exercise.rpm)} />
      )}
    </div>
  );
}

function buildInlineSummary(exercise: Exercise): string {
  const hasSets =
    (exercise.exerciseType === ExerciseType.WEIGHTS ||
      exercise.exerciseType === ExerciseType.BODY_WEIGHT) &&
    exercise.sets &&
    exercise.sets.length > 0;

  if (hasSets) {
    const parts: string[] = [`${exercise.sets.length} sets`];
    const avgWeightVal = exercise.sets.reduce((sum, s) => sum + s.weight, 0) / exercise.sets.length;
    if (avgWeightVal > 0) {
      const unit = exercise.sets[0]?.unit ?? "kg";
      parts.push(`${avgWeightVal % 1 === 0 ? avgWeightVal : avgWeightVal.toFixed(1)}${unit}`);
    }
    const validReps = exercise.sets.filter((s) => !isNaN(s.reps) && s.reps > 0);
    if (validReps.length > 0) {
      parts.push(`${validReps.reduce((sum, s) => sum + s.reps, 0)} reps`);
    }
    return parts.join(" · ");
  }

  const parts: string[] = [];
  if (exercise.time) {
    parts.push(formatDuration(Number(exercise.time)));
  }
  if (exercise.distance != null && exercise.distance > 0) {
    parts.push(`${exercise.distance}${exercise.distanceUnit ?? ""}`);
  }
  if (exercise.level != null && exercise.level > 0) {
    parts.push(`L${exercise.level}`);
  }
  return parts.join(" · ");
}

function ExerciseCard({
  exercise,
  onDelete,
  onDuplicate,
  userExercises,
  onExerciseUpdated,
}: {
  exercise: Exercise;
  onDelete: (id: string) => Promise<void>;
  onDuplicate: (exercise: Exercise) => Promise<void>;
  userExercises?: string[];
  onExerciseUpdated?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const summary = buildInlineSummary(exercise);

  return (
    <>
      <article className="bg-card rounded-xl overflow-hidden">
        {/* Single-line header row */}
        <div
          className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-surface-low/40 transition-colors"
          onClick={() => setExpanded((v) => !v)}
        >
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />

          <span className="font-semibold text-sm text-foreground truncate flex-1 min-w-0">
            {exercise.name}
          </span>

          <span className="hidden sm:inline-block px-2 py-0.5 bg-surface-high rounded-full text-[9px] font-bold uppercase tracking-wider text-muted-foreground shrink-0">
            {formatExerciseType(exercise.exerciseType)}
          </span>

          {summary && (
            <span className="text-xs text-muted-foreground shrink-0">
              {summary}
            </span>
          )}

          {isDuplicating ? (
            <div className="h-8 w-8 flex items-center justify-center shrink-0" role="status" aria-label="Duplicating exercise">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-dark" />
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Exercise options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEdit(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async (e) => {
                    e.stopPropagation();
                    setIsDuplicating(true);
                    try {
                      await onDuplicate(exercise);
                    } finally {
                      setIsDuplicating(false);
                    }
                  }}
                >
                  <Copy className="h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(exercise.exerciseId);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Expandable details */}
        {expanded && (
          <div className="border-t border-border/50 pt-3">
            <ExerciseExpandedDetail exercise={exercise} />
          </div>
        )}
      </article>

      {showEdit && (
        <EditExerciseModal
          exercise={exercise}
          showModal={showEdit}
          setShowModal={setShowEdit}
          userExercises={userExercises ?? []}
          onExerciseUpdated={onExerciseUpdated}
        />
      )}
    </>
  );
}

export function Workout({
  loaderData,
  onDeleteExercise,
  onDuplicateExercise,
  onRefresh,
}: {
  loaderData: {
    workout: Workout | null;
    userExercises: string[];
  };
  onDeleteExercise: (exerciseId: string) => Promise<void>;
  onDuplicateExercise: (exercise: import("@/types/Exercise").Exercise) => Promise<void>;
  onRefresh: () => void;
})
 {
  const workout = loaderData?.workout;
  const userExercises = loaderData?.userExercises;

  const [showModal, setShowModal] = useState(false);

  const ctaRef = useRef<HTMLDivElement>(null);
  const [ctaOffScreen, setCtaOffScreen] = useState(false);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setCtaOffScreen(!entry.isIntersecting), { threshold: 0 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!workout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          data-testid="loading-spinner"
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-dark"
        />
      </div>
    );
  }

  const formattedDate = new Date(workout.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Hero */}
        <section className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
              Session Detail
            </span>
            <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter text-foreground leading-none uppercase">
              {workout.name || `Workout ${workout.date}`}
            </h1>
            <p className="font-sans text-sm font-semibold text-muted-foreground pt-2 uppercase">
              {formattedDate}
            </p>
          </div>
          <Button
            variant="link"
            asChild
            className="text-primary-dark font-bold text-xs uppercase tracking-widest underline p-0 h-auto self-start"
          >
            <Link href="/">&larr; Dashboard</Link>
          </Button>
        </section>

        {/* Add Exercise CTA */}
        <div ref={ctaRef} className="mb-10">
          <button
            onClick={() => setShowModal(true)}
            className="group w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl flex items-center justify-center md:inline-flex gap-3 transition-all active:scale-95 shadow-lg font-headline font-bold uppercase tracking-wider"
          >
            <span className="text-xl leading-none">+</span>
            Add Exercise
          </button>
        </div>

        {/* Exercise list */}
        <div className="space-y-2">
          {!workout.exercises || workout.exercises.length === 0 ? (
            <div className="bg-card rounded-xl p-12 text-center">
              <p className="font-sans text-muted-foreground text-sm">
                No exercises added yet.
              </p>
            </div>
          ) : (
            workout.exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.exerciseId}
                exercise={exercise}
                onDelete={onDeleteExercise}
                onDuplicate={onDuplicateExercise}
                userExercises={userExercises}
                onExerciseUpdated={onRefresh}
              />
            ))
          )}
        </div>
      </div>

      {showModal && (
        <AddExerciseModal
          showModal={showModal}
          setShowModal={setShowModal}
          userExercises={userExercises}
          onExerciseAdded={onRefresh}
        />
      )}

      {/* Floating action button — slides in when Add Exercise CTA scrolls off-screen */}
      <button
        onClick={() => setShowModal(true)}
        className={`fixed bottom-[34px] right-[34px] w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl font-bold z-50 transition-all duration-300 ${ctaOffScreen ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0 pointer-events-none"}`}
        style={{ backgroundColor: "#e4f725", color: "#545c00" }}
        aria-label="Add Exercise"
      >
        +
      </button>
    </div>
  );
}
