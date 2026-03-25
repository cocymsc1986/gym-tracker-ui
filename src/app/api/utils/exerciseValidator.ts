import { ExerciseType, DistanceUnits, WeightUnits } from "@/types/Exercise";

interface BaseExercise {
  exerciseId: string;
  name: string;
  exerciseType: ExerciseType;
}

interface WeightsExercise extends BaseExercise {
  exerciseType: ExerciseType.WEIGHTS;
  sets: Array<{
    weight: number;
    unit: WeightUnits;
    reps: number;
  }>;
}

interface BodyWeightExercise extends BaseExercise {
  exerciseType: ExerciseType.BODY_WEIGHT;
  sets: Array<{
    weight: number;
    unit: WeightUnits;
    reps: number;
  }>;
}

interface CardioExercise extends BaseExercise {
  exerciseType: ExerciseType.CARDIO;
  time: number; // total seconds
  distance: number;
  distanceUnit: DistanceUnits;
  level: number;
}

interface OtherExercise extends BaseExercise {
  exerciseType: ExerciseType.OTHER;
  time: number; // total seconds
  distance: number;
  distanceUnit: DistanceUnits;
  level: number;
  weight: number;
  weightUnit: WeightUnits;
}

type ValidatedExercise = WeightsExercise | BodyWeightExercise | CardioExercise | OtherExercise;

function validateWeights(formData: FormData): WeightsExercise | false {
  const exerciseId = formData.get("exercise-id")?.toString().trim();
  const name = formData.get("exercise-name")?.toString().trim();

  if (!exerciseId || !name) {
    return false;
  }

  const sets = [];
  let i = 0;
  while (formData.get(`set-${i}-weight`) !== null) {
    const weight = parseFloat(formData.get(`set-${i}-weight`)?.toString() || "0");
    const unit = formData.get(`set-${i}-unit`)?.toString() as WeightUnits || WeightUnits.KG;
    const reps = parseInt(formData.get(`set-${i}-reps`)?.toString() || "0", 10);
    if (weight > 0 && reps > 0) {
      sets.push({ weight, unit, reps });
    }
    i++;
  }

  if (sets.length === 0) {
    return false;
  }

  return { exerciseId, name, exerciseType: ExerciseType.WEIGHTS, sets };
}

function validateBodyWeight(formData: FormData): BodyWeightExercise | false {
  const exerciseId = formData.get("exercise-id")?.toString().trim();
  const name = formData.get("exercise-name")?.toString().trim();

  if (!exerciseId || !name) {
    return false;
  }

  const sets = [];
  let i = 0;
  while (formData.get(`set-${i}-weight`) !== null) {
    const weight = parseFloat(formData.get(`set-${i}-weight`)?.toString() || "0");
    const unit = formData.get(`set-${i}-unit`)?.toString() as WeightUnits || WeightUnits.KG;
    const reps = parseInt(formData.get(`set-${i}-reps`)?.toString() || "0", 10);
    const duration = parseInt(formData.get(`set-${i}-duration`)?.toString() || "0", 10);
    // A valid bodyweight set needs at least reps or duration
    if (reps > 0 || duration > 0) {
      sets.push({
        weight,
        unit,
        reps,
        ...(duration > 0 ? { duration } : {}),
      });
    }
    i++;
  }

  if (sets.length === 0) {
    return false;
  }

  return { exerciseId, name, exerciseType: ExerciseType.BODY_WEIGHT, sets };
}

function validateCardio(formData: FormData): CardioExercise | false {
  const exerciseId = formData.get("exercise-id")?.toString().trim();
  const name = formData.get("exercise-name")?.toString().trim();

  if (!exerciseId || !name) {
    return false;
  }

  const distance = parseFloat(
    formData.get("exercise-distance")?.toString() || "0"
  );
  const distanceUnit = formData.get("exercise-distance-unit")?.toString() as DistanceUnits || DistanceUnits.KM;
  const timeMinutes = parseInt(
    formData.get("exercise-time-minutes")?.toString() || "0",
    10
  );
  const timeSeconds = parseInt(
    formData.get("exercise-time-seconds")?.toString() || "0",
    10
  );
  const level = parseInt(
    formData.get("exercise-level")?.toString() || "1",
    10
  );

  const totalTimeInSeconds = (timeMinutes * 60) + timeSeconds;

  return {
    exerciseId,
    name,
    exerciseType: ExerciseType.CARDIO,
    time: totalTimeInSeconds,
    distance,
    distanceUnit,
    level,
  };
}

function validateOther(formData: FormData): OtherExercise | false {
  const exerciseId = formData.get("exercise-id")?.toString().trim();
  const name = formData.get("exercise-name")?.toString().trim();

  if (!exerciseId || !name) {
    return false;
  }

  const timeMinutes = parseInt(
    formData.get("exercise-time-minutes")?.toString() || "0",
    10
  );
  const timeSeconds = parseInt(
    formData.get("exercise-time-seconds")?.toString() || "0",
    10
  );
  const distance = parseFloat(
    formData.get("exercise-distance")?.toString() || "0"
  );
  const distanceUnit = formData.get("exercise-distance-unit")?.toString() as DistanceUnits || DistanceUnits.KM;
  const weight = parseFloat(formData.get("exercise-weight")?.toString() || "0");
  const weightUnit = formData.get("exercise-weight-unit")?.toString() as WeightUnits || WeightUnits.KG;
  const level = parseInt(
    formData.get("exercise-level")?.toString() || "1",
    10
  );

  const totalTimeInSeconds = (timeMinutes * 60) + timeSeconds;

  return {
    exerciseId,
    name,
    exerciseType: ExerciseType.OTHER,
    time: totalTimeInSeconds,
    distance,
    distanceUnit,
    level,
    weight,
    weightUnit,
  };
}

export { validateWeights, validateBodyWeight, validateCardio, validateOther };
export type { ValidatedExercise, WeightsExercise, BodyWeightExercise, CardioExercise, OtherExercise };
