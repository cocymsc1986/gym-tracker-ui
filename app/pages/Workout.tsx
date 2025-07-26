import { Link } from "react-router";
import { type ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { type Exercise } from "@/types/Exercise";
import { DataTable } from "@/components/ui/data-table";
import { useState } from "react";

export const columns: ColumnDef<Exercise>[] = [
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
  loaderData: workout,
}: {
  loaderData: { id: number; name: string; exercises: Exercise[] } | null;
}) {
  const [showModal, setShowModal] = useState(false);

  const showAddExerciseModal = () => {
    // Logic to show modal for adding an exercise
  };
  if (!workout) {
    return <div>Loading...</div>;
  }

  if (workout) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Workout</CardTitle>
            <CardDescription>
              Workout tracking data. Add as many exercises as you want.
            </CardDescription>
            <CardAction>
              <Button variant="link" asChild>
                <Link to="/">Back to dashboard</Link>
              </Button>
              <Button variant="primary" asChild onClick={showAddExerciseModal}>
                Add Exercise
              </Button>
            </CardAction>
            {workout.exercises && workout.exercises.length > 0 && (
              <DataTable columns={columns} data={workout.exercises} />
            )}
          </CardHeader>
        </Card>
      </div>
    );
  }
}
