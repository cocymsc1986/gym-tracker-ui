import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/authContext";
import { apiClient } from "@/lib/apiClient";

export function Login() {
  const [, setLocation] = useLocation();
  const { setTokens, isAuthenticated } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    console.log("[Login] Auth state changed:", { isAuthenticated });
    if (isAuthenticated) {
      console.log("[Login] User authenticated, redirecting to dashboard...");
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await apiClient.post("/auth/signin", {
        email,
        password,
      });

      if (response.status === 200) {
        console.log("[Login] Received response:", response.data);
        // Transform API response to match expected token format
        const tokenData = {
          token: response.data.access_token,
          refreshToken: response.data.refresh_token,
          expiresAt: response.data.expires_in
            ? Date.now() + response.data.expires_in * 1000
            : undefined,
        };
        console.log("[Login] Setting tokens:", tokenData);
        setTokens(tokenData);
        console.log("[Login] Tokens set, waiting for auth validation...");
        // Don't redirect immediately - let the auth context handle it after validation
      } else {
        setError(response.data.error || "Login failed");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.error || "An error occurred during login");
      console.error("Login error:", err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
        <CardAction>
          <Button variant="link" asChild>
            <Link to="/register">Sign Up</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid">
              <div className="flex items-center mb-2">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input id="password" name="password" type="password" required />
              <a
                href="#"
                className="inline-block text-sm underline-offset-4 hover:underline mt-1"
              >
                Forgot password
              </a>
            </div>
          </div>
          {error && (
            <div className="mt-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-2 mt-4">
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Logging in..." : "Login"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
