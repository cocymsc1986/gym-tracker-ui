import { useFetcher, Link, useNavigate } from "react-router";
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

export function AddWorkout() {
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const busy = fetcher.state !== "idle";

  const response = fetcher.data;

  // Handle successful workout creation
  useEffect(() => {
    if (response && response.status === 201) {
      navigate(`/workout/${response.data.workoutId}`, { replace: true });
    }
  }, [response, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create your workout</CardTitle>
          <CardDescription>Enter workout details below</CardDescription>
          <CardAction>
            <Button variant="link" asChild>
              <Link to="/">Back to dashboard</Link>
            </Button>
          </CardAction>
        </CardHeader>
        <fetcher.Form method="post" action="/api/workout">
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="workout-name">Name</Label>
                <Input
                  id="workout-name"
                  name="workout-name"
                  type="text"
                  placeholder="Enter a workout name (optional)"
                  autoComplete="workout-name"
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
                <Label htmlFor="workout-date">Date</Label>
                <Input
                  id="workout-date"
                  name="workout-date"
                  type="date"
                  autoComplete="workout-date"
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
              {busy ? "Creating workout..." : "Add Workout"}
            </Button>
          </CardFooter>
        </fetcher.Form>
      </Card>
    </div>
  );
}
