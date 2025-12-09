import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import type { MediaDetailData } from "@/components/media/media-detail-panel";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";
import { addToWatchlistFn } from "@/lib/server/watchlist";
import type { WatchListEntryKind } from "@/types";

type UseWatchlistAddOptions = {
  kind: WatchListEntryKind;
};

export function useWatchlistAdd({ kind }: UseWatchlistAddOptions) {
  const { user } = useAuth();
  const addToWatchlist = useServerFn(addToWatchlistFn);
  type AddWatchlistResult = Awaited<ReturnType<typeof addToWatchlist>>;
  const queryClient = useQueryClient();

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

  const handleAddToWatchlist = (media: MediaDetailData) => {
    if (!user) {
      toast.error("Sign in to save this title", {
        description: "Log in to keep your watchlist in sync.",
      });
      return;
    }
    mutation.mutate(media);
  };

  const addLabel = mutation.isPending
    ? "Saving..."
    : user
    ? "Add to watchlist"
    : "Sign in to add";

  const addHelperText = user
    ? "Save this pick to revisit from your home feed."
    : "Sign in to stash this pick in your watchlist.";

  return {
    onAddToWatchlist: handleAddToWatchlist,
    addIsLoading: mutation.isPending,
    addLabel,
    addHelperText,
  };
}
