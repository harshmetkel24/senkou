import { ExperienceBadge } from "@/components/helpers/experience-badge";
import {
  EXPERIENCE_LEVELS,
  getExperienceLevelInfo,
} from "@/lib/constants/experience-levels";

type ExperienceCardProps = {
  level: number;
};

export function ExperienceCard({ level }: ExperienceCardProps) {
  const info = getExperienceLevelInfo(level);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-[var(--shadow-elevated)]">
      <div className="flex items-center gap-4 mb-4">
        <ExperienceBadge level={level} size="md" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground truncate">
            Level {info.level + 1}: {info.title}
          </p>
          <p className="text-xs text-muted-foreground">{info.subtitle}</p>
        </div>
      </div>

      <div
        className="flex gap-1"
        role="progressbar"
        aria-valuenow={level + 1}
        aria-valuemin={0}
        aria-valuemax={10}
        aria-label={`Experience level ${level + 1} of 10`}
      >
        {EXPERIENCE_LEVELS.map((expLevel, i) => (
          <div
            key={expLevel.level}
            className={`h-2 flex-1 rounded-full transition-all duration-400 ${
              i <= level
                ? `bg-linear-to-r ${info.badgeClass}`
                : "bg-muted/30"
            }`}
            style={{
              animationDelay: `${i * 60}ms`,
            }}
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {level + 1} of {EXPERIENCE_LEVELS.length} levels
      </p>
    </div>
  );
}

export function ExperienceCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="h-9 w-9 rounded-full bg-muted/40 animate-pulse" />
        <div className="space-y-2">
          <div className="h-3.5 w-32 rounded bg-muted/50 animate-pulse" />
          <div className="h-3 w-24 rounded bg-muted/40 animate-pulse" />
        </div>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="h-2 flex-1 rounded-full bg-muted/30 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
