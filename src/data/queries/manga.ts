import { fetchAniList } from "@/lib/anilist-client";

import { sanitizeDescription, sanitizeSearchTerm } from "./utils";

const TRENDING_MANGA_QUERY = /* GraphQL */ `
  query TrendingManga($page: Int!, $perPage: Int!) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        perPage
        currentPage
        lastPage
        hasNextPage
      }
      media(
        type: MANGA
        sort: [TRENDING_DESC, SCORE_DESC]
        status_in: [RELEASING, FINISHED]
        isAdult: false
      ) {
        id
        format
        status
        chapters
        volumes
        averageScore
        popularity
        genres
        description
        bannerImage
        coverImage {
          extraLarge
          large
          color
        }
        staff(perPage: 6) {
          edges {
            node {
              id
              name {
                full
                native
              }
            }
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

type MangaPageQueryResult = {
  Page: {
    pageInfo: {
      total: number;
      perPage: number;
      currentPage: number;
      lastPage: number;
      hasNextPage: boolean;
    };
    media: MangaMedia[];
  };
};

type MangaMedia = {
  id: number;
  format: string | null;
  status: string | null;
  chapters: number | null;
  volumes: number | null;
  averageScore: number | null;
  popularity: number | null;
  genres: string[] | null;
  description: string | null;
  bannerImage: string | null;
  coverImage: {
    extraLarge: string | null;
    large: string | null;
    color: string | null;
  } | null;
  staff: {
    edges: Array<{
      node: {
        id: number;
        name: { full: string | null; native: string | null } | null;
      } | null;
    } | null>;
  } | null;
  title: {
    romaji: string | null;
    english: string | null;
    native: string | null;
  };
};

export type MangaListItem = {
  id: number;
  title: string;
  coverImage: string;
  bannerImage?: string;
  color?: string;
  format?: string;
  status?: string;
  chapters?: number;
  volumes?: number;
  episodes?: number;
  episodeLabel?: string;
  episodeUnit?: string;
  averageScore?: number;
  popularity?: number;
  genres: string[];
  studios: string[];
  description?: string;
};

export type MangaListPage = {
  items: MangaListItem[];
  pageInfo: MangaPageQueryResult["Page"]["pageInfo"];
};

const normalizeStaff = (media: MangaMedia): MangaListItem["studios"] => {
  if (!media.staff?.edges.length) return [];

  return media.staff.edges
    .map((edge) => edge?.node?.name?.full ?? edge?.node?.name?.native ?? null)
    .filter((value): value is string => Boolean(value));
};

const normalizeManga = (media: MangaMedia): MangaListItem => {
  const hasChapters = Boolean(media.chapters);
  const hasVolumes = Boolean(media.volumes);

  return {
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
    chapters: media.chapters ?? undefined,
    volumes: media.volumes ?? undefined,
    episodes: media.chapters ?? media.volumes ?? undefined,
    episodeLabel: hasChapters ? "Chapters" : hasVolumes ? "Volumes" : undefined,
    episodeUnit: hasChapters ? "ch" : hasVolumes ? "vol" : undefined,
    averageScore: media.averageScore ?? undefined,
    popularity: media.popularity ?? undefined,
    genres: media.genres?.filter(Boolean) ?? [],
    studios: normalizeStaff(media),
    description: sanitizeDescription(media.description),
  };
};

export const fetchTrendingManga = async (
  page = 1,
  perPage = 20,
): Promise<MangaListPage> => {
  const data = await fetchAniList<MangaPageQueryResult>({
    query: TRENDING_MANGA_QUERY,
    variables: { page, perPage },
  });

  return {
    items: data.Page.media.map(normalizeManga),
    pageInfo: data.Page.pageInfo,
  };
};

const SEARCH_MANGA_QUERY = /* GraphQL */ `
  query SearchManga($page: Int!, $perPage: Int!, $search: String!) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        perPage
        currentPage
        lastPage
        hasNextPage
      }
      media(
        type: MANGA
        search: $search
        sort: [SEARCH_MATCH, POPULARITY_DESC]
        status_in: [RELEASING, FINISHED]
        isAdult: false
      ) {
        id
        format
        status
        chapters
        volumes
        averageScore
        popularity
        genres
        description
        bannerImage
        coverImage {
          extraLarge
          large
          color
        }
        staff(perPage: 6) {
          edges {
            node {
              id
              name {
                full
                native
              }
            }
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

export const fetchMangaSearch = async (
  searchTerm: string,
  page = 1,
  perPage = 20,
): Promise<MangaListPage> => {
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

  const data = await fetchAniList<MangaPageQueryResult>({
    query: SEARCH_MANGA_QUERY,
    variables: { page, perPage, search: sanitizedSearch },
  });

  return {
    items: data.Page.media.map(normalizeManga),
    pageInfo: data.Page.pageInfo,
  };
};
