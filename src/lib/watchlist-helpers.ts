import type { WatchStatus } from "@/types";

export const WATCH_STATUS_LABELS: Record<WatchStatus, string> = {
  PLANNING: "Planning",
  WATCHING: "Watching",
  COMPLETED: "Completed",
  PAUSED: "Paused",
  DROPPED: "Dropped",
};

export const WATCH_STATUS_OPTIONS: Array<{
  value: WatchStatus;
  label: string;
  description: string;
}> = [
  {
    value: "WATCHING",
    label: "Watching",
    description: "Actively following new episodes.",
  },
  {
    value: "PLANNING",
    label: "Planning",
    description: "Queued up next in your backlog.",
  },
  {
    value: "COMPLETED",
    label: "Completed",
    description: "Wrapped every episode or chapter.",
  },
  {
    value: "PAUSED",
    label: "Paused",
    description: "Taking a breather before continuing.",
  },
  {
    value: "DROPPED",
    label: "Dropped",
    description: "No plans to finish for now.",
  },
];

const STATUS_BADGE_STYLES: Record<WatchStatus, string> = {
  WATCHING:
    "border-emerald-400/40 bg-emerald-500/15 text-emerald-100 shadow-[0_10px_40px_rgba(16,185,129,0.25)]",
  PLANNING:
    "border-sky-400/40 bg-sky-500/15 text-sky-100 shadow-[0_10px_40px_rgba(56,189,248,0.25)]",
  COMPLETED:
    "border-amber-400/40 bg-amber-500/15 text-amber-100 shadow-[0_10px_40px_rgba(251,191,36,0.25)]",
  PAUSED:
    "border-indigo-400/40 bg-indigo-500/15 text-indigo-100 shadow-[0_10px_40px_rgba(129,140,248,0.25)]",
  DROPPED:
    "border-rose-400/40 bg-rose-500/15 text-rose-100 shadow-[0_10px_40px_rgba(244,63,94,0.25)]",
};

export const formatWatchStatusLabel = (status: WatchStatus) =>
  WATCH_STATUS_LABELS[status] ?? "Saved";

export const getWatchStatusBadgeClass = (status: WatchStatus) =>
  STATUS_BADGE_STYLES[status] ??
  "border-border/60 bg-background/60 text-foreground/80";
