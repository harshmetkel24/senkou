import { keepPreviousData, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Heart, RefreshCw, Sparkles, Star } from "lucide-react";
import { useMemo, useState } from "react";

import type { CharacterCardData } from "@/components/characters/character-card";
import { CharacterDetailPanel } from "@/components/characters/character-detail-panel";
import { CharacterGrid } from "@/components/characters/character-grid";
import { Button } from "@/components/ui/button";
import { fetchTrendingCharacters } from "@/data/queries/characters";

const trendingCharactersQueryOptions = () => ({
  queryKey: ["characters", "trending", 1],
  queryFn: () => fetchTrendingCharacters(1, 20),
  staleTime: 1000 * 60 * 5,
  placeholderData: keepPreviousData,
});

export const Route = createFileRoute("/characters")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(trendingCharactersQueryOptions()),
  component: CharactersRoute,
});

function CharactersRoute() {
  const { data, isFetching } = useSuspenseQuery(
    trendingCharactersQueryOptions(),
  );
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeCharacter, setActiveCharacter] = useState<
    CharacterCardData | undefined
  >();

  const spotlight = useMemo(() => data.items[0], [data.items]);

  const handleSelect = (character: CharacterCardData) => {
    setActiveCharacter(character);
    setIsPanelOpen(true);
  };

  return (
    <main className="relative min-h-screen px-4 py-10 md:px-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
      >
        <div className="absolute left-10 top-16 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute bottom-8 right-12 h-72 w-72 rounded-full bg-pink-500/15 blur-[160px]" />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
        {spotlight ? (
          <section className="relative overflow-hidden rounded-[36px] border border-border/60 bg-card/80 shadow-[0_45px_120px_rgba(0,0,0,0.55)]">
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/25" />
            <div className="relative grid gap-10 px-8 py-10 md:grid-cols-[minmax(0,1fr)_320px] md:px-12 md:py-14">
              <div className="space-y-5 text-white">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-white/70">
                  <Sparkles className="h-4 w-4" />
                  Character spotlight
                </p>
                <h1 className="text-3xl font-black leading-tight md:text-4xl">
                  {spotlight.name}
                </h1>
                <p className="text-sm text-white/80 md:text-base">
                  {spotlight.description ??
                    "From cult favorites to chart-topping leads—meet AniList’s most beloved characters in real time."}
                </p>

                <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.35em] text-white/80">
                  {spotlight.appearances.slice(0, 3).map((appearance) => (
                    <span
                      key={appearance.id}
                      className="rounded-full border border-white/20 bg-white/10 px-4 py-1"
                    >
                      {appearance.title}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4">
                  <Button
                    type="button"
                    className="rounded-2xl bg-primary/90 px-6 py-5 text-base"
                    onClick={() => handleSelect(spotlight)}
                  >
                    <Heart className="h-5 w-5" />
                    Open full profile
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-2xl border border-white/20 px-6 py-5 text-base text-white hover:bg-white/10"
                  >
                    <Star className="h-5 w-5" />
                    Shuffle spotlight
                  </Button>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black/40">
                <img
                  src={spotlight.image}
                  alt={spotlight.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 flex gap-2 text-xs uppercase tracking-[0.35em] text-white/80">
                  {spotlight.gender ? (
                    <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1">
                      {spotlight.gender}
                    </span>
                  ) : null}
                  {spotlight.age ? (
                    <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1">
                      Age {spotlight.age}
                    </span>
                  ) : null}
                  {spotlight.favorites ? (
                    <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1">
                      {Intl.NumberFormat("en", {
                        notation: "compact",
                      }).format(spotlight.favorites)}{" "}
                      favs
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                AniList Character Index
              </p>
              <h2 className="mt-2 text-3xl font-bold">
                Your favorite voices, all in one canon
              </h2>
            </div>
            {isFetching ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-xs uppercase tracking-[0.35em] text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Updating
              </span>
            ) : null}
          </div>

          <CharacterGrid items={data.items} onSelect={handleSelect} />
        </section>
      </div>

      <CharacterDetailPanel
        character={activeCharacter}
        open={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </main>
  );
}
