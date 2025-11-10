import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/manga")({
  component: MangaRoute,
});

function MangaRoute() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Manga</h1>
      <p className="mt-2 text-muted-foreground">
        Placeholder content for the Manga route.
      </p>
    </main>
  );
}
