import { Calendar, Flame, Star } from "lucide-react";

import { cn } from "@/lib/utils";

export type MediaCardData = {
  id: number;
  title: string;
  coverImage: string;
  color?: string;
  format?: string;
  status?: string;
  episodes?: number;
  episodeLabel?: string;
  episodeUnit?: string;
  duration?: number;
  averageScore?: number;
  popularity?: number;
  genres?: string[];
  studios?: string[];
};

type MediaCardProps = {
  media: MediaCardData;
  onSelect?: (media: MediaCardData) => void;
};

const formatLabel = (media: MediaCardData) => {
  if (media.format && media.status) {
    return `${media.format} · ${media.status}`;
  }
  return media.format ?? media.status ?? "Featured";
};

export function MediaCard({ media, onSelect }: MediaCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(media)}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-background/40 to-background/5 text-left shadow-[0_20px_45px_rgba(0,0,0,0.45)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70",
      )}
      aria-label={`Open details for ${media.title}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={media.coverImage}
          alt={media.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent opacity-90"
          style={
            media.color
              ? {
                  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 10%, ${media.color}22 45%, rgba(0,0,0,0.85) 100%)`,
                }
              : undefined
          }
        />

        <div className="absolute left-3 top-3 rounded-2xl border border-white/20 bg-black/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-lg backdrop-blur-sm">
          {formatLabel(media)}
        </div>
        {media.averageScore ? (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-2xl border border-yellow-500/40 bg-black/50 px-3 py-1 text-sm font-semibold text-yellow-100 backdrop-blur-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{Math.round(media.averageScore)}%</span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-4 px-5 pb-5 pt-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            {media.studios?.[0] ?? "Studio TBD"}
          </p>
          <h3 className="mt-1 text-lg font-semibold leading-tight text-foreground">
            {media.title}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          {media.episodes ? (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {media.episodes} {media.episodeUnit ?? "ep"}
            </span>
          ) : null}

          {media.popularity ? (
            <span className="inline-flex items-center gap-1">
              <Flame className="h-4 w-4 text-amber-400" />
              {Intl.NumberFormat("en", {
                notation: "compact",
              }).format(media.popularity)}
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {(media.genres ?? []).slice(0, 3).map((genre) => (
            <span
              key={genre}
              className="rounded-full border border-border/80 bg-background/60 px-3 py-1 text-xs uppercase tracking-wide text-muted-foreground transition-colors group-hover:border-primary/70 group-hover:text-primary"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
