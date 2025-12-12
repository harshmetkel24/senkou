import { FormEvent } from "react";

import { useMutation } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
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
import { PasswordField } from "@/components/ui/password-field";
import { toast } from "@/components/ui/sonner";
import { registerFn } from "@/lib/auth/register";
import {
  DisplayNameInput,
  EmailInput,
  PasswordInput,
} from "@/lib/auth/validation";

export const Route = createFileRoute("/register")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const register = useServerFn(registerFn);
  const registerMutation = useMutation({
    mutationFn: async (payload: {
      displayName: DisplayNameInput;
      email: EmailInput;
      password: PasswordInput;
    }) => {
      return await register({ data: payload });
    },
    onSuccess: (response) => {
      if (!response?.success) {
        toast.error("Registration failed", {
          description: "Please try again in a moment.",
        });
        return;
      }

      toast.success("Account created", {
        description: "Redirecting you to your home feed.",
      });
      navigate({ to: "/" });
    },
    onError: (error) => {
      const description =
        error instanceof Error
          ? error.message
          : "Please try again in a moment.";
      toast.error("Registration failed", { description });
    },
  });

  const submissionError = registerMutation.isError
    ? registerMutation.error instanceof Error
      ? registerMutation.error.message
      : "Something went wrong while creating your account."
    : "";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const displayName = (formData.get("register-display-name") as string) || "";
    const email = (formData.get("register-email") as string) || "";
    const password = (formData.get("register-password") as string) || "";
    const confirmPassword =
      (formData.get("register-confirm-password") as string) || "";

    if (password !== confirmPassword) {
      toast.error("Passwords do not match", {
        description: "Please confirm your password and try again.",
      });
      return;
    }

    registerMutation.mutate({
      displayName: displayName.trim(),
      email: email.trim(),
      password,
    });
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
            aria-busy={registerMutation.isPending}
            aria-label="Signup form"
          >
            <label className="flex flex-col gap-1 text-sm font-semibold text-foreground">
              Display name
              <Input
                id="register-display-name"
                name="register-display-name"
                placeholder="Senku fan"
                type="text"
                required
              />
            </label>

            <label className="flex flex-col gap-1 text-sm font-semibold text-foreground">
              Email
              <Input
                id="register-email"
                name="register-email"
                placeholder="you@email.com"
                type="email"
                required
              />
            </label>

            <PasswordField
              id="register-password"
              label="Password"
              name="register-password"
              placeholder="Create a strong passphrase"
              autoComplete="new-password"
              required
            />

            <PasswordField
              id="register-confirm-password"
              label="Confirm password"
              name="register-confirm-password"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              required
            />

            <div className="text-[0.7rem] text-muted-foreground">
              <p>
                We&apos;ll never share your details. All submissions are CSRF
                protected and rate limit aware.
              </p>
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
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Creating..." : "Create account"}
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
