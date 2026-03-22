// build modal for adding exercises using ui/dialog component
import { useParams } from "wouter";
import { CardContent, CardFooter } from "@/components/ui/card";
import { apiClient } from "@/lib/apiClient";
import { getUserId } from "@/lib/getUserId";
import {
  validateWeights,
  validateCardio,
  validateOther,
} from "@/api/utils/exerciseValidator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AddSets } from "./AddSets";

import { DistanceUnits, ExerciseType, WeightUnits } from "@/types/Exercise";
import { useState } from "react";
import { Combobox } from "./ui/combobox";
const exerciseTypes = Object.values(ExerciseType);
const distanceUnits = Object.values(DistanceUnits);
const weightUnits = Object.values(WeightUnits);

const TimeInput = () => (
  <div className="grid gap-2 grid-cols-2">
    <div className="grid gap-2 w-30">
      <Label htmlFor="exercise-time-minutes">Minutes</Label>
      <Input
        id="exercise-time-minutes"
        name="exercise-time-minutes"
        type="text"
        autoComplete="off"
      />
    </div>
    <div className="grid gap-2 w-30">
      <Label htmlFor="exercise-time-seconds">Seconds</Label>
      <Input
        id="exercise-time-seconds"
        name="exercise-time-seconds"
        type="text"
        autoComplete="off"
      />
    </div>
  </div>
);

const DistanceInput = () => (
  <div className="grid gap-2 grid-cols-2">
    <div className="grid gap-2 w-30">
      <Label htmlFor="exercise-distance">Distance</Label>
      <Input
        id="exercise-distance"
        name="exercise-distance"
        type="text"
        autoComplete="off"
        placeholder="Enter distance (e.g. 5 km)"
      />
    </div>
    <div className="grid gap-2 w-30">
      <Label htmlFor="exercise-distance-unit">Unit</Label>
      <Select name="exercise-distance-unit">
        <SelectTrigger>
          <SelectValue placeholder="Distance unit" />
        </SelectTrigger>
        <SelectContent>
          {distanceUnits.map((unit) => (
            <SelectItem key={unit} value={unit}>
              {unit}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
);

const LevelInput = () => (
  <div className="grid gap-2 w-30">
    <Label htmlFor="exercise-level">Level/Speed</Label>
    <Input
      id="exercise-level"
      name="exercise-level"
      type="number"
      autoComplete="off"
    />
  </div>
);

const WeightInput = () => (
  <div className="grid gap-2 grid-cols-2">
    <div className="grid gap-2 w-30">
      <Label htmlFor="exercise-weight">Weight</Label>
      <Input
        id="exercise-weight"
        name="exercise-weight"
        type="number"
        step="0.1"
        autoComplete="off"
        placeholder="Enter weight (e.g. 70 kg)"
      />
    </div>
    <div className="grid gap-2 w-30">
      <Label htmlFor="exercise-weight-unit">Unit</Label>
      <Select name="exercise-weight-unit">
        <SelectTrigger>
          <SelectValue placeholder="Weight unit" />
        </SelectTrigger>
        <SelectContent>
          {weightUnits.map((unit) => (
            <SelectItem key={unit} value={unit}>
              {unit}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
);

const SetsInput = () => (
  <div className="grid gap-2">
    <Label htmlFor="exercise-sets">Sets</Label>
    <AddSets />
  </div>
);

const exerciseTypeMap = {
  [ExerciseType.WEIGHTS]: <SetsInput />,
  [ExerciseType.CARDIO]: (
    <>
      <DistanceInput />
      <TimeInput />
      <LevelInput />
    </>
  ),
  [ExerciseType.OTHER]: (
    <>
      <DistanceInput />
      <TimeInput />
      <LevelInput />
      <WeightInput />
    </>
  ),
};

export function AddExerciseModal({
  showModal,
  setShowModal,
  userExercises,
  onExerciseAdded,
}: {
  showModal: boolean;
  setShowModal: (open: boolean) => void;
  userExercises: string[];
  onExerciseAdded?: () => void;
}) {
  const [selectedType, setSelectedType] = useState<ExerciseType | null>(null);
  const [exerciseName, setExerciseName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const { id: workoutId } = params;

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (busy) return;
    if (!workoutId) {
      console.error("No workout ID found");
      return;
    }

    setBusy(true);
    setError(null);

    const userId = getUserId();
    if (!userId) {
      setError("User not authenticated");
      setBusy(false);
      return;
    }

    const exerciseId = crypto.randomUUID();
    const formData = new FormData(event.currentTarget);
    formData.set("exercise-id", exerciseId);

    const exerciseType = formData.get("exercise-type") as ExerciseType;
    if (!exerciseType) {
      setError("Exercise type is required");
      setBusy(false);
      return;
    }

    let validatedFields;
    switch (exerciseType) {
      case ExerciseType.WEIGHTS:
        validatedFields = validateWeights(formData);
        break;
      case ExerciseType.CARDIO:
        validatedFields = validateCardio(formData);
        break;
      case ExerciseType.OTHER:
        validatedFields = validateOther(formData);
        break;
      default:
        setError("Invalid exercise type");
        setBusy(false);
        return;
    }

    if (!validatedFields) {
      setError("Required fields are missing or invalid");
      setBusy(false);
      return;
    }

    try {
      // Step 1: Create the exercise
      const response = await apiClient.post(
        `/exercises/${userId}`,
        validatedFields
      );

      if (response.status !== 201) {
        setError("Failed to create exercise");
        return;
      }

      // Step 2: Link the exercise to the workout
      await apiClient.post(
        `/workouts/${userId}/${workoutId}/exercises/${exerciseId}`
      );

      setShowModal(false);
      setExerciseName("");
      setSelectedType(null);
      onExerciseAdded?.();
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    } catch (err: any) {
      setError(err.response?.data?.error || "An error occurred");
      console.error("Add exercise error:", err);
    } finally {
      setBusy(false);
    }
  };

  const uniqueExerciseNames = Array.from(new Set(userExercises));

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent>
        <DialogTitle>Add Exercise</DialogTitle>
        <DialogDescription>Add your exercise below</DialogDescription>
        <form method="post" onSubmit={onSubmit}>
          <CardContent className="p-0">
            <div className="flex flex-col gap-4 mb-6">
              <div className="grid gap-2">
                <Label htmlFor="exercise-type">Exercise Type</Label>
                <Select
                  name="exercise-type"
                  onValueChange={(value) => {
                    setSelectedType(value as ExerciseType);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Exercise type" />
                  </SelectTrigger>
                  <SelectContent>
                    {exerciseTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="exercise-name">Exercise Name</Label>
                <Combobox
                  name="exercise-name"
                  options={uniqueExerciseNames}
                  value={exerciseName}
                  onChange={setExerciseName}
                  placeholder="Type or select a previous exercise name..."
                />
              </div>
              {selectedType ? (
                exerciseTypeMap[selectedType]
              ) : (
                <div className="font-body text-sm text-secondary">Select an exercise type</div>
              )}
            </div>
            {error && (
              <div className="mt-4 p-4 text-sm font-body bg-error/10 text-error rounded-xl">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-2 p-0">
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Adding Exercise..." : "Add Exercise"}
            </Button>
          </CardFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
