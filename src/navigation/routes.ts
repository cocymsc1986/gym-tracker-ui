/**
 * Central registry of route names used throughout the app.
 * Import from here rather than using inline string literals to
 * prevent typos and make renames safe.
 */
export const ROUTES = {
  /**
   * The home / dashboard screen containing the WeekTracker.
   */
  HOME: 'Home',

  /**
   * Create Workout screen.
   * Accepts an optional `date` param (ISO 8601 string) to pre-fill
   * the workout date field.
   */
  CREATE_WORKOUT: 'CreateWorkout',

  /**
   * Workout Detail / View screen.
   * Requires a `workoutId` param to identify which workout to display.
   */
  WORKOUT_DETAIL: 'WorkoutDetail',
} as const;

export type RouteName = (typeof ROUTES)[keyof typeof ROUTES];

/**
 * Param map for the app's root stack navigator.
 * Every screen that accepts typed params should be listed here.
 */
export type RootStackParamList = {
  [ROUTES.HOME]: undefined;
  [ROUTES.CREATE_WORKOUT]: {
    /**
     * ISO 8601 date string to pre-fill the workout date.
     * When omitted the Create Workout screen defaults to today.
     */
    date?: string;
  };
  [ROUTES.WORKOUT_DETAIL]: {
    /**
     * ID of the workout to display.
     */
    workoutId: string;
  };
};
