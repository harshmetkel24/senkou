import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/anime")({
  component: AnimeRoute,
});

function AnimeRoute() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Anime</h1>
      <p className="mt-2 text-muted-foreground">
        Placeholder content for the Anime route.
      </p>
    </main>
  );
}
