import { FormEvent } from "react";

import { Link, createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <section className="w-full flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md bg-card/80 border border-border/60 shadow-2xl shadow-yellow-900/30">
        <CardHeader>
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>
            Log into Senkou to keep filters synced and watchlists intact.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            aria-label="Login form"
          >
            <label className="flex flex-col gap-1 text-sm font-semibold text-foreground">
              Email
              <Input
                id="login-email"
                placeholder="you@email.com"
                type="email"
                required
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-semibold text-foreground">
              Password
              <Input
                id="login-password"
                placeholder="••••••••"
                type="password"
                autoComplete="current-password"
                required
              />
            </label>

            <div className="flex items-center justify-between text-[0.75rem] text-muted-foreground">
              {/* WIP: check how this will be implemented */}
              <label
                htmlFor="remember-me"
                className="inline-flex items-center gap-2 font-medium"
              >
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-border bg-background text-primary outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                />
                Remember me
              </label>
            </div>

            <Button className="w-full" size="lg" type="submit">
              Continue
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-1 text-xs text-muted-foreground">
          <p>
            New around here?{" "}
            <Link
              className="text-primary font-semibold hover:underline"
              to="/register"
            >
              Create an account.
            </Link>
          </p>
        </CardFooter>
      </Card>
    </section>
  );
}
