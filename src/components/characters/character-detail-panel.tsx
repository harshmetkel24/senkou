import { Image } from "@unpic/react";
import { Flame, Heart, ImageOff, Sparkles, User, X } from "lucide-react";

import type { CharacterCardData } from "./character-card";

type CharacterDetailPanelProps = {
  character?: CharacterCardData;
  open: boolean;
  onClose: () => void;
};

export function CharacterDetailPanel({
  character,
  open,
  onClose,
}: CharacterDetailPanelProps) {
  if (!character) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 transition-opacity ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={`${character.name} details`}
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <article className="relative z-10 grid max-h-[92vh] w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-b from-card/90 via-background/95 to-background shadow-[0_40px_90px_rgba(0,0,0,0.65)] md:grid-cols-[320px_minmax(0,1fr)]">
        <div className="relative h-full bg-black/30">
          <Image
            src={character.image}
            alt={character.name}
            width={700}
            height={900}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/50" />
          <div className="absolute left-6 top-6 rounded-full border border-white/20 bg-black/40 px-4 py-1 text-sm font-semibold uppercase tracking-[0.4em] text-white">
            Icon
          </div>
          <button
            type="button"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white hover:bg-white/10"
            onClick={onClose}
            aria-label="Close details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-6 overflow-y-auto px-6 py-6 md:px-8 md:py-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground">
              {character.nativeName ?? "Legend"}
            </p>
            <h2 className="mt-2 text-3xl font-black leading-tight text-foreground md:text-4xl">
              {character.name}
            </h2>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {character.favorites ? (
              <span className="inline-flex items-center gap-2 rounded-2xl border border-border/70 bg-background/40 px-3 py-1">
                <Heart className="h-4 w-4 text-rose-400" />
                {Intl.NumberFormat("en", {
                  notation: "compact",
                }).format(character.favorites)}{" "}
                favorites
              </span>
            ) : null}
            {character.gender ? (
              <span className="inline-flex items-center gap-2 rounded-2xl border border-border/70 bg-background/40 px-3 py-1">
                <User className="h-4 w-4 text-sky-300" />
                {character.gender}
              </span>
            ) : null}
            {character.age ? (
              <span className="inline-flex items-center gap-2 rounded-2xl border border-border/70 bg-background/40 px-3 py-1">
                <Sparkles className="h-4 w-4 text-amber-300" />
                Age {character.age}
              </span>
            ) : null}
            {character.appearances.length ? (
              <span className="inline-flex items-center gap-2 rounded-2xl border border-border/70 bg-background/40 px-3 py-1">
                <Flame className="h-4 w-4 text-primary" />
                {character.appearances.length} appearances
              </span>
            ) : null}
          </div>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              Biography
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {character.description ??
                "More lore coming soon for this iconic character."}
            </p>
          </section>

          {character.appearances.length ? (
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                Notable appearances
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {character.appearances.map((media) => (
                  <div
                    key={media.id}
                    className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/40 p-3"
                  >
                    <div className="h-14 w-14 overflow-hidden rounded-xl border border-border/60 bg-muted/20">
                      {media.coverImage ? (
                        <Image
                          src={media.coverImage}
                          alt={media.title}
                          width={400}
                          height={600}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageOff className="h-full w-full p-3 text-muted-foreground/50" />
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
                        {media.format ?? media.type ?? "Media"}
                      </p>
                      <p className="text-sm font-semibold leading-snug">
                        {media.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </article>
    </div>
  );
}
