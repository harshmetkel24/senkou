import { RefreshCw } from "lucide-react";

export function PendingComponent() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 md:px-10">
      <div className="flex items-center gap-3 rounded-full border border-border/60 bg-card/70 px-6 py-4 shadow-lg">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        <span className="text-sm font-medium uppercase tracking-[0.35em] text-muted-foreground">
          Loading content...
        </span>
      </div>
    </main>
  );
}