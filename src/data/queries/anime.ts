import { fetchAniList } from "@/lib/anilist-client";
import type { SearchMediaFormat, SearchSeason } from "@/lib/constants/search";

import { sanitizeDescription, sanitizeSearchTerm } from "./utils";

const TRENDING_ANIME_QUERY = /* GraphQL */ `
  query TrendingAnime($page: Int!, $perPage: Int!) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        perPage
        currentPage
        lastPage
        hasNextPage
      }
      media(
        type: ANIME
        sort: [TRENDING_DESC, SCORE_DESC]
        status_in: [RELEASING, FINISHED]
        isAdult: false
      ) {
        id
        format
        status
        episodes
        duration
        averageScore
        popularity
        season
        seasonYear
        genres
        description
        bannerImage
        coverImage {
          extraLarge
          large
          color
        }
        studios(isMain: true) {
          nodes {
            id
            name
          }
        }
        title {
          romaji
          english
          native
        }
      }
    }
  }
`;

type AnimePageQueryResult = {
  Page: {
    pageInfo: {
      total: number;
      perPage: number;
      currentPage: number;
      lastPage: number;
      hasNextPage: boolean;
    };
    media: AnimeMedia[];
  };
};

export type AnimeMedia = {
  id: number;
  format: string | null;
  status: string | null;
  episodes: number | null;
  duration: number | null;
  averageScore: number | null;
  popularity: number | null;
  season: string | null;
  seasonYear: number | null;
  genres: string[] | null;
  description: string | null;
  bannerImage: string | null;
  coverImage: {
    extraLarge: string | null;
    large: string | null;
    color: string | null;
  } | null;
  studios: {
    nodes: Array<{ id: number; name: string }>;
  } | null;
  title: {
    romaji: string | null;
    english: string | null;
    native: string | null;
  };
};

export type AnimeListItem = {
  id: number;
  title: string;
  coverImage: string;
  bannerImage?: string;
  color?: string;
  format?: string;
  status?: string;
  episodes?: number;
  episodeLabel?: string;
  episodeUnit?: string;
  duration?: number;
  averageScore?: number;
  popularity?: number;
  season?: string;
  seasonYear?: number;
  genres: string[];
  studios: string[];
  description?: string;
};

export type AnimeListPage = {
  items: AnimeListItem[];
  pageInfo: AnimePageQueryResult["Page"]["pageInfo"];
};

const normalizeAnime = (media: AnimeMedia): AnimeListItem => ({
  id: media.id,
  title:
    media.title.english ??
    media.title.romaji ??
    media.title.native ??
    "Untitled",
  coverImage:
    media.coverImage?.extraLarge ??
    media.coverImage?.large ??
    media.bannerImage ??
    "/senkou-circle-logo.png",
  bannerImage: media.bannerImage ?? undefined,
  color: media.coverImage?.color ?? undefined,
  format: media.format ?? undefined,
  status: media.status ?? undefined,
  episodes: media.episodes ?? undefined,
  duration: media.duration ?? undefined,
  averageScore: media.averageScore ?? undefined,
  popularity: media.popularity ?? undefined,
  season: media.season ?? undefined,
  seasonYear: media.seasonYear ?? undefined,
  genres: media.genres?.filter(Boolean) ?? [],
  studios: media.studios?.nodes.map((studio) => studio.name) ?? [],
  description: sanitizeDescription(media.description),
  episodeLabel: "Episodes",
  episodeUnit: "ep",
});

export const fetchTrendingAnime = async (
  page = 1,
  perPage = 20,
): Promise<AnimeListPage> => {
  const data = await fetchAniList<AnimePageQueryResult>({
    query: TRENDING_ANIME_QUERY,
    variables: { page, perPage },
  });

  return {
    items: data.Page.media.map(normalizeAnime),
    pageInfo: data.Page.pageInfo,
  };
};

const SEARCH_ANIME_QUERY = /* GraphQL */ `
  query SearchAnime(
    $page: Int!
    $perPage: Int!
    $search: String!
    $format: MediaFormat
    $season: MediaSeason
    $seasonYear: Int
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        perPage
        currentPage
        lastPage
        hasNextPage
      }
      media(
        type: ANIME
        search: $search
        format: $format
        season: $season
        seasonYear: $seasonYear
        sort: [SEARCH_MATCH, POPULARITY_DESC]
        status_in: [RELEASING, FINISHED]
        isAdult: false
      ) {
        id
        format
        status
        episodes
        duration
        averageScore
        popularity
        season
        seasonYear
        genres
        description
        bannerImage
        coverImage {
          extraLarge
          large
          color
        }
        studios(isMain: true) {
          nodes {
            id
            name
          }
        }
        title {
          romaji
          english
          native
        }
      }
    }
  }
`;

type AnimeSearchFilters = {
  format?: SearchMediaFormat;
  season?: SearchSeason;
  seasonYear?: number;
};

export const fetchAnimeSearch = async (
  searchTerm: string,
  page = 1,
  perPage = 20,
  filters: AnimeSearchFilters = {},
): Promise<AnimeListPage> => {
  const sanitizedSearch = sanitizeSearchTerm(searchTerm);

  if (!sanitizedSearch) {
    return {
      items: [],
      pageInfo: {
        total: 0,
        perPage,
        currentPage: page,
        lastPage: 0,
        hasNextPage: false,
      },
    };
  }

  const data = await fetchAniList<AnimePageQueryResult>({
    query: SEARCH_ANIME_QUERY,
    variables: {
      page,
      perPage,
      search: sanitizedSearch,
      format: filters.format,
      season: filters.season,
      seasonYear: filters.seasonYear,
    },
  });

  return {
    items: data.Page.media.map(normalizeAnime),
    pageInfo: data.Page.pageInfo,
  };
};
