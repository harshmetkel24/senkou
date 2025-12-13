import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Image } from "@unpic/react";
import {
  Check,
  CheckCircle2,
  Clock3,
  Loader,
  PauseCircle,
  PlayCircle,
  Trash2,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState, type KeyboardEvent } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWatchlistRemove } from "@/hooks/use-watchlist-remove";
import { useWatchlistStatus } from "@/hooks/use-watchlist-status";
import { useAuth } from "@/hooks/useAuth";
import { getWatchlistFn } from "@/lib/server/watchlist";
import { cn } from "@/lib/utils";
import {
  WATCH_STATUS_OPTIONS,
  formatWatchStatusLabel,
  getWatchStatusBadgeClass,
} from "@/lib/watchlist-helpers";
import type { WatchStatus } from "@/types";

type WatchlistRows = Awaited<ReturnType<typeof getWatchlistFn>>;

type WatchlistItem = {
  entryId: number;
  anilistId: number;
  title: string;
  coverImage: string;
  bannerImage?: string;
  format?: string;
  status: WatchStatus;
};

const statusIcons: Record<WatchStatus, LucideIcon> = {
  WATCHING: PlayCircle,
  PLANNING: Clock3,
  COMPLETED: CheckCircle2,
  PAUSED: PauseCircle,
  DROPPED: XCircle,
};

export const watchlistQueryOptions = () => ({
  queryKey: ["watchlist", "self"],
  queryFn: () => getWatchlistFn(),
  staleTime: 1000 * 60 * 2,
  placeholderData: keepPreviousData,
});

export function WatchlistShelf() {
  const { user } = useAuth();
  const { onUpdateStatus, isUpdating, pendingEntryId, pendingStatus } =
    useWatchlistStatus();
  const { onRemoveEntry, isRemoving, pendingRemovalId } = useWatchlistRemove();
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);
  const watchlistQuery = useQuery<WatchlistRows>({
    ...watchlistQueryOptions(),
    suspense: true,
    throwOnError: false,
  });

  if (!user) return null;

  const watchlistEntries = watchlistQuery.data ?? [];
  const watchlistItems = useMemo(
    () =>
      watchlistEntries.map<WatchlistItem>(({ entity, entry }) => ({
        entryId: entry.id,
        anilistId: entity.anilistId,
        title: entity.title,
        coverImage: entity.coverImage ?? "/senkou-circle-logo.png",
        bannerImage: entity.bannerImage ?? undefined,
        format: entity.format ?? undefined,
        status: entry.status,
      })),
    [watchlistEntries]
  );

  const selectedItem = useMemo(
    () => watchlistItems.find((item) => item.entryId === selectedEntryId),
    [watchlistItems, selectedEntryId]
  );

  const handleCardSelect = (item: WatchlistItem) => {
    setSelectedEntryId(item.entryId);
  };

  const handleCardKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    item: WatchlistItem
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCardSelect(item);
    }
  };

  const closeDialog = () => setSelectedEntryId(null);

  return (
    <section className="mx-auto w-full max-w-6xl p-8">
      <div className="mb-4 flex flex-col gap-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
          Welcome back{user.displayName ? `, ${user.displayName}` : ""}
        </p>
        <h2 className="text-2xl font-bold">Your Watchlist</h2>
        <p className="text-sm text-muted-foreground">
          We&apos;ll surface your recent saves here—perfect for quick catch-ups.
        </p>
      </div>

      {watchlistQuery.isError ? (
        <div className="rounded-3xl border border-destructive/40 bg-destructive/10 px-6 py-8 text-center text-destructive">
          We couldn&apos;t load your watchlist. Please refresh to retry.
        </div>
      ) : watchlistItems.length ? (
        <>
          {/* IDEA: paginate this carousel once watchlist grows beyond the visible set. */}
          <Carousel className="w-full" opts={{ align: "start" }}>
            <CarouselContent>
              {watchlistItems.map((item) => (
                <CarouselItem
                  key={item.entryId}
                  className="basis-60 md:basis-64 lg:basis-72"
                >
                  <Card
                    role="button"
                    tabIndex={0}
                    onClick={() => handleCardSelect(item)}
                    onKeyDown={(event) => handleCardKeyDown(event, item)}
                    className="h-full cursor-pointer border-border/60 bg-card/80 shadow-sm transition hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label={`Open details for ${item.title}`}
                  >
                    <CardContent className="space-y-3">
                      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted/20">
                        <Image
                          src={item.coverImage}
                          alt={`${item.title} cover art`}
                          width={400}
                          height={520}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                        <span
                          className={cn(
                            buttonVariants({
                              variant: "outline",
                              size: "sm",
                            }),
                            "absolute right-3 top-3 rounded-full border-border/70 bg-background/80 text-[11px] font-semibold uppercase tracking-[0.2em]"
                          )}
                        >
                          {formatWatchStatusLabel(item.status)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                          {item.format ?? "Saved title"}
                        </p>
                        <h3 className="text-base font-semibold leading-snug line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Update status or open for more actions.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>

          <WatchlistDetailDialog
            item={selectedItem}
            onClose={closeDialog}
            onUpdateStatus={onUpdateStatus}
            onRemoveEntry={onRemoveEntry}
            isUpdating={isUpdating}
            isRemoving={isRemoving}
            pendingEntryId={pendingEntryId}
            pendingStatus={pendingStatus}
            pendingRemovalId={pendingRemovalId}
          />
        </>
      ) : (
        <div className="rounded-3xl border border-border/60 bg-card/60 px-6 py-8 text-center text-muted-foreground">
          Nothing saved yet. Jump into the Anime tab to start building your
          list.
        </div>
      )}
    </section>
  );
}

export function WatchlistShelfSkeleton({
  displayName,
}: {
  displayName?: string;
}) {
  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="mb-4 flex flex-col gap-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
          Welcome back{displayName ? `, ${displayName}` : ""}
        </p>
        <h2 className="text-2xl font-bold">Your Watchlist</h2>
        <p className="text-sm text-muted-foreground">
          We&apos;ll surface your recent saves here—perfect for quick catch-ups.
        </p>
      </div>

      <Carousel className="w-full" opts={{ align: "start" }}>
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem
              key={index}
              className="basis-60 md:basis-64 lg:basis-72"
            >
              <article className="flex h-full flex-col gap-3 rounded-3xl border border-border/60 bg-card/40 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.35)]">
                <div className="aspect-[3/4] rounded-2xl bg-muted/30 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-3 w-24 rounded-full bg-muted/40 animate-pulse" />
                  <div className="h-4 w-36 rounded-full bg-muted/50 animate-pulse" />
                  <div className="h-3 w-28 rounded-full bg-muted/30 animate-pulse" />
                </div>
              </article>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}

type WatchlistDetailDialogProps = {
  item?: WatchlistItem;
  onClose: () => void;
  onUpdateStatus: (payload: {
    entryId: number;
    status: WatchStatus;
    title: string;
  }) => void;
  onRemoveEntry: (payload: { entryId: number; title: string }) => void;
  isUpdating: boolean;
  isRemoving: boolean;
  pendingEntryId: number | null;
  pendingStatus: WatchStatus | null;
  pendingRemovalId: number | null;
};

function WatchlistDetailDialog({
  item,
  onClose,
  onUpdateStatus,
  onRemoveEntry,
  isUpdating,
  isRemoving,
  pendingEntryId,
  pendingStatus,
  pendingRemovalId,
}: WatchlistDetailDialogProps) {
  const isEntryUpdating =
    Boolean(item) && isUpdating && pendingEntryId === item?.entryId;
  const isEntryRemoving =
    Boolean(item) && isRemoving && pendingRemovalId === item?.entryId;
  const statusBadgeClass = cn(
    buttonVariants({ variant: "outline", size: "sm" }),
    "rounded-full border-border/70 bg-background/80 text-[11px] font-semibold uppercase tracking-[0.25em]"
  );

  return (
    <Dialog open={Boolean(item)} onOpenChange={(open) => !open && onClose()}>
      {item ? (
        <DialogContent className="max-w-4xl gap-6 border-border/60">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-2xl font-bold leading-tight">
              {item.title}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="space-y-4">
              <Card className="overflow-hidden border-border/70 shadow-sm">
                <CardContent className="p-0">
                  <div className="relative h-56 w-full">
                    <Image
                      src={item.bannerImage ?? item.coverImage}
                      alt={`${item.title} banner art`}
                      width={1200}
                      height={520}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.3em] text-white/80">
                          {item.format ?? "Saved title"}
                        </p>
                        <h3 className="text-xl font-semibold text-white line-clamp-2">
                          {item.title}
                        </h3>
                      </div>
                      <span
                        className={cn(
                          statusBadgeClass,
                          getWatchStatusBadgeClass(item.status)
                        )}
                      >
                        {formatWatchStatusLabel(item.status)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="border-border/70 shadow-sm">
                <CardContent className="space-y-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {WATCH_STATUS_OPTIONS.map((option) => {
                      const Icon = statusIcons[option.value];
                      const isActive = item.status === option.value;
                      const isPending =
                        isEntryUpdating && pendingStatus === option.value;
                      return (
                        <Button
                          key={option.value}
                          type="button"
                          variant={"icon"}
                          className="h-full justify-between rounded-lg text-left"
                          onClick={() =>
                            onUpdateStatus({
                              entryId: item.entryId,
                              status: option.value,
                              title: item.title,
                            })
                          }
                          disabled={
                            (isEntryUpdating && !isActive) || isEntryRemoving
                          }
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <Icon className="size-4 hover:text-black" />
                            </span>
                            <div className="space-y-0.5">
                              <p className="text-sm font-semibold">
                                {option.label}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs tracking-[0.2em]">
                            {isPending ? (
                              <Loader />
                            ) : isActive ? (
                              <Check />
                            ) : null}
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full justify-between rounded-lg border border-destructive/50 bg-transparent text-left text-destructive hover:bg-destructive/15 focus-visible:ring-destructive/40"
                    onClick={() =>
                      onRemoveEntry({
                        entryId: item.entryId,
                        title: item.title,
                      })
                    }
                    disabled={isEntryRemoving || isEntryUpdating}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-destructive/20 text-destructive">
                        <Trash2 className="size-4" />
                      </span>
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold">
                          Remove from watchlist
                        </p>
                      </div>
                    </div>
                    <span className="text-xs tracking-[0.2em]">
                      {isEntryRemoving ? <Loader /> : null}
                    </span>
                  </Button>
                </CardContent>
              </Card>

              {/* <Card className="border-border/70 shadow-sm">
                <CardHeader className="space-y-1 pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-[0.25em] text-muted-foreground">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Future actions
                  </CardTitle>
                  <CardDescription>
                    Progress tracking, notes, and sharing wire in here.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                  <div className="rounded-md border border-dashed border-border/70 p-3">
                    <p className="font-semibold text-foreground">
                      Track progress
                    </p>
                    <p className="text-xs">
                      Episode and volume tracking hooks in here.
                    </p>
                  </div>
                  <div className="rounded-md border border-dashed border-border/70 p-3">
                    <p className="font-semibold text-foreground">
                      Notes & sharing
                    </p>
                    <p className="text-xs">
                      Personal notes, visibility, and sharing controls live
                      together.
                    </p>
                  </div>
                </CardContent>
              </Card> */}
            </div>
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
