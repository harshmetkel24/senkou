import { Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-slate-950/80 text-slate-200">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-white">Senkou • AniList seeker</p>
          <p className="text-sm text-slate-300">
            Crafted for buttery scrolls, thoughtful filters, and calm night browsing.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <p className="text-xs font-semibold tracking-[0.3em] text-slate-500">stay in orbit</p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-100">
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
              like my work, please hit a ⭐
            </span>
            <a
              href="https://github.com/harshmetkel24/senkou"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-[0.85rem] font-medium text-white transition hover:border-white/60 hover:bg-white/10"
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
