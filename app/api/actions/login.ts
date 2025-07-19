import axios from "axios";
import type { Route } from "../../+types/root";

const API_URL = import.meta.env.VITE_API_URL;

export async function clientAction({ request }: Route.ActionArgs) {
  const URL = `${API_URL}/auth/signin`;
  console.info(`<POST> - ${URL}`);

  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    const response = await axios.post(URL, {
      email,
      password,
    });

    const tokenData = {
      token: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresAt: response.data.expires_in
        ? Date.now() + response.data.expires_in * 1000
        : undefined,
    };

    return {
      status: 200,
      tokenData,
    };
  } catch (error) {
    console.error("Login failed:", error);
    return {
      status: 400,
      error: "Login failed. Please check your credentials.",
    };
  }
}
