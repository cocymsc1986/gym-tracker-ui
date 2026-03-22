import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/authContext";
import { apiClient } from "@/lib/apiClient";

export function Login() {
  const [, setLocation] = useLocation();
  const { setTokens, isAuthenticated } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) setLocation("/");
  }, [isAuthenticated, setLocation]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await apiClient.post("/auth/signin", { email, password });

      if (response.status === 200) {
        const tokenData = {
          token: response.data.access_token,
          refreshToken: response.data.refresh_token,
          expiresAt: response.data.expires_in
            ? Date.now() + response.data.expires_in * 1000
            : undefined,
        };
        setTokens(tokenData);
      } else {
        setError(response.data.error || "Login failed");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.error || "An error occurred during login");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <BrandPanel />

      <section className="flex-1 flex flex-col justify-center items-center px-8 md:px-24 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="md:hidden mb-12 flex justify-center">
            <span className="font-headline font-black italic tracking-tighter text-4xl text-primary-dark">
              KINETIC
            </span>
          </div>

          <div className="mb-10">
            <h2 className="font-headline font-bold text-4xl text-foreground tracking-tight mb-2">
              Welcome back
            </h2>
            <p className="text-muted-foreground font-medium">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Password
                </Label>
                <a
                  href="#"
                  className="text-[10px] font-bold uppercase tracking-widest text-primary-dark hover:opacity-70 transition-opacity"
                >
                  Forgot?
                </a>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-destructive px-1">{error}</p>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full py-4 font-headline font-extrabold text-sm uppercase tracking-widest"
                disabled={busy}
              >
                {busy ? "Starting session..." : "Start Session ⚡"}
              </Button>
            </div>
          </form>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground text-sm">
              New to the lab?{" "}
              <Link
                to="/register"
                className="text-foreground font-bold underline decoration-primary decoration-4 underline-offset-4 hover:decoration-primary-dark transition-all"
              >
                Register an account
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function BrandPanel() {
  return (
    <section className="hidden md:flex md:w-1/2 bg-primary-dark flex-col justify-between p-16 relative overflow-hidden">
      <h1 className="font-headline font-black italic tracking-tighter text-5xl text-primary z-10">
        KINETIC
      </h1>

      <p className="font-headline font-bold text-white text-7xl leading-none tracking-tight z-10">
        PRECISION <br /> IN EVERY <br />
        <span className="text-primary">REP.</span>
      </p>

      <span className="font-sans font-bold text-primary tracking-[0.2em] uppercase text-xs z-10">
        Performance Tracking System v2.0
      </span>

      {/* Decorative ring */}
      <div className="absolute -right-20 bottom-0 opacity-20 w-96 h-96 border-[40px] border-primary rounded-full" />
    </section>
  );
}

