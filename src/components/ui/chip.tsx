import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const chipVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border text-[11px] font-semibold uppercase tracking-[0.32em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "px-4 py-1.5",
        md: "px-5 py-2 text-xs tracking-[0.35em]",
      },
      state: {
        active: "border-primary/60 bg-primary/15 text-primary hover:bg-primary/20",
        inactive:
          "border-border/70 bg-background/40 text-muted-foreground hover:text-foreground",
      },
    },
    defaultVariants: {
      size: "sm",
      state: "inactive",
    },
  }
);

type ChipProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof chipVariants> & {
    active?: boolean;
  };

function Chip({
  className,
  size,
  state,
  active,
  type = "button",
  ...props
}: ChipProps) {
  const resolvedState = state ?? (active ? "active" : "inactive");

  return (
    <button
      type={type}
      className={cn(chipVariants({ size, state: resolvedState, className }))}
      {...props}
    />
  );
}

export { Chip, chipVariants };
