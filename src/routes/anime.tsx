import { keepPreviousData, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Activity, Film, RefreshCw, Sparkles, Wand2 } from "lucide-react";
import { useMemo, useState } from "react";

import {
  MediaDetailPanel,
  type MediaDetailData,
} from "@/components/media/media-detail-panel";
import { MediaGrid } from "@/components/media/media-grid";
import { HighlightCard } from "@/components/media/highlight-card";
import { Button } from "@/components/ui/button";
import { fetchTrendingAnime } from "@/data/queries/anime";

const trendingAnimeQueryOptions = () => ({
  queryKey: ["anime", "trending", 1],
  queryFn: () => fetchTrendingAnime(1, 20),
  staleTime: 1000 * 60 * 5,
  placeholderData: keepPreviousData,
});

export const Route = createFileRoute("/anime")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(trendingAnimeQueryOptions()),
  component: AnimeRoute,
});

function AnimeRoute() {
  const { data, isFetching } = useSuspenseQuery(trendingAnimeQueryOptions());
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeMedia, setActiveMedia] = useState<MediaDetailData | undefined>(
    undefined,
  );

  const spotlight = useMemo(() => data.items[0], [data.items]);

  const handleSelect = (media: MediaDetailData) => {
    setActiveMedia(media);
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
  };

  return (
    <main className="relative min-h-screen bg-background px-4 py-10 md:px-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-50"
      >
        <div className="absolute inset-x-0 top-10 mx-auto h-64 max-w-5xl rounded-full bg-amber-500/10 blur-[150px]" />
        <div className="absolute bottom-10 left-8 h-48 w-48 rounded-full bg-yellow-500/10 blur-3xl" />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
        {spotlight ? (
          <section className="relative overflow-hidden rounded-[36px] border border-border/60 bg-card/70 shadow-[0_45px_120px_rgba(0,0,0,0.55)]">
            <div className="absolute inset-0">
              <img
                src={spotlight.bannerImage ?? spotlight.coverImage}
                alt={`${spotlight.title} banner art`}
                className="h-full w-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/60 to-black/30" />
            </div>
            <div className="relative grid gap-8 px-8 py-10 md:grid-cols-[1.2fr_minmax(0,0.8fr)] md:px-12 md:py-14">
              <div className="space-y-5 text-white">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-white/70">
                  <Sparkles className="h-4 w-4" />
                  Trending spotlight
                </p>
                <h1 className="text-3xl font-black leading-tight md:text-4xl">
                  {spotlight.title}
                </h1>
                <p className="text-sm text-white/80 md:text-base">
                  {spotlight.description ??
                    "Dive into the latest cinematic anime experiences curated straight from AniList’s live charts."}
                </p>

                <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.35em] text-white/80">
                  {spotlight.genres.slice(0, 3).map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full border border-white/20 bg-white/10 px-4 py-1"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4">
                  <Button
                    type="button"
                    className="rounded-2xl bg-primary/90 px-6 py-5 text-base"
                    onClick={() => handleSelect(spotlight)}
                  >
                    <Film className="h-5 w-5" />
                    Open Full Details
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-2xl border border-white/20 px-6 py-5 text-base text-white hover:bg-white/10"
                  >
                    <Wand2 className="h-5 w-5" />
                    Surprise me
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <HighlightCard
                  label="Audience score"
                  value={
                    spotlight.averageScore
                      ? `${spotlight.averageScore}%`
                      : "N/A"
                  }
                  icon={<Activity className="h-5 w-5 text-yellow-300" />}
                />
                <HighlightCard
                  label="Episodes"
                  value={
                    spotlight.episodes ? `${spotlight.episodes} ep` : "TBD"
                  }
                  icon={<Film className="h-5 w-5 text-sky-300" />}
                />
                <HighlightCard
                  label="Status"
                  value={spotlight.status ?? "TBD"}
                  icon={<Sparkles className="h-5 w-5 text-emerald-300" />}
                />
                <HighlightCard
                  label="Season"
                  value={
                    spotlight.seasonYear
                      ? `${spotlight.season ?? ""} ${spotlight.seasonYear}`.trim()
                      : (spotlight.season ?? "TBA")
                  }
                  icon={<Wand2 className="h-5 w-5 text-violet-300" />}
                />
              </div>
            </div>
          </section>
        ) : null}

        <section className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                ANIList Live Charts
              </p>
              <h2 className="mt-2 text-3xl font-bold">
                Cinematic cards built for binge planning
              </h2>
            </div>
            {isFetching ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-xs uppercase tracking-[0.35em] text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Updating
              </span>
            ) : null}
          </div>

          <MediaGrid items={data.items} onSelect={handleSelect} />
        </section>
      </div>

      <MediaDetailPanel
        media={activeMedia}
        open={isPanelOpen}
        onClose={closePanel}
      />
    </main>
  );
}
