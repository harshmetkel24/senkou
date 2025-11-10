import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/characters")({
  component: CharactersRoute,
});

function CharactersRoute() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Characters</h1>
      <p className="mt-2 text-muted-foreground">
        Placeholder content for the Characters route.
      </p>
    </main>
  );
}
