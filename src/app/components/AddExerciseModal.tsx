import { useParams } from "wouter";
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
import { AddSets } from "./AddSets";

import { DistanceUnits, ExerciseType, WeightUnits } from "@/types/Exercise";
import { useState } from "react";
import { Combobox } from "./ui/combobox";

const exerciseTypes = Object.values(ExerciseType);
const distanceUnits = Object.values(DistanceUnits);
const weightUnits = Object.values(WeightUnits);

const fieldLabel = "font-sans text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold";
const fieldInput = "bg-surface-high border-0 focus-visible:ring-0 focus-visible:bg-surface-highest rounded-xl h-12 font-sans placeholder:text-muted-foreground/50";

const TimeInput = () => (
  <div className="space-y-2">
    <span className={fieldLabel}>Time</span>
    <div className="grid gap-2 grid-cols-2">
      <div className="space-y-1">
        <Label htmlFor="exercise-time-minutes" className={fieldLabel}>
          Minutes
        </Label>
        <Input
          id="exercise-time-minutes"
          name="exercise-time-minutes"
          type="text"
          autoComplete="off"
          className={fieldInput}
          placeholder="0"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="exercise-time-seconds" className={fieldLabel}>
          Seconds
        </Label>
        <Input
          id="exercise-time-seconds"
          name="exercise-time-seconds"
          type="text"
          autoComplete="off"
          className={fieldInput}
          placeholder="0"
        />
      </div>
    </div>
  </div>
);

const DistanceInput = () => (
  <div className="space-y-1">
    <Label htmlFor="exercise-distance" className={fieldLabel}>
      Distance
    </Label>
    <div className="grid gap-2 grid-cols-2">
      <Input
        id="exercise-distance"
        name="exercise-distance"
        type="text"
        autoComplete="off"
        placeholder="e.g. 5"
        className={fieldInput}
      />
      <Select name="exercise-distance-unit">
        <SelectTrigger className="bg-surface-high border-0 focus:ring-0 rounded-xl h-12 font-sans">
          <SelectValue placeholder="Unit" />
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
  <div className="space-y-1">
    <Label htmlFor="exercise-level" className={fieldLabel}>
      Level / Speed
    </Label>
    <Input
      id="exercise-level"
      name="exercise-level"
      type="number"
      autoComplete="off"
      className={fieldInput}
      placeholder="0"
    />
  </div>
);

const WeightInput = () => (
  <div className="space-y-1">
    <Label htmlFor="exercise-weight" className={fieldLabel}>
      Weight
    </Label>
    <div className="grid gap-2 grid-cols-2">
      <Input
        id="exercise-weight"
        name="exercise-weight"
        type="number"
        step="0.1"
        autoComplete="off"
        placeholder="e.g. 70"
        className={fieldInput}
      />
      <Select name="exercise-weight-unit">
        <SelectTrigger className="bg-surface-high border-0 focus:ring-0 rounded-xl h-12 font-sans">
          <SelectValue placeholder="Unit" />
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
  <div className="space-y-2">
    <span className={fieldLabel}>Sets</span>
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
      const response = await apiClient.post(`/exercises/${userId}`, validatedFields);

      if (response.status !== 201) {
        setError("Failed to create exercise");
        return;
      }

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
      <DialogContent className="max-w-lg rounded-2xl p-8">
        {/* Header */}
        <div className="mb-6">
          <DialogDescription className={`${fieldLabel} mb-1`}>
            Add your exercise below
          </DialogDescription>
          <DialogTitle className="font-headline font-bold text-3xl uppercase tracking-tight text-foreground">
            Add Exercise
          </DialogTitle>
        </div>

        <form method="post" onSubmit={onSubmit}>
          <div className="flex flex-col gap-5 mb-6">

            {/* Exercise Type */}
            <div className="space-y-1">
              <Label htmlFor="exercise-type" className={fieldLabel}>
                Exercise Type
              </Label>
              <Select
                name="exercise-type"
                onValueChange={(value) => setSelectedType(value as ExerciseType)}
              >
                <SelectTrigger className="bg-surface-high border-0 focus:ring-0 rounded-xl h-12 font-sans w-full">
                  <SelectValue placeholder="Select type..." />
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

            {/* Exercise Name */}
            <div className="space-y-1">
              <Label htmlFor="exercise-name" className={fieldLabel}>
                Exercise Name
              </Label>
              <Combobox
                name="exercise-name"
                options={uniqueExerciseNames}
                value={exerciseName}
                onChange={setExerciseName}
                placeholder="Type or select a previous exercise name..."
              />
            </div>

            {/* Type-specific fields */}
            {selectedType ? (
              exerciseTypeMap[selectedType]
            ) : (
              <p className="font-sans text-sm text-muted-foreground">
                Select an exercise type
              </p>
            )}
          </div>

          {error && (
            <div className="mb-4 p-4 text-sm font-sans bg-destructive/10 text-destructive rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-xl font-headline font-bold uppercase tracking-wider transition-all active:scale-95 shadow-lg disabled:opacity-60"
          >
            {busy ? "Adding Exercise..." : "Add Exercise"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
