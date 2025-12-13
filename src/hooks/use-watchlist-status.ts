import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { toast } from "@/components/ui/sonner";
import { getWatchlistFn, updateWatchlistStatusFn } from "@/lib/server/watchlist";
import { formatWatchStatusLabel } from "@/lib/watchlist-helpers";
import { useAuth } from "@/hooks/useAuth";
import type { UpdateWatchlistStatusInput, WatchStatus } from "@/types";

type WatchlistRows = Awaited<ReturnType<typeof getWatchlistFn>>;

type UpdateStatusPayload = UpdateWatchlistStatusInput & {
  title: string;
};

export function useWatchlistStatus() {
  const { user } = useAuth();
  const updateWatchlistStatus = useServerFn(updateWatchlistStatusFn);
  type UpdateWatchlistResult = Awaited<ReturnType<typeof updateWatchlistStatus>>;
  const queryClient = useQueryClient();
  const [pendingEntryId, setPendingEntryId] = useState<number | null>(null);
  const [pendingStatus, setPendingStatus] = useState<WatchStatus | null>(null);

  const mutation = useMutation<
    UpdateWatchlistResult,
    Error,
    UpdateStatusPayload
  >({
    mutationFn: ({ entryId, status }) =>
      updateWatchlistStatus({
        data: { entryId, status },
      }),
    onMutate: ({ entryId, status }) => {
      setPendingEntryId(entryId);
      setPendingStatus(status);
    },
    onSuccess: (updatedEntry, variables) => {
      queryClient.setQueryData<WatchlistRows>(
        ["watchlist", "self"],
        (previous) =>
          previous
            ? previous.map((row) =>
                row.entry.id === updatedEntry.id
                  ? { ...row, entry: { ...row.entry, ...updatedEntry } }
                  : row
              )
            : previous
      );

      queryClient.invalidateQueries({ queryKey: ["watchlist", "self"] });
      toast.success("Status updated", {
        description: `${variables.title} marked as ${formatWatchStatusLabel(
          updatedEntry.status
        )}.`,
      });
    },
    onError: (error) => {
      const description =
        error instanceof Error
          ? error.message
          : "Unable to update this watchlist entry right now.";
      toast.error("Watchlist update failed", { description });
    },
    onSettled: () => {
      setPendingEntryId(null);
      setPendingStatus(null);
    },
  });

  const handleUpdateStatus = (payload: UpdateStatusPayload) => {
    if (!user) {
      toast.error("Sign in to update this watchlist item", {
        description: "Log in to keep your watchlist status in sync.",
      });
      return;
    }

    mutation.mutate(payload);
  };

  return {
    onUpdateStatus: handleUpdateStatus,
    isUpdating: mutation.isPending,
    pendingEntryId,
    pendingStatus,
  };
}
