import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExerciseType, WeightUnits, DistanceUnits } from "@/types/Exercise";
import { clientAction } from "./add-exercise";

const mockPost = vi.fn().mockResolvedValue({
  status: 201,
  data: { id: "exercise-456", success: true },
});

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    post: (url: string, body: unknown, headers: unknown) =>
      mockPost(url, body, headers),
  },
}));

vi.mock("@/lib/getUserId", () => ({
  getUserId: () => "test-user-id",
}));

describe("add-exercise action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully add a weights exercise", async () => {
    const formData = new FormData();
    formData.append("workout-id", "workout-123");
    formData.append("exercise-id", "exercise-456");
    formData.append("exercise-type", ExerciseType.WEIGHTS);
    formData.append("exercise-name", "Bench Press");
    formData.append("set-0-weight", "100");
    formData.append("set-0-unit", WeightUnits.KG);
    formData.append("set-0-reps", "10");

    const request = new Request("http://localhost/api/add-exercise", {
      method: "POST",
      body: formData,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await clientAction({ request } as any);

    expect(mockPost).toHaveBeenCalledTimes(2);
    expect(mockPost).toHaveBeenNthCalledWith(
      1,
      "/exercises/test-user-id",
      {
        exerciseId: "exercise-456",
        name: "Bench Press",
        exerciseType: ExerciseType.WEIGHTS,
        sets: [{ weight: 100, unit: WeightUnits.KG, reps: 10 }],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // The second call is to add the exercise to the workout via the url params - no body
    expect(mockPost).toHaveBeenNthCalledWith(
      2,
      "/workouts/test-user-id/workout-123/exercises/exercise-456",
      undefined,
      undefined
    );

    expect(result).toEqual({
      status: 201,
      data: { id: "exercise-456", success: true },
    });
  });

  it("should successfully add a cardio exercise", async () => {
    const formData = new FormData();
    formData.append("workout-id", "workout-123");
    formData.append("exercise-id", "exercise-789");
    formData.append("exercise-type", ExerciseType.CARDIO);
    formData.append("exercise-name", "Running");
    formData.append("exercise-distance", "5.2");
    formData.append("exercise-distance-unit", DistanceUnits.KM);
    formData.append("exercise-time-minutes", "30");
    formData.append("exercise-time-seconds", "45");
    formData.append("exercise-level", "7");

    const request = new Request("http://localhost/api/add-exercise", {
      method: "POST",
      body: formData,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await clientAction({ request } as any);

    expect(mockPost).toHaveBeenCalledTimes(2);
    expect(mockPost).toHaveBeenNthCalledWith(
      1,
      "/exercises/test-user-id",
      {
        exerciseId: "exercise-789",
        name: "Running",
        exerciseType: ExerciseType.CARDIO,
        time: 1845, // 30 * 60 + 45
        distance: 5.2,
        distanceUnit: DistanceUnits.KM,
        level: 7,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // The second call is to add the exercise to the workout via the url params - no body
    expect(mockPost).toHaveBeenNthCalledWith(
      2,
      "/workouts/test-user-id/workout-123/exercises/exercise-789",
      undefined,
      undefined
    );

    expect(result).toEqual({
      status: 201,
      data: { id: "exercise-456", success: true },
    });
  });

  it("should successfully add an other exercise", async () => {
    const formData = new FormData();
    formData.append("workout-id", "workout-123");
    formData.append("exercise-id", "exercise-999");
    formData.append("exercise-type", ExerciseType.OTHER);
    formData.append("exercise-name", "Yoga Flow");
    formData.append("exercise-distance", "0");
    formData.append("exercise-distance-unit", DistanceUnits.KM);
    formData.append("exercise-time-minutes", "45");
    formData.append("exercise-time-seconds", "0");
    formData.append("exercise-level", "3");
    formData.append("exercise-weight", "2.5");
    formData.append("exercise-weight-unit", WeightUnits.KG);

    const request = new Request("http://localhost/api/add-exercise", {
      method: "POST",
      body: formData,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await clientAction({ request } as any);

    expect(mockPost).toHaveBeenCalledTimes(2);
    expect(mockPost).toHaveBeenCalledWith(
      "/exercises/test-user-id",
      {
        exerciseId: "exercise-999",
        name: "Yoga Flow",
        exerciseType: ExerciseType.OTHER,
        time: 2700, // 45 * 60
        distance: 0,
        distanceUnit: DistanceUnits.KM,
        level: 3,
        weight: 2.5,
        weightUnit: WeightUnits.KG,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // The second call is to add the exercise to the workout via the url params - no body
    expect(mockPost).toHaveBeenNthCalledWith(
      2,
      "/workouts/test-user-id/workout-123/exercises/exercise-999",
      undefined,
      undefined
    );

    expect(result).toEqual({
      status: 201,
      data: { id: "exercise-456", success: true },
    });
  });

  it("should return error when workout ID is missing", async () => {
    const formData = new FormData();
    formData.append("exercise-id", "exercise-456");
    formData.append("exercise-type", ExerciseType.WEIGHTS);

    const request = new Request("http://localhost/api/add-exercise", {
      method: "POST",
      body: formData,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await clientAction({ request } as any);

    expect(result).toEqual({
      status: 400,
      error: "Workout ID, Exercise ID, and Exercise Type are required",
    });

    expect(mockPost).not.toHaveBeenCalled();
  });

  it("should return error when exercise ID is missing", async () => {
    const formData = new FormData();
    formData.append("workout-id", "workout-123");
    formData.append("exercise-type", ExerciseType.WEIGHTS);

    const request = new Request("http://localhost/api/add-exercise", {
      method: "POST",
      body: formData,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await clientAction({ request } as any);

    expect(result).toEqual({
      status: 400,
      error: "Workout ID, Exercise ID, and Exercise Type are required",
    });

    expect(mockPost).not.toHaveBeenCalled();
  });

  it("should return error when exercise type is missing", async () => {
    const formData = new FormData();
    formData.append("workout-id", "workout-123");
    formData.append("exercise-id", "exercise-456");

    const request = new Request("http://localhost/api/add-exercise", {
      method: "POST",
      body: formData,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await clientAction({ request } as any);

    expect(result).toEqual({
      status: 400,
      error: "Workout ID, Exercise ID, and Exercise Type are required",
    });

    expect(mockPost).not.toHaveBeenCalled();
  });

  it("should return error when validation fails", async () => {
    const formData = new FormData();
    formData.append("workout-id", "workout-123");
    formData.append("exercise-id", "exercise-456");
    formData.append("exercise-type", ExerciseType.WEIGHTS);
    // Missing exercise-name, which should cause validation to fail

    const request = new Request("http://localhost/api/add-exercise", {
      method: "POST",
      body: formData,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await clientAction({ request } as any);

    expect(result).toEqual({
      status: 400,
      error: "Required fields are missing or invalid",
    });

    expect(mockPost).not.toHaveBeenCalled();
  });

  it("should return error when invalid exercise type is provided", async () => {
    const formData = new FormData();
    formData.append("workout-id", "workout-123");
    formData.append("exercise-id", "exercise-456");
    formData.append("exercise-type", "InvalidType" as ExerciseType);

    const request = new Request("http://localhost/api/add-exercise", {
      method: "POST",
      body: formData,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await clientAction({ request } as any);

    expect(result).toEqual({
      status: 400,
      error: "Invalid exercise type",
    });

    expect(mockPost).not.toHaveBeenCalled();
  });

  it("should handle API errors gracefully", async () => {
    mockPost.mockRejectedValue(new Error("Network error"));

    const formData = new FormData();
    formData.append("workout-id", "workout-123");
    formData.append("exercise-id", "exercise-456");
    formData.append("exercise-type", ExerciseType.WEIGHTS);
    formData.append("exercise-name", "Bench Press");
    formData.append("set-0-weight", "100");
    formData.append("set-0-unit", WeightUnits.KG);
    formData.append("set-0-reps", "10");

    const request = new Request("http://localhost/api/add-exercise", {
      method: "POST",
      body: formData,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await clientAction({ request } as any);

    expect(result).toEqual({
      status: 500,
      error: "Network error",
    });
  });

  it("should handle non-201 API responses", async () => {
    mockPost.mockResolvedValue({
      status: 400,
      statusText: "Failed to add exercise",
    });

    const formData = new FormData();
    formData.append("workout-id", "workout-123");
    formData.append("exercise-id", "exercise-456");
    formData.append("exercise-type", ExerciseType.WEIGHTS);
    formData.append("exercise-name", "Bench Press");
    formData.append("set-0-weight", "100");
    formData.append("set-0-unit", WeightUnits.KG);
    formData.append("set-0-reps", "10");

    const request = new Request("http://localhost/api/add-exercise", {
      method: "POST",
      body: formData,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await clientAction({ request } as any);

    expect(result).toEqual({
      status: 400,
      error: "Failed to add exercise",
    });
  });
});
