import { Calendar, Clock, Film, SlidersHorizontal, Sparkles } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import {
  SEARCH_CATEGORIES,
  SEARCH_MEDIA_FORMAT_VALUES,
  SEARCH_SEASON_VALUES,
  type SearchCategory,
  type SearchMediaFormat,
  type SearchSeason,
} from "@/lib/constants/search";

type ScopeValue = SearchCategory | "all";

interface SearchPlusUltraPanelProps {
  categories: SearchCategory[];
  format?: SearchMediaFormat;
  season?: SearchSeason;
  year?: number;
  onScopeChange: (value: ScopeValue) => void;
  onFormatChange: (value?: SearchMediaFormat) => void;
  onSeasonChange: (value?: SearchSeason) => void;
  onYearChange: (value?: number) => void;
  onClearFilters: () => void;
}

export function SearchPlusUltraPanel({
  categories,
  format,
  season,
  year,
  onScopeChange,
  onFormatChange,
  onSeasonChange,
  onYearChange,
  onClearFilters,
}: SearchPlusUltraPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const isAllActive = categories.length === 0;
  const activeCount =
    categories.length +
    (format ? 1 : 0) +
    (season ? 1 : 0) +
    (year ? 1 : 0);
  const activeLabel = activeCount ? `${activeCount} active` : "All active";
  const formatLabels: Record<SearchMediaFormat, string> = {
    TV: "TV",
    TV_SHORT: "TV Short",
    MOVIE: "Movie",
    SPECIAL: "Special",
    OVA: "OVA",
    ONA: "ONA",
    MUSIC: "Music",
    MANGA: "Manga",
    NOVEL: "Novel",
    ONE_SHOT: "One-shot",
    MANHWA: "Manhwa",
    MANHUA: "Manhua",
  };
  const seasonLabels: Record<SearchSeason, string> = {
    WINTER: "Winter",
    SPRING: "Spring",
    SUMMER: "Summer",
    FALL: "Fall",
  };
  const formatOptions = SEARCH_MEDIA_FORMAT_VALUES.map((value) => ({
    value,
    label: formatLabels[value] ?? value,
  }));
  const seasonOptions = SEARCH_SEASON_VALUES.map((value) => ({
    value,
    label: seasonLabels[value] ?? value,
  }));
  const maxYear = new Date().getFullYear() + 1;
  const yearOptions = Array.from({ length: 8 }, (_, index) => maxYear - index);
  if (year && !yearOptions.includes(year)) {
    yearOptions.push(year);
    yearOptions.sort((a, b) => b - a);
  }
  const scopeOptions: Array<{ label: string; value: ScopeValue }> = [
    { label: "All", value: "all" },
    ...SEARCH_CATEGORIES.map((category) => ({
      label: category.label,
      value: category.value,
    })),
  ];

  return (
    <section className="rounded-[32px] border border-border/60 bg-card/70 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.5)] md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="size-8" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              Search Plus Ultra
            </p>
            <h2 className="mt-2 text-lg font-semibold">
              Dial in scopes without leaving the page.
            </h2>
            <p className="text-sm text-muted-foreground">
              Filters apply instantly and keep the URL shareable for teammates.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-border/60 bg-background/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
            {activeLabel}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full border border-border/60"
            onClick={onClearFilters}
            disabled={activeCount === 0}
          >
            Clear
          </Button>
          <Button
            type="button"
            size="sm"
            className="rounded-full"
            onClick={() => setIsOpen((current) => !current)}
            aria-expanded={isOpen}
          >
            {isOpen ? "Hide controls" : "Open controls"}
          </Button>
        </div>
      </div>

      {isOpen ? (
        <div className="mt-5 space-y-4">
          <FilterSection
            icon={<SlidersHorizontal className="h-4 w-4" />}
            label="Scope"
            description="Pick which categories respond to this query."
          >
            {scopeOptions.map((option) => {
              const isActive =
                option.value === "all"
                  ? isAllActive
                  : categories.includes(option.value);

                return (
                  <Chip
                    key={option.value}
                    aria-pressed={isActive}
                    active={isActive}
                    onClick={() => onScopeChange(option.value)}
                  >
                    {option.label}
                  </Chip>
                );
              })}
          </FilterSection>

          <FilterSection
            icon={<Film className="h-4 w-4" />}
            label="Formats"
            description="Target anime cuts or manga print types."
          >
            <Chip
              active={!format}
              aria-pressed={!format}
              onClick={() => onFormatChange(undefined)}
            >
              Any format
            </Chip>
            {formatOptions.map((option) => {
              const isActive = format === option.value;
              return (
                <Chip
                  key={option.value}
                  aria-pressed={isActive}
                  active={isActive}
                  onClick={() =>
                    onFormatChange(isActive ? undefined : option.value)
                  }
                >
                  {option.label}
                </Chip>
              );
            })}
          </FilterSection>

          <div className="grid gap-4 md:grid-cols-2">
            <FilterSection
              icon={<Calendar className="h-4 w-4" />}
              label="Season"
              description="Pair seasons with a year to focus premieres."
            >
              <Chip
                active={!season}
                aria-pressed={!season}
                onClick={() => onSeasonChange(undefined)}
              >
                Any season
              </Chip>
              {seasonOptions.map((option) => {
                const isActive = season === option.value;
                return (
                  <Chip
                    key={option.value}
                    aria-pressed={isActive}
                    active={isActive}
                    onClick={() =>
                      onSeasonChange(isActive ? undefined : option.value)
                    }
                  >
                    {option.label}
                  </Chip>
                );
              })}
            </FilterSection>

            <FilterSection
              icon={<Clock className="h-4 w-4" />}
              label="Year"
              description="Recent years for quick pivots."
            >
              <Chip
                active={!year}
                aria-pressed={!year}
                onClick={() => onYearChange(undefined)}
              >
                Any
              </Chip>
              {yearOptions.map((yearOption) => {
                const isActive = year === yearOption;
                return (
                  <Chip
                    key={yearOption}
                    aria-pressed={isActive}
                    active={isActive}
                    onClick={() =>
                      onYearChange(isActive ? undefined : yearOption)
                    }
                  >
                    {yearOption}
                  </Chip>
                );
              })}
            </FilterSection>
          </div>
        </div>
      ) : null}
    </section>
  );
}

interface FilterSectionProps {
  icon: ReactNode;
  label: string;
  description: string;
  children: ReactNode;
}

function FilterSection({
  icon,
  label,
  description,
  children,
}: FilterSectionProps) {
  return (
    <div className="rounded-3xl border border-border/60 bg-background/40 p-4 md:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            {label}
          </p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
