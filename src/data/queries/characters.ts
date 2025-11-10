import { fetchAniList } from "@/lib/anilist-client";

import { sanitizeDescription } from "./utils";

const TRENDING_CHARACTERS_QUERY = /* GraphQL */ `
  query TrendingCharacters($page: Int!, $perPage: Int!) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        perPage
        currentPage
        lastPage
        hasNextPage
      }
      characters(sort: [FAVOURITES_DESC, ID_DESC]) {
        id
        name {
          full
          native
        }
        image {
          large
        }
        favourites
        age
        gender
        description
        media(perPage: 4, sort: [POPULARITY_DESC]) {
          nodes {
            id
            type
            format
            title {
              romaji
              english
            }
            coverImage {
              large
            }
          }
        }
      }
    }
  }
`;

type TrendingCharactersQueryResult = {
  Page: {
    pageInfo: {
      total: number;
      perPage: number;
      currentPage: number;
      lastPage: number;
      hasNextPage: boolean;
    };
    characters: CharacterEntity[];
  };
};

type CharacterEntity = {
  id: number;
  name: {
    full: string | null;
    native: string | null;
  };
  image: {
    large: string | null;
  } | null;
  favourites: number | null;
  age: string | null;
  gender: string | null;
  description: string | null;
  media: {
    nodes: Array<{
      id: number;
      type: string | null;
      format: string | null;
      title: {
        romaji: string | null;
        english: string | null;
      };
      coverImage: {
        large: string | null;
      } | null;
    } | null>;
  } | null;
};

export type CharacterMedia = {
  id: number;
  title: string;
  coverImage?: string;
  format?: string;
  type?: string;
};

export type CharacterListItem = {
  id: number;
  name: string;
  nativeName?: string;
  image: string;
  favorites?: number;
  age?: string;
  gender?: string;
  description?: string;
  appearances: CharacterMedia[];
};

export type CharacterListPage = {
  items: CharacterListItem[];
  pageInfo: TrendingCharactersQueryResult["Page"]["pageInfo"];
};

const normalizeCharacter = (character: CharacterEntity): CharacterListItem => ({
  id: character.id,
  name: character.name.full ?? character.name.native ?? "Unknown character",
  nativeName: character.name.native ?? undefined,
  image: character.image?.large ?? "/senkou-circle-logo.png",
  favorites: character.favourites ?? undefined,
  age: character.age ?? undefined,
  gender: character.gender ?? undefined,
  description: sanitizeDescription(character.description),
  appearances:
    character.media?.nodes
      .filter((media): media is NonNullable<typeof media> => Boolean(media))
      .map((media) => ({
        id: media.id,
        title: media.title.english ?? media.title.romaji ?? "Untitled",
        coverImage: media.coverImage?.large ?? undefined,
        format: media.format ?? undefined,
        type: media.type ?? undefined,
      })) ?? [],
});

export const fetchTrendingCharacters = async (
  page = 1,
  perPage = 20,
): Promise<CharacterListPage> => {
  const data = await fetchAniList<TrendingCharactersQueryResult>({
    query: TRENDING_CHARACTERS_QUERY,
    variables: { page, perPage },
  });

  return {
    items: data.Page.characters.map(normalizeCharacter),
    pageInfo: data.Page.pageInfo,
  };
};
