/**
 * Represents a single day entry in the 7-day week tracker.
 */
export interface WeekDay {
  /**
   * ISO 8601 date string for this day, e.g. '2024-01-15'
   */
  date: string;

  /**
   * Short display label for the day, e.g. 'Mon', 'Tue'
   */
  label: string;

  /**
   * Whether a workout has been logged for this day.
   * Derived from workoutId presence but kept explicit for clarity.
   */
  hasWorkout: boolean;

  /**
   * The ID of the workout logged for this day.
   * Undefined when no workout has been logged.
   * When multiple workouts exist for a day, callers should pass the
   * most-recently-created workout's ID (product decision).
   */
  workoutId?: string;
}

export interface WeekTrackerProps {
  /**
   * Array of exactly 7 day entries representing the current week.
   * Days should be ordered Monday → Sunday (or the locale equivalent).
   */
  days: WeekDay[];

  /**
   * Optional test ID for the container, useful in E2E tests.
   */
  testID?: string;
}
