import { Link } from "wouter";
import { Dumbbell, MoreVertical, Trash2, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { type Workout } from "@/types/Workout";

export const Activities = ({
  workouts,
  onDeleteWorkout,
}: {
  workouts: Workout[];
  onDeleteWorkout: (workoutId: number) => Promise<void>;
}) => {
  return (
    <section>
      <h3 className="font-headline font-bold text-2xl tracking-tight mb-6">
        RECENT SESSIONS
      </h3>

      {!workouts || workouts.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No sessions yet. Add your first workout to get started.
        </p>
      ) : (
        <div className="space-y-4">
          {[...workouts]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((workout) => (
              <WorkoutRow
                key={workout.workoutId}
                workout={workout}
                onDelete={onDeleteWorkout}
              />
            ))}
        </div>
      )}
    </section>
  );
};

function WorkoutRow({
  workout,
  onDelete,
}: {
  workout: Workout;
  onDelete: (id: number) => Promise<void>;
}) {
  return (
    <div className="group bg-muted hover:bg-primary rounded-xl transition-all duration-300 flex items-center justify-between p-5">
      <Link
        href={`/workout/${workout.workoutId}`}
        className="flex items-center gap-4 flex-1 min-w-0"
      >
        <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
          <Dumbbell className="h-5 w-5 text-primary-dark group-hover:text-primary-foreground transition-colors" />
        </div>
        <div className="min-w-0">
          <h4 className="font-headline font-bold text-lg leading-tight group-hover:text-primary-foreground transition-colors">
            {workout.name}
          </h4>
          <p className="text-xs text-muted-foreground group-hover:text-primary-foreground/70 font-medium uppercase tracking-wider transition-colors">
            {new Date(workout.date).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </Link>

      <div className="flex items-center gap-1 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground group-hover:text-primary-foreground hover:bg-white/20"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Workout options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(workout.workoutId)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
      </div>
    </div>
  );
}
