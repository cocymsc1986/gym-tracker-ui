import { Link } from "wouter";
import { type ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { type Exercise } from "@/types/Exercise";
import { DataTable } from "@/components/ui/data-table";
import { useState } from "react";
import { AddExerciseModal } from "@/components/AddExerciseModal";
import type { Workout } from "@/types/Workout";

const columns: ColumnDef<Exercise>[] = [
  {
    accessorKey: "exerciseType",
    header: "Exercise Type",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
];

export function Workout({
  loaderData,
}: {
  loaderData: {
    workout: Workout | null;
    userExercises: string[];
  };
}) {
  const workout = loaderData?.workout;
  const userExercises = loaderData?.userExercises;

  const [showModal, setShowModal] = useState(false);
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
