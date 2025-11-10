import type { ReactNode } from "react";

type HighlightCardProps = {
  label: string;
  value: string;
  icon: ReactNode;
};

export function HighlightCard({ label, value, icon }: HighlightCardProps) {
  return (
    <div className="rounded-3xl border border-white/15 bg-black/35 p-4 text-left text-white/90 backdrop-blur">
      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-white/70">
        {icon}
        {label}
      </div>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  );
}
