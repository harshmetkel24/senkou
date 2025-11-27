import { fetchAnimeSearch, type AnimeListItem } from "@/data/queries/anime";
import {
  fetchCharacterSearch,
  type CharacterListItem,
} from "@/data/queries/characters";
import { fetchMangaSearch, type MangaListItem } from "@/data/queries/manga";
import {
  getSearchCategoryLabel,
  SEARCH_CATEGORY_VALUES,
  sortSearchCategories,
  type SearchCategory,
} from "@/lib/constants/search";

export type SearchAutocompleteScope =
  | SearchCategory
  | SearchCategory[]
  | "all";

export type SearchAutocompleteItem = {
  id: number;
  title: string;
  subtitle?: string;
  image?: string;
  category: SearchCategory;
};

export type SearchAutocompleteGroup = {
  category: SearchCategory;
  label: string;
  items: SearchAutocompleteItem[];
};

export type SearchAutocompleteResult = {
  query: string;
  groups: SearchAutocompleteGroup[];
};

const AUTOCOMPLETE_PER_CATEGORY = 4;

const createSubtitle = (parts: Array<string | null | undefined>) =>
  parts.filter(Boolean).join(" • ");

const mapAnimeItem = (item: AnimeListItem): SearchAutocompleteItem => ({
  id: item.id,
  title: item.title,
  subtitle: createSubtitle([
    item.format,
    item.seasonYear ? item.seasonYear.toString() : null,
    item.episodes && item.episodeUnit
      ? `${item.episodes} ${item.episodeUnit}`
      : item.episodes
        ? `${item.episodes} ep`
        : null,
  ]),
  image: item.coverImage,
  category: "anime",
});

const mapMangaItem = (item: MangaListItem): SearchAutocompleteItem => ({
  id: item.id,
  title: item.title,
  subtitle: createSubtitle([
    item.format,
    item.episodes && item.episodeUnit
      ? `${item.episodes} ${item.episodeUnit}`
      : null,
  ]),
  image: item.coverImage,
  category: "manga",
});

const mapCharacterItem = (item: CharacterListItem): SearchAutocompleteItem => ({
  id: item.id,
  title: item.name,
  subtitle:
    item.nativeName ??
    item.appearances[0]?.title ??
    (item.appearances.length > 1
      ? `${item.appearances.length} appearances`
      : undefined),
  image: item.image,
  category: "characters",
});

const createAnimeGroup = (
  items: AnimeListItem[],
  limit: number,
): SearchAutocompleteGroup => ({
  category: "anime",
  label: getSearchCategoryLabel("anime"),
  items: items.slice(0, limit).map(mapAnimeItem),
});

const createMangaGroup = (
  items: MangaListItem[],
  limit: number,
): SearchAutocompleteGroup => ({
  category: "manga",
  label: getSearchCategoryLabel("manga"),
  items: items.slice(0, limit).map(mapMangaItem),
});

const createCharacterGroup = (
  items: CharacterListItem[],
  limit: number,
): SearchAutocompleteGroup => ({
  category: "characters",
  label: getSearchCategoryLabel("characters"),
  items: items.slice(0, limit).map(mapCharacterItem),
});

const fetchScopedResults = (
  scope: SearchCategory,
  query: string,
  perCategoryLimit: number,
) => {
  if (scope === "anime") {
    return fetchAnimeSearch(query, 1, perCategoryLimit);
  }

  if (scope === "manga") {
    return fetchMangaSearch(query, 1, perCategoryLimit);
  }

  return fetchCharacterSearch(query, 1, perCategoryLimit);
};

async function fetchGroupsForCategories(
  scopes: Iterable<SearchCategory>,
  query: string,
  perCategoryLimit: number,
) {
  const normalizedScopes = sortSearchCategories(scopes);

  if (!normalizedScopes.length) return [];

  const results = await Promise.all(
    normalizedScopes.map((category) =>
      fetchScopedResults(category, query, perCategoryLimit),
    ),
  );

  return normalizedScopes
    .map((category, index) => {
      const result = results[index];

      if (category === "anime") {
        return createAnimeGroup(
          (result.items ?? []) as AnimeListItem[],
          perCategoryLimit,
        );
      }
      if (category === "manga") {
        return createMangaGroup(
          (result.items ?? []) as MangaListItem[],
          perCategoryLimit,
        );
      }
      return createCharacterGroup(
        (result.items ?? []) as CharacterListItem[],
        perCategoryLimit,
      );
    })
    .filter((group) => group.items.length > 0);
}

export async function fetchSearchAutocomplete(
  query: string,
  scope: SearchAutocompleteScope,
  perCategoryLimit = AUTOCOMPLETE_PER_CATEGORY,
): Promise<SearchAutocompleteResult> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return { query: "", groups: [] };
  }

  if (scope === "all") {
    const groups = await fetchGroupsForCategories(
      SEARCH_CATEGORY_VALUES,
      trimmedQuery,
      perCategoryLimit,
    );

    return {
      query: trimmedQuery,
      groups,
    };
  }

  if (Array.isArray(scope)) {
    const groups = await fetchGroupsForCategories(
      scope,
      trimmedQuery,
      perCategoryLimit,
    );

    return {
      query: trimmedQuery,
      groups,
    };
  }

  const result = await fetchScopedResults(
    scope,
    trimmedQuery,
    perCategoryLimit,
  );

  const group =
    scope === "anime"
      ? createAnimeGroup(result.items, perCategoryLimit)
      : scope === "manga"
        ? createMangaGroup(result.items, perCategoryLimit)
        : createCharacterGroup(result.items, perCategoryLimit);

  return {
    query: trimmedQuery,
    groups: group.items.length ? [group] : [],
  };
}
