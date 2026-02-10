import { Link } from "wouter";
import { useState } from "react";

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
import { apiClient } from "@/lib/apiClient";

type Step = "register" | "confirm" | "success";

export function Register() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("register");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const emailValue = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await apiClient.post("/auth/signup", {
        email: emailValue,
        password,
      });

      if (response.status === 201) {
        setEmail(emailValue);
        setStep("confirm");
      } else {
        setError(response.data.error || "Registration failed");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(
        err.response?.data?.error || "An error occurred during registration"
      );
      console.error("Registration error:", err);
    } finally {
      setBusy(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const code = formData.get("code") as string;

    try {
      await apiClient.post("/auth/confirm", {
        Email: email,
        Code: code,
      });

      setStep("success");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(
        err.response?.data?.error || "An error occurred during confirmation"
      );
      console.error("Confirmation error:", err);
    } finally {
      setBusy(false);
    }
  };

  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Registration Successful</CardTitle>
            <CardDescription>
              Your account has been confirmed
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Confirm your account</CardTitle>
            <CardDescription>
              Enter the 6-digit code sent to {email}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleConfirm}>
            <CardContent>
              <div className="grid gap-2">
                <Label htmlFor="code">Confirmation Code</Label>
                <Input
                  id="code"
                  name="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  autoComplete="one-time-code"
                  required
                  onChange={() => setError(null)}
                />
              </div>
              {error && (
                <div className="mt-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Confirming..." : "Confirm Account"}
              </Button>
            </CardFooter>
          </form>
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
              <Link href="/login">Sign In</Link>
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
                  type="text"
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  onChange={() => setError(null)}
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
                  onChange={() => setError(null)}
                />
              </div>
            </div>
            {error && (
              <div className="mt-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Creating account..." : "Create Account"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
