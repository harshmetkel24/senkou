import { keepPreviousData, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { Suspense, useState } from "react";

import { PendingComponent } from "@/components/helpers/PendingComponent";
import { RouteErrorBoundary } from "@/components/helpers/RouteErrorBoundary";
import {
  MediaDetailPanel,
  type MediaDetailData,
} from "@/components/media/media-detail-panel";
import { MediaGrid } from "@/components/media/media-grid";
import { SearchBar } from "@/components/ui/search-bar";
import {
  WatchlistShelf,
  WatchlistShelfSkeleton,
} from "@/components/watchlist/watchlist-shelf";
import { fetchTrendingAnime, type AnimeListItem } from "@/data/queries/anime";
import { useWatchlistAdd } from "@/hooks/use-watchlist-add";
import { useAuth } from "@/hooks/useAuth";

const trendingAnimeQueryOptions = () => ({
  queryKey: ["anime", "trending", 1, 8],
  queryFn: () => fetchTrendingAnime(1, 8),
  staleTime: 1000 * 60 * 5,
  placeholderData: keepPreviousData,
});

export const Route = createFileRoute("/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(trendingAnimeQueryOptions()),
  component: App,
  pendingComponent: PendingComponent,
  errorComponent: (props) => (
    <RouteErrorBoundary
      {...props}
      title="We couldn't render the home showcase"
      description="Trending picks failed to load. The sidebar still works, so hop to another section or try again."
    />
  ),
});

function App() {
  const { user } = useAuth();
  const { data: trendingAnime } = useSuspenseQuery(trendingAnimeQueryOptions());
  const [activeMedia, setActiveMedia] = useState<MediaDetailData | undefined>();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const watchlistActions = useWatchlistAdd({
    kind: "ANIME",
    activeMediaId: activeMedia?.id,
  });
  const heroPlaceholders = buildHeroSearchPlaceholders(trendingAnime.items);

  const handleSelect = (media: MediaDetailData) => {
    setActiveMedia(media);
    setIsPanelOpen(true);
  };

  return (
    <div className="relative min-h-screen">
      <div className="flex flex-col items-center justify-center px-6 py-12">
        {/* Logo and Title */}
        <div className="mb-10 text-center animate-fade-in">
          <Image
            src="/senkou-full.png"
            alt="Senkou Logo"
            width={1024}
            height={1024}
            className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6"
          />
          <h1 className="text-4xl md:text-6xl font-black mb-4 uppercase [letter-spacing:-0.08em]">
            senkō!
          </h1>
          <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground font-light">
            Endless light. Endless stories. Built with the same sleek, data-rich
            spirit you love on IMDb—now curated for anime-first adventures.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full justify-center flex mb-6">
          <SearchBar variant="hero" placeholderSuggestions={heroPlaceholders} />
        </div>

        {user ? (
          <Suspense
            fallback={<WatchlistShelfSkeleton displayName={user.displayName} />}
          >
            <WatchlistShelf />
          </Suspense>
        ) : null}

        {/* Trending Anime */}
        <section className="w-full max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6">Trending Now</h2>
          <MediaGrid
            items={trendingAnime.items.slice(1)}
            onSelect={handleSelect}
          />
        </section>
      </div>
      <MediaDetailPanel
        media={activeMedia}
        open={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onAddToWatchlist={watchlistActions.onAddToWatchlist}
        addIsLoading={watchlistActions.addIsLoading}
        addLabel={watchlistActions.addLabel}
        addHelperText={watchlistActions.addHelperText}
      />
    </div>
  );
}

const HERO_PLACEHOLDER_SEEDS = [
  "One Piece",
  "Frieren",
  "Gojo Satoru",
] as const;

function buildHeroSearchPlaceholders(animeItems: AnimeListItem[]): string[] {
  const animeTitles = animeItems.map((item) => item.title).filter(Boolean);
  const used = new Set<string>();
  const placeholders: string[] = [];

  const pickFromPool = (seed: string, pool: string[]) => {
    if (!pool.length) return seed;
    const loweredSeed = seed.toLowerCase();
    const match = pool.find((title) =>
      title.toLowerCase().includes(loweredSeed)
    );
    if (match) return match;
    const fallback = pool.find((title) => {
      const normalized = normalizePlaceholderTerm(title).toLowerCase();
      return normalized.length > 0 && !used.has(normalized);
    });
    return fallback ?? seed;
  };

  HERO_PLACEHOLDER_SEEDS.forEach((seed) => {
    const term = pickFromPool(seed, animeTitles);
    const normalized = normalizePlaceholderTerm(term);
    if (!normalized) return;
    const key = normalized.toLowerCase();
    if (used.has(key)) return;
    used.add(key);
    placeholders.push(`Search ${normalized}...`);
  });

  if (placeholders.length < HERO_PLACEHOLDER_SEEDS.length) {
    for (const title of animeTitles) {
      if (placeholders.length >= HERO_PLACEHOLDER_SEEDS.length) break;
      const normalized = normalizePlaceholderTerm(title);
      const key = normalized.toLowerCase();
      if (!normalized || used.has(key)) continue;
      used.add(key);
      placeholders.push(`Search ${normalized}...`);
    }
  }

  return placeholders;
}

function normalizePlaceholderTerm(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  const separators = [":", " - "];
  let candidate = trimmed;
  for (const separator of separators) {
    const index = candidate.indexOf(separator);
    if (index > 0) {
      candidate = candidate.slice(0, index).trim();
    }
  }
  return candidate.trim();
}
