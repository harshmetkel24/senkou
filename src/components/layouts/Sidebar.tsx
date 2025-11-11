"use client";

import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Film,
  Home,
  Menu,
  Users,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSidebarStore } from "@/lib/stores";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/anime", label: "Anime", icon: Film },
  { to: "/manga", label: "Manga", icon: BookOpen },
  { to: "/characters", label: "Characters", icon: Users },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const collapsed = useSidebarStore((state) => state.collapsed);
  const setCollapsed = useSidebarStore((state) => state.setCollapsed);
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <>
      {/* Mobile Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <SheetHeader>
            <SheetTitle className="text-left">Navigation</SheetTitle>
          </SheetHeader>
          <nav className="mt-6 space-y-2">
            {navItems.map(({ to, label, icon: Icon }) => {
              const isActive = pathname === to || pathname.startsWith(`${to}/`);
              return (
                <Button
                  key={to}
                  asChild
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setOpen(false)}
                >
                  <Link to={to}>
                    <Icon className="mr-2 h-4 w-4" />
                    {label}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:bg-background md:border-r md:border-border transition-all duration-300 ${collapsed ? "md:w-16" : "md:w-64"}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <img
                src="/senkou-circle-logo.png"
                alt="Senkou Logo"
                className="h-8 w-8"
              />
              <span className="text-lg font-bold uppercase tracking-tighter">
                senkō!
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive =
              pathname === to || (to !== "/" && pathname.startsWith(`${to}/`));
            return (
              <Button
                key={to}
                asChild
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full ${collapsed ? "justify-center px-2" : "justify-start"}`}
                title={collapsed ? label : undefined}
              >
                <Link to={to}>
                  <Icon className={`${collapsed ? "" : "mr-2"} h-4 w-4`} />
                  {!collapsed && label}
                </Link>
              </Button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
