export type ExerciseType = "Weights" | "Cardio" | "Other";

export type WeightItem = {
  Weight: float;
  Unit: string;
  Reps: number;
};

export type Exercise = {
  ExerciseID: string;
  Name: string;
  ExerciseType: ExerciseType;
  Time: string;
  Distance: float;
  DistanceUnit: string;
  Level: string;
  Sets: WeightItem[];
};
