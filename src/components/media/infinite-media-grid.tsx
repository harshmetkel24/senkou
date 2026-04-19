import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

import type { MediaCardData } from "./media-card";
import { MediaGrid, MediaGridSkeleton } from "./media-grid";

type InfiniteMediaGridProps = {
  pages: Array<{ items: MediaCardData[] }>;
  onSelect?: (media: MediaCardData) => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
};

export function InfiniteMediaGrid({
  pages,
  onSelect,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: InfiniteMediaGridProps) {
  const { sentinelRef } = useInfiniteScroll({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });

  const allItems = pages.flatMap((page) => page.items);

  return (
    <>
      <MediaGrid items={allItems} onSelect={onSelect} />
      <div ref={sentinelRef} className="mt-8">
        {isFetchingNextPage && <MediaGridSkeleton />}
        {!hasNextPage && allItems.length > 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            You&apos;ve seen it all
          </p>
        )}
      </div>
    </>
  );
}
