import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWatchlistStatsFn } from "@/lib/server/watchlist";
import { WATCH_STATUS_LABELS } from "@/lib/watchlist-helpers";
import type { WatchStatus } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  BookMarked,
  CheckCircle2,
  CirclePause,
  Play,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";

type WatchlistStats = {
  PLANNING: number;
  WATCHING: number;
  COMPLETED: number;
  PAUSED: number;
  DROPPED: number;
  total: number;
};

const STATUS_CONFIG: Record<
  WatchStatus,
  { icon: LucideIcon; gradient: string; bgGlow: string }
> = {
  WATCHING: {
    icon: Play,
    gradient: "from-emerald-500 to-emerald-600",
    bgGlow: "shadow-emerald-500/20",
  },
  PLANNING: {
    icon: BookMarked,
    gradient: "from-sky-500 to-sky-600",
    bgGlow: "shadow-sky-500/20",
  },
  COMPLETED: {
    icon: CheckCircle2,
    gradient: "from-amber-500 to-amber-600",
    bgGlow: "shadow-amber-500/20",
  },
  PAUSED: {
    icon: CirclePause,
    gradient: "from-indigo-500 to-indigo-600",
    bgGlow: "shadow-indigo-500/20",
  },
  DROPPED: {
    icon: TrendingDown,
    gradient: "from-rose-500 to-rose-600",
    bgGlow: "shadow-rose-500/20",
  },
};

const STATUS_ORDER: WatchStatus[] = [
  "WATCHING",
  "COMPLETED",
  "PLANNING",
  "PAUSED",
  "DROPPED",
];

function StatCard({
  status,
  count,
  total,
}: {
  status: WatchStatus;
  count: number;
  total: number;
}) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 p-4 transition-all hover:border-border hover:shadow-lg ${config.bgGlow}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {WATCH_STATUS_LABELS[status]}
          </p>
          <p className="text-2xl font-bold tabular-nums">{count}</p>
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${config.gradient} text-white shadow-lg`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${config.gradient} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          {percentage}% of library
        </p>
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-3 w-16 animate-pulse rounded bg-muted/50" />
          <div className="h-7 w-10 animate-pulse rounded bg-muted/50" />
        </div>
        <div className="h-10 w-10 animate-pulse rounded-lg bg-muted/50" />
      </div>
      <div className="mt-3">
        <div className="h-1.5 w-full animate-pulse rounded-full bg-muted/50" />
        <div className="mt-1.5 h-2.5 w-20 animate-pulse rounded bg-muted/40" />
      </div>
    </div>
  );
}

export function ProfileAnalytics() {
  const getStats = useServerFn(getWatchlistStatsFn);
  const { data: stats, isLoading } = useQuery<WatchlistStats | null>({
    queryKey: ["watchlist-stats"],
    queryFn: () => getStats(),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookMarked className="size-4 text-primary" />
          Anime Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        ) : !stats || stats.total === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BookMarked className="size-12 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">
              No anime in your library yet.
            </p>
            <p className="text-xs text-muted-foreground/70">
              Start adding anime to track your journey!
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold">{stats.total}</span>
              <span className="text-xl text-muted-foreground">
                anime in library
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {STATUS_ORDER.map((status) => (
                <StatCard
                  key={status}
                  status={status}
                  count={stats[status]}
                  total={stats.total}
                />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
