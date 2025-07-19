import { useFetcher, Link } from "react-router";

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

export function Register() {
  const fetcher = useFetcher();
  const busy = fetcher.state !== "idle";

  const response = fetcher.data;

  if (response && response.status === 201) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Registration Successful</CardTitle>
            <CardDescription>
              {response.data.message ||
                "Please check your email to confirm your account"}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/login">Go to Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
          <CardAction>
            <Button variant="link" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </CardAction>
        </CardHeader>
        <fetcher.Form method="post" action="/api/register">
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  autoComplete="username"
                  required
                  onChange={() => {
                    // clear any previous error messages
                    if (response && response.error) {
                      fetcher.data = null;
                    }
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Enter your password"
                  required
                  onChange={() => {
                    // clear any previous error messages
                    if (response && response.error) {
                      fetcher.data = null;
                    }
                  }}
                />
              </div>
            </div>
            {response && response.error && (
              <div className="mt-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {response.error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Creating account..." : "Create Account"}
            </Button>
          </CardFooter>
        </fetcher.Form>
      </Card>
    </div>
  );
}
