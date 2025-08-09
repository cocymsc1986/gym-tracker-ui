import { describe, it, expect } from "vitest";
import {
  validateWeights,
  validateCardio,
  validateOther,
  type CardioExercise,
} from "./exerciseValidator";
import { ExerciseType, WeightUnits, DistanceUnits } from "@/types/Exercise";
import type { C } from "vitest/dist/chunks/environment.d.cL3nLXbE.js";

describe("exerciseValidator", () => {
  describe("validateWeights", () => {
    it("should validate a valid weights exercise", () => {
      const formData = new FormData();
      formData.append("exercise-id", "test-id-123");
      formData.append("exercise-name", "Bench Press");
      formData.append("set-0-weight", "100");
      formData.append("set-0-unit", WeightUnits.KG);
      formData.append("set-0-reps", "10");
      formData.append("set-1-weight", "105");
      formData.append("set-1-unit", WeightUnits.KG);
      formData.append("set-1-reps", "8");

      const result = validateWeights(formData);

      expect(result).toEqual({
        exerciseId: "test-id-123",
        name: "Bench Press",
        exerciseType: ExerciseType.WEIGHTS,
        sets: [
          { weight: 100, unit: WeightUnits.KG, reps: 10 },
          { weight: 105, unit: WeightUnits.KG, reps: 8 },
        ],
      });
    });

    it("should return false when exerciseId is missing", () => {
      const formData = new FormData();
      formData.append("exercise-name", "Bench Press");
      formData.append("set-0-weight", "100");
      formData.append("set-0-unit", WeightUnits.KG);
      formData.append("set-0-reps", "10");

      const result = validateWeights(formData);

      expect(result).toBe(false);
    });

    it("should return false when name is missing", () => {
      const formData = new FormData();
      formData.append("exercise-id", "test-id-123");
      formData.append("set-0-weight", "100");
      formData.append("set-0-unit", WeightUnits.KG);
      formData.append("set-0-reps", "10");

      const result = validateWeights(formData);

      expect(result).toBe(false);
    });

    it("should return false when no valid sets are provided", () => {
      const formData = new FormData();
      formData.append("exercise-id", "test-id-123");
      formData.append("exercise-name", "Bench Press");

      const result = validateWeights(formData);

      expect(result).toBe(false);
    });

    it("should filter out invalid sets (zero weight or reps)", () => {
      const formData = new FormData();
      formData.append("exercise-id", "test-id-123");
      formData.append("exercise-name", "Bench Press");
      formData.append("set-0-weight", "0");
      formData.append("set-0-unit", WeightUnits.KG);
      formData.append("set-0-reps", "10");
      formData.append("set-1-weight", "100");
      formData.append("set-1-unit", WeightUnits.KG);
      formData.append("set-1-reps", "0");
      formData.append("set-2-weight", "105");
      formData.append("set-2-unit", WeightUnits.KG);
      formData.append("set-2-reps", "8");

      const result = validateWeights(formData);

      expect(result).toEqual({
        exerciseId: "test-id-123",
        name: "Bench Press",
        exerciseType: ExerciseType.WEIGHTS,
        sets: [{ weight: 105, unit: WeightUnits.KG, reps: 8 }],
      });
    });
  });

  describe("validateCardio", () => {
    it("should validate a valid cardio exercise", () => {
      const formData = new FormData();
      formData.append("exercise-id", "test-id-456");
      formData.append("exercise-name", "Running");
      formData.append("exercise-distance", "5.2");
      formData.append("exercise-distance-unit", DistanceUnits.KM);
      formData.append("exercise-time-minutes", "30");
      formData.append("exercise-time-seconds", "45");
      formData.append("exercise-level", "7");

      const result = validateCardio(formData);

      expect(result).toEqual({
        exerciseId: "test-id-456",
        name: "Running",
        exerciseType: ExerciseType.CARDIO,
        time: 1845, // 30 * 60 + 45 = 1845 seconds
        distance: 5.2,
        distanceUnit: DistanceUnits.KM,
        level: 7,
      });
    });

    it("should return false when exerciseId is missing", () => {
      const formData = new FormData();
      formData.append("exercise-name", "Running");
      formData.append("exercise-distance", "5.2");
      formData.append("exercise-distance-unit", DistanceUnits.KM);

      const result = validateCardio(formData);

      expect(result).toBe(false);
    });

    it("should return false when name is missing", () => {
      const formData = new FormData();
      formData.append("exercise-id", "test-id-456");
      formData.append("exercise-distance", "5.2");
      formData.append("exercise-distance-unit", DistanceUnits.KM);

      const result = validateCardio(formData);

      expect(result).toBe(false);
    });

    it("should use default values for optional fields", () => {
      const formData = new FormData();
      formData.append("exercise-id", "test-id-456");
      formData.append("exercise-name", "Running");

      const result = validateCardio(formData);

      expect(result).toEqual({
        exerciseId: "test-id-456",
        name: "Running",
        exerciseType: ExerciseType.CARDIO,
        time: 0,
        distance: 0,
        distanceUnit: DistanceUnits.KM,
        level: 1,
      });
    });

    it("should convert time to total seconds correctly", () => {
      const formData = new FormData();
      formData.append("exercise-id", "test-id-456");
      formData.append("exercise-name", "Cycling");
      formData.append("exercise-time-minutes", "2");
      formData.append("exercise-time-seconds", "30");

      const result = validateCardio(formData) as CardioExercise;

      expect(result?.time).toBe(150); // 2 * 60 + 30 = 150 seconds
    });
  });

  describe("validateOther", () => {
    it("should validate a valid other exercise", () => {
      const formData = new FormData();
      formData.append("exercise-id", "test-id-789");
      formData.append("exercise-name", "Yoga Flow");
      formData.append("exercise-distance", "0");
      formData.append("exercise-distance-unit", DistanceUnits.KM);
      formData.append("exercise-time-minutes", "45");
      formData.append("exercise-time-seconds", "0");
      formData.append("exercise-level", "3");
      formData.append("exercise-weight", "2.5");
      formData.append("exercise-weight-unit", WeightUnits.KG);

      const result = validateOther(formData);

      expect(result).toEqual({
        exerciseId: "test-id-789",
        name: "Yoga Flow",
        exerciseType: ExerciseType.OTHER,
        time: 2700, // 45 * 60 = 2700 seconds
        distance: 0,
        distanceUnit: DistanceUnits.KM,
        level: 3,
        weight: 2.5,
        weightUnit: WeightUnits.KG,
      });
    });

    it("should return false when exerciseId is missing", () => {
      const formData = new FormData();
      formData.append("exercise-name", "Yoga");
      formData.append("exercise-weight", "2.5");
      formData.append("exercise-weight-unit", WeightUnits.KG);

      const result = validateOther(formData);

      expect(result).toBe(false);
    });

    it("should return false when name is missing", () => {
      const formData = new FormData();
      formData.append("exercise-id", "test-id-789");
      formData.append("exercise-weight", "2.5");
      formData.append("exercise-weight-unit", WeightUnits.KG);

      const result = validateOther(formData);

      expect(result).toBe(false);
    });

    it("should use default values for optional fields", () => {
      const formData = new FormData();
      formData.append("exercise-id", "test-id-789");
      formData.append("exercise-name", "Meditation");

      const result = validateOther(formData);

      expect(result).toEqual({
        exerciseId: "test-id-789",
        name: "Meditation",
        exerciseType: ExerciseType.OTHER,
        time: 0,
        distance: 0,
        distanceUnit: DistanceUnits.KM,
        level: 1,
        weight: 0,
        weightUnit: WeightUnits.KG,
      });
    });

    it("should include both cardio and weight fields", () => {
      const formData = new FormData();
      formData.append("exercise-id", "test-id-789");
      formData.append("exercise-name", "CrossFit WOD");
      formData.append("exercise-distance", "1000");
      formData.append("exercise-distance-unit", DistanceUnits.CALORIES);
      formData.append("exercise-time-minutes", "20");
      formData.append("exercise-time-seconds", "0");
      formData.append("exercise-level", "8");
      formData.append("exercise-weight", "50");
      formData.append("exercise-weight-unit", WeightUnits.LB);

      const result = validateOther(formData);

      expect(result).toEqual({
        exerciseId: "test-id-789",
        name: "CrossFit WOD",
        exerciseType: ExerciseType.OTHER,
        time: 1200, // 20 * 60 = 1200 seconds
        distance: 1000,
        distanceUnit: DistanceUnits.CALORIES,
        level: 8,
        weight: 50,
        weightUnit: WeightUnits.LB,
      });
    });
  });
});
