export const QA_USER_ID = "qa-user";

export function snapshot() {
  return {
    nextWorkoutId: 2,
    workouts: new Map([
      [
        QA_USER_ID,
        [
          {
            workoutId: 1,
            name: "Push Day",
            date: "2026-06-09",
            exercises: ["ex-bench-001", "ex-shoulder-002"],
          },
          {
            workoutId: 2,
            name: "Pull Day",
            date: "2026-06-11",
            exercises: ["ex-pullups-003", "ex-cardio-004"],
          },
        ],
      ],
    ]),
    exercises: new Map([
      [
        QA_USER_ID,
        [
          {
            exerciseId: "ex-bench-001",
            name: "Bench Press",
            exerciseType: "weights",
            sets: [
              { weight: 60, unit: "kg", reps: 10 },
              { weight: 65, unit: "kg", reps: 8 },
              { weight: 70, unit: "kg", reps: 6 },
            ],
          },
          {
            exerciseId: "ex-shoulder-002",
            name: "Overhead Press",
            exerciseType: "weights",
            sets: [
              { weight: 35, unit: "kg", reps: 8 },
              { weight: 40, unit: "kg", reps: 6 },
            ],
          },
          {
            exerciseId: "ex-pullups-003",
            name: "Pull Ups",
            exerciseType: "body_weight",
            sets: [
              { weight: 0, unit: "kg", reps: 8 },
              { weight: 0, unit: "kg", reps: 7 },
            ],
          },
          {
            exerciseId: "ex-cardio-004",
            name: "Treadmill",
            exerciseType: "cardio",
            time: 1200,
            distance: 3.5,
            distanceUnit: "km",
            level: 6,
            sets: [],
          },
        ],
      ],
    ]),
  };
}
