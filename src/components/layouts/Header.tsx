"use client";

import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/lib/stores";

export default function Header() {
  const collapsed = useSidebarStore((state) => state.collapsed);
  const mobileOpen = useSidebarStore((state) => state.mobileOpen);
  const setMobileOpen = useSidebarStore((state) => state.setMobileOpen);

  const toggleMobileSidebar = () => setMobileOpen(!mobileOpen);

  return (
    <header
      className={`border-b border-border bg-background/90 px-4 backdrop-blur md:px-6 transition-all duration-300 ${collapsed ? "md:ml-16" : "md:ml-64"}`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center flex-1">
        <div className="flex items-center gap-4 justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-sidebar"
            onClick={toggleMobileSidebar}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          <Link to="/" className="flex items-center gap-3 md:hidden">
            <img
              src="/senkou-circle-logo.png"
              alt="Senkou Logo"
              className="h-10 w-10"
            />
            <span className="text-xl font-bold uppercase tracking-tighter">
              senkō!
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
