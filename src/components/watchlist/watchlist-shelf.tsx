import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Image } from "@unpic/react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useAuth } from "@/hooks/useAuth";
import { getWatchlistFn } from "@/lib/server/watchlist";

type WatchlistRows = Awaited<ReturnType<typeof getWatchlistFn>>;

export const watchlistQueryOptions = () => ({
  queryKey: ["watchlist", "self"],
  queryFn: () => getWatchlistFn(),
  staleTime: 1000 * 60 * 2,
  placeholderData: keepPreviousData,
});

export function WatchlistShelf() {
  const { user } = useAuth();
  const watchlistQuery = useQuery<WatchlistRows>({
    ...watchlistQueryOptions(),
    suspense: true,
    throwOnError: false,
  });

  if (!user) return null;

  const watchlistEntries = watchlistQuery.data ?? [];
  const watchlistItems = watchlistEntries.map(({ entity, entry }) => ({
    id: entity.anilistId,
    title: entity.title,
    coverImage: entity.coverImage ?? "/senkou-circle-logo.png",
    bannerImage: entity.bannerImage ?? undefined,
    format: entity.format ?? undefined,
    status: entry.status ?? undefined,
  }));

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="mb-4 flex flex-col gap-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
          Welcome back{user.displayName ? `, ${user.displayName}` : ""}
        </p>
        <h2 className="text-2xl font-bold">Your Watchlist</h2>
        <p className="text-sm text-muted-foreground">
          We&apos;ll surface your recent saves here—perfect for quick catch-ups.
        </p>
      </div>

      {watchlistQuery.isError ? (
        <div className="rounded-3xl border border-destructive/40 bg-destructive/10 px-6 py-8 text-center text-destructive">
          We couldn&apos;t load your watchlist. Please refresh to retry.
        </div>
      ) : watchlistItems.length ? (
        <>
          {/* IDEA: paginate this carousel once watchlist grows beyond the visible set. */}
          <Carousel className="w-full" opts={{ align: "start" }}>
            <CarouselContent>
              {watchlistItems.map((item) => (
                <CarouselItem
                  key={`${item.id}-${item.title}`}
                  className="basis-60 md:basis-64 lg:basis-72"
                >
                  <article className="flex h-full flex-col gap-3 rounded-3xl border border-border/60 bg-card/70 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.35)]">
                    <div className="aspect-[3/4] overflow-hidden rounded-2xl border border-border/50 bg-muted/20">
                      <Image
                        src={item.coverImage}
                        alt={`${item.title} cover art`}
                        width={400}
                        height={520}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                        {item.format ?? "Saved title"}
                      </p>
                      <h3 className="text-base font-semibold line-clamp-2">
                        {item.title}
                      </h3>
                      {item.status ? (
                        <p className="text-xs text-primary">Status: {item.status}</p>
                      ) : null}
                    </div>
                  </article>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </>
      ) : (
        <div className="rounded-3xl border border-border/60 bg-card/60 px-6 py-8 text-center text-muted-foreground">
          Nothing saved yet. Jump into the Anime tab to start building your list.
        </div>
      )}
    </section>
  );
}

export function WatchlistShelfSkeleton({
  displayName,
}: {
  displayName?: string;
}) {
  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="mb-4 flex flex-col gap-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
          Welcome back{displayName ? `, ${displayName}` : ""}
        </p>
        <h2 className="text-2xl font-bold">Your Watchlist</h2>
        <p className="text-sm text-muted-foreground">
          We&apos;ll surface your recent saves here—perfect for quick catch-ups.
        </p>
      </div>

      <Carousel className="w-full" opts={{ align: "start" }}>
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem
              key={index}
              className="basis-60 md:basis-64 lg:basis-72"
            >
              <article className="flex h-full flex-col gap-3 rounded-3xl border border-border/60 bg-card/40 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.35)]">
                <div className="aspect-[3/4] rounded-2xl bg-muted/30 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-3 w-24 rounded-full bg-muted/40 animate-pulse" />
                  <div className="h-4 w-36 rounded-full bg-muted/50 animate-pulse" />
                  <div className="h-3 w-28 rounded-full bg-muted/30 animate-pulse" />
                </div>
              </article>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
