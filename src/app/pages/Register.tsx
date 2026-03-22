import { Link } from "wouter";
import { useState } from "react";

import { Button } from "@/components/ui/button";
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
      setError(err.response?.data?.error || "An error occurred during registration");
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
      await apiClient.post("/auth/confirm", { Email: email, Code: code });
      setStep("success");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.error || "An error occurred during confirmation");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-8 bg-background">
      <div className="w-full max-w-md">
        <div className="mb-12 flex justify-center">
          <span className="font-headline font-black italic tracking-tighter text-4xl text-primary-dark">
            KINETIC
          </span>
        </div>

        {step === "success" && <SuccessStep />}
        {step === "confirm" && (
          <ConfirmStep email={email} busy={busy} error={error} onSubmit={handleConfirm} onErrorClear={() => setError(null)} />
        )}
        {step === "register" && (
          <RegisterStep busy={busy} error={error} onSubmit={handleSubmit} onErrorClear={() => setError(null)} />
        )}
      </div>
    </div>
  );
}

function RegisterStep({
  busy,
  error,
  onSubmit,
  onErrorClear,
}: {
  busy: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onErrorClear: () => void;
}) {
  return (
    <>
      <div className="mb-10">
        <h2 className="font-headline font-bold text-4xl text-foreground tracking-tight mb-2">
          Join the lab
        </h2>
        <p className="text-muted-foreground font-medium">
          Create your account and start tracking your performance.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
            Email Address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            required
            onChange={onErrorClear}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Create a strong password"
            autoComplete="new-password"
            required
            onChange={onErrorClear}
          />
        </div>

        {error && <p className="text-sm text-destructive px-1">{error}</p>}

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full py-4 font-headline font-extrabold text-sm uppercase tracking-widest"
            disabled={busy}
          >
            {busy ? "Creating account..." : "Create Account ⚡"}
          </Button>
        </div>
      </form>

      <div className="mt-12 text-center">
        <p className="text-muted-foreground text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-foreground font-bold underline decoration-primary decoration-4 underline-offset-4 hover:decoration-primary-dark transition-all"
          >
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}

function ConfirmStep({
  email,
  busy,
  error,
  onSubmit,
  onErrorClear,
}: {
  email: string;
  busy: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onErrorClear: () => void;
}) {
  return (
    <>
      <div className="mb-10">
        <h2 className="font-headline font-bold text-4xl text-foreground tracking-tight mb-2">
          Check your inbox
        </h2>
        <p className="text-muted-foreground font-medium">
          We sent a 6-digit code to{" "}
          <span className="text-foreground font-semibold">{email}</span>
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="code" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
            Confirmation Code
          </Label>
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
            onChange={onErrorClear}
          />
        </div>

        {error && <p className="text-sm text-destructive px-1">{error}</p>}

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full py-4 font-headline font-extrabold text-sm uppercase tracking-widest"
            disabled={busy}
          >
            {busy ? "Confirming..." : "Confirm Account"}
          </Button>
        </div>
      </form>
    </>
  );
}

function SuccessStep() {
  return (
    <>
      <div className="mb-10">
        <h2 className="font-headline font-bold text-4xl text-foreground tracking-tight mb-2">
          You're in.
        </h2>
        <p className="text-muted-foreground font-medium">
          Your account is confirmed. Time to get to work.
        </p>
      </div>

      <Button asChild className="w-full py-4 font-headline font-extrabold text-sm uppercase tracking-widest">
        <Link to="/login">Start Session ⚡</Link>
      </Button>
    </>
  );
}
