import { Github } from "lucide-react";

import { useSidebarStore } from "@/lib/stores";

export default function Footer() {
  const collapsed = useSidebarStore((state) => state.collapsed);
  return (
    <footer
      className={`border-t border-border bg-muted/50 text-muted-foreground transition-all duration-300 ${
        collapsed ? "md:ml-[5rem]" : "md:ml-64"
      }`}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-foreground">Senkou • AniList seeker</p>
          <p className="text-sm text-muted-foreground">
            Crafted for buttery scrolls, thoughtful filters, and calm night browsing.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <p className="text-xs font-semibold tracking-[0.3em] text-muted-foreground">stay in orbit</p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-foreground">
            <span className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              like my work, please hit a ⭐
            </span>
            <a
              href="https://github.com/harshmetkel24/senkou"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full border border-border bg-accent/5 px-4 py-2 text-[0.85rem] font-medium text-foreground transition hover:border-accent hover:bg-accent/10"
            >
              <Github className="h-4 w-4" aria-hidden />
              <span>github.com/harshmetkel24/senkou</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
