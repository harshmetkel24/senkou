import { getExperienceLevelInfo } from "@/lib/constants/experience-levels";
import { cn } from "@/lib/utils";

type ExperienceBadgeProps = {
  level?: number | null;
  className?: string;
  size?: "sm" | "md";
};

const badgeSizeClasses = {
  sm: "h-8 w-8 text-base",
  md: "h-9 w-9 text-lg",
} as const;

export function ExperienceBadge({
  level,
  className,
  size = "md",
}: ExperienceBadgeProps) {
  const info = getExperienceLevelInfo(level);

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br shadow-lg ring-2 ring-background",
        badgeSizeClasses[size],
        info.badgeClass,
        className
      )}
      role="img"
      aria-label={`Level ${info.level + 1}: ${info.title}`}
      title={`${info.title} (Level ${info.level + 1})`}
    >
      <span aria-hidden="true">{info.emoji}</span>
    </div>
  );
}
