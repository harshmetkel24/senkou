import { keepPreviousData, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertCircle, Heart, RefreshCw, Search as SearchIcon, Sparkles, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";

import { RouteErrorBoundary } from "@/components/helpers/RouteErrorBoundary";
import type { CharacterCardData } from "@/components/characters/character-card";
import { CharacterDetailPanel } from "@/components/characters/character-detail-panel";
import { CharacterGrid, CharacterGridSkeleton } from "@/components/characters/character-grid";
import { Button } from "@/components/ui/button";
import { fetchCharacterSearch, fetchTrendingCharacters } from "@/data/queries/characters";
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
          searchCharacterQueryOptions(resolvedSearch.q),
        ),
      );
    }

    return Promise.all(tasks);
  },
  component: CharactersRoute,
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
    trendingCharactersQueryOptions(),
  );
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeCharacter, setActiveCharacter] = useState<
    CharacterCardData | undefined
  >();

  const { q: searchQuery } = Route.useSearch();
  const normalizedSearchQuery = searchQuery ?? "";
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

  const spotlight = useMemo(() => data.items[0], [data.items]);
  const searchResults = searchData?.items ?? [];
  const searchTotal = searchData?.pageInfo.total ?? 0;
  const showSkeleton =
    shouldShowSearch && searchStatus === "pending" && !searchData;
  const showSearchResults =
    shouldShowSearch && !showSkeleton && !isSearchError && searchResults.length > 0;
  const showEmptyState =
    shouldShowSearch && !showSkeleton && !isSearchError && searchResults.length === 0;

  const { visible: curatedResults, suggestions: relatedSuggestions } = useMemo(
    () =>
      deriveRelatedResults(
        searchResults,
        normalizedSearchQuery,
        (item) => [item.name, item.nativeName],
        { limit: 6 },
      ),
    [searchResults, normalizedSearchQuery],
  );

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
        {shouldShowSearch ? (
          <section className="space-y-6 rounded-[36px] border border-border/60 bg-card/80 p-6 shadow-[0_45px_120px_rgba(0,0,0,0.55)] md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                  AniList search
                </p>
                <h2 className="mt-2 text-3xl font-bold">
                  Character hits for "{normalizedSearchQuery}"
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchTotal
                    ? `${searchTotal} personas fit this query. Send this link to share the context.`
                    : "Search by name, alias, or romaji to surface just the right hero."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {isSearching ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-xs uppercase tracking-[0.35em] text-muted-foreground">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Updating
                  </span>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-2xl border border-border/60"
                  onClick={handleClearSearch}
                >
                  Clear search
                </Button>
              </div>
            </div>

            {showSkeleton ? <CharacterGridSkeleton /> : null}

            {isSearchError && searchQuery ? (
              <div className="rounded-3xl border border-destructive/40 bg-destructive/5 p-6 text-destructive">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        AniList search failed
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {searchError instanceof Error
                          ? searchError.message
                          : "Rate limits or invalid filters stopped this query."}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" onClick={() => refetchSearch()}>
                      Retry search
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClearSearch}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}

            {showEmptyState && searchQuery ? (
              <div className="rounded-3xl border border-border/60 bg-background/40 p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-border/80 bg-card/50">
                  <SearchIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-2xl font-semibold">
                  Couldn't find "{normalizedSearchQuery}"
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try alternate spellings or clear the filter to browse trending favorites.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Button type="button" onClick={() => refetchSearch()}>
                    Try again
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearSearch}
                  >
                    Clear search
                  </Button>
                </div>
              </div>
            ) : null}

            {showSearchResults ? (
              <CharacterGrid items={curatedResults} onSelect={handleSelect} />
            ) : null}

            {relatedSuggestions.length ? (
              <div className="rounded-3xl border border-border/50 bg-background/40 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                  Maybe you meant
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {relatedSuggestions.map((item) => (
                    <Button
                      key={item.id}
                      variant="outline"
                      size="sm"
                      className="rounded-full border-border/70"
                      onClick={() =>
                        navigate({
                          to: "/characters",
                          search: (prev) => ({
                            ...(prev ?? {}),
                            q: item.name,
                          }),
                        })
                      }
                    >
                      {item.name}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        ) : spotlight ? (
          <section className="relative overflow-hidden rounded-[36px] border border-border/60 bg-card/80 shadow-[0_45px_120px_rgba(0,0,0,0.55)]">
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/25" />
            <div className="relative grid gap-10 px-8 py-10 md:grid-cols-[minmax(0,1fr)_320px] md:px-12 md:py-14">
              <div className="space-y-5 text-white">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-white/70">
                  <Sparkles className="h-4 w-4" />
                  Character spotlight
                </p>
                <h1 className="text-3xl font-black leading-tight md:text-4xl">
                  {spotlight.name}
                </h1>
                <p className="text-sm text-white/80 md:text-base">
                  {spotlight.description ??
                    "From cult favorites to chart-topping leads—meet AniList’s most beloved characters in real time."}
                </p>

                <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.35em] text-white/80">
                  {spotlight.appearances.slice(0, 3).map((appearance) => (
                    <span
                      key={appearance.id}
                      className="rounded-full border border-white/20 bg-white/10 px-4 py-1"
                    >
                      {appearance.title}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4">
                  <Button
                    type="button"
                    className="rounded-2xl bg-primary/90 px-6 py-5 text-base"
                    onClick={() => handleSelect(spotlight)}
                  >
                    <Heart className="h-5 w-5" />
                    Open full profile
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-2xl border border-white/20 px-6 py-5 text-base text-white hover:bg-white/10"
                  >
                    <Star className="h-5 w-5" />
                    Shuffle spotlight
                  </Button>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black/40">
                <img
                  src={spotlight.image}
                  alt={spotlight.name}
                  className="h-full w-full object-cover"
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
