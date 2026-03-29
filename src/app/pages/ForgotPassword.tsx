import { Link } from "wouter";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/apiClient";

type Step = "request" | "confirm" | "success";

export function ForgotPassword() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");

  const handleRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const emailValue = formData.get("email") as string;

    try {
      await apiClient.post("/auth/reset", { email: emailValue });
      setEmail(emailValue);
      setStep("confirm");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.error || "An error occurred. Please try again.");
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
    const new_password = formData.get("new_password") as string;

    try {
      await apiClient.post("/auth/reset/confirm", { email, code, new_password });
      setStep("success");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.error || "An error occurred. Please try again.");
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

        {step === "request" && (
          <RequestStep busy={busy} error={error} onSubmit={handleRequest} onErrorClear={() => setError(null)} />
        )}
        {step === "confirm" && (
          <ConfirmStep email={email} busy={busy} error={error} onSubmit={handleConfirm} onErrorClear={() => setError(null)} />
        )}
        {step === "success" && <SuccessStep />}
      </div>
    </div>
  );
}

function RequestStep({
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
          Reset password
        </h2>
        <p className="text-muted-foreground font-medium">
          Enter your email and we'll send you a reset code.
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

        {error && <p className="text-sm text-destructive px-1">{error}</p>}

        <div className="pt-2">
          <Button
            type="submit"
            size="lg"
            className="w-full font-headline font-extrabold text-sm uppercase tracking-widest"
            disabled={busy}
          >
            {busy ? "Sending..." : "Send Reset Code"}
          </Button>
        </div>
      </form>

      <div className="mt-12 text-center">
        <p className="text-muted-foreground text-sm">
          Remembered it?{" "}
          <Link
            to="/login"
            className="text-foreground font-bold underline decoration-primary decoration-4 underline-offset-4 hover:decoration-primary-dark transition-all"
          >
            Back to login
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
          We sent a reset code to{" "}
          <span className="text-foreground font-semibold">{email}</span>. Enter it below with your new password.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="code" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
            Reset Code
          </Label>
          <Input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            placeholder="Enter reset code"
            autoComplete="one-time-code"
            required
            onChange={onErrorClear}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="new_password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
            New Password
          </Label>
          <Input
            id="new_password"
            name="new_password"
            type="password"
            placeholder="Create a new password"
            autoComplete="new-password"
            required
            onChange={onErrorClear}
          />
        </div>

        {error && <p className="text-sm text-destructive px-1">{error}</p>}

        <div className="pt-2">
          <Button
            type="submit"
            size="lg"
            className="w-full font-headline font-extrabold text-sm uppercase tracking-widest"
            disabled={busy}
          >
            {busy ? "Resetting..." : "Reset Password"}
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
          Password reset.
        </h2>
        <p className="text-muted-foreground font-medium">
          Your password has been updated. You can now sign in with your new credentials.
        </p>
      </div>

      <Button asChild size="lg" className="w-full font-headline font-extrabold text-sm uppercase tracking-widest">
        <Link to="/login">Back to Login</Link>
      </Button>
    </>
  );
}
