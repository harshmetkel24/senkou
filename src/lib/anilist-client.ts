const ANILIST_GRAPHQL_ENDPOINT = "https://graphql.anilist.co";
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 250;

type GraphQLRequestInput<V> = {
  query: string;
  variables?: V;
  operationName?: string;
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export class AniListError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AniListError";
    this.status = status;
  }
}

export async function fetchAniList<TData, TVariables = Record<string, never>>(
  payload: GraphQLRequestInput<TVariables>,
): Promise<TData> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(ANILIST_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const isRateLimited = response.status === 429;
    const isServerError = response.status >= 500;

    if (!response.ok) {
      if ((isRateLimited || isServerError) && attempt < MAX_RETRIES) {
        const jitter = Math.random() * 100;
        await sleep(BASE_DELAY_MS * 2 ** attempt + jitter);
        continue;
      }

      throw new AniListError(
        `AniList request failed with status ${response.status}`,
        response.status,
      );
    }

    const result = (await response.json()) as GraphQLResponse<TData>;

    if (result.errors?.length) {
      const errorMessage = result.errors.map((err) => err.message).join(", ");
      throw new AniListError(errorMessage, response.status);
    }

    if (!result.data) {
      throw new AniListError("AniList response missing data", response.status);
    }

    return result.data;
  }

  throw new AniListError(
    "AniList request exhausted retries without success",
    500,
  );
}
