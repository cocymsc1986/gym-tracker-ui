import { Link } from "wouter";
import { CheckCircle, MoreVertical, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { type Exercise, ExerciseType } from "@/types/Exercise";
import { useState } from "react";
import { AddExerciseModal } from "@/components/AddExerciseModal";
import type { Workout } from "@/types/Workout";

function calcVolume(exercises: Exercise[]): number {
  return exercises
    .filter((e) => e.exerciseType === ExerciseType.WEIGHTS)
    .flatMap((e) => e.sets ?? [])
    .reduce((sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0);
}

function ExerciseCard({
  exercise,
  active = false,
  onDelete,
}: {
  exercise: Exercise;
  active?: boolean;
  onDelete: (id: string) => Promise<void>;
}) {
  const hasSets =
    exercise.exerciseType === ExerciseType.WEIGHTS &&
    exercise.sets &&
    exercise.sets.length > 0;

  if (active) {
    return (
      <article className="bg-primary text-primary-foreground rounded-xl p-6 shadow-[0_4px_20px_theme(colors.primary/0.2)]">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="font-headline text-2xl font-bold">
              {exercise.name}
            </h2>
            <div className="flex gap-2 mt-2">
              <span className="px-3 py-1 bg-primary-foreground/10 rounded-full text-[10px] font-bold uppercase tracking-widest">
                {exercise.exerciseType}
              </span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Exercise options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(exercise.exerciseId)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {hasSets && (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-4 px-4 font-sans text-[10px] font-bold uppercase tracking-widest text-primary-foreground/60">
              <span>Set</span>
              <span className="text-center">Previous</span>
              <span className="text-center">
                {exercise.sets[0]?.unit?.toUpperCase() ?? "KG"}
              </span>
              <span className="text-center">Reps</span>
            </div>
            {exercise.sets.map((set, i) => (
              <div
                key={i}
                className="bg-card rounded-lg p-4 grid grid-cols-4 gap-4 items-center"
              >
                <span className="font-headline font-bold text-lg text-primary-dark">
                  {i + 1}
                </span>
                <span className="text-center font-sans text-sm text-muted-foreground">
                  —
                </span>
                <div className="bg-surface-low rounded p-2 text-center font-headline font-bold text-foreground">
                  {set.weight}
                </div>
                <div className="bg-surface-low rounded p-2 text-center font-headline font-bold text-foreground">
                  {set.reps}
                </div>
              </div>
            ))}
          </div>
        )}

        {exercise.exerciseType !== ExerciseType.WEIGHTS && (
          <div className="flex flex-wrap gap-3 mt-2">
            {exercise.time && (
              <div className="bg-primary-foreground/10 rounded-lg px-4 py-3 flex flex-col items-center min-w-[80px]">
                <span className="font-sans text-[10px] uppercase tracking-widest opacity-60 mb-1">
                  Time
                </span>
                <span className="font-headline font-bold">
                  {Math.floor(Number(exercise.time) / 60)}m{" "}
                  {Number(exercise.time) % 60}s
                </span>
              </div>
            )}
            {exercise.distance != null && exercise.distance > 0 && (
              <div className="bg-primary-foreground/10 rounded-lg px-4 py-3 flex flex-col items-center min-w-[80px]">
                <span className="font-sans text-[10px] uppercase tracking-widest opacity-60 mb-1">
                  Distance
                </span>
                <span className="font-headline font-bold">
                  {exercise.distance} {exercise.distanceUnit ?? ""}
                </span>
              </div>
            )}
            {exercise.level != null && exercise.level > 0 && (
              <div className="bg-primary-foreground/10 rounded-lg px-4 py-3 flex flex-col items-center min-w-[80px]">
                <span className="font-sans text-[10px] uppercase tracking-widest opacity-60 mb-1">
                  Level
                </span>
                <span className="font-headline font-bold">{exercise.level}</span>
              </div>
            )}
          </div>
        )}
      </article>
    );
  }

  return (
    <article className="bg-card rounded-xl p-6 border border-transparent hover:border-surface-highest transition-colors">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="font-headline text-2xl font-bold text-foreground">
            {exercise.name}
          </h2>
          <div className="flex gap-2 mt-2">
            <span className="px-3 py-1 bg-surface-high rounded-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {exercise.exerciseType}
            </span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Exercise options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(exercise.exerciseId)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {hasSets && (
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-4 px-4 font-sans text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            <span>Set</span>
            <span className="text-center">Previous</span>
            <span className="text-center">
              {exercise.sets[0]?.unit?.toUpperCase() ?? "KG"}
            </span>
            <span className="text-center">Reps</span>
          </div>
          {exercise.sets.map((set, i) => (
            <div
              key={i}
              className="bg-surface-low rounded-lg p-4 grid grid-cols-4 gap-4 items-center"
            >
              <span className="font-headline font-bold text-lg text-muted-foreground">
                {i + 1}
              </span>
              <span className="text-center font-sans text-sm text-muted-foreground">
                —
              </span>
              <div className="bg-surface-high rounded p-2 text-center font-headline font-bold text-foreground">
                {set.weight}
              </div>
              <div className="bg-surface-high rounded p-2 text-center font-headline font-bold text-foreground">
                {set.reps}
              </div>
            </div>
          ))}
        </div>
      )}

      {exercise.exerciseType !== ExerciseType.WEIGHTS && (
        <div className="flex flex-wrap gap-3 mt-2">
          {exercise.time && (
            <div className="bg-surface-low rounded-lg px-4 py-3 flex flex-col items-center min-w-[80px]">
              <span className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Time
              </span>
              <span className="font-headline font-bold text-foreground">
                {Math.floor(Number(exercise.time) / 60)}m{" "}
                {Number(exercise.time) % 60}s
              </span>
            </div>
          )}
          {exercise.distance != null && exercise.distance > 0 && (
            <div className="bg-surface-low rounded-lg px-4 py-3 flex flex-col items-center min-w-[80px]">
              <span className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Distance
              </span>
              <span className="font-headline font-bold text-foreground">
                {exercise.distance} {exercise.distanceUnit ?? ""}
              </span>
            </div>
          )}
          {exercise.level != null && exercise.level > 0 && (
            <div className="bg-surface-low rounded-lg px-4 py-3 flex flex-col items-center min-w-[80px]">
              <span className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Level
              </span>
              <span className="font-headline font-bold text-foreground">
                {exercise.level}
              </span>
            </div>
          )}
        </div>
      )}
    </article>
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
}) {
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
  }).toUpperCase();

  const totalVolume = calcVolume(workout.exercises ?? []);

  return (
    <div className="min-h-screen bg-background pb-32">
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
          {totalVolume > 0 && (
            <div className="flex flex-col items-start md:items-end gap-1 shrink-0">
              <span className="font-sans text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Estimated Volume
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-headline text-4xl font-bold text-primary-dark italic">
                  {totalVolume.toLocaleString()}
                </span>
                <span className="font-sans text-sm font-bold text-muted-foreground">KG</span>
              </div>
            </div>
          )}
        </section>

        {/* Exercise list */}
        <div className="space-y-8">
          {!workout.exercises || workout.exercises.length === 0 ? (
            <div className="bg-card rounded-xl p-12 text-center">
              <p className="font-sans text-muted-foreground text-sm">
                No exercises added yet.
              </p>
            </div>
          ) : (
            workout.exercises.map((exercise, index) => (
              <ExerciseCard
                key={exercise.exerciseId}
                exercise={exercise}
                active={index === 0}
                onDelete={onDeleteExercise}
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

      {/* Finish Workout FAB */}
      <div className="fixed bottom-24 right-6 z-50">
        <Link
          href="/workouts"
          className="flex items-center gap-3 bg-primary text-primary-foreground px-6 py-4 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] font-headline font-bold uppercase tracking-widest hover:brightness-95 active:scale-95 transition-all"
        >
          <CheckCircle className="h-5 w-5" />
          Finish Workout
        </Link>
      </div>
    </div>
  );
}
