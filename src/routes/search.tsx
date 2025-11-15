import {
  keepPreviousData,
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertCircle, RefreshCw, Search as SearchIcon } from "lucide-react";
import { type ReactNode } from "react";
import { z } from "zod";

import { CharacterGrid, CharacterGridSkeleton } from "@/components/characters/character-grid";
import { RouteErrorBoundary } from "@/components/helpers/RouteErrorBoundary";
import { MediaGrid, MediaGridSkeleton } from "@/components/media/media-grid";
import { Button } from "@/components/ui/button";
import { fetchAnimeSearch } from "@/data/queries/anime";
import { fetchCharacterSearch } from "@/data/queries/characters";
import { fetchMangaSearch } from "@/data/queries/manga";
import {
  getSearchCategoryLabel,
  SEARCH_CATEGORY_VALUES,
  type SearchCategory,
} from "@/lib/constants/search";

const OVERVIEW_PAGE_SIZE = 6;

const searchSchema = z.object({
  q: z
    .string()
    .trim()
    .max(60, "Search queries are capped at 60 characters")
    .optional()
    .transform((value) => (value && value.length ? value : undefined)),
  category: z.enum(SEARCH_CATEGORY_VALUES).optional(),
});

const animeOverviewQueryOptions = (query: string) => ({
  queryKey: ["search", "overview", "anime", query],
  queryFn: () => fetchAnimeSearch(query, 1, OVERVIEW_PAGE_SIZE),
  staleTime: 1000 * 60 * 2,
  placeholderData: keepPreviousData,
});

const mangaOverviewQueryOptions = (query: string) => ({
  queryKey: ["search", "overview", "manga", query],
  queryFn: () => fetchMangaSearch(query, 1, OVERVIEW_PAGE_SIZE),
  staleTime: 1000 * 60 * 2,
  placeholderData: keepPreviousData,
});

const characterOverviewQueryOptions = (query: string) => ({
  queryKey: ["search", "overview", "characters", query],
  queryFn: () => fetchCharacterSearch(query, 1, OVERVIEW_PAGE_SIZE),
  staleTime: 1000 * 60 * 2,
  placeholderData: keepPreviousData,
});

export const Route = createFileRoute("/search")({
  validateSearch: (search) => searchSchema.parse(search ?? {}),
  loader: ({ context, search }) => {
    const resolvedSearch = searchSchema.parse(search ?? {});

    if (!resolvedSearch.q) return null;

    const categoriesToPreload: SearchCategory[] = resolvedSearch.category
      ? [resolvedSearch.category]
      : [...SEARCH_CATEGORY_VALUES];
    const tasks: Array<Promise<unknown>> = [];

    for (const category of categoriesToPreload) {
      if (category === "anime") {
        tasks.push(
          context.queryClient.ensureQueryData(
            animeOverviewQueryOptions(resolvedSearch.q),
          ),
        );
      } else if (category === "manga") {
        tasks.push(
          context.queryClient.ensureQueryData(
            mangaOverviewQueryOptions(resolvedSearch.q),
          ),
        );
      } else {
        tasks.push(
          context.queryClient.ensureQueryData(
            characterOverviewQueryOptions(resolvedSearch.q),
          ),
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
  const { q, category } = Route.useSearch();
  const navigate = useNavigate();
  const normalizedQuery = q ?? "";
  const hasQuery = Boolean(normalizedQuery);
  const normalizedCategory = category ?? null;
  const scopedCategoryLabel = normalizedCategory
    ? getSearchCategoryLabel(normalizedCategory)
    : null;
  const showAnimeScope =
    !normalizedCategory || normalizedCategory === "anime";
  const showMangaScope =
    !normalizedCategory || normalizedCategory === "manga";
  const showCharacterScope =
    !normalizedCategory || normalizedCategory === "characters";
  const headerTitle = hasQuery
    ? normalizedCategory
      ? `${scopedCategoryLabel ?? normalizedCategory} hits for "${normalizedQuery}"`
      : `All hits for "${normalizedQuery}"`
    : "Search everything";
  const headerDescription = hasQuery
    ? normalizedCategory
      ? `Locked on ${(scopedCategoryLabel ?? normalizedCategory).toLowerCase()} only. Toggle the chips to widen the search.`
      : "We aggregate the strongest anime, manga, and character matches before you dive deeper."
    : "Use the hero search bar (⌘+K) or the chips at the top of the home page to get started.";

  const animeQuery = useQuery({
    ...animeOverviewQueryOptions(normalizedQuery),
    enabled: hasQuery && showAnimeScope,
  });

  const mangaQuery = useQuery({
    ...mangaOverviewQueryOptions(normalizedQuery),
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
    <main className="relative min-h-screen px-4 py-10 md:px-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-50"
      >
        <div className="absolute left-16 top-10 h-80 w-80 rounded-full bg-primary/10 blur-[150px]" />
        <div className="absolute bottom-10 right-8 h-64 w-64 rounded-full bg-rose-500/15 blur-[160px]" />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="rounded-[36px] border border-border/60 bg-card/80 p-6 shadow-[0_45px_120px_rgba(0,0,0,0.55)]">
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
                render={(items) => <MediaGrid items={items} />}
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
                render={(items) => <MediaGrid items={items} />}
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
                render={(items) => <CharacterGrid items={items} />}
              />
            ) : null}
          </div>
        ) : (
          <div className="rounded-[36px] border border-dashed border-border/60 bg-background/30 p-10 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-border/60 bg-card/60">
              <SearchIcon className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold">Start typing to explore everything</h2>
            <p className="mt-2 text-muted-foreground">
              Pick a category chip on the home hero search to lock the scope or leave it open to query all content types here.
            </p>
          </div>
        )}
      </div>
    </main>
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
    <section className="space-y-6 rounded-[36px] border border-border/60 bg-card/70 p-6 shadow-[0_35px_90px_rgba(0,0,0,0.5)]">
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
              <Button type="button" onClick={() => refetch()}>Retry</Button>
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
          <p className="mt-2 text-sm text-muted-foreground">{emptyDescription}</p>
        </div>
      ) : null}

      {showResults ? render(items) : null}
    </section>
  );
}
