import { useCallback, useEffect, useMemo, useState } from "react";

type Identifiable = { id: number | string };

type SpotlightOptions = {
  size?: number;
};

export function useSpotlightDeck<T extends Identifiable>(
  items: T[],
  options?: SpotlightOptions,
) {
  const desiredSize = Math.max(0, Math.floor(options?.size ?? 5));
  const [selectedIds, setSelectedIds] = useState<Array<T["id"]>>(() =>
    sampleIds(items, desiredSize),
  );

  useEffect(() => {
    setSelectedIds((current) => {
      const limit = Math.min(desiredSize, items.length);
      if (limit === 0) {
        return current.length ? [] : current;
      }

      const availableIds = new Set(items.map((item) => item.id));
      const preserved = current.filter((id) => availableIds.has(id));

      if (preserved.length >= limit) {
        const trimmed = preserved.slice(0, limit);
        const unchanged =
          trimmed.length === current.length &&
          trimmed.every((id, index) => id === current[index]);
        return unchanged ? current : trimmed;
      }

      const needed = limit - preserved.length;
      const unusedItems = items.filter((item) => !preserved.includes(item.id));
      const refill = sampleIds(unusedItems, needed);

      return [...preserved, ...refill];
    });
  }, [desiredSize, items]);

  const shuffleSpotlights = useCallback(() => {
    const limit = Math.min(desiredSize, items.length);
    if (limit === 0) {
      setSelectedIds((current) => (current.length ? [] : current));
      return;
    }

    setSelectedIds(sampleIds(items, limit));
  }, [desiredSize, items]);

  const spotlightItems = useMemo(() => {
    if (!selectedIds.length || !items.length) return [] as T[];
    const lookup = new Map(items.map((item) => [item.id, item]));
    return selectedIds.map((id) => lookup.get(id)).filter(Boolean) as T[];
  }, [items, selectedIds]);

  return { spotlightItems, shuffleSpotlights } as const;
}

function sampleIds<T extends Identifiable>(
  items: T[],
  count: number,
): Array<T["id"]> {
  if (!items.length || count <= 0) return [];

  const pool = [...items];
  const selection: Array<T["id"]> = [];
  const limit = Math.min(count, pool.length);

  for (let index = 0; index < limit; index++) {
    const pickIndex = Math.floor(Math.random() * pool.length);
    const [item] = pool.splice(pickIndex, 1);
    selection.push(item.id);
  }

  return selection;
}
