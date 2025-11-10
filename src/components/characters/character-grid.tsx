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
