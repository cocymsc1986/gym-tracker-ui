import { type Exercise } from "./Exercise";

export type Workout = {
  workoutId: number;
  name: string;
  exercises: Exercise[];
  date: string;
};
