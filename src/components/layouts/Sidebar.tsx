import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useSidebarStore } from "@/lib/stores";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Film,
  Home,
  LogIn,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect } from "react";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/anime", label: "Anime", icon: Film },
  { to: "/manga", label: "Manga", icon: BookOpen },
  { to: "/characters", label: "Characters", icon: Users },
];
const authItems = [
  { to: "/login", label: "Log in", icon: LogIn },
  { to: "/register", label: "Register", icon: UserPlus },
];

export default function Sidebar() {
  const collapsed = useSidebarStore((state) => state.collapsed);
  const setCollapsed = useSidebarStore((state) => state.setCollapsed);
  const mobileOpen = useSidebarStore((state) => state.mobileOpen);
  const setMobileOpen = useSidebarStore((state) => state.setMobileOpen);
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  return (
    <>
      {/* Mobile Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          id="mobile-sidebar"
          side="left"
          className="w-64 px-0"
          aria-label="Primary navigation"
        >
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
                  onClick={() => setMobileOpen(false)}
                >
                  <Link to={to}>
                    <Icon className="mr-2 h-4 w-4" />
                    {label}
                  </Link>
                </Button>
              );
            })}
            <div className="mt-4 flex flex-col gap-2 border-t border-border/60 pt-4">
              {authItems.map(({ to, label, icon: Icon }) => {
                const isActive = pathname === to;
                return (
                  <Button
                    key={to}
                    asChild
                    variant={isActive ? "secondary" : "ghost"}
                    className={`w-full justify-start ${
                      label === "Register"
                        ? "text-xs uppercase tracking-[0.3em]"
                        : ""
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Link to={to}>
                      <Icon className="mr-2 h-4 w-4" />
                      {label}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:bg-background md:border-r md:border-border transition-all duration-300 ${
          collapsed ? "md:w-16" : "md:w-64"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <Image
                src="/senkou-circle-logo.png"
                alt="Senkou Logo"
                width={1024}
                height={1024}
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
                className={cn(
                  "w-full",
                  collapsed ? "justify-center px-2" : "justify-start"
                )}
                title={collapsed ? label : undefined}
              >
                <Link to={to}>
                  <Icon className={`${collapsed ? "" : "mr-2"} h-4 w-4`} />
                  {!collapsed && label}
                </Link>
              </Button>
            );
          })}
          <div
            className={`mt-4 flex flex-col gap-2 border-t border-border/60 pt-4 ${
              collapsed ? "items-center" : ""
            }`}
          >
            {authItems.map(({ to, label, icon: Icon }) => {
              const isActive = pathname === to;
              return (
                <Button
                  key={to}
                  asChild
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full",
                    collapsed ? "justify-center px-2" : "justify-start",
                    label === "Register"
                      ? "text-xs uppercase tracking-[0.3em]"
                      : ""
                  )}
                  title={collapsed ? label : undefined}
                >
                  <Link to={to}>
                    <Icon className={`${collapsed ? "" : "mr-2"} h-4 w-4`} />
                    {!collapsed && label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}
