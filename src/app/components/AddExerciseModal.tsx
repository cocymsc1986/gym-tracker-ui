// build modal for adding exercises using ui/dialog component
import { useParams } from "wouter";
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

import { DistanceUnits, ExerciseType, WeightUnits, type Exercise } from "@/types/Exercise";
import { useEffect, useState } from "react";
import { Combobox } from "./ui/combobox";
import { History } from "lucide-react";
const exerciseTypes = Object.values(ExerciseType);
const distanceUnits = Object.values(DistanceUnits);
const weightUnits = Object.values(WeightUnits);

function formatExerciseType(type: ExerciseType): string {
  return type.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

const TimeInput = ({
  onMinutesChange,
  onSecondsChange,
}: {
  onMinutesChange?: (val: number) => void;
  onSecondsChange?: (val: number) => void;
} = {}) => (
  <div className="grid gap-2 grid-cols-2">
    <div className="grid gap-2 w-30">
      <Label htmlFor="exercise-time-minutes">Minutes</Label>
      <Input
        id="exercise-time-minutes"
        name="exercise-time-minutes"
        type="number"
        min={0}
        autoComplete="off"
        onChange={(e) => onMinutesChange?.(Number(e.target.value) || 0)}
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
        onChange={(e) => onSecondsChange?.(Number(e.target.value) || 0)}
      />
    </div>
  </div>
);

const DistanceInput = ({ onUnitChange }: { onUnitChange?: (unit: DistanceUnits) => void } = {}) => (
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
        placeholder="e.g. 5"
      />
    </div>
    <div className="grid gap-2 w-30">
      <Label htmlFor="exercise-distance-unit">Unit</Label>
      <Select name="exercise-distance-unit" onValueChange={onUnitChange}>
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
      min={0}
      step="any"
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

const BodyWeightSetsInput = () => (
  <div className="grid gap-2">
    <Label htmlFor="exercise-sets">Sets</Label>
    <AddSets bodyWeight />
  </div>
);

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
}

function LastSessionPanel({ exercise }: { exercise: Exercise }) {
  const hasSets =
    (exercise.exerciseType === ExerciseType.WEIGHTS ||
      exercise.exerciseType === ExerciseType.BODY_WEIGHT) &&
    exercise.sets &&
    exercise.sets.length > 0;

  return (
    <div className="rounded-xl bg-surface-low p-4">
      <p className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-3">
        Last Session
      </p>
      {hasSets ? (
        <div className="space-y-1.5">
          {exercise.sets.map((set, i) => (
            <div key={i} className="flex items-center gap-2 text-sm font-body">
              <span className="font-bold text-primary-dark w-5 shrink-0">{i + 1}</span>
              {set.weight > 0 && (
                <span className="font-headline font-bold">{set.weight} {set.unit}</span>
              )}
              {!isNaN(set.reps) && set.reps > 0 && (
                <span className="text-muted-foreground">× {set.reps} reps</span>
              )}
              {set.duration != null && set.duration > 0 && (
                <span className="text-muted-foreground">· {formatDuration(set.duration)}</span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {exercise.time != null && Number(exercise.time) > 0 && (
            <div className="flex flex-col items-center bg-background rounded-lg px-3 py-2 min-w-[64px]">
              <span className="font-sans text-[9px] uppercase tracking-widest text-muted-foreground">Time</span>
              <span className="font-headline font-bold text-sm">{formatDuration(Number(exercise.time))}</span>
            </div>
          )}
          {exercise.distance != null && exercise.distance > 0 && (
            <div className="flex flex-col items-center bg-background rounded-lg px-3 py-2 min-w-[64px]">
              <span className="font-sans text-[9px] uppercase tracking-widest text-muted-foreground">Dist</span>
              <span className="font-headline font-bold text-sm">{exercise.distance} {exercise.distanceUnit ?? ""}</span>
            </div>
          )}
          {exercise.level != null && exercise.level > 0 && (
            <div className="flex flex-col items-center bg-background rounded-lg px-3 py-2 min-w-[64px]">
              <span className="font-sans text-[9px] uppercase tracking-widest text-muted-foreground">Level</span>
              <span className="font-headline font-bold text-sm">{exercise.level}</span>
            </div>
          )}
          {exercise.rpm != null && exercise.rpm > 0 && (
            <div className="flex flex-col items-center bg-background rounded-lg px-3 py-2 min-w-[64px]">
              <span className="font-sans text-[9px] uppercase tracking-widest text-muted-foreground">RPM</span>
              <span className="font-headline font-bold text-sm">{exercise.rpm}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CardioInput() {
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnits | null>(null);
  const [storeRpm, setStoreRpm] = useState(false);
  const [timeMinutes, setTimeMinutes] = useState(0);
  const [timeSeconds, setTimeSeconds] = useState(0);

  const isCalories = distanceUnit === DistanceUnits.CALORIES;
  const hasTime = timeMinutes > 0 || timeSeconds > 0;
  const rpmDisabled = !hasTime || !distanceUnit || isCalories;

  useEffect(() => {
    if (rpmDisabled) setStoreRpm(false);
  }, [rpmDisabled]);

  return (
    <>
      <input type="hidden" name="exercise-store-rpm" value={storeRpm ? "true" : "false"} />
      <DistanceInput
        onUnitChange={(unit) => {
          setDistanceUnit(unit);
        }}
      />
      <TimeInput
        onMinutesChange={setTimeMinutes}
        onSecondsChange={setTimeSeconds}
      />
      <div className="grid gap-2 grid-cols-2">
        <LevelInput />
        <div className="grid gap-2">
          <Label htmlFor="exercise-store-rpm">Show RPM</Label>
          <div className={`flex items-center gap-3 p-3 bg-surface-low rounded-xl ${rpmDisabled ? "opacity-40" : ""}`}>
            <input
              id="exercise-store-rpm"
              type="checkbox"
              checked={storeRpm}
              onChange={(e) => setStoreRpm(e.target.checked)}
              disabled={rpmDisabled}
              className="h-4 w-4 rounded accent-primary-dark cursor-pointer disabled:cursor-not-allowed"
            />
            <Label
              htmlFor="exercise-store-rpm"
              className="font-body text-sm cursor-pointer select-none"
            >
              Show RPM
            </Label>
          </div>
        </div>
      </div>
    </>
  );
}

const exerciseTypeMap = {
  [ExerciseType.WEIGHTS]: <SetsInput />,
  [ExerciseType.BODY_WEIGHT]: <BodyWeightSetsInput />,
  [ExerciseType.CARDIO]: <CardioInput />,
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
  allUserExercises = [],
  onExerciseAdded,
}: {
  showModal: boolean;
  setShowModal: (open: boolean) => void;
  userExercises: string[];
  allUserExercises?: Exercise[];
  onExerciseAdded?: () => void;
}) {
  const [selectedType, setSelectedType] = useState<ExerciseType | null>(null);
  const [exerciseName, setExerciseName] = useState("");
  const [lastExercise, setLastExercise] = useState<Exercise | null>(null);
  const [showLastSession, setShowLastSession] = useState(false);
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
      setLastExercise(null);
      setShowLastSession(false);
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
                  onChange={(name) => {
                    setExerciseName(name);
                    const matching = allUserExercises.filter(
                      (e) => e.name.toLowerCase() === name.toLowerCase()
                    );
                    const found = matching.length > 0 ? matching[matching.length - 1] : null;
                    setLastExercise(found);
                    if (!found) setShowLastSession(false);
                  }}
                  placeholder="Type or select a previous exercise name..."
                />
              </div>
              <div className="flex items-center">
                <button
                  type="button"
                  disabled={!lastExercise}
                  onClick={() => setShowLastSession((v) => !v)}
                  className={`flex items-center gap-1.5 text-xs font-body transition-all duration-200 select-none ${
                    lastExercise
                      ? "text-primary-dark hover:opacity-70 cursor-pointer"
                      : "text-muted-foreground/40 cursor-not-allowed"
                  }`}
                >
                  <History className={`h-3.5 w-3.5 transition-transform duration-300 ${showLastSession ? "rotate-180" : ""}`} />
                  {showLastSession ? "Hide last session" : "View last session"}
                </button>
              </div>
              <div className={`grid transition-all duration-300 ease-in-out ${showLastSession && lastExercise ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                  {lastExercise && <LastSessionPanel exercise={lastExercise} />}
                </div>
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
