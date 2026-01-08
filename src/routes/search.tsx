import {
  keepPreviousData,
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertCircle, RefreshCw, Search as SearchIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { z } from "zod";

import type { CharacterCardData } from "@/components/characters/character-card";
import { CharacterDetailPanel } from "@/components/characters/character-detail-panel";
import {
  CharacterGrid,
  CharacterGridSkeleton,
} from "@/components/characters/character-grid";
import { RouteErrorBoundary } from "@/components/helpers/RouteErrorBoundary";
import {
  MediaDetailPanel,
  type MediaDetailData,
} from "@/components/media/media-detail-panel";
import { MediaGrid, MediaGridSkeleton } from "@/components/media/media-grid";
import { SearchPlusUltraPanel } from "@/components/search/search-plus-ultra";
import { Button } from "@/components/ui/button";
import { fetchAnimeSearch } from "@/data/queries/anime";
import { fetchCharacterSearch } from "@/data/queries/characters";
import { fetchMangaSearch } from "@/data/queries/manga";
import { useWatchlistAdd } from "@/hooks/use-watchlist-add";
import {
  getSearchCategoryLabel,
  SEARCH_ANIME_FORMAT_VALUES,
  SEARCH_CATEGORY_VALUES,
  SEARCH_MANGA_FORMAT_VALUES,
  SEARCH_MEDIA_FORMAT_VALUES,
  SEARCH_SEASON_VALUES,
  sortSearchCategories,
  type SearchCategory,
  type SearchMediaFormat,
  type SearchSeason,
} from "@/lib/constants/search";

const OVERVIEW_PAGE_SIZE = 6;

type SearchFilters = {
  format?: SearchMediaFormat;
  season?: SearchSeason;
  year?: number;
};

const searchSchema = z.object({
  q: z
    .string()
    .trim()
    .max(60, "Search queries are capped at 60 characters")
    .optional()
    .transform((value) => (value && value.length ? value : undefined)),
  categories: z
    .union([
      z.enum(SEARCH_CATEGORY_VALUES),
      z.array(z.enum(SEARCH_CATEGORY_VALUES)),
    ])
    .optional()
    .transform((value) => {
      if (!value) return [] as SearchCategory[];
      const list = Array.isArray(value) ? value : [value];
      return sortSearchCategories(list);
    }),
  format: z.enum(SEARCH_MEDIA_FORMAT_VALUES).optional(),
  season: z.enum(SEARCH_SEASON_VALUES).optional(),
  year: z.preprocess((value) => {
    if (value === undefined || value === null || value === "") return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, z.number().int().min(1940).max(2100).optional()),
});

const animeOverviewQueryOptions = (query: string, filters: SearchFilters) => {
  const isAnimeFormat =
    filters.format && SEARCH_ANIME_FORMAT_VALUES.includes(filters.format);
  const resolvedFormat = isAnimeFormat ? filters.format : undefined;

  return {
    queryKey: [
      "search",
      "overview",
      "anime",
      query,
      resolvedFormat ?? null,
      filters.season ?? null,
      filters.year ?? null,
    ],
    queryFn: () =>
      fetchAnimeSearch(query, 1, OVERVIEW_PAGE_SIZE, {
        format: resolvedFormat,
        season: filters.season,
        seasonYear: filters.year,
      }),
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
  };
};

const mangaOverviewQueryOptions = (query: string, filters: SearchFilters) => {
  const isMangaFormat =
    filters.format && SEARCH_MANGA_FORMAT_VALUES.includes(filters.format);
  const resolvedFormat = isMangaFormat ? filters.format : undefined;

  return {
    queryKey: ["search", "overview", "manga", query, resolvedFormat ?? null],
    queryFn: () =>
      fetchMangaSearch(query, 1, OVERVIEW_PAGE_SIZE, {
        format: resolvedFormat,
      }),
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
  };
};

const characterOverviewQueryOptions = (query: string) => ({
  queryKey: ["search", "overview", "characters", query],
  queryFn: () => fetchCharacterSearch(query, 1, OVERVIEW_PAGE_SIZE),
  staleTime: 1000 * 60 * 2,
  placeholderData: keepPreviousData,
});

function withLegacyCategorySupport(
  search: Record<string, unknown> | null | undefined
) {
  if (!search) return undefined;
  if ("categories" in search || !("category" in search)) return search;

  const { category, ...rest } = search as {
    category?: unknown;
  } & Record<string, unknown>;

  return {
    ...rest,
    categories: category,
  };
}

function formatCategoryList(
  categories: SearchCategory[],
  options: { lowercase?: boolean } = {}
) {
  const labels = categories.map((category) => {
    const label = getSearchCategoryLabel(category);
    return options.lowercase ? label.toLowerCase() : label;
  });

  if (!labels.length) return "";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;

  const leading = labels.slice(0, -1).join(", ");
  const trailing = labels[labels.length - 1];
  return `${leading}, and ${trailing}`;
}

export const Route = createFileRoute("/search")({
  validateSearch: (search) =>
    searchSchema.parse(withLegacyCategorySupport(search) ?? {}),
  loader: ({ context, search }) => {
    const resolvedSearch = searchSchema.parse(
      withLegacyCategorySupport(search) ?? {}
    );

    if (!resolvedSearch.q) return null;

    const categoriesToPreload: SearchCategory[] = resolvedSearch.categories
      .length
      ? resolvedSearch.categories
      : [...SEARCH_CATEGORY_VALUES];
    const filters: SearchFilters = {
      format: resolvedSearch.format,
      season: resolvedSearch.season,
      year: resolvedSearch.year,
    };
    const tasks: Array<Promise<unknown>> = [];

    for (const category of categoriesToPreload) {
      if (category === "anime") {
        tasks.push(
          context.queryClient.ensureQueryData(
            animeOverviewQueryOptions(resolvedSearch.q, filters)
          )
        );
      } else if (category === "manga") {
        tasks.push(
          context.queryClient.ensureQueryData(
            mangaOverviewQueryOptions(resolvedSearch.q, filters)
          )
        );
      } else {
        tasks.push(
          context.queryClient.ensureQueryData(
            characterOverviewQueryOptions(resolvedSearch.q)
          )
        );
      }
    }

    return Promise.all(tasks);
  },
  component: SearchRoute,
  errorComponent: (props) => (
    <RouteErrorBoundary
      {...props}
      title="Search systems failed to boot"
      description="AniList didn't respond in time. Jump to a sidebar route or retry shortly."
    />
  ),
});

function SearchRoute() {
  const { q, categories, format, season, year } = Route.useSearch();
  const navigate = useNavigate();
  const [activeMedia, setActiveMedia] = useState<
    | { kind: "ANIME"; media: MediaDetailData }
    | { kind: "MANGA"; media: MediaDetailData }
    | null
  >(null);
  const [isMediaPanelOpen, setIsMediaPanelOpen] = useState(false);
  const [activeCharacter, setActiveCharacter] =
    useState<CharacterCardData | null>(null);
  const [isCharacterPanelOpen, setIsCharacterPanelOpen] = useState(false);
  const animeWatchlist = useWatchlistAdd({
    kind: "ANIME",
    activeMediaId:
      activeMedia?.kind === "ANIME" ? activeMedia.media.id : undefined,
  });
  const mangaWatchlist = useWatchlistAdd({
    kind: "MANGA",
    activeMediaId:
      activeMedia?.kind === "MANGA" ? activeMedia.media.id : undefined,
  });
  const normalizedQuery = q ?? "";
  const hasQuery = Boolean(normalizedQuery);
  const normalizedCategories = categories ?? [];
  const filters: SearchFilters = { format, season, year };
  const scopedCategories =
    normalizedCategories.length === SEARCH_CATEGORY_VALUES.length
      ? []
      : normalizedCategories;
  const hasScopedCategories = scopedCategories.length > 0;
  const scopedCategoryLabel = hasScopedCategories
    ? formatCategoryList(scopedCategories)
    : null;
  const scopedCategoryLabelLowercase = hasScopedCategories
    ? formatCategoryList(scopedCategories, { lowercase: true })
    : null;
  const showAnimeScope =
    !hasScopedCategories || scopedCategories.includes("anime");
  const showMangaScope =
    !hasScopedCategories || scopedCategories.includes("manga");
  const showCharacterScope =
    !hasScopedCategories || scopedCategories.includes("characters");
  const headerTitle = hasQuery
    ? hasScopedCategories
      ? `${scopedCategoryLabel} hits for "${normalizedQuery}"`
      : `All hits for "${normalizedQuery}"`
    : "Search everything";
  const headerDescription = hasQuery
    ? hasScopedCategories
      ? `Locked on ${scopedCategoryLabelLowercase} only. Toggle the chips to widen the search.`
      : "We aggregate the strongest anime, manga, and character matches before you dive deeper."
    : "Use the hero search bar (Cmd/Ctrl+K) or the Search Plus Ultra scope chips to get started.";

  const updateSearchParams = (updates: {
    categories?: SearchCategory[];
    format?: SearchMediaFormat | null;
    season?: SearchSeason | null;
    year?: number | null;
  }) => {
    navigate({
      to: "/search",
      search: (prev) => {
        const next = { ...(prev ?? {}) } as Record<string, unknown>;

        if ("categories" in updates) {
          const nextCategories = updates.categories ?? [];
          if (nextCategories.length) {
            next.categories =
              nextCategories.length === 1 ? nextCategories[0] : nextCategories;
          } else {
            delete next.categories;
          }
        }

        if ("format" in updates) {
          if (updates.format) {
            next.format = updates.format;
          } else {
            delete next.format;
          }
        }

        if ("season" in updates) {
          if (updates.season) {
            next.season = updates.season;
          } else {
            delete next.season;
          }
        }

        if ("year" in updates) {
          if (typeof updates.year === "number") {
            next.year = updates.year;
          } else {
            delete next.year;
          }
        }

        delete (next as { category?: unknown }).category;

        return next;
      },
    });
  };

  const handleScopeChange = (value: SearchCategory | "all") => {
    if (value === "all") {
      updateSearchParams({ categories: [] });
      return;
    }

    const nextSet = new Set(scopedCategories);

    if (nextSet.has(value)) {
      nextSet.delete(value);
    } else {
      nextSet.add(value);
    }

    let nextCategories = sortSearchCategories(nextSet);

    if (nextCategories.length === SEARCH_CATEGORY_VALUES.length) {
      nextCategories = [];
    }

    updateSearchParams({ categories: nextCategories });
  };

  const handleFormatChange = (nextFormat?: SearchMediaFormat) =>
    updateSearchParams({ format: nextFormat ?? null });

  const handleSeasonChange = (nextSeason?: SearchSeason) =>
    updateSearchParams({ season: nextSeason ?? null });

  const handleYearChange = (nextYear?: number) =>
    updateSearchParams({ year: nextYear ?? null });

  const handleClearFilters = () =>
    updateSearchParams({
      categories: [],
      format: null,
      season: null,
      year: null,
    });

  const animeQuery = useQuery({
    ...animeOverviewQueryOptions(normalizedQuery, filters),
    enabled: hasQuery && showAnimeScope,
  });

  const mangaQuery = useQuery({
    ...mangaOverviewQueryOptions(normalizedQuery, filters),
    enabled: hasQuery && showMangaScope,
  });

  const charactersQuery = useQuery({
    ...characterOverviewQueryOptions(normalizedQuery),
    enabled: hasQuery && showCharacterScope,
  });

  const handleClear = () =>
    navigate({
      to: "/search",
      search: () => ({}),
    });

  const handleSelectAnime = (media: MediaDetailData) => {
    setActiveMedia({ kind: "ANIME", media });
    setIsMediaPanelOpen(true);
  };

  const handleSelectManga = (media: MediaDetailData) => {
    setActiveMedia({ kind: "MANGA", media });
    setIsMediaPanelOpen(true);
  };

  const handleSelectCharacter = (character: CharacterCardData) => {
    setActiveCharacter(character);
    setIsCharacterPanelOpen(true);
  };

  const closeMediaPanel = () => setIsMediaPanelOpen(false);
  const closeCharacterPanel = () => setIsCharacterPanelOpen(false);

  const activeWatchlist =
    activeMedia?.kind === "ANIME"
      ? animeWatchlist
      : activeMedia?.kind === "MANGA"
      ? mangaWatchlist
      : undefined;

  const viewAnime = () =>
    navigate({
      to: "/anime",
      search: (prev) => ({ ...(prev ?? {}), q: normalizedQuery || undefined }),
    });
  const viewManga = () =>
    navigate({
      to: "/manga",
      search: (prev) => ({ ...(prev ?? {}), q: normalizedQuery || undefined }),
    });
  const viewCharacters = () =>
    navigate({
      to: "/characters",
      search: (prev) => ({ ...(prev ?? {}), q: normalizedQuery || undefined }),
    });

  const animeTotal = animeQuery.data?.pageInfo.total ?? 0;
  const mangaTotal = mangaQuery.data?.pageInfo.total ?? 0;
  const characterTotal = charactersQuery.data?.pageInfo.total ?? 0;

  return (
    <>
      <main className="relative min-h-screen px-4 py-10 md:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-50"
        >
          <div className="absolute left-16 top-10 h-80 w-80 rounded-full bg-primary/10 blur-[150px]" />
          <div className="absolute bottom-10 right-8 h-64 w-64 rounded-full bg-rose-500/15 blur-[160px]" />
        </div>

        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
          <SearchPlusUltraPanel
            categories={scopedCategories}
            format={format}
            season={season}
            year={year}
            onScopeChange={handleScopeChange}
            onFormatChange={handleFormatChange}
            onSeasonChange={handleSeasonChange}
            onYearChange={handleYearChange}
            onClearFilters={handleClearFilters}
          />
          <header className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-(--shadow-immersive)">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              Cinematic discovery
            </p>
            <h1 className="mt-3 text-3xl font-bold">{headerTitle}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {headerDescription}
            </p>
            {hasQuery ? (
              <div className="mt-4 flex flex-wrap gap-3">
                <Button type="button" variant="outline" onClick={handleClear}>
                  Clear query
                </Button>
              </div>
            ) : null}
          </header>

          {hasQuery ? (
            <div className="flex flex-col gap-8">
              {showAnimeScope ? (
                <CategorySection
                  label="Anime"
                  title="Animated epics"
                  description={
                    animeTotal
                      ? `${animeTotal} titles match this energy — here are the top ones.`
                      : "We will surface the closest anime matches once AniList responds."
                  }
                  queryResult={animeQuery}
                  skeleton={<MediaGridSkeleton />}
                  emptyTitle="No anime matched this search"
                  emptyDescription="Try a different spelling or pivot to a new format."
                  onViewAll={viewAnime}
                  viewAllLabel="View all anime"
                  render={(items) => (
                    <MediaGrid items={items} onSelect={handleSelectAnime} />
                  )}
                />
              ) : null}

              {showMangaScope ? (
                <CategorySection
                  label="Manga"
                  title="Printed legends"
                  description={
                    mangaTotal
                      ? `${mangaTotal} manga showed up for this query.`
                      : "We'll pull in manga hits the moment AniList shares them."
                  }
                  queryResult={mangaQuery}
                  skeleton={<MediaGridSkeleton />}
                  emptyTitle="No manga surfaced"
                  emptyDescription="Tweak the query or head straight to the manga route for deeper filters."
                  onViewAll={viewManga}
                  viewAllLabel="View all manga"
                  render={(items) => (
                    <MediaGrid items={items} onSelect={handleSelectManga} />
                  )}
                />
              ) : null}

              {showCharacterScope ? (
                <CategorySection
                  label="Characters"
                  title="Icons & personas"
                  description={
                    characterTotal
                      ? `${characterTotal} character profiles fit this vibe.`
                      : "AniList is searching character bios for matching names."
                  }
                  queryResult={charactersQuery}
                  skeleton={<CharacterGridSkeleton />}
                  emptyTitle="Nobody matched"
                  emptyDescription="Double-check spellings or open the characters view for advanced filters."
                  onViewAll={viewCharacters}
                  viewAllLabel="View all characters"
                  render={(items) => (
                    <CharacterGrid
                      items={items}
                      onSelect={handleSelectCharacter}
                    />
                  )}
                />
              ) : null}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/60 bg-background/30 p-10 text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-border/60 bg-card/60">
                <SearchIcon className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="mt-6 text-2xl font-semibold">
                Start typing to explore everything
              </h2>
              <p className="mt-2 text-muted-foreground">
                Pick a category chip on the home hero search to lock the scope
                or leave it open to query all content types here.
              </p>
            </div>
          )}
        </div>
      </main>

      <MediaDetailPanel
        media={activeMedia?.media}
        open={isMediaPanelOpen}
        onClose={closeMediaPanel}
        onAddToWatchlist={activeWatchlist?.onAddToWatchlist}
        addLabel={activeWatchlist?.addLabel}
        addHelperText={activeWatchlist?.addHelperText}
        addIsLoading={activeWatchlist?.addIsLoading}
      />

      <CharacterDetailPanel
        character={activeCharacter ?? undefined}
        open={isCharacterPanelOpen}
        onClose={closeCharacterPanel}
      />
    </>
  );
}

interface CategorySectionProps {
  label: string;
  title: string;
  description: string;
  queryResult: UseQueryResult<any, Error>;
  skeleton: ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  onViewAll: () => void;
  viewAllLabel: string;
  render: (items: any[]) => ReactNode;
}

function CategorySection({
  label,
  title,
  description,
  queryResult,
  skeleton,
  emptyTitle,
  emptyDescription,
  onViewAll,
  viewAllLabel,
  render,
}: CategorySectionProps) {
  const { data, status, isError, error, refetch, isFetching } = queryResult;
  const showSkeleton = status === "pending" && !data;
  const items = (data?.items ?? []) as any[];
  const showResults = items.length > 0;
  const showEmpty = Boolean(data) && !showSkeleton && !isError && !showResults;
  const errorMessage =
    error instanceof Error
      ? error.message
      : "AniList couldn't respond fast enough. Retry in a moment.";

  return (
    <section className="space-y-6 rounded-2xl border border-border/60 bg-card/70 p-6 shadow-(--shadow-elevated)">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            {label}
          </p>
          <h3 className="mt-2 text-2xl font-bold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isFetching ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-xs uppercase tracking-[0.35em] text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Fetching
            </span>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl"
            onClick={onViewAll}
          >
            {viewAllLabel}
          </Button>
        </div>
      </div>

      {showSkeleton ? skeleton : null}

      {isError ? (
        <div className="rounded-3xl border border-destructive/40 bg-destructive/5 p-5 text-destructive">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5" />
              <div>
                <h4 className="text-lg font-semibold text-foreground">
                  Could not load {label.toLowerCase()} results
                </h4>
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="button" onClick={() => refetch()}>
                Retry
              </Button>
              <Button type="button" variant="outline" onClick={onViewAll}>
                Go to {label}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {showEmpty ? (
        <div className="rounded-3xl border border-border/60 bg-background/40 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-border/60">
            <SearchIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <h4 className="mt-4 text-xl font-semibold">{emptyTitle}</h4>
          <p className="mt-2 text-sm text-muted-foreground">
            {emptyDescription}
          </p>
        </div>
      ) : null}

      {showResults ? render(items) : null}
    </section>
  );
}
