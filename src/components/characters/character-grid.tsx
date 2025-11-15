import { CharacterCard, type CharacterCardData } from "./character-card";

type CharacterGridProps = {
  items: CharacterCardData[];
  onSelect?: (character: CharacterCardData) => void;
};

export function CharacterGrid({ items, onSelect }: CharacterGridProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {items.map((character) => (
        <CharacterCard
          key={character.id}
          character={character}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

export function CharacterGridSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-3xl border border-border/70 bg-card/40 p-5"
        >
          <div className="flex gap-4">
            <div className="h-36 w-28 rounded-2xl bg-muted/40" />
            <div className="flex flex-1 flex-col gap-3">
              <div className="h-3 w-24 rounded-full bg-muted/40" />
              <div className="h-4 w-3/4 rounded-full bg-muted/50" />
              <div className="h-4 w-1/2 rounded-full bg-muted/30" />
              <div className="flex gap-2">
                <div className="h-6 w-16 rounded-full bg-muted/30" />
                <div className="h-6 w-16 rounded-full bg-muted/30" />
              </div>
            </div>
          </div>
          <div className="mt-4 h-12 rounded-2xl bg-muted/20" />
        </div>
      ))}
    </div>
  );
}
