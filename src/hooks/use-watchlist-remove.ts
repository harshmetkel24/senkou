import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";
import { getWatchlistFn, removeFromWatchlistFn } from "@/lib/server/watchlist";

type WatchlistRows = Awaited<ReturnType<typeof getWatchlistFn>>;

type RemoveWatchlistPayload = {
  entryId: number;
  title: string;
};

export function useWatchlistRemove() {
  const { user } = useAuth();
  const removeFromWatchlist = useServerFn(removeFromWatchlistFn);
  type RemoveWatchlistResult = Awaited<ReturnType<typeof removeFromWatchlist>>;
  const queryClient = useQueryClient();
  const [pendingRemovalId, setPendingRemovalId] = useState<number | null>(null);

  const mutation = useMutation<
    RemoveWatchlistResult,
    Error,
    RemoveWatchlistPayload
  >({
    mutationFn: ({ entryId }) =>
      removeFromWatchlist({
        data: { entryId },
      }),
    onMutate: ({ entryId }) => {
      setPendingRemovalId(entryId);
    },
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
    onSettled: () => {
      setPendingRemovalId(null);
    },
  });

  const handleRemoveEntry = (payload: RemoveWatchlistPayload) => {
    if (!user) {
      toast.error("Sign in to manage your watchlist", {
        description: "Log in to remove saved titles.",
      });
      return;
    }

    mutation.mutate(payload);
  };

  return {
    onRemoveEntry: handleRemoveEntry,
    isRemoving: mutation.isPending,
    pendingRemovalId,
  };
}
