import { useState } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { apiClient } from "@/lib/apiClient";
import { getUserId } from "@/lib/getUserId";
import {
  validateWeights,
  validateBodyWeight,
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
import { Combobox } from "./ui/combobox";

import {
  type Exercise,
  DistanceUnits,
  ExerciseType,
  WeightUnits,
} from "@/types/Exercise";

const exerciseTypes = Object.values(ExerciseType);
const distanceUnits = Object.values(DistanceUnits);
const weightUnits = Object.values(WeightUnits);

function formatExerciseType(type: ExerciseType): string {
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function EditExerciseModal({
  exercise,
  showModal,
  setShowModal,
  userExercises,
  onExerciseUpdated,
}: {
  exercise: Exercise;
  showModal: boolean;
  setShowModal: (open: boolean) => void;
  userExercises: string[];
  onExerciseUpdated?: () => void;
}) {
  const [selectedType, setSelectedType] = useState<ExerciseType>(
    exercise.exerciseType
  );
  const [exerciseName, setExerciseName] = useState(exercise.name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnits>(
    exercise.distanceUnit ?? DistanceUnits.KM
  );
  const [storeRpm, setStoreRpm] = useState(false);

  const timeMinutes = Math.floor((exercise.time ?? 0) / 60);
  const timeSeconds = (exercise.time ?? 0) % 60;

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (busy) return;

    setBusy(true);
    setError(null);

    const userId = getUserId();
    if (!userId) {
      setError("User not authenticated");
      setBusy(false);
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.set("exercise-id", exercise.exerciseId);

    let validatedFields;
    switch (selectedType) {
      case ExerciseType.WEIGHTS:
        validatedFields = validateWeights(formData);
        break;
      case ExerciseType.BODY_WEIGHT:
        validatedFields = validateBodyWeight(formData);
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
      const response = await apiClient.put(
        `/exercises/${userId}/${exercise.exerciseId}`,
        validatedFields
      );

      if (response.status !== 200) {
        setError("Failed to update exercise");
        return;
      }

      setShowModal(false);
      onExerciseUpdated?.();
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    } catch (err: any) {
      setError(err.response?.data?.error || "An error occurred");
      console.error("Edit exercise error:", err);
    } finally {
      setBusy(false);
    }
  };

  const uniqueExerciseNames = Array.from(new Set(userExercises));

  const isSets =
    selectedType === ExerciseType.WEIGHTS ||
    selectedType === ExerciseType.BODY_WEIGHT;

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent>
        <DialogTitle>Edit Exercise</DialogTitle>
        <DialogDescription>Update your exercise details below</DialogDescription>
        <form method="post" onSubmit={onSubmit}>
          {/* hidden field so Select value is always in FormData */}
          <input type="hidden" name="exercise-type" value={selectedType} />
          <CardContent className="p-0">
            <div className="flex flex-col gap-4 mb-6">
              <div className="grid gap-2">
                <Label htmlFor="exercise-type">Exercise Type</Label>
                <Select
                  value={selectedType}
                  onValueChange={(value) =>
                    setSelectedType(value as ExerciseType)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Exercise type" />
                  </SelectTrigger>
                  <SelectContent>
                    {exerciseTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {formatExerciseType(type)}
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

              {/* Sets-based exercises */}
              {isSets && (
                <div className="grid gap-2">
                  <Label>Sets</Label>
                  <AddSets
                    bodyWeight={selectedType === ExerciseType.BODY_WEIGHT}
                    initialSets={exercise.sets}
                  />
                </div>
              )}

              {/* Cardio / Other exercises */}
              {!isSets && (
                <>
                  {/* hidden input so FormData always carries the rpm flag for cardio */}
                  {selectedType === ExerciseType.CARDIO && (
                    <input type="hidden" name="exercise-store-rpm" value={storeRpm ? "true" : "false"} />
                  )}
                  {/* Distance */}
                  <div className="grid gap-2 grid-cols-2">
                    <div className="grid gap-2 w-30">
                      <Label htmlFor="exercise-distance">Distance</Label>
                      <Input
                        id="exercise-distance"
                        name="exercise-distance"
                        type="number"
                        min={0}
                        step="any"
                        autoComplete="off"
                        defaultValue={exercise.distance ?? ""}
                        placeholder="e.g. 5"
                      />
                    </div>
                    <div className="grid gap-2 w-30">
                      <Label htmlFor="exercise-distance-unit">Unit</Label>
                      <Select
                        name="exercise-distance-unit"
                        value={distanceUnit}
                        onValueChange={(value) => {
                          setDistanceUnit(value as DistanceUnits);
                          if (value === DistanceUnits.CALORIES) setStoreRpm(false);
                        }}
                      >
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

                  {/* Time */}
                  <div className="grid gap-2 grid-cols-2">
                    <div className="grid gap-2 w-30">
                      <Label htmlFor="exercise-time-minutes">Minutes</Label>
                      <Input
                        id="exercise-time-minutes"
                        name="exercise-time-minutes"
                        type="number"
                        min={0}
                        autoComplete="off"
                        defaultValue={timeMinutes || ""}
                      />
                    </div>
                    <div className="grid gap-2 w-30">
                      <Label htmlFor="exercise-time-seconds">Seconds</Label>
                      <Input
                        id="exercise-time-seconds"
                        name="exercise-time-seconds"
                        type="number"
                        min={0}
                        max={59}
                        autoComplete="off"
                        defaultValue={timeSeconds || ""}
                      />
                    </div>
                  </div>

                  {/* Level */}
                  <div className="grid gap-2 w-30">
                    <Label htmlFor="exercise-level">Level/Speed</Label>
                    <Input
                      id="exercise-level"
                      name="exercise-level"
                      type="number"
                      min={0}
                      step="any"
                      autoComplete="off"
                      defaultValue={exercise.level ?? ""}
                    />
                  </div>

                  {/* Weight (Other only) */}
                  {selectedType === ExerciseType.OTHER && (
                    <div className="grid gap-2 grid-cols-2">
                      <div className="grid gap-2 w-30">
                        <Label htmlFor="exercise-weight">Weight</Label>
                        <Input
                          id="exercise-weight"
                          name="exercise-weight"
                          type="number"
                          step="0.1"
                          autoComplete="off"
                          defaultValue={""}
                          placeholder="e.g. 70"
                        />
                      </div>
                      <div className="grid gap-2 w-30">
                        <Label htmlFor="exercise-weight-unit">Unit</Label>
                        <Select
                          name="exercise-weight-unit"
                          defaultValue={WeightUnits.KG}
                        >
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
                  )}

                  {/* Show RPM (Cardio only) */}
                  {selectedType === ExerciseType.CARDIO && (
                    <div className="flex items-center gap-3 p-3 bg-surface-low rounded-xl">
                      <input
                        id="exercise-store-rpm"
                        type="checkbox"
                        checked={storeRpm}
                        onChange={(e) => setStoreRpm(e.target.checked)}
                        disabled={distanceUnit === DistanceUnits.CALORIES}
                        className="h-4 w-4 rounded accent-primary-dark disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <Label
                        htmlFor="exercise-store-rpm"
                        className={`font-body text-sm cursor-pointer select-none ${distanceUnit === DistanceUnits.CALORIES ? "opacity-40" : ""}`}
                      >
                        Show RPM
                      </Label>
                    </div>
                  )}
                </>
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
              {busy ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
