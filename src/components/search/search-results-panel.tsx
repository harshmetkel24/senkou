import { AlertCircle, RefreshCw, Search as SearchIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

export type SearchSuggestion<T> = {
  heading: string;
  items: T[];
  getLabel: (item: T) => string;
  onSelect: (item: T) => void;
};

interface SearchResultsPanelProps<T> {
  heading: string;
  description: string;
  isSearching: boolean;
  showSkeleton: boolean;
  skeleton?: ReactNode;
  isError: boolean;
  errorTitle: string;
  errorDescription: string;
  showEmpty: boolean;
  emptyTitle: string;
  emptyDescription: string;
  onRetry: () => void;
  onClear: () => void;
  showResults: boolean;
  results: T[];
  renderGrid: (items: T[]) => ReactNode;
  suggestions?: SearchSuggestion<T>;
}

export function SearchResultsPanel<T>({
  heading,
  description,
  isSearching,
  showSkeleton,
  skeleton,
  isError,
  errorTitle,
  errorDescription,
  showEmpty,
  emptyTitle,
  emptyDescription,
  onRetry,
  onClear,
  showResults,
  results,
  renderGrid,
  suggestions,
}: SearchResultsPanelProps<T>) {
  return (
    <section className="space-y-6 rounded-[36px] border border-border/60 bg-card/80 p-6 shadow-[0_45px_120px_rgba(0,0,0,0.55)] md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            AniList search
          </p>
          <h2 className="mt-2 text-3xl font-bold">{heading}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
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
            onClick={onClear}
          >
            Clear search
          </Button>
        </div>
      </div>

      {showSkeleton ? skeleton : null}

      {isError ? (
        <div className="rounded-3xl border border-destructive/40 bg-destructive/5 p-6 text-destructive">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {errorTitle}
                </h3>
                <p className="text-sm text-muted-foreground">{errorDescription}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="button" onClick={onRetry}>
                Retry search
              </Button>
              <Button type="button" variant="outline" onClick={onClear}>
                Reset
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {showEmpty ? (
        <div className="rounded-3xl border border-border/60 bg-background/40 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-border/80 bg-card/50">
            <SearchIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-2xl font-semibold">{emptyTitle}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{emptyDescription}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button type="button" onClick={onRetry}>
              Try again
            </Button>
            <Button type="button" variant="outline" onClick={onClear}>
              Clear search
            </Button>
          </div>
        </div>
      ) : null}

      {showResults ? renderGrid(results) : null}

      {suggestions && suggestions.items.length ? (
        <div className="rounded-3xl border border-border/50 bg-background/40 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            {suggestions.heading}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.items.map((item, index) => (
              <Button
                key={`${suggestions.getLabel(item)}-${index}`}
                variant="outline"
                size="sm"
                className="rounded-full border-border/70"
                onClick={() => suggestions.onSelect(item)}
              >
                {suggestions.getLabel(item)}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
