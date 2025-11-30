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

export const Route = createFileRoute("/register")({
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
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Secure your watchlist so Stage 2 features are ready when they land.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            aria-label="Signup form"
          >
            <label className="flex flex-col gap-1 text-sm font-semibold text-foreground">
              Display name
              <Input
                id="register-display-name"
                placeholder="Senku fan"
                type="text"
                required
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-semibold text-foreground">
              Email
              <Input
                id="register-email"
                placeholder="you@email.com"
                type="email"
                required
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-semibold text-foreground">
              Password
              <Input
                id="register-password"
                placeholder="Create a strong passphrase"
                type="password"
                autoComplete="new-password"
                required
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-semibold text-foreground">
              Confirm password
              <Input
                id="register-confirm-password"
                placeholder="Re-enter your password"
                type="password"
                autoComplete="new-password"
                required
              />
            </label>

            <div className="text-[0.7rem] text-muted-foreground">
              <p>
                We&apos;ll never share your details. All submissions are CSRF
                protected and rate limit aware.
              </p>
            </div>

            <Button className="w-full" size="lg" type="submit">
              Create account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-1 text-[0.75rem] text-muted-foreground">
          <p>Already have an account?</p>
          <Link
            to="/login"
            className="text-primary font-semibold hover:underline"
          >
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </section>
  );
}
