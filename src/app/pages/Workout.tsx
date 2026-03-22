import { Link } from "wouter";
import { MoreVertical, Trash2 } from "lucide-react";

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

function ExerciseMetaChip({ label }: { label: string }) {
  return (
    <span className="px-3 py-1 bg-surface-container-high rounded-full text-[10px] font-bold uppercase tracking-widest text-secondary">
      {label}
    </span>
  );
}

function ExerciseCard({
  exercise,
  onDelete,
}: {
  exercise: Exercise;
  onDelete: (id: string) => Promise<void>;
}) {
  const hasSets = exercise.sets && exercise.sets.length > 0;

  return (
    <article className="bg-surface-container-lowest rounded-xl p-6 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="font-headline text-2xl font-bold text-foreground">
            {exercise.name}
          </h2>
          <div className="flex gap-2 mt-2">
            <ExerciseMetaChip label={exercise.exerciseType} />
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary hover:text-foreground">
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

      {/* Weights: sets grid */}
      {exercise.exerciseType === ExerciseType.WEIGHTS && hasSets && (
        <div className="space-y-3 mt-4">
          <div className="grid grid-cols-3 gap-4 px-4 font-label text-[10px] font-bold uppercase tracking-widest text-secondary">
            <span>Set</span>
            <span className="text-center">
              {exercise.sets[0]?.unit?.toUpperCase() ?? "KG"}
            </span>
            <span className="text-center">Reps</span>
          </div>
          {exercise.sets.map((set, i) => (
            <div
              key={i}
              className="bg-surface-container-low rounded-lg p-4 grid grid-cols-3 gap-4 items-center"
            >
              <span className="font-headline font-bold text-lg text-primary-dark">
                {i + 1}
              </span>
              <div className="bg-surface-container rounded p-2 text-center font-headline font-bold">
                {set.weight}
              </div>
              <div className="bg-surface-container rounded p-2 text-center font-headline font-bold">
                {set.reps}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cardio / Other: time, distance, level chips */}
      {exercise.exerciseType !== ExerciseType.WEIGHTS && (
        <div className="flex flex-wrap gap-3 mt-4">
          {exercise.time && (
            <div className="bg-surface-container-low rounded-lg px-4 py-3 flex flex-col items-center min-w-[80px]">
              <span className="font-label text-[10px] uppercase tracking-widest text-secondary mb-1">
                Time
              </span>
              <span className="font-headline font-bold text-on-surface">
                {Math.floor(Number(exercise.time) / 60)}m{" "}
                {Number(exercise.time) % 60}s
              </span>
            </div>
          )}
          {exercise.distance && (
            <div className="bg-surface-container-low rounded-lg px-4 py-3 flex flex-col items-center min-w-[80px]">
              <span className="font-label text-[10px] uppercase tracking-widest text-secondary mb-1">
                Distance
              </span>
              <span className="font-headline font-bold text-on-surface">
                {exercise.distance}{" "}
                {exercise.distanceUnit ?? ""}
              </span>
            </div>
          )}
          {exercise.level != null && (
            <div className="bg-surface-container-low rounded-lg px-4 py-3 flex flex-col items-center min-w-[80px]">
              <span className="font-label text-[10px] uppercase tracking-widest text-secondary mb-1">
                Level
              </span>
              <span className="font-headline font-bold text-on-surface">
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
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Hero */}
        <section className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary font-bold">
              Session Detail
            </span>
            <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter text-foreground leading-none uppercase">
              {workout.name || `Workout ${workout.date}`}
            </h1>
            <p className="font-body text-sm font-semibold text-secondary pt-2 uppercase">
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
            <div className="bg-surface-container-lowest rounded-xl p-12 text-center">
              <p className="font-body text-secondary text-sm">
                No exercises added yet.
              </p>
            </div>
          ) : (
            workout.exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.exerciseId}
                exercise={exercise}
                onDelete={onDeleteExercise}
              />
            ))
          )}

          {/* Add Exercise CTA */}
          <div className="pt-2">
            <button
              onClick={() => setShowModal(true)}
              className="w-full py-8 border-2 border-dashed border-surface-container-highest rounded-xl flex flex-col items-center justify-center gap-2 text-secondary hover:text-primary-dark hover:border-primary-container transition-all group"
            >
              <span className="font-headline text-3xl group-hover:scale-110 transition-transform inline-block">
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
