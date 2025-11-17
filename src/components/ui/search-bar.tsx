import { useQuery } from "@tanstack/react-query";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import debounce from "lodash/debounce";
import { AlertCircle, RefreshCw, Search as SearchIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useSidebar } from "@/components/contexts/SidebarContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  isSearchCategory,
  SEARCH_CATEGORIES,
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
}

const AUTOCOMPLETE_MIN_QUERY_LENGTH = 4;
const AUTOCOMPLETE_DEBOUNCE_MS = 350;

export function SearchBar({
  variant = "header",
  onQueryChange,
}: SearchBarProps) {
  const navigate = useNavigate();
  type RouterSearchState = {
    q?: string;
    category?: string;
  };
  const locationState = useRouterState({
    select: (state) => ({
      pathname: state.location.pathname,
      search: state.location.search as RouterSearchState,
    }),
  });
  const locationQuery = locationState.search?.q ?? "";
  const locationCategory = isSearchCategory(locationState.search?.category)
    ? locationState.search?.category
    : null;
  const [searchQuery, setSearchQuery] = useState(locationQuery);
  const shouldFocusSearch = useSidebar((state) => state.shouldFocusSearch);
  const setShouldFocusSearch = useSidebar(
    (state) => state.setShouldFocusSearch,
  );

  const resolveSearchRoute = (pathname: string) => {
    if (pathname.startsWith("/manga")) return "/manga" as const;
    if (pathname.startsWith("/characters")) return "/characters" as const;
    if (pathname.startsWith("/search")) return "/search" as const;
    return "/anime" as const;
  };

  const searchTarget = resolveSearchRoute(locationState.pathname);
  const showCategoryChips =
    variant === "hero" || searchTarget === "/search" ? true : false;
  const [selectedCategory, setSelectedCategory] =
    useState<SearchCategory | null>(locationCategory);
  const isHero = variant === "hero";
  const showInlineCategoryChips = showCategoryChips && !isHero;
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(() =>
    searchQuery.trim(),
  );
  const debouncedUpdater = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearchQuery(value.trim());
      }, AUTOCOMPLETE_DEBOUNCE_MS),
    [],
  );
  const normalizedDebouncedQuery = debouncedSearchQuery.trim();
  const autocompleteScope: SearchAutocompleteScope = showCategoryChips
    ? (selectedCategory ?? "all")
    : searchTarget === "/manga"
      ? "manga"
      : searchTarget === "/characters"
        ? "characters"
        : "anime";
  const shouldFetchAutocomplete =
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
  const showAutocomplete = isInputFocused && shouldFetchAutocomplete;
  const showAutocompleteEmptyState =
    showAutocomplete &&
    !isFetchingAutocomplete &&
    !isAutocompleteError &&
    !hasAutocompleteResults;
  const shouldRenderAutocompletePanel =
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

  useEffect(() => {
    setSearchQuery((current) =>
      current === locationQuery ? current : locationQuery,
    );
  }, [locationQuery]);

  useEffect(() => {
    const trimmedLocation = locationQuery.trim();
    setDebouncedSearchQuery((current) =>
      current === trimmedLocation ? current : trimmedLocation,
    );
  }, [locationQuery]);

  useEffect(() => {
    setSelectedCategory((current) =>
      current === locationCategory ? current : locationCategory,
    );
  }, [locationCategory]);

  useEffect(() => {
    debouncedUpdater(searchQuery);
    return () => {
      debouncedUpdater.cancel();
    };
  }, [searchQuery, debouncedUpdater]);

  const handleSuggestionSelect = (suggestion: SearchAutocompleteItem) => {
    const trimmedSuggestion = suggestion.title.trim();

    if (!trimmedSuggestion.length) return;

    setSearchQuery(trimmedSuggestion);
    onQueryChange?.(trimmedSuggestion);

    if (showCategoryChips) {
      setSelectedCategory(suggestion.category);
    }

    const target = showCategoryChips ? "/search" : searchTarget;

    navigate({
      to: target as "/anime" | "/manga" | "/characters" | "/search",
      search: (prev) => {
        const next = { ...(prev ?? {}) } as Record<string, unknown>;
        next.q = trimmedSuggestion;

        if (showCategoryChips) {
          next.category = suggestion.category;
        } else {
          delete next.category;
        }

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
          next.category = selectedCategory ?? undefined;
        } else {
          delete next.category;
        }

        return next;
      },
    });
  };

  const inputPaddingRight = useMemo(() => {
    if (!showInlineCategoryChips) {
      return isHero ? "pr-36" : "pr-24";
    }
    return "pr-[17rem]";
  }, [isHero, showInlineCategoryChips]);

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl">
      <div className="relative">
        <SearchIcon
          className={`absolute left-6 top-1/2 transform -translate-y-1/2 ${isHero ? "w-8 h-8" : "w-5 h-5"} text-muted-foreground`}
        />
        <Input
          ref={focusInputRefCallback}
          type="text"
          placeholder="Type 4 or more letter to see suggestions"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            onQueryChange?.(e.target.value);
          }}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          className={cn(
            isHero
              ? "pl-20 py-6 text-2xl rounded-3xl border-2 shadow-lg focus:ring-4"
              : "pl-12 py-2 text-base rounded-2xl border focus:ring-2",
            inputPaddingRight,
            "border-border bg-card/95 text-foreground placeholder-muted-foreground focus:ring-primary/50",
          )}
        />
        {showInlineCategoryChips ? (
          <div
            className={cn(
              "absolute inset-y-2 flex items-center",
              isHero ? "right-32" : "right-24",
            )}
          >
            <div className="pointer-events-auto rounded-full border border-border/60 bg-background/90 px-2 py-1 shadow-sm">
              <CategoryChipGroup
                selected={selectedCategory}
                onChange={setSelectedCategory}
                variant="inline"
                className="flex-nowrap"
              />
            </div>
          </div>
        ) : null}
        <Button
          type="submit"
          size={isHero ? "lg" : "sm"}
          variant="outline"
          className={`absolute top-1/2 -translate-y-1/2 transform ${isHero ? "right-4 px-6 py-2 text-lg" : "right-2 px-3 py-1 text-sm"} rounded-2xl`}
        >
          Search
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
            selected={selectedCategory}
            onChange={setSelectedCategory}
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
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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
  selected: SearchCategory | null;
  onChange: (value: SearchCategory | null) => void;
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
        const isActive = selected === category.value;

        return (
          <button
            key={category.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => {
              if (isActive && !allowClear) return;
              onChange(isActive ? null : category.value);
            }}
            className={cn(
              chipBase,
              "transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40",
              isActive
                ? "border-primary bg-primary/15 text-primary"
                : "border-border/70 bg-card/70 text-muted-foreground hover:text-foreground",
            )}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
}
