import {
  Calendar,
  Clock,
  Flame,
  Play,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { Image } from "@unpic/react";
import { type ComponentType, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { MediaCardData } from "./media-card";

export type MediaDetailData = MediaCardData & {
  bannerImage?: string;
  season?: string;
  seasonYear?: number;
  description?: string;
};

type MediaDetailPanelProps = {
  media?: MediaDetailData;
  open: boolean;
  onClose: () => void;
  onAddToWatchlist?: (media: MediaDetailData) => void;
  addLabel?: string;
  addIsLoading?: boolean;
  addDisabled?: boolean;
  addHelperText?: string;
};

type DetailStat = {
  key: string;
  icon: ComponentType<{ className?: string }>;
  getLabel: (media: MediaDetailData) => string;
  formatter: (media: MediaDetailData) => string | undefined;
};

const detailStats: DetailStat[] = [
  {
    key: "score",
    icon: Star,
    getLabel: () => "Score",
    formatter: (media) =>
      media.averageScore
        ? `${Math.round(media.averageScore)}% Audience`
        : undefined,
  },
  {
    key: "popularity",
    icon: Flame,
    getLabel: () => "Popularity",
    formatter: (media) =>
      media.popularity
        ? Intl.NumberFormat("en", { notation: "compact" }).format(
            media.popularity,
          )
        : undefined,
  },
  {
    key: "length",
    icon: Play,
    getLabel: (media) => media.episodeLabel ?? "Episodes",
    formatter: (media) =>
      media.episodes ? `${media.episodes} total` : undefined,
  },
  {
    key: "runtime",
    icon: Clock,
    getLabel: () => "Runtime",
    formatter: (media) =>
      media.duration ? `${media.duration} min` : undefined,
  },
];

export function MediaDetailPanel({
  media,
  open,
  onClose,
  onAddToWatchlist,
  addLabel = "Add to watchlist",
  addIsLoading = false,
  addDisabled = false,
  addHelperText,
}: MediaDetailPanelProps) {
  const seasonLabel = useMemo(() => {
    if (!media?.season && !media?.seasonYear) return undefined;
    if (media.season && media.seasonYear) {
      return `${media.season} ${media.seasonYear}`;
    }
    return media.season ?? `${media.seasonYear}`;
  }, [media]);

  if (!media) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 transition-opacity",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      role="dialog"
      aria-modal="true"
      aria-label={`${media.title} details`}
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <article className="relative z-10 flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-border/60 bg-gradient-to-b from-card/90 via-background/95 to-background shadow-[0_40px_90px_rgba(0,0,0,0.65)]">
        <header className="relative h-64 overflow-hidden">
          <Image
            src={media.bannerImage ?? media.coverImage}
            alt={media.title}
            width={1600}
            height={600}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/85" />

          <div className="absolute left-6 top-6 flex items-center gap-3 rounded-full border border-white/20 bg-black/40 px-4 py-1 text-sm font-semibold uppercase tracking-[0.35em] text-white/90 backdrop-blur">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            Spotlight
          </div>

          <div className="absolute right-6 top-6 flex gap-3">
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full border border-white/20 bg-black/20 text-white hover:bg-white/10"
              onClick={onClose}
              aria-label="Close details"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="absolute inset-x-0 bottom-4 flex flex-col gap-2 px-6 text-white md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-white/70">
                {media.studios?.[0] ?? "Featured Studio"}
              </p>
              <h2 className="mt-1 text-3xl font-black md:text-4xl">
                {media.title}
              </h2>
            </div>
            {seasonLabel ? (
              <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-black/30 px-4 py-2 text-sm uppercase tracking-wide">
                <Calendar className="h-4 w-4" />
                {seasonLabel}
              </div>
            ) : null}
          </div>
        </header>

        <div className="grid flex-1 grid-cols-1 overflow-y-auto px-6 py-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:gap-10 md:px-10 md:py-8">
          <section className="space-y-6 pr-2">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Synopsis
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {media.description ??
                  "We are still gathering the perfect synopsis for this title."}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Genres
              </h3>
              <div className="flex flex-wrap gap-2">
                {(media.genres ?? ["Uncategorized"]).map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full border border-border/80 bg-background/50 px-4 py-1 text-xs uppercase tracking-wide text-foreground/80"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-6">
            {onAddToWatchlist ? (
              <div className="space-y-2">
                <Button
                  type="button"
                  className="w-full justify-center rounded-2xl"
                  onClick={() => onAddToWatchlist(media)}
                  disabled={addDisabled || addIsLoading}
                >
                  {addIsLoading ? "Saving..." : addLabel}
                </Button>
                {addHelperText ? (
                  <p className="text-xs text-muted-foreground">
                    {addHelperText}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-4">
              {detailStats.map(({ key, getLabel, icon: Icon, formatter }) => {
                const value = formatter(media);
                if (!value) return null;
                return (
                  <div
                    key={key}
                    className="rounded-3xl border border-border/60 bg-card/60 px-4 py-3 text-sm text-foreground"
                  >
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      <Icon className="h-4 w-4 text-primary" />
                      {getLabel(media)}
                    </div>
                    <p className="mt-2 text-lg font-semibold">{value}</p>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Studios
              </h3>
              <div className="flex flex-wrap gap-2">
                {(media.studios?.length ? media.studios : ["TBA"]).map(
                  (studio) => (
                    <span
                      key={studio}
                      className="rounded-2xl border border-border/70 bg-background/40 px-4 py-1 text-sm"
                    >
                      {studio}
                    </span>
                  ),
                )}
              </div>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}
