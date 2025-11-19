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

const CATEGORY_ORDER = new Map(
  SEARCH_CATEGORY_VALUES.map((value, index) => [value, index] as const),
);

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

export function sortSearchCategories(
  categories: Iterable<SearchCategory>,
): SearchCategory[] {
  const seen = new Set<SearchCategory>();
  const uniqueByOrder: SearchCategory[] = [];

  for (const category of categories) {
    if (seen.has(category)) continue;
    seen.add(category);
    uniqueByOrder.push(category);
  }

  return uniqueByOrder.sort(
    (a, b) =>
      (CATEGORY_ORDER.get(a) ?? Number.POSITIVE_INFINITY) -
      (CATEGORY_ORDER.get(b) ?? Number.POSITIVE_INFINITY),
  );
}

export function decodeSearchCategoriesParam(
  value: unknown,
): SearchCategory[] {
  const raw = Array.isArray(value) ? value : value ? [value] : [];
  const filtered = raw.filter((entry): entry is SearchCategory =>
    isSearchCategory(entry),
  );

  return sortSearchCategories(filtered);
}
