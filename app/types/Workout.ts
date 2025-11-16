import { type Exercise } from "./Exercise";

export type Workout = {
  workoutId: number;
  name: string;
  exercises: Exercise[];
  date: string;
};

export type WorkoutResponse = {
  workoutId: number;
  name: string;
  exercises: string[];
  date: string;
};
