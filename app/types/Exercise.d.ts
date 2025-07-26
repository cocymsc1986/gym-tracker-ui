export type ExerciseType = "Weights" | "Cardio" | "Other";

export type WeightItem = {
  weight: float;
  unit: string;
  reps: number;
};

export type Exercise = {
  exerciseID: string;
  name: string;
  exerciseType: ExerciseType;
  time: string;
  distance: float;
  distanceUnit: string;
  level: string;
  sets: WeightItem[];
};
