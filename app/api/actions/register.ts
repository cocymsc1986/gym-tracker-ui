import axios from "axios";
import type { Route } from "./+types/register";

const API_URL = import.meta.env.VITE_API_URL;

export async function clientAction({ request }: Route.ActionArgs) {
  const URL = `${API_URL}/auth/signup`;

  const formData = await request.formData();
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return {
      status: 400,
      error: "Username and password are required",
    };
  }

  try {
    const response = await axios.post(
      URL,
      { email: username, password },
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
        error: "Registration failed",
      };
    }

    const data = response.data;

    return {
      status: 201,
      data,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      status: 500,
      error: "Failed to connect to server",
    };
  }
}
