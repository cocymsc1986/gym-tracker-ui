import { TOKEN_STORAGE_KEY, type TokenData } from "@/lib/authContext";
import { decodeJWT } from "./jwtValidation";

export function getUserId(): string | null {
  const storedTokens = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (storedTokens) {
    try {
      const parsed = JSON.parse(storedTokens) as TokenData;

      if (!parsed || !parsed.token) {
        return null;
      }

      // Decode the token without validation since the auth context already validates it
      const payload = decodeJWT(parsed.token);

      if (payload && payload.username) {
        return payload.username;
      }

      return null;
    } catch (error) {
      console.error("Failed to parse stored tokens:", error);
      return null;
    }
  }

  return null;
}
