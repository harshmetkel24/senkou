import { Link, type ErrorComponentProps } from "@tanstack/react-router";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

type RouteErrorBoundaryProps = ErrorComponentProps & {
  title?: string;
  description?: string;
  actionLabel?: string;
};

export function RouteErrorBoundary({
  error,
  reset,
  title = "We couldn't load this page",
  description = "Sidebar navigation is still active. You can try again or hop to another section.",
  actionLabel = "Try again",
}: RouteErrorBoundaryProps) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Unknown error";

  const handleRetry = () => {
    if (typeof reset === "function") {
      reset();
    } else {
      // eslint-disable-next-line no-console
      console.warn("No reset handler registered for this route error.");
    }
  };

  return (
    <section
      role="alert"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center"
    >
      <div className="rounded-3xl border border-border/60 bg-card/70 px-6 py-8 shadow-lg">
        <AlertTriangle className="mx-auto size-12 text-amber-400" />
        <div className="mt-4 space-y-2">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {message ? (
          <p className="mt-4 rounded-2xl border border-border/80 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            {message}
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Button type="button" onClick={handleRetry}>
            <RefreshCw className="size-4" />
            {actionLabel}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/" className="inline-flex items-center gap-2">
              <Home className="size-4" />
              Back home
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
