export enum ExerciseType {
  WEIGHTS = "Weights",
  CARDIO = "Cardio",
  OTHER = "Other",
}

export enum WeightUnits {
  KG = "kg",
  LB = "lb",
}

export type WeightItem = {
  weight: GLfloat;
  unit: WeightUnits;
  reps: number;
};

export enum DistanceUnits {
  KM = "km",
  MILES = "miles",
  CALORIES = "calories",
}

export type Exercise = {
  exerciseId: string;
  name: string;
  exerciseType: ExerciseType;
  time?: string;
  distance?: GLfloat;
  distanceUnit?: DistanceUnits;
  level?: number;
  sets: WeightItem[];
};
