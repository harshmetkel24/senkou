import { Link } from "@tanstack/react-router";
import { Download, Github, Twitter, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/lib/hooks/use-pwa-install";
import { useSidebarStore } from "@/lib/stores";

export default function Footer() {
  const collapsed = useSidebarStore((state) => state.collapsed);
  const currentYear = new Date().getFullYear();
  const { isInstallable, isInstalled, install } = usePWAInstall();

  return (
    <footer
      className={`border-t border-border/50 bg-gradient-to-t from-muted/30 to-background/50 backdrop-blur transition-all duration-300 ${
        collapsed ? "md:ml-[5rem]" : "md:ml-64"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Brand Section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-foreground">
                Senkō
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              A beautiful, performant AniList browser crafted for cinematic
              browsing.
            </p>
            <div className="flex items-center gap-1 pt-2 text-xs text-muted-foreground">
              <Zap className="h-3 w-3 text-accent" />
              <span>Built with passion and care</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-foreground">
              Browse
            </h4>
            <nav className="flex flex-col gap-2">
              <Link
                to="/anime"
                className="text-xs text-muted-foreground transition hover:text-primary hover:translate-x-0.5"
              >
                Anime
              </Link>
              <Link
                to="/manga"
                className="text-xs text-muted-foreground transition hover:text-primary hover:translate-x-0.5"
              >
                Manga
              </Link>
              <Link
                to="/characters"
                className="text-xs text-muted-foreground transition hover:text-primary hover:translate-x-0.5"
              >
                Characters
              </Link>
              <Link
                to="/staff"
                className="text-xs text-muted-foreground transition hover:text-primary hover:translate-x-0.5"
              >
                Staff
              </Link>
            </nav>
          </div>

          {/* Resources */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-foreground">
              Resources
            </h4>
            <nav className="flex flex-col gap-2">
              <a
                href="https://anilist.co"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-muted-foreground transition hover:text-primary hover:translate-x-0.5"
              >
                AniList API
              </a>
              <a
                href="https://github.com/harshmetkel24/senkou"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-muted-foreground transition hover:text-primary hover:translate-x-0.5"
              >
                Source Code
              </a>
              <a
                href="https://github.com/harshmetkel24/senkou/issues"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-muted-foreground transition hover:text-primary hover:translate-x-0.5"
              >
                Report Issues
              </a>
            </nav>
          </div>

          {/* Social & Actions */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-foreground">
              Connect
            </h4>
            <div className="flex gap-2">
              <a
                href="https://github.com/harshmetkel24/senkou"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub repository"
                className="group flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-muted/30 transition hover:border-accent/50 hover:bg-accent/10"
              >
                <Github className="h-3.5 w-3.5 text-muted-foreground transition group-hover:text-accent" />
              </a>
              <a
                href="https://x.com/harshmetkel24"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter / X"
                className="group flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-muted/30 transition hover:border-primary/50 hover:bg-primary/10"
              >
                <Twitter className="h-3.5 w-3.5 text-muted-foreground transition group-hover:text-primary" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              Love the project?{" "}
              <span className="block text-[0.7rem] pt-1">
                Consider starring on GitHub
              </span>
            </p>
            {isInstallable && !isInstalled && (
              <Button
                onClick={install}
                size="sm"
                className="mt-2 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 shadow-md shadow-green-500/20"
              >
                <Download className="h-4 w-4" />
                Install App
              </Button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="my-4 h-px bg-gradient-to-r from-border/0 via-border/30 to-border/0"></div>

        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-center text-xs text-muted-foreground sm:text-left">
            <p>
              © {currentYear} Senkō • Made by{" "}
              <a
                href="https://isharsh.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="text-primary transition hover:text-primary/80"
              >
                Harsh Metkel
              </a>
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full border border-border/30 bg-muted/20 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-pulse"></span>
              Built with TanStack, Tailwind & ❤️
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
