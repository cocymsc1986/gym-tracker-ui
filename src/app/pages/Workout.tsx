import { Link } from "wouter";
import { ChevronRight, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

function ExerciseDetailModal({
  exercise,
  open,
  onClose,
}: {
  exercise: Exercise;
  open: boolean;
  onClose: () => void;
}) {
  const hasSets = exercise.sets && exercise.sets.length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{exercise.name}</DialogTitle>
        </DialogHeader>

        {/* Weights / Body Weight: full sets grid */}
        {(exercise.exerciseType === ExerciseType.WEIGHTS || exercise.exerciseType === ExerciseType.BODY_WEIGHT) && hasSets && (() => {
          const showWeight = exercise.sets.some((s) => s.weight > 0);
          const showReps = exercise.sets.some((s) => !isNaN(s.reps) && s.reps > 0);
          const showDuration = exercise.sets.some((s) => s.duration != null && s.duration > 0);
          const colCount = 1 + (showWeight ? 1 : 0) + (showReps ? 1 : 0) + (showDuration ? 1 : 0);
          const gridClass = ({ 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" } as Record<number, string>)[colCount] ?? "grid-cols-3";
          return (
            <div className="space-y-3 mt-2">
              <div className={`grid ${gridClass} gap-4 px-4 font-sans text-[10px] font-bold uppercase tracking-widest text-muted-foreground`}>
                <span>Set</span>
                {showWeight && <span className="text-center">{exercise.sets[0]?.unit?.toUpperCase() ?? "KG"}</span>}
                {showReps && <span className="text-center">Reps</span>}
                {showDuration && <span className="text-center">Duration</span>}
              </div>
              {exercise.sets.map((set, i) => (
                <div key={i} className={`bg-surface-low rounded-lg p-4 grid ${gridClass} gap-4 items-center`}>
                  <span className="font-headline font-bold text-lg text-primary-dark">{i + 1}</span>
                  {showWeight && (
                    <div className="bg-muted rounded p-2 text-center font-headline font-bold">{set.weight}</div>
                  )}
                  {showReps && (
                    <div className="bg-muted rounded p-2 text-center font-headline font-bold">
                      {!isNaN(set.reps) && set.reps > 0 ? set.reps : "—"}
                    </div>
                  )}
                  {showDuration && (
                    <div className="bg-muted rounded p-2 text-center font-headline font-bold">
                      {set.duration != null && set.duration > 0 ? formatDuration(set.duration) : "—"}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })()}

        {/* Cardio / Other: full metrics */}
        {exercise.exerciseType !== ExerciseType.WEIGHTS && exercise.exerciseType !== ExerciseType.BODY_WEIGHT && (
          <div className="flex flex-wrap gap-3 mt-2">
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ExerciseCard({
  exercise,
  onDelete,
  onEdit,
  userExercises,
  onExerciseUpdated,
}: {
  exercise: Exercise;
  onDelete: (id: string) => Promise<void>;
  onEdit?: (exercise: Exercise) => void;
  userExercises?: string[];
  onExerciseUpdated?: () => void;
}) {
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const hasSets =
    (exercise.exerciseType === ExerciseType.WEIGHTS ||
      exercise.exerciseType === ExerciseType.BODY_WEIGHT) &&
    exercise.sets &&
    exercise.sets.length > 0;

  // Compute summary stats for weights/bodyweight exercises
  let weightsSummary: {
    sets: number;
    avgWeight: string | null;
    totalReps: number | null;
    avgDuration: string | null;
  } | null = null;
  if (hasSets) {
    const setsCount = exercise.sets.length;

    const validReps = exercise.sets.filter((s) => !isNaN(s.reps) && s.reps > 0);
    const totalReps = validReps.length > 0
      ? validReps.reduce((sum, s) => sum + s.reps, 0)
      : null;

    const avgWeightVal = exercise.sets.reduce((sum, s) => sum + s.weight, 0) / setsCount;
    const unit = exercise.sets[0]?.unit ?? "kg";
    const avgWeight = avgWeightVal === 0
      ? "Bodyweight"
      : `${avgWeightVal % 1 === 0 ? avgWeightVal : avgWeightVal.toFixed(1)}${unit}`;

    const setsWithDuration = exercise.sets.filter((s) => s.duration != null && s.duration > 0);
    const avgDuration = setsWithDuration.length > 0
      ? formatDuration(Math.round(setsWithDuration.reduce((sum, s) => sum + (s.duration ?? 0), 0) / setsWithDuration.length))
      : null;

    weightsSummary = { sets: setsCount, avgWeight, totalReps, avgDuration };
  }

  return (
    <>
      <article
        className="bg-card rounded-xl p-6 cursor-pointer hover:ring-1 hover:ring-primary transition-all"
        onClick={() => setShowDetail(true)}
      >
        {/* Exercise header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="font-headline text-2xl font-bold text-foreground">
              {exercise.name}
            </h2>
            <div className="flex gap-2 mt-2">
              <span className="px-3 py-1 bg-surface-high rounded-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {formatExerciseType(exercise.exerciseType)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
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
          </div>
        </div>

        {/* Weights / Body Weight: summary chips */}
        {weightsSummary && (
          <div className="flex flex-wrap gap-3 mt-4">
            <MetricChip label="Sets" value={String(weightsSummary.sets)} />
            {weightsSummary.avgWeight && (
              <MetricChip label="Avg Weight" value={weightsSummary.avgWeight} />
            )}
            {weightsSummary.totalReps != null && (
              <MetricChip label="Total Reps" value={String(weightsSummary.totalReps)} />
            )}
            {weightsSummary.avgDuration && (
              <MetricChip label="Avg Duration" value={weightsSummary.avgDuration} />
            )}
          </div>
        )}

        {/* Cardio / Other: metric chips */}
        {exercise.exerciseType !== ExerciseType.WEIGHTS && exercise.exerciseType !== ExerciseType.BODY_WEIGHT && (
          <div className="flex flex-wrap gap-3 mt-4">
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
          </div>
        )}
      </article>

      <ExerciseDetailModal
        exercise={exercise}
        open={showDetail}
        onClose={() => setShowDetail(false)}
      />

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
  onRefresh,
}: {
  loaderData: {
    workout: Workout | null;
    userExercises: string[];
  };
  onDeleteExercise: (exerciseId: string) => Promise<void>;
  onRefresh: () => void;
})
 {
  const workout = loaderData?.workout;
  const userExercises = loaderData?.userExercises;

  const [showModal, setShowModal] = useState(false);

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
            className="text-primary-dark font-bold text-xs uppercase tracking-widest underline p-0 h-auto self-start md:self-auto"
          >
            <Link href="/">&larr; Dashboard</Link>
          </Button>
        </section>

        {/* Exercise list */}
        <div className="space-y-6">
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
                userExercises={userExercises}
                onExerciseUpdated={onRefresh}
              />
            ))
          )}

          {/* Add Exercise CTA */}
          <div className="pt-2">
            <button
              onClick={() => setShowModal(true)}
              className="w-full py-8 border-2 border-dashed border-surface-highest rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary-dark hover:border-primary transition-all group"
            >
              <span className="font-headline text-3xl group-hover:scale-110 transition-transform inline-block leading-none">
                +
              </span>
              <span className="font-headline font-bold uppercase tracking-widest text-sm">
                Add Exercise
              </span>
            </button>
          </div>
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
    </div>
  );
}
