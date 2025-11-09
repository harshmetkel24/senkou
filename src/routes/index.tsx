import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <div className="min-h-screen text-foreground bg-gradient-to-b from-[var(--color-background)] via-[var(--color-card)] to-[var(--color-background)]">
      <section className="relative py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-secondary)]" />
        <div className="relative max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-6 mb-6">
            <img
              src="/senkou-full.png"
              alt="TanStack Logo"
              className="w-24 h-24 md:w-32 md:h-32"
            />
            <h1 className="text-6xl md:text-7xl font-black [letter-spacing:-0.08em]">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]">
                SENKOU
              </span>
            </h1>
          </div>
          <p className="text-2xl md:text-3xl text-muted-foreground mb-4 font-light">
            Endless light. Endless stories.
          </p>
        </div>
      </section>
    </div>
  );
}
