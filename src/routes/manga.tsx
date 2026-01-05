import {
  keepPreviousData,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import Autoplay from "embla-carousel-autoplay";
import {
  BookOpen,
  Layers,
  Library,
  RefreshCw,
  ScrollText,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";

import { PendingComponent } from "@/components/helpers/PendingComponent";
import { RouteErrorBoundary } from "@/components/helpers/RouteErrorBoundary";
import { HighlightCard } from "@/components/media/highlight-card";
import {
  MediaDetailPanel,
  type MediaDetailData,
} from "@/components/media/media-detail-panel";
import { MediaGrid, MediaGridSkeleton } from "@/components/media/media-grid";
import { SearchPlusUltraCallout } from "@/components/search/search-plus-ultra-callout";
import { SearchResultsPanel } from "@/components/search/search-results-panel";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { fetchMangaSearch, fetchTrendingManga } from "@/data/queries/manga";
import { useSpotlightDeck } from "@/hooks/use-spotlight-deck";
import { useWatchlistAdd } from "@/hooks/use-watchlist-add";
import { deriveRelatedResults } from "@/lib/search-helpers";

const trendingMangaQueryOptions = () => ({
  queryKey: ["manga", "trending", 1],
  queryFn: () => fetchTrendingManga(1, 20),
  staleTime: 1000 * 60 * 5,
  placeholderData: keepPreviousData,
});

const searchSchema = z.object({
  q: z
    .string()
    .trim()
    .max(60, "Search queries are capped at 60 characters")
    .optional()
    .transform((value) => (value && value.length ? value : undefined)),
});

const searchMangaQueryOptions = (query: string) => ({
  queryKey: ["manga", "search", query],
  queryFn: () => fetchMangaSearch(query, 1, 24),
  staleTime: 1000 * 60 * 2,
  placeholderData: keepPreviousData,
});

export const Route = createFileRoute("/manga")({
  validateSearch: (search) => searchSchema.parse(search ?? {}),
  loader: ({ context, search }) => {
    const resolvedSearch = search ?? {};
    const tasks = [
      context.queryClient.ensureQueryData(trendingMangaQueryOptions()),
    ];

    if (resolvedSearch.q) {
      tasks.push(
        context.queryClient.ensureQueryData(
          searchMangaQueryOptions(resolvedSearch.q)
        )
      );
    }

    return Promise.all(tasks);
  },
  component: MangaRoute,
  pendingComponent: PendingComponent,
  errorComponent: (props) => (
    <RouteErrorBoundary
      {...props}
      title="Manga page glitched out"
      description="The illustrated lineup couldn't load. Give it another shot or pick a different tab."
    />
  ),
});

function MangaRoute() {
  const navigate = useNavigate();
  const { data, isFetching } = useSuspenseQuery(trendingMangaQueryOptions());
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeMedia, setActiveMedia] = useState<MediaDetailData | undefined>();
  const watchlistActions = useWatchlistAdd({
    kind: "MANGA",
    activeMediaId: activeMedia?.id,
  });
  const [autoplayPlugin] = useState(() => Autoplay({ delay: 2000 }));
  const { q: searchQuery } = Route.useSearch();
  const normalizedSearchQuery = searchQuery ?? "";
  const plusUltraSearch = {
    to: "/search",
    search: () => ({
      q: normalizedSearchQuery || undefined,
      categories: "manga",
    }),
  };

  const shouldShowSearch = Boolean(searchQuery);
  const {
    data: searchData,
    status: searchStatus,
    isFetching: isSearching,
    isError: isSearchError,
    error: searchError,
    refetch: refetchSearch,
  } = useQuery({
    ...searchMangaQueryOptions(normalizedSearchQuery),
    enabled: shouldShowSearch,
  });

  const { spotlightItems, shuffleSpotlights } = useSpotlightDeck(data.items);
  const searchResults = searchData?.items ?? [];
  const searchTotal = searchData?.pageInfo.total ?? 0;
  const showSkeleton =
    shouldShowSearch && searchStatus === "pending" && !searchData;
  const showSearchResults =
    shouldShowSearch &&
    !showSkeleton &&
    !isSearchError &&
    searchResults.length > 0;
  const showEmptyState =
    shouldShowSearch &&
    !showSkeleton &&
    !isSearchError &&
    searchResults.length === 0;

  const { visible: curatedResults, suggestions: relatedSuggestions } = useMemo(
    () =>
      deriveRelatedResults(
        searchResults,
        normalizedSearchQuery,
        (item) => [item.title],
        { limit: 6 }
      ),
    [searchResults, normalizedSearchQuery]
  );

  const searchDescription = searchTotal
    ? `${searchTotal} titles match this query. Share this URL to keep the context.`
    : "Refine the query to uncover the perfect manga arc.";
  const errorDescription =
    searchError instanceof Error
      ? searchError.message
      : "Rate limits or invalid filters stopped this search.";

  const handleSelect = (media: MediaDetailData) => {
    setActiveMedia(media);
    setIsPanelOpen(true);
  };

  const handleClearSearch = () => {
    navigate({
      to: "/manga",
      search: (prev) => ({
        ...(prev ?? {}),
        q: undefined,
      }),
    });
  };

  return (
    <main className="relative min-h-screen px-4 py-10 md:px-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
      >
        <div className="absolute inset-x-0 top-14 mx-auto h-64 max-w-5xl rounded-full bg-rose-500/15 blur-[150px]" />
        <div className="absolute bottom-0 right-10 h-48 w-48 rounded-full bg-purple-500/15 blur-3xl" />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
        {!shouldShowSearch ? (
          <SearchPlusUltraCallout
            action={
              <Button asChild className="rounded-full">
                <Link {...plusUltraSearch}>Go for Manga</Link>
              </Button>
            }
          />
        ) : null}
        {shouldShowSearch ? (
          <SearchResultsPanel
            heading={`Library results for "${normalizedSearchQuery}"`}
            description={searchDescription}
            isSearching={isSearching}
            showSkeleton={showSkeleton}
            skeleton={<MediaGridSkeleton />}
            isError={Boolean(searchQuery) && isSearchError}
            errorTitle="AniList search failed"
            errorDescription={errorDescription}
            showEmpty={Boolean(searchQuery) && showEmptyState}
            emptyTitle={`No manga found for "${normalizedSearchQuery}"`}
            emptyDescription="Adjust romanization, try author names, or clear the filter to go back to charts."
            onRetry={() => refetchSearch()}
            onClear={handleClearSearch}
            actions={
              <Button asChild variant="outline" className="rounded-2xl">
                <Link {...plusUltraSearch}>Search Plus Ultra</Link>
              </Button>
            }
            showResults={showSearchResults}
            results={curatedResults}
            renderGrid={(items) => (
              <MediaGrid items={items} onSelect={handleSelect} />
            )}
            suggestions={
              relatedSuggestions.length
                ? {
                    heading: "Nearby picks",
                    items: relatedSuggestions,
                    getLabel: (item) => item.title,
                    onSelect: (item) =>
                      navigate({
                        to: "/manga",
                        search: (prev) => ({ ...(prev ?? {}), q: item.title }),
                      }),
                  }
                : undefined
            }
          />
        ) : spotlightItems.length ? (
          <section className="space-y-4">
            <Carousel
              className="overflow-hidden rounded-2xl border border-border/60 bg-card/70 shadow-[0_45px_120px_rgba(0,0,0,0.55)] md:h-[520px]"
              opts={{ loop: true }}
              plugins={[autoplayPlugin]}
            >
              <CarouselContent className="md:h-full">
                {spotlightItems.map((spotlight) => (
                  <CarouselItem key={spotlight.id} className="md:h-full">
                    <article className="relative overflow-hidden rounded-2xl md:h-full">
                      <div className="absolute inset-0">
                        <Image
                          src={spotlight.bannerImage ?? spotlight.coverImage}
                          alt={`${spotlight.title} banner art`}
                          width={1600}
                          height={600}
                          className="h-full w-full object-cover opacity-70"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/65 to-black/35" />
                      </div>
                      <div className="relative grid gap-8 px-8 py-10 md:h-full md:grid-cols-[1.1fr_minmax(0,0.9fr)] md:px-12 md:py-14">
                        <div className="space-y-5 text-white">
                          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-white/70">
                            <Sparkles className="h-4 w-4" />
                            Library spotlight
                          </p>
                          <h1 className="text-3xl font-black leading-tight md:text-4xl">
                            {spotlight.title}
                          </h1>
                          <p className="text-sm text-white/80 md:text-base line-clamp-5">
                            {spotlight.description ??
                              "Hand-picked graphic epics sourced directly from AniList’s live manga rankings."}
                          </p>

                          <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.35em] text-white/80">
                            {spotlight.genres.slice(0, 3).map((genre) => (
                              <span
                                key={genre}
                                className="rounded-full border border-white/20 bg-white/10 px-4 py-1"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>

                          <div className="flex flex-wrap gap-4 pb-2 md:pb-0">
                            <Button
                              type="button"
                              className="rounded-2xl bg-primary/90 px-6 py-5 text-base"
                              onClick={() => handleSelect(spotlight)}
                              data-carousel-interactive="true"
                            >
                              <BookOpen className="h-5 w-5" />
                              Open full entry
                            </Button>

                            <Button
                              type="button"
                              variant="ghost"
                              className="rounded-2xl border border-white/20 px-6 py-5 text-base text-white hover:bg-white/10"
                              data-carousel-interactive="true"
                              onClick={shuffleSpotlights}
                            >
                              <ScrollText className="h-5 w-5" />
                              Random chapter
                            </Button>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <HighlightCard
                            label="Audience score"
                            value={
                              spotlight.averageScore
                                ? `${spotlight.averageScore}%`
                                : "N/A"
                            }
                            icon={
                              <Sparkles className="h-5 w-5 text-rose-200" />
                            }
                          />
                          <HighlightCard
                            label="Chapters"
                            value={
                              spotlight.chapters
                                ? `${spotlight.chapters}`
                                : "TBD"
                            }
                            icon={<Layers className="h-5 w-5 text-amber-200" />}
                          />
                          <HighlightCard
                            label="Volumes"
                            value={
                              spotlight.volumes ? `${spotlight.volumes}` : "TBD"
                            }
                            icon={<Library className="h-5 w-5 text-sky-200" />}
                          />
                          <HighlightCard
                            label="Status"
                            value={spotlight.status ?? "TBD"}
                            icon={
                              <BookOpen className="h-5 w-5 text-emerald-200" />
                            }
                          />
                        </div>
                      </div>
                    </article>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </section>
        ) : null}

        <section className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                AniList Illustrated Charts
              </p>
              <h2 className="mt-2 text-3xl font-bold">
                {shouldShowSearch
                  ? "Still hungry? Trend charts await"
                  : "Prestige manga made for binge reading"}
              </h2>
            </div>
            {isFetching ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-xs uppercase tracking-[0.35em] text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Updating
              </span>
            ) : null}
          </div>

          <MediaGrid items={data.items} onSelect={handleSelect} />
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
    </main>
  );
}
