export enum ExerciseType {
  WEIGHTS = "weights",
  CARDIO = "cardio",
  BODY_WEIGHT = "body_weight",
  OTHER = "other",
}

export enum WeightUnits {
  KG = "kg",
  LB = "lb",
}

export type WeightItem = {
  weight: GLfloat;
  unit: WeightUnits;
  reps: number;
  duration?: number; // seconds; for timed sets (e.g. plank)
};

export enum DistanceUnits {
  KM = "km",
  MILES = "miles",
  METERS = "m",
  CALORIES = "calories",
}

export type Exercise = {
  exerciseId: string;
  name: string;
  exerciseType: ExerciseType;
  time?: number;
  distance?: GLfloat;
  distanceUnit?: DistanceUnits;
  level?: number;
  rpm?: number;
  sets: WeightItem[];
};
