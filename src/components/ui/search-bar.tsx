import { useQuery } from "@tanstack/react-query";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import debounce from "lodash/debounce";
import { AlertCircle, RefreshCw, Search as SearchIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useSidebar } from "@/components/contexts/SidebarContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  decodeSearchCategoriesParam,
  SEARCH_CATEGORIES,
  sortSearchCategories,
  type SearchCategory,
} from "@/lib/constants/search";
import {
  fetchSearchAutocomplete,
  type SearchAutocompleteGroup,
  type SearchAutocompleteItem,
  type SearchAutocompleteScope,
} from "@/lib/search-autocomplete";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  variant?: "header" | "hero";
  onQueryChange?: (value: string) => void;
  placeholderSuggestions?: string[];
}

const AUTOCOMPLETE_MIN_QUERY_LENGTH = 4;
const AUTOCOMPLETE_DEBOUNCE_MS = 350;
const HERO_PLACEHOLDER_ROTATE_MS = 2800;
const HERO_INPUT_TEXT_CLASS = "text-xl";
const HERO_PLACEHOLDER_FALLBACKS = [
  "Search One Piece...",
  "Search Frieren...",
  "Search Gojo Satoru...",
];

export function SearchBar({
  variant = "header",
  onQueryChange,
  placeholderSuggestions,
}: SearchBarProps) {
  const navigate = useNavigate();
  type RouterSearchState = {
    q?: string;
    categories?: SearchCategory[] | SearchCategory;
  };
  const locationState = useRouterState({
    select: (state) => ({
      pathname: state.location.pathname,
      search: state.location.search as RouterSearchState,
    }),
  });
  const locationQuery = locationState.search?.q ?? "";
  const locationCategories = useMemo(
    () => decodeSearchCategoriesParam(locationState.search?.categories),
    [locationState.search]
  );
  const [searchQuery, setSearchQuery] = useState(locationQuery);
  const [rawSelectedCategories, setRawSelectedCategories] =
    useState<SearchCategory[]>(locationCategories);
  const selectedCategories = rawSelectedCategories;
  const setSelectedCategories = useCallback(
    (
      value: SearchCategory[] | ((prev: SearchCategory[]) => SearchCategory[])
    ) => {
      setRawSelectedCategories((current) => {
        const nextValue = typeof value === "function" ? value(current) : value;
        return sortSearchCategories(nextValue);
      });
    },
    []
  );
  const shouldFocusSearch = useSidebar((state) => state.shouldFocusSearch);
  const setShouldFocusSearch = useSidebar(
    (state) => state.setShouldFocusSearch
  );

  const resolveSearchRoute = (pathname: string) => {
    if (pathname.startsWith("/manga")) return "/manga" as const;
    if (pathname.startsWith("/characters")) return "/characters" as const;
    if (pathname.startsWith("/search")) return "/search" as const;
    return "/anime" as const;
  };

  const isSearchRoute = locationState.pathname.startsWith("/search");
  const searchTarget = resolveSearchRoute(locationState.pathname);
  const showCategoryChips =
    variant === "hero" || searchTarget === "/search" ? true : false;
  const isHero = variant === "hero";
  const prefersReducedMotion = usePrefersReducedMotion();

  const [isInputFocused, setIsInputFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(() =>
    searchQuery.trim()
  );
  const debouncedUpdater = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearchQuery(value.trim());
      }, AUTOCOMPLETE_DEBOUNCE_MS),
    []
  );
  const normalizedDebouncedQuery = debouncedSearchQuery.trim();
  const autocompleteScope: SearchAutocompleteScope = showCategoryChips
    ? selectedCategories.length === 0
      ? "all"
      : selectedCategories.length === 1
      ? selectedCategories[0]
      : selectedCategories
    : searchTarget === "/manga"
    ? "manga"
    : searchTarget === "/characters"
    ? "characters"
    : "anime";
  const autocompleteEnabled = !isSearchRoute;
  const shouldFetchAutocomplete =
    autocompleteEnabled &&
    normalizedDebouncedQuery.length >= AUTOCOMPLETE_MIN_QUERY_LENGTH;

  const {
    data: autocompleteData,
    isFetching: isFetchingAutocomplete,
    isError: isAutocompleteError,
    error: autocompleteError,
  } = useQuery({
    queryKey: [
      "search",
      "autocomplete",
      autocompleteScope,
      normalizedDebouncedQuery,
    ],
    queryFn: () =>
      fetchSearchAutocomplete(normalizedDebouncedQuery, autocompleteScope),
    enabled: shouldFetchAutocomplete,
    staleTime: 1000 * 60 * 2,
  });

  const autocompleteGroups = autocompleteData?.groups ?? [];
  const hasAutocompleteResults = autocompleteGroups.length > 0;
  const showAutocomplete =
    autocompleteEnabled && isInputFocused && shouldFetchAutocomplete;
  const showAutocompleteEmptyState =
    showAutocomplete &&
    !isFetchingAutocomplete &&
    !isAutocompleteError &&
    !hasAutocompleteResults;
  const shouldRenderAutocompletePanel =
    autocompleteEnabled &&
    showAutocomplete &&
    (isFetchingAutocomplete ||
      isAutocompleteError ||
      hasAutocompleteResults ||
      showAutocompleteEmptyState);
  const autocompleteErrorMessage =
    autocompleteError instanceof Error
      ? autocompleteError.message
      : "AniList did not return suggestions. Try typing a different keyword.";
  const normalizedAutocompleteQuery =
    normalizedDebouncedQuery || searchQuery.trim();
  const heroPlaceholderOptions = useMemo(() => {
    if (!isHero) return HERO_PLACEHOLDER_FALLBACKS;
    const trimmed = (placeholderSuggestions ?? [])
      .map((value) => value.trim())
      .filter(Boolean);
    const unique = Array.from(new Set(trimmed));
    return unique.length > 0 ? unique : HERO_PLACEHOLDER_FALLBACKS;
  }, [isHero, placeholderSuggestions]);
  const heroPlaceholderKey = heroPlaceholderOptions.join("|");
  const activeHeroPlaceholder =
    heroPlaceholderOptions[0] ?? HERO_PLACEHOLDER_FALLBACKS[0];
  const hasHeroQuery = searchQuery.trim().length > 0;
  const showAnimatedPlaceholder =
    isHero &&
    !isInputFocused &&
    !hasHeroQuery &&
    heroPlaceholderOptions.length > 0 &&
    !prefersReducedMotion;
  const shouldRotatePlaceholder =
    showAnimatedPlaceholder && heroPlaceholderOptions.length > 1;

  useEffect(() => {
    setSearchQuery((current) =>
      current === locationQuery ? current : locationQuery
    );
  }, [locationQuery]);

  useEffect(() => {
    const trimmedLocation = locationQuery.trim();
    setDebouncedSearchQuery((current) =>
      current === trimmedLocation ? current : trimmedLocation
    );
  }, [locationQuery]);

  useEffect(() => {
    setSelectedCategories((current) =>
      areCategoryArraysEqual(current, locationCategories)
        ? current
        : locationCategories
    );
  }, [locationCategories, setSelectedCategories]);

  useEffect(() => {
    debouncedUpdater(searchQuery);
    return () => {
      debouncedUpdater.cancel();
    };
  }, [searchQuery, debouncedUpdater]);

  useEffect(() => {
    setPlaceholderIndex(0);
  }, [heroPlaceholderKey]);

  useEffect(() => {
    if (!shouldRotatePlaceholder) return;
    const interval = window.setInterval(() => {
      setPlaceholderIndex((current) =>
        heroPlaceholderOptions.length === 0
          ? 0
          : (current + 1) % heroPlaceholderOptions.length
      );
    }, HERO_PLACEHOLDER_ROTATE_MS);

    return () => window.clearInterval(interval);
  }, [heroPlaceholderOptions.length, shouldRotatePlaceholder]);

  const handleSuggestionSelect = (suggestion: SearchAutocompleteItem) => {
    const trimmedSuggestion = suggestion.title.trim();

    if (!trimmedSuggestion.length) return;

    setSearchQuery(trimmedSuggestion);
    onQueryChange?.(trimmedSuggestion);

    if (showCategoryChips) {
      setSelectedCategories([suggestion.category]);
    }

    const target = showCategoryChips ? "/search" : searchTarget;

    navigate({
      to: target as "/anime" | "/manga" | "/characters" | "/search",
      search: (prev) => {
        const next = { ...(prev ?? {}) } as Record<string, unknown>;
        next.q = trimmedSuggestion;

        if (showCategoryChips) {
          next.categories = encodeCategoriesParam([suggestion.category]);
        } else {
          delete next.categories;
        }

        delete (next as { category?: unknown }).category;

        return next;
      },
    });
  };

  const focusInputRefCallback = (node: HTMLInputElement | null) => {
    if (shouldFocusSearch) {
      node && node.focus();
      setShouldFocusSearch(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    const target = showCategoryChips ? "/search" : searchTarget;

    navigate({
      to: target as "/anime" | "/manga" | "/characters" | "/search",
      search: (prev) => {
        const next = { ...(prev ?? {}) } as Record<string, unknown>;
        next.q = trimmedQuery || undefined;

        if (showCategoryChips) {
          next.categories = encodeCategoriesParam(selectedCategories);
        } else {
          delete next.categories;
        }

        delete (next as { category?: unknown }).category;

        return next;
      },
    });
  };

  const defaultPlaceholderText = isSearchRoute
    ? "Type and press Enter to search (Cmd/Ctrl+K to focus)"
    : `Type ${AUTOCOMPLETE_MIN_QUERY_LENGTH} or more letters to see suggestions (Cmd/Ctrl+K to search)`;
  const heroPlaceholderText =
    heroPlaceholderOptions[placeholderIndex] ?? activeHeroPlaceholder;
  const placeholderText = isHero ? heroPlaceholderText : defaultPlaceholderText;

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl">
      <div className={cn("relative", isHero && "group")}>
        {isHero ? (
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-1 rounded-4xl bg-primary/10 opacity-0 blur-xl transition-opacity duration-300 group-focus-within:opacity-70 group-focus-within:animate-[pulse_3s_ease-in-out_infinite] motion-reduce:animate-none"
          />
        ) : null}
        <Input
          ref={focusInputRefCallback}
          type="text"
          placeholder={placeholderText}
          aria-label="Search"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            onQueryChange?.(e.target.value);
          }}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          className={cn(
            "relative z-10 px-8 rounded-4xl",
            isHero
              ? cn(
                  "py-6 border-2 shadow-lg focus:ring-4",
                  HERO_INPUT_TEXT_CLASS
                )
              : "py-6 text-base border focus:ring-2",
            "border-border bg-card/95 text-foreground placeholder-muted-foreground focus:ring-primary/50",
            showAnimatedPlaceholder && "placeholder:text-transparent"
          )}
        />
        {isHero && showAnimatedPlaceholder ? (
          <span
            key={`${placeholderIndex}-${heroPlaceholderText}`}
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-y-0 left-0 right-16 z-20 flex items-center px-8 text-muted-foreground/80 truncate",
              "animate-placeholder-swap motion-reduce:animate-none"
            )}
          >
            {heroPlaceholderText}
          </span>
        ) : null}

        <Button
          type="submit"
          size="icon"
          variant="outline"
          className={`absolute top-1/2 -translate-y-1/2 transform px-2 z-10 ${
            isHero ? "right-4 py-2" : "right-2 py-1 text-sm"
          } rounded-2xl`}
        >
          <SearchIcon />
        </Button>
        {shouldRenderAutocompletePanel ? (
          <SearchAutocompletePanel
            query={normalizedAutocompleteQuery}
            groups={autocompleteGroups}
            isLoading={isFetchingAutocomplete}
            isError={isAutocompleteError}
            errorMessage={autocompleteErrorMessage}
            showEmpty={showAutocompleteEmptyState}
            onSelect={handleSuggestionSelect}
          />
        ) : null}
      </div>
      {isHero && showCategoryChips ? (
        <div className="mt-4 flex justify-center">
          <CategoryChipGroup
            selected={selectedCategories}
            onChange={setSelectedCategories}
            className="justify-center"
          />
        </div>
      ) : null}
    </form>
  );
}

interface SearchAutocompletePanelProps {
  query: string;
  groups: SearchAutocompleteGroup[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  showEmpty: boolean;
  onSelect: (item: SearchAutocompleteItem) => void;
}

function SearchAutocompletePanel({
  query,
  groups,
  isLoading,
  isError,
  errorMessage,
  showEmpty,
  onSelect,
}: SearchAutocompletePanelProps) {
  const columnsClass =
    groups.length >= 3
      ? "lg:grid-cols-3"
      : groups.length === 2
      ? "lg:grid-cols-2"
      : "lg:grid-cols-1";

  return (
    <div
      className="absolute left-0 right-0 top-full z-30 mt-3"
      onMouseDown={(event) => event.preventDefault()}
    >
      <div className="space-y-4 rounded-3xl max-h-[450px] overflow-auto border border-border/60 bg-card/95 p-4 shadow-[0_35px_100px_rgba(0,0,0,0.55)] backdrop-blur">
        {isLoading ? (
          <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/70 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Searching
          </div>
        ) : null}

        {isError ? (
          <div className="flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive/5 p-4 text-destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm text-destructive">
              {errorMessage ?? "We couldn't fetch suggestions."}
            </p>
          </div>
        ) : null}

        {groups.length ? (
          <div className={cn("grid grid-cols-1 gap-4", columnsClass)}>
            {groups.map((group) => (
              <div key={group.category} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                  {group.label}
                </p>
                <div className="flex flex-col gap-2">
                  {group.items.map((item) => (
                    <button
                      key={`${group.category}-${item.id}`}
                      type="button"
                      className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/70 px-3 py-2 text-left transition hover:border-primary/60 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      onClick={() => onSelect(item)}
                    >
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-2xl bg-muted">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={`${item.title} cover art`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-full w-full bg-muted" />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <span className="text-sm font-semibold text-foreground line-clamp-1">
                          {item.title}
                        </span>
                        {item.subtitle ? (
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {item.subtitle}
                          </span>
                        ) : null}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {showEmpty ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-background/70 px-4 py-6 text-center">
            <SearchIcon className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">
              No results found for "{query}"
            </p>
            <p className="text-xs text-muted-foreground">
              Keep typing or try another keyword.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

interface CategoryChipGroupProps {
  selected: SearchCategory[];
  onChange: (value: SearchCategory[]) => void;
  allowClear?: boolean;
  className?: string;
  variant?: "default" | "inline";
}

export function CategoryChipGroup({
  selected,
  onChange,
  allowClear = true,
  className,
  variant = "default",
}: CategoryChipGroupProps) {
  const containerBase =
    variant === "inline"
      ? "flex flex-nowrap items-center gap-2"
      : "flex flex-wrap gap-3";
  const chipBase =
    variant === "inline"
      ? "rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.28em]"
      : "rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em]";

  return (
    <div className={cn(containerBase, className)}>
      {SEARCH_CATEGORIES.map((category) => {
        const isActive = selected.includes(category.value);
        const handleSelect = () => {
          if (isActive) {
            const next = selected.filter((value) => value !== category.value);
            if (!allowClear && next.length === 0) return;
            onChange(next);
            return;
          }
          onChange([...selected, category.value]);
        };

        return (
          <button
            key={category.value}
            type="button"
            aria-pressed={isActive}
            onClick={handleSelect}
            className={cn(
              chipBase,
              "transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40",
              isActive
                ? "border-primary bg-primary/15 text-primary"
                : "border-border/70 bg-card/70 text-muted-foreground hover:text-foreground"
            )}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
}

function areCategoryArraysEqual(
  a: SearchCategory[],
  b: SearchCategory[]
): boolean {
  if (a.length !== b.length) return false;
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) return false;
  }
  return true;
}

function encodeCategoriesParam(
  categories: SearchCategory[]
): SearchCategory[] | SearchCategory | undefined {
  if (categories.length === 0) return undefined;
  return categories.length === 1 ? categories[0] : categories;
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(media.matches);
    update();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  return prefersReducedMotion;
}
