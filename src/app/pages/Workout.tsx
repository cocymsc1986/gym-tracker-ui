import { Link } from "wouter";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { type Exercise } from "@/types/Exercise";
import { DataTable } from "@/components/ui/data-table";
import { useState } from "react";
import { AddExerciseModal } from "@/components/AddExerciseModal";
import type { Workout } from "@/types/Workout";

function buildColumns(
  onDeleteExercise: (exerciseId: string) => Promise<void>
): ColumnDef<Exercise>[] {
  return [
    {
      accessorKey: "exerciseType",
      header: "Exercise Type",
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const exercise = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Exercise options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDeleteExercise(exercise.exerciseId)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}

export function Workout({
  loaderData,
  onDeleteExercise,
}: {
  loaderData: {
    workout: Workout | null;
    userExercises: string[];
  };
  onDeleteExercise: (exerciseId: string) => Promise<void>;
}) {
  const workout = loaderData?.workout;
  const userExercises = loaderData?.userExercises;

  const [showModal, setShowModal] = useState(false);

  const columns = buildColumns(onDeleteExercise);

  if (!workout) {
    return <div>Loading...</div>;
  }

  if (workout) {
    return (
      <div className="p-4 w-full max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <Button variant="link" asChild>
            <Link href="/">&lt; Back to dashboard</Link>
          </Button>
          <Button variant="default" onClick={() => setShowModal(true)}>
            Add Exercise
          </Button>
        </div>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{workout.name || `Workout ${workout.date}`}</CardTitle>
            <CardDescription>
              {new Date(workout.date).toLocaleDateString()}
            </CardDescription>
            <CardContent className="p-0 mt-4">
              {!workout.exercises || workout.exercises.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No exercises added yet.
                </div>
              ) : (
                <DataTable columns={columns} data={workout.exercises} />
              )}
            </CardContent>
          </CardHeader>
        </Card>
        {showModal && (
          <AddExerciseModal
            showModal={showModal}
            setShowModal={setShowModal}
            userExercises={userExercises}
          />
        )}
      </div>
    );
  }
}
