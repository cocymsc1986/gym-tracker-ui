import { useFetcher, useNavigate, Link } from "react-router";
import { useEffect } from "react";

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

export function Login() {
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const { setTokens, isAuthenticated } = useAuth();
  const busy = fetcher.state !== "idle";

  const response = fetcher.data;

  // Handle successful login
  useEffect(() => {
    if (response && response.status === 200 && response.tokenData) {
      setTokens(response.tokenData);
      navigate("/", { replace: true });
    }
  }, [response, setTokens, navigate]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex justify-center p-4 md:p-8 w-full">
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
        <fetcher.Form method="post" action="/api/login">
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
            {response && response.error && (
              <div className="mt-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {response.error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-2 mt-4">
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Logging in..." : "Login"}
            </Button>
          </CardFooter>
        </fetcher.Form>
      </Card>
    </div>
  );
}
