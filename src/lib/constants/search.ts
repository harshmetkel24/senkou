export const SEARCH_CATEGORY_VALUES = [
  "anime",
  "manga",
  "characters",
] as const;

export type SearchCategory = (typeof SEARCH_CATEGORY_VALUES)[number];

export const SEARCH_CATEGORIES: ReadonlyArray<{
  label: string;
  value: SearchCategory;
}> = [
  { label: "Anime", value: "anime" },
  { label: "Manga", value: "manga" },
  { label: "Characters", value: "characters" },
] as const;

export function isSearchCategory(value: unknown): value is SearchCategory {
  return (
    typeof value === "string" &&
    (SEARCH_CATEGORY_VALUES as readonly string[]).some(
      (category) => category === value,
    )
  );
}

export function getSearchCategoryLabel(category: SearchCategory) {
  return (
    SEARCH_CATEGORIES.find((entry) => entry.value === category)?.label ??
    category
  );
}
