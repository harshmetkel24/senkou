import { MediaCard } from "./media-card";

import type { MediaCardData } from "./media-card";

type MediaGridProps = {
  items: MediaCardData[];
  onSelect?: (media: MediaCardData) => void;
};

export function MediaGrid({ items, onSelect }: MediaGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {items.map((media) => (
        <MediaCard key={media.id} media={media} onSelect={onSelect} />
      ))}
    </div>
  );
}

export function MediaGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse overflow-hidden rounded-3xl border border-border/60 bg-card/40"
        >
          <div className="h-64 bg-muted/50" />
          <div className="space-y-3 px-5 py-6">
            <div className="h-4 w-32 rounded-full bg-muted/60" />
            <div className="h-5 w-3/4 rounded-full bg-muted/40" />
            <div className="h-3 w-1/2 rounded-full bg-muted/30" />
            <div className="flex gap-2">
              <div className="h-6 w-16 rounded-full bg-muted/40" />
              <div className="h-6 w-16 rounded-full bg-muted/40" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
