import { useState } from "react";
import { Link } from "wouter";
import { ChevronRight, Copy, MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { type Workout } from "@/types/Workout";
import { DuplicateWorkoutModal } from "@/components/DuplicateWorkoutModal";

export const Activities = ({
  workouts,
  onDeleteWorkout,
}: {
  workouts: Workout[];
  onDeleteWorkout: (workoutId: number) => Promise<void>;
}) => {
  const sorted = [...(workouts ?? [])].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-headline font-bold text-2xl tracking-tight">
          RECENT SESSIONS
        </h3>
        <Link
          href="/workouts"
          className="font-sans font-bold text-xs uppercase tracking-widest text-primary-dark underline hover:text-foreground transition-colors"
        >
          View All
        </Link>
      </div>

      {sorted.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No sessions yet. Add your first workout to get started.
        </p>
      ) : (
        <div className="space-y-4">
          {sorted.slice(0, 5).map((workout, index) => (
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
  );
};

export function WorkoutRow({
  workout,
  highlight = false,
  onDelete,
}: {
  workout: Workout;
  highlight?: boolean;
  onDelete: (id: number) => Promise<void>;
}) {
  const [duplicateOpen, setDuplicateOpen] = useState(false);

  const formattedDate = new Date(workout.date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).toUpperCase();

  const exerciseCount = workout.exercises?.length ?? 0;

  if (highlight) {
    return (
      <>
        <div className="bg-primary text-primary-foreground p-6 rounded-xl flex items-center justify-between shadow-lg">
          <Link
            href={`/workout/${workout.workoutId}`}
            className="flex flex-col flex-1 min-w-0"
          >
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] mb-1 opacity-70">
              {formattedDate}
            </span>
            <h4 className="font-headline font-extrabold text-2xl uppercase italic leading-tight">
              {workout.name}
            </h4>
            {exerciseCount > 0 && (
              <span className="font-sans text-sm font-bold mt-2 opacity-80">
                {exerciseCount} exercise{exerciseCount !== 1 ? "s" : ""}
              </span>
            )}
          </Link>
          <div className="flex items-center gap-1 shrink-0 ml-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Workout options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setDuplicateOpen(true)}>
                  <Copy className="h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(workout.workoutId)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="bg-primary-foreground text-primary w-10 h-10 rounded-lg flex items-center justify-center">
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>
        </div>
        <DuplicateWorkoutModal
          workout={workout}
          open={duplicateOpen}
          onOpenChange={setDuplicateOpen}
        />
      </>
    );
  }

  return (
    <>
      <div className="group bg-card hover:bg-surface-low p-6 rounded-xl flex items-center justify-between transition-colors">
        <Link
          href={`/workout/${workout.workoutId}`}
          className="flex flex-col flex-1 min-w-0"
        >
          <span className="font-sans text-[10px] uppercase tracking-[0.2em] mb-1 text-muted-foreground">
            {formattedDate}
          </span>
          <h4 className="font-headline font-bold text-2xl uppercase text-foreground leading-tight">
            {workout.name}
          </h4>
          {exerciseCount > 0 && (
            <span className="font-sans text-sm text-muted-foreground mt-2">
              {exerciseCount} exercise{exerciseCount !== 1 ? "s" : ""}
            </span>
          )}
        </Link>
        <div className="flex items-center gap-1 shrink-0 ml-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Workout options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setDuplicateOpen(true)}>
                <Copy className="h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(workout.workoutId)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="text-muted-foreground group-hover:bg-surface-high w-10 h-10 rounded-lg flex items-center justify-center transition-colors">
            <ChevronRight className="h-5 w-5" />
          </div>
        </div>
      </div>
      <DuplicateWorkoutModal
        workout={workout}
        open={duplicateOpen}
        onOpenChange={setDuplicateOpen}
      />
    </>
  );
}
