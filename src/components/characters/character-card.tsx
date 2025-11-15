import { Flame, Heart, Sparkles } from "lucide-react";
import { Image } from "@unpic/react";

import type { CharacterListItem } from "@/data/queries/characters";
import { cn } from "@/lib/utils";

export type CharacterCardData = CharacterListItem;

type CharacterCardProps = {
  character: CharacterCardData;
  onSelect?: (character: CharacterCardData) => void;
};

export function CharacterCard({ character, onSelect }: CharacterCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(character)}
      className={cn(
        "group flex flex-col rounded-3xl border border-border/80 bg-gradient-to-b from-card/80 to-background/30 p-5 text-left shadow-[0_20px_50px_rgba(0,0,0,0.45)] transition hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70",
      )}
      aria-label={`Open profile for ${character.name}`}
    >
      <div className="flex gap-4">
        <div className="relative h-36 w-28 overflow-hidden rounded-2xl border border-border/60 bg-background/40">
          <Image
            src={character.image}
            alt={character.name}
            width={600}
            height={800}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          <div className="absolute left-2 top-2 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-white">
            {character.gender ?? "Icon"}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
              {character.nativeName ?? "Character"}
            </p>
            <h3 className="mt-1 text-xl font-semibold leading-tight text-foreground">
              {character.name}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {character.favorites ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-border/70 px-2 py-1">
                <Heart className="h-4 w-4 text-rose-400" />
                {Intl.NumberFormat("en", {
                  notation: "compact",
                }).format(character.favorites)}
              </span>
            ) : null}
            {character.age ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-border/70 px-2 py-1">
                <Sparkles className="h-4 w-4 text-amber-400" />
                Age {character.age}
              </span>
            ) : null}
            {character.appearances.length ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-border/70 px-2 py-1">
                <Flame className="h-4 w-4 text-primary" />
                {character.appearances.length} roles
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">
        {character.description ??
          "We are still collecting lore for this standout character."}
      </p>

      {character.appearances.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {character.appearances.slice(0, 3).map((appearance) => (
            <span
              key={appearance.id}
              className="rounded-full border border-border/80 bg-background/60 px-3 py-1 text-xs uppercase tracking-wide text-muted-foreground transition group-hover:border-primary/70 group-hover:text-primary"
            >
              {appearance.title}
            </span>
          ))}
        </div>
      ) : null}
    </button>
  );
}
