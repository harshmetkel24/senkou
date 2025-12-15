import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import type { MediaDetailData } from "@/components/media/media-detail-panel";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  addToWatchlistFn,
  getWatchlistFn,
  removeFromWatchlistFn,
} from "@/lib/server/watchlist";
import type { WatchListEntryKind } from "@/types";

type UseWatchlistAddOptions = {
  kind: WatchListEntryKind;
  activeMediaId?: number;
};

type WatchlistRows = Awaited<ReturnType<typeof getWatchlistFn>>;

type RemoveWatchlistPayload = {
  entryId: number;
  title: string;
};

export function useWatchlistAdd({
  kind,
  activeMediaId,
}: UseWatchlistAddOptions) {
  const { user } = useAuth();
  const addToWatchlist = useServerFn(addToWatchlistFn);
  const removeFromWatchlist = useServerFn(removeFromWatchlistFn);
  type AddWatchlistResult = Awaited<ReturnType<typeof addToWatchlist>>;
  type RemoveWatchlistResult = Awaited<ReturnType<typeof removeFromWatchlist>>;
  const queryClient = useQueryClient();

  const watchlistQuery = useQuery<WatchlistRows>({
    queryKey: ["watchlist", "self"],
    queryFn: () => getWatchlistFn(),
    enabled: Boolean(user),
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
  });

  const findExistingEntry = (mediaId: number) =>
    (watchlistQuery.data ?? []).find(
      (row) =>
        row.entity.anilistId === mediaId && row.entity.kind === kind
    );

  const activeEntry =
    activeMediaId !== undefined ? findExistingEntry(activeMediaId) : undefined;

  const mutation = useMutation<AddWatchlistResult, Error, MediaDetailData>({
    mutationFn: async (media) => {
      return await addToWatchlist({
        data: {
          anilistId: media.id,
          kind,
          title: media.title,
          format: media.format ?? undefined,
          coverImage: media.coverImage,
          bannerImage: media.bannerImage,
          status: "PLANNING",
          progress: 0,
          visibility: "PRIVATE",
        },
      });
    },
    onSuccess: (result, media) => {
      if (result?.entry && result?.entity) {
        queryClient.setQueryData<WatchlistRows>(
          ["watchlist", "self"],
          (previous) => {
            const nextRow = { entry: result.entry, entity: result.entity };
            if (!previous) return [nextRow];
            const existingIndex = previous.findIndex(
              (row) => row.entry.id === result.entry.id
            );
            if (existingIndex !== -1) {
              const updated = [...previous];
              updated[existingIndex] = nextRow;
              return updated;
            }
            return [nextRow, ...previous];
          }
        );
      }
      queryClient.invalidateQueries({ queryKey: ["watchlist", "self"] });
      toast.success(
        result?.alreadyExists ? "Already in watchlist" : "Added to watchlist",
        {
          description: `${media.title} ${
            result?.alreadyExists ? "is already saved." : "is now saved."
          }`,
        }
      );
    },
    onError: (error) => {
      const description =
        error instanceof Error
          ? error.message
          : "Unable to save this title right now.";
      toast.error("Watchlist update failed", { description });
    },
  });

  const removeMutation = useMutation<
    RemoveWatchlistResult,
    Error,
    RemoveWatchlistPayload
  >({
    mutationFn: ({ entryId }) =>
      removeFromWatchlist({
        data: { entryId },
      }),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<WatchlistRows>(
        ["watchlist", "self"],
        (previous) =>
          previous?.filter((row) => row.entry.id !== variables.entryId) ??
          previous
      );
      queryClient.invalidateQueries({ queryKey: ["watchlist", "self"] });
      toast.success("Removed from watchlist", {
        description: `${variables.title} cleared from your shelf.`,
      });
    },
    onError: (error) => {
      const description =
        error instanceof Error
          ? error.message
          : "Unable to remove this watchlist entry right now.";
      toast.error("Remove failed", { description });
    },
  });

  const handleAddToWatchlist = (media: MediaDetailData) => {
    if (mutation.isPending || removeMutation.isPending) return;

    if (!user) {
      toast.error("Sign in to save this title", {
        description: "Log in to keep your watchlist in sync.",
      });
      return;
    }

    const existingEntry = findExistingEntry(media.id);

    if (existingEntry) {
      removeMutation.mutate({
        entryId: existingEntry.entry.id,
        title: media.title,
      });
      return;
    }

    mutation.mutate(media);
  };

  const addIsLoading = mutation.isPending || removeMutation.isPending;

  const addLabel = mutation.isPending
    ? "Saving..."
    : removeMutation.isPending
    ? "Removing..."
    : user
    ? activeEntry
      ? "Remove from watchlist"
      : "Add to watchlist"
    : "Sign in to add";

  const addHelperText = user
    ? activeEntry
      ? "Already in your watchlist."
      : "Save this pick to revisit from your home feed."
    : "Sign in to stash this pick in your watchlist.";

  return {
    onAddToWatchlist: handleAddToWatchlist,
    addIsLoading,
    isInWatchlist: Boolean(activeEntry),
    addLabel,
    addHelperText,
  };
}
