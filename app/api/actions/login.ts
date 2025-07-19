import axios from "axios";
import { data, redirect } from "react-router";
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
      token: response.data.token,
      refreshToken: response.data.refreshToken,
      expiresAt: response.data.expiresAt
        ? Date.now() + response.data.expiresAt * 1000
        : undefined,
    };

    console.log("Token data:", tokenData);

    // setTokenData(tokenData);

    return redirect("/");
  } catch (error) {
    console.error("Login failed:", error);
    throw data("Login failed", { status: 400 });
  }
}
