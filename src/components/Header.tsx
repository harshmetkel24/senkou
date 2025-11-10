"use client";

import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Film, Users } from "lucide-react";

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
    <header className="bg-accent-foreground border-b border-border px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/senkou-circle-logo.png"
            alt="Senkou Logo"
            className="w-10 h-10"
          />
          <span className="text-xl font-bold uppercase">senkō!</span>
        </Link>

        <nav className="hidden md:flex items-center gap-3">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = pathname === to || pathname.startsWith(`${to}/`);
            return (
              <Button
                key={to}
                asChild
                variant={isActive ? "outline" : "ghost"}
                size="sm"
                className="flex items-center gap-2 rounded-lg px-3"
              >
                <Link to={to}>
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              </Button>
            );
          })}
        </nav>

        {/* Mobile menu button - simplified */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden rounded-lg hover:bg-muted"
          aria-label="Menu"
        >
          <span className="sr-only">Menu</span>
          <div className="w-6 h-0.5 bg-foreground mb-1"></div>
          <div className="w-6 h-0.5 bg-foreground mb-1"></div>
          <div className="w-6 h-0.5 bg-foreground"></div>
        </Button>
      </div>
    </header>
  );
}
