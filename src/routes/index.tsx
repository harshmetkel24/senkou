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
import { fetchTrendingAnime } from "@/data/queries/anime";
import { useWatchlistAdd } from "@/hooks/use-watchlist-add";
import { useAuth } from "@/hooks/useAuth";

const trendingAnimeQueryOptions = () => ({
  queryKey: ["anime", "trending", 1],
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
  const { data } = useSuspenseQuery(trendingAnimeQueryOptions());
  const watchlistActions = useWatchlistAdd({ kind: "ANIME" });
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeMedia, setActiveMedia] = useState<MediaDetailData | undefined>();

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
        <div className="w-full justify-center flex">
          <SearchBar variant="hero" />
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
          <MediaGrid items={data.items.slice(1)} onSelect={handleSelect} />
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
