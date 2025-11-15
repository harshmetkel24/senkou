import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useSidebar } from "@/components/contexts/SidebarContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  isSearchCategory,
  SEARCH_CATEGORIES,
  type SearchCategory,
} from "@/lib/constants/search";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  variant?: "header" | "hero";
  onQueryChange?: (value: string) => void;
}

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

  useEffect(() => {
    setSearchQuery((current) =>
      current === locationQuery ? current : locationQuery,
    );
  }, [locationQuery]);

  useEffect(() => {
    setSelectedCategory((current) =>
      current === locationCategory ? current : locationCategory,
    );
  }, [locationCategory]);

  const focusInputRefCallback = (node: HTMLInputElement | undefined) => {
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
        <Search
          className={`absolute left-6 top-1/2 transform -translate-y-1/2 ${isHero ? "w-8 h-8" : "w-5 h-5"} text-muted-foreground`}
        />
        <Input
          ref={focusInputRefCallback}
          type="text"
          placeholder="⌘+K to search anime, manga, characters..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            onQueryChange?.(e.target.value);
          }}
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
