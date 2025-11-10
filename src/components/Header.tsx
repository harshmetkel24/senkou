"use client";

import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Film, Search, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/anime", label: "Anime", icon: Film },
  { to: "/manga", label: "Manga", icon: BookOpen },
  { to: "/characters", label: "Characters", icon: Users },
];

export default function Header() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <header className="border-b border-border bg-background/90 px-4 py-4 backdrop-blur md:px-6">
      <div className="mx-auto flex items-center justify-between w-full max-w-7xl flex-col gap-3 md:grid md:grid-cols-[auto_minmax(320px,1fr)_auto] md:items-center md:gap-6">
        <div className="flex gap-4">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/senkou-circle-logo.png"
              alt="Senkou Logo"
              className="h-10 w-10"
            />
            <span className="text-xl font-bold uppercase tracking-tighter">
              senkō!
            </span>
          </Link>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg hover:bg-muted md:hidden"
            aria-label="Menu"
          >
            <span className="sr-only">Menu</span>
            <div className="mb-1 h-0.5 w-6 bg-foreground"></div>
            <div className="mb-1 h-0.5 w-6 bg-foreground"></div>
            <div className="h-0.5 w-6 bg-foreground"></div>
          </Button>
        </div>
        <form
          role="search"
          className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card/80 px-4 py-2 text-sm shadow-sm focus-within:ring-2 focus-within:ring-ring/60 md:order-none"
          onSubmit={(event) => event.preventDefault()}
        >
          <input
            type="search"
            name="q"
            placeholder="Search anime, manga, characters..."
            className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none"
            autoComplete="off"
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/80"
          >
            <Search aria-hidden="true" />
          </Button>
        </form>

        <nav className="flex justify-end gap-2 md:order-none">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = pathname === to || pathname.startsWith(`${to}/`);
            return (
              <Button
                key={to}
                asChild
                variant={isActive ? "outline" : "ghost"}
                size="sm"
                className="hidden items-center gap-2 rounded-lg px-3 md:flex"
              >
                <Link to={to}>
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
