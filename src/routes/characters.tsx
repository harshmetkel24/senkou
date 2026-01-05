import {
  keepPreviousData,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import Autoplay from "embla-carousel-autoplay";
import { Heart, RefreshCw, Sparkles, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";

import type { CharacterCardData } from "@/components/characters/character-card";
import { CharacterDetailPanel } from "@/components/characters/character-detail-panel";
import {
  CharacterGrid,
  CharacterGridSkeleton,
} from "@/components/characters/character-grid";
import { PendingComponent } from "@/components/helpers/PendingComponent";
import { RouteErrorBoundary } from "@/components/helpers/RouteErrorBoundary";
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
import {
  fetchCharacterSearch,
  fetchTrendingCharacters,
} from "@/data/queries/characters";
import { useSpotlightDeck } from "@/hooks/use-spotlight-deck";
import { deriveRelatedResults } from "@/lib/search-helpers";

const trendingCharactersQueryOptions = () => ({
  queryKey: ["characters", "trending", 1],
  queryFn: () => fetchTrendingCharacters(1, 20),
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

const searchCharacterQueryOptions = (query: string) => ({
  queryKey: ["characters", "search", query],
  queryFn: () => fetchCharacterSearch(query, 1, 24),
  staleTime: 1000 * 60 * 2,
  placeholderData: keepPreviousData,
});

export const Route = createFileRoute("/characters")({
  validateSearch: (search) => searchSchema.parse(search ?? {}),
  loader: ({ context, search }) => {
    const resolvedSearch = search ?? {};
    const tasks = [
      context.queryClient.ensureQueryData(trendingCharactersQueryOptions()),
    ];

    if (resolvedSearch.q) {
      tasks.push(
        context.queryClient.ensureQueryData(
          searchCharacterQueryOptions(resolvedSearch.q)
        )
      );
    }

    return Promise.all(tasks);
  },
  component: CharactersRoute,
  pendingComponent: PendingComponent,
  errorComponent: (props) => (
    <RouteErrorBoundary
      {...props}
      title="Character compendium failed to render"
      description="AniList didn't return the character data in time. Try again or switch routes via the sidebar."
    />
  ),
});

function CharactersRoute() {
  const navigate = useNavigate();
  const { data, isFetching } = useSuspenseQuery(
    trendingCharactersQueryOptions()
  );
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeCharacter, setActiveCharacter] = useState<
    CharacterCardData | undefined
  >();
  const [autoplayPlugin] = useState(() => Autoplay({ delay: 2000 }));

  const { q: searchQuery } = Route.useSearch();
  const normalizedSearchQuery = searchQuery ?? "";
  const plusUltraSearch = {
    to: "/search",
    search: () => ({
      q: normalizedSearchQuery || undefined,
      categories: "characters",
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
    ...searchCharacterQueryOptions(normalizedSearchQuery),
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
        (item) => [item.name, item.nativeName],
        { limit: 6 }
      ),
    [searchResults, normalizedSearchQuery]
  );

  const searchDescription = searchTotal
    ? `${searchTotal} personas fit this query. Send this link to share the context.`
    : "Search by name, alias, or romaji to surface just the right hero.";
  const errorDescription =
    searchError instanceof Error
      ? searchError.message
      : "Rate limits or invalid filters stopped this query.";

  const handleSelect = (character: CharacterCardData) => {
    setActiveCharacter(character);
    setIsPanelOpen(true);
  };

  const handleClearSearch = () => {
    navigate({
      to: "/characters",
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
        <div className="absolute left-10 top-16 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute bottom-8 right-12 h-72 w-72 rounded-full bg-pink-500/15 blur-[160px]" />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
        {!shouldShowSearch ? (
          <SearchPlusUltraCallout
            action={
              <Button asChild className="rounded-full">
                <Link {...plusUltraSearch}>Go for Characters</Link>
              </Button>
            }
          />
        ) : null}
        {shouldShowSearch ? (
          <SearchResultsPanel
            heading={`Character hits for "${normalizedSearchQuery}"`}
            description={searchDescription}
            isSearching={isSearching}
            showSkeleton={showSkeleton}
            skeleton={<CharacterGridSkeleton />}
            isError={Boolean(searchQuery) && isSearchError}
            errorTitle="AniList search failed"
            errorDescription={errorDescription}
            showEmpty={Boolean(searchQuery) && showEmptyState}
            emptyTitle={`Couldn't find "${normalizedSearchQuery}"`}
            emptyDescription="Try alternate spellings or clear the filter to browse trending favorites."
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
              <CharacterGrid items={items} onSelect={handleSelect} />
            )}
            suggestions={
              relatedSuggestions.length
                ? {
                    heading: "Maybe you meant",
                    items: relatedSuggestions,
                    getLabel: (item) => item.name,
                    onSelect: (item) =>
                      navigate({
                        to: "/characters",
                        search: (prev) => ({
                          ...(prev ?? {}),
                          q: item.name,
                        }),
                      }),
                  }
                : undefined
            }
          />
        ) : spotlightItems.length ? (
          <section className="space-y-4">
            <Carousel
              className="overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-[0_45px_120px_rgba(0,0,0,0.55)] md:h-[520px]"
              opts={{ loop: true }}
              plugins={[autoplayPlugin]}
            >
              <CarouselContent className="md:h-full">
                {spotlightItems.map((spotlight) => (
                  <CarouselItem key={spotlight.id} className="md:h-full">
                    <article className="relative overflow-hidden rounded-2xl md:h-full">
                      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/20" />
                      <div className="relative grid gap-10 px-8 py-10 md:h-full md:grid-cols-[minmax(0,1fr)_320px] md:px-12 md:py-14">
                        <div className="space-y-5 text-white">
                          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-white/70">
                            <Sparkles className="h-4 w-4" />
                            Character spotlight
                          </p>
                          <h1 className="text-3xl font-black leading-tight md:text-4xl">
                            {spotlight.name}
                          </h1>
                          <p className="text-sm text-white/80 md:text-base line-clamp-5">
                            {spotlight.description ??
                              "From cult favorites to chart-topping leads—meet AniList’s most beloved characters in real time."}
                          </p>

                          <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.35em] text-white/80">
                            {spotlight.appearances
                              .slice(0, 3)
                              .map((appearance) => (
                                <span
                                  key={appearance.id}
                                  className="rounded-full border border-white/20 bg-white/10 px-4 py-1"
                                >
                                  {appearance.title}
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
                              <Heart className="h-5 w-5" />
                              Open full profile
                            </Button>

                            <Button
                              type="button"
                              variant="ghost"
                              className="rounded-2xl border border-white/20 px-6 py-5 text-base text-white hover:bg-white/10"
                              data-carousel-interactive="true"
                              onClick={shuffleSpotlights}
                            >
                              <Star className="h-5 w-5" />
                              Shuffle spotlight
                            </Button>
                          </div>
                        </div>

                        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                          <Image
                            src={spotlight.image}
                            alt={spotlight.name}
                            width={600}
                            height={800}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                          <div className="absolute bottom-4 left-4 flex gap-2 text-xs uppercase tracking-[0.35em] text-white/80">
                            {spotlight.gender ? (
                              <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1">
                                {spotlight.gender}
                              </span>
                            ) : null}
                            {spotlight.age ? (
                              <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1">
                                Age {spotlight.age}
                              </span>
                            ) : null}
                            {spotlight.favorites ? (
                              <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1">
                                {Intl.NumberFormat("en", {
                                  notation: "compact",
                                }).format(spotlight.favorites)}{" "}
                                favs
                              </span>
                            ) : null}
                          </div>
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
                AniList Character Index
              </p>
              <h2 className="mt-2 text-3xl font-bold">
                {shouldShowSearch
                  ? "Or keep browsing beloved icons"
                  : "Your favorite voices, all in one canon"}
              </h2>
            </div>
            {isFetching ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-xs uppercase tracking-[0.35em] text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Updating
              </span>
            ) : null}
          </div>

          <CharacterGrid items={data.items} onSelect={handleSelect} />
        </section>
      </div>

      <CharacterDetailPanel
        character={activeCharacter}
        open={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </main>
  );
}
