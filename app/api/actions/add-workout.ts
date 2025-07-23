import { apiClient } from "@/lib/apiClient";
import { type Route } from "../../+types/root";
import { getUserId } from "@/lib/getUserId";

export async function clientAction({ request }: Route.ActionArgs) {
  const userId = await getUserId();
  const path = `/workouts/${userId}`;

  const formData = await request.formData();
  const name = formData.get("workout-name") as string;
  const date = formData.get("workout-date") as string;

  if (!name || !date) {
    return {
      status: 400,
      error: "Name and date are required",
    };
  }

  try {
    const response = await apiClient.post(
      path,
      { name, date },
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status !== 201) {
      return {
        status: response.status,
        error: "Create workout failed",
      };
    }

    const data = response.data;

    return {
      status: 201,
      data,
    };
  } catch (error) {
    console.error("Create workout error:", error);
    return {
      status: 500,
      error: "Failed to connect to server",
    };
  }
}
