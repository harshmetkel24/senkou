import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

import type { CharacterCardData } from "./character-card";
import { CharacterGrid, CharacterGridSkeleton } from "./character-grid";

type InfiniteCharacterGridProps = {
  pages: Array<{ items: CharacterCardData[] }>;
  onSelect?: (character: CharacterCardData) => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
};

export function InfiniteCharacterGrid({
  pages,
  onSelect,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: InfiniteCharacterGridProps) {
  const { sentinelRef } = useInfiniteScroll({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });

  const allItems = pages.flatMap((page) => page.items);

  return (
    <>
      <CharacterGrid items={allItems} onSelect={onSelect} />
      <div ref={sentinelRef} className="mt-8">
        {isFetchingNextPage && <CharacterGridSkeleton />}
        {!hasNextPage && allItems.length > 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            You&apos;ve seen it all
          </p>
        )}
      </div>
    </>
  );
}
