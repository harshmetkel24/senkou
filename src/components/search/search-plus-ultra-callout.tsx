import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

interface SearchPlusUltraCalloutProps {
  action: ReactNode;
  title?: string;
  description?: string;
}

export function SearchPlusUltraCallout({
  action,
  title = "Search Plus Ultra",
  description = "Unlock advanced filters and discover content beyond the surface.",
}: SearchPlusUltraCalloutProps) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/70 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.5)] md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              {title}
            </p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {action}
      </div>
    </section>
  );
}
