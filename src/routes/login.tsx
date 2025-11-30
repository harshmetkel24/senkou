import { FormEvent } from "react";

import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

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
import { toast } from "@/components/ui/sonner";
import { loginFn } from "@/lib/auth/login";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const login = useServerFn(loginFn);
  const loginMutation = useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      return await login({ data: payload });
    },
    onSuccess: (response) => {
      if (!response?.success) {
        toast.error("Login failed", {
          description: "Please try again in a moment.",
        });
        return;
      }

      toast.success("Signed in", {
        description: "Redirecting you to your dashboard.",
      });
      navigate({ to: "/" });
    },
    onError: (error) => {
      const description =
        error instanceof Error
          ? error.message
          : "Please double-check your credentials.";
      toast.error("Login failed", { description });
    },
  });

  const submissionError = loginMutation.isError
    ? loginMutation.error instanceof Error
      ? loginMutation.error.message
      : "Something went wrong while logging you in."
    : "";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = (formData.get("login-email") as string) || "";
    const password = (formData.get("login-password") as string) || "";

    loginMutation.mutate({
      email: email.trim(),
      password,
    });
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
            aria-busy={loginMutation.isPending}
            aria-label="Login form"
          >
            <label className="flex flex-col gap-1 text-sm font-semibold text-foreground">
              Email
              <Input
                id="login-email"
                name="login-email"
                placeholder="you@email.com"
                type="email"
                required
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-semibold text-foreground">
              Password
              <Input
                id="login-password"
                name="login-password"
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

            {submissionError ? (
              <p className="text-sm text-destructive" role="alert">
                {submissionError}
              </p>
            ) : null}

            <Button
              className="w-full"
              size="lg"
              type="submit"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing in..." : "Continue"}
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
