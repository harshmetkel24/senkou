export type ComparableValue = string | undefined | null;

type Options = {
  limit?: number;
  minDirectMatches?: number;
  suggestionLimit?: number;
};

export function deriveRelatedResults<T>(
  items: T[],
  query: string,
  getComparableValues: (item: T) => ComparableValue[],
  options?: Options,
) {
  const limit = options?.limit ?? 6;
  const suggestionLimit = options?.suggestionLimit ?? 3;
  const minDirectMatches = options?.minDirectMatches ?? 3;

  if (!items.length) {
    return { visible: [] as T[], suggestions: [] as T[] };
  }

  const normalizedQuery = query.trim().toLowerCase();
  const directMatches = normalizedQuery
    ? items.filter((item) => {
        const values = getComparableValues(item)
          .map((value) => value?.toString().toLowerCase().trim())
          .filter(Boolean) as string[];
        if (!values.length) return false;
        return values.some((value) => value.includes(normalizedQuery));
      })
    : [];

  const prioritized =
    normalizedQuery && directMatches.length >= minDirectMatches
      ? directMatches
      : items;

  const visible = prioritized.slice(0, limit);
  const suggestions = prioritized.slice(limit, limit + suggestionLimit);

  return { visible, suggestions };
}
