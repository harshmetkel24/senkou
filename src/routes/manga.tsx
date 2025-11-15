import { keepPreviousData, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  Layers,
  Library,
  RefreshCw,
  ScrollText,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

import { RouteErrorBoundary } from "@/components/helpers/RouteErrorBoundary";
import { HighlightCard } from "@/components/media/highlight-card";
import {
  MediaDetailPanel,
  type MediaDetailData,
} from "@/components/media/media-detail-panel";
import { MediaGrid } from "@/components/media/media-grid";
import { Button } from "@/components/ui/button";
import { fetchTrendingManga } from "@/data/queries/manga";

const trendingMangaQueryOptions = () => ({
  queryKey: ["manga", "trending", 1],
  queryFn: () => fetchTrendingManga(1, 20),
  staleTime: 1000 * 60 * 5,
  placeholderData: keepPreviousData,
});

export const Route = createFileRoute("/manga")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(trendingMangaQueryOptions()),
  component: MangaRoute,
  errorComponent: (props) => (
    <RouteErrorBoundary
      {...props}
      title="Manga page glitched out"
      description="The illustrated lineup couldn't load. Give it another shot or pick a different tab."
    />
  ),
});

function MangaRoute() {
  const { data, isFetching } = useSuspenseQuery(trendingMangaQueryOptions());
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeMedia, setActiveMedia] = useState<MediaDetailData | undefined>();

  const spotlight = useMemo(() => data.items[0], [data.items]);

  const handleSelect = (media: MediaDetailData) => {
    setActiveMedia(media);
    setIsPanelOpen(true);
  };

  return (
    <main className="relative min-h-screen px-4 py-10 md:px-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
      >
        <div className="absolute inset-x-0 top-14 mx-auto h-64 max-w-5xl rounded-full bg-rose-500/15 blur-[150px]" />
        <div className="absolute bottom-0 right-10 h-48 w-48 rounded-full bg-purple-500/15 blur-3xl" />
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
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/65 to-black/35" />
            </div>
            <div className="relative grid gap-8 px-8 py-10 md:grid-cols-[1.1fr_minmax(0,0.9fr)] md:px-12 md:py-14">
              <div className="space-y-5 text-white">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-white/70">
                  <Sparkles className="h-4 w-4" />
                  Library spotlight
                </p>
                <h1 className="text-3xl font-black leading-tight md:text-4xl">
                  {spotlight.title}
                </h1>
                <p className="text-sm text-white/80 md:text-base">
                  {spotlight.description ??
                    "Hand-picked graphic epics sourced directly from AniList’s live manga rankings."}
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
                    <BookOpen className="h-5 w-5" />
                    Open full entry
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-2xl border border-white/20 px-6 py-5 text-base text-white hover:bg-white/10"
                  >
                    <ScrollText className="h-5 w-5" />
                    Random chapter
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
                  icon={<Sparkles className="h-5 w-5 text-rose-200" />}
                />
                <HighlightCard
                  label="Chapters"
                  value={spotlight.chapters ? `${spotlight.chapters}` : "TBD"}
                  icon={<Layers className="h-5 w-5 text-amber-200" />}
                />
                <HighlightCard
                  label="Volumes"
                  value={spotlight.volumes ? `${spotlight.volumes}` : "TBD"}
                  icon={<Library className="h-5 w-5 text-sky-200" />}
                />
                <HighlightCard
                  label="Status"
                  value={spotlight.status ?? "TBD"}
                  icon={<BookOpen className="h-5 w-5 text-emerald-200" />}
                />
              </div>
            </div>
          </section>
        ) : null}

        <section className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                AniList Illustrated Charts
              </p>
              <h2 className="mt-2 text-3xl font-bold">
                Prestige manga made for binge reading
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
        onClose={() => setIsPanelOpen(false)}
      />
    </main>
  );
}
