import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "@/components/ui/sonner";
import { logoutFn } from "@/lib/auth/login";
import { useSidebarStore } from "@/lib/stores";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Film,
  Home,
  LogIn,
  LogOut,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";

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
const profileItem = { to: "/profile", label: "Profile", icon: User };

export default function Sidebar() {
  const { user } = useAuth();

  const collapsed = useSidebarStore((state) => state.collapsed);
  const setCollapsed = useSidebarStore((state) => state.setCollapsed);
  const mobileOpen = useSidebarStore((state) => state.mobileOpen);
  const setMobileOpen = useSidebarStore((state) => state.setMobileOpen);
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const navigate = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: logoutFn,
    onSuccess: (response) => {
      if (!response?.success) {
        toast.error("User logged out failed", {
          description: "Please try again in a moment.",
        });
        return;
      }

      toast.success("Signed in", {
        description: "Redirecting you to your dashboard.",
      });
      navigate({ to: "/" });
    },
    onError: (error) => {
      const description =
        error instanceof Error ? error.message : "Please try again.";
      toast.error("Logout failed", { description });
    },
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
          <div className="flex h-full flex-col">
            <SheetHeader className="px-4">
              <SheetTitle className="text-left">Navigation</SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-1 flex-col space-y-2 px-4">
              <div className="space-y-2">
                {navItems.map(({ to, label, icon: Icon }) => {
                  // FIXME: should use route matching here to find active route
                  const isActive =
                    pathname === to ||
                    (to !== "/" && pathname.startsWith(`${to}/`));
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
                        <Icon
                          className={`${collapsed ? "" : "mr-2"} h-4 w-4`}
                        />
                        {!collapsed && label}
                      </Link>
                    </Button>
                  );
                })}
              </div>
              <div className="mt-auto flex flex-col gap-2 border-t border-border/60 pb-6 pt-4">
                {user ? (
                  <>
                    <Link to={profileItem.to}>
                      {({ isActive }) => (
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => setMobileOpen(false)}
                        >
                          <profileItem.icon className="mr-2 h-4 w-4" />
                          {profileItem.label}
                        </Button>
                      )}
                    </Link>
                    <Button
                      variant="destructive"
                      disabled={logoutMutation.isPending}
                      className="w-full justify-start"
                      onClick={() => logoutMutation.mutate(undefined)}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  authItems.map(({ to, label, icon: Icon }) => {
                    // FIXME: should use route matching here to find active route
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
                  })
                )}
              </div>
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={`relative hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:bg-background md:border-r md:border-border md:overflow-visible md:z-30 transition-all duration-300 ${
          collapsed ? "md:w-[5rem]" : "md:w-64"
        }`}
      >
        <div
          className={cn(
            "flex items-center border-b border-border p-4",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          <div className="flex items-center gap-3">
            <Image
              src="/senkou-circle-logo.png"
              alt="Senkou Logo"
              width={1024}
              height={1024}
              className="h-12 w-12"
            />
            {!collapsed && (
              <span className="text-lg font-bold uppercase tracking-tighter">
                senkō!
              </span>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={cn("h-8 w-8", {
              "absolute -right-4 top-6 z-50 rounded-full border border-border bg-background shadow-lg":
                collapsed,
            })}
            aria-label="Toggle Sidebar"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <nav className="flex flex-1 flex-col p-4">
          <div className="space-y-2">
            {navItems.map(({ to, label, icon: Icon }) => {
              // FIXME: should use route matching here to find active route
              const isActive =
                pathname === to ||
                (to !== "/" && pathname.startsWith(`${to}/`));
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
          </div>
          <div
            className={cn(
              "mt-auto flex flex-col gap-2 border-t border-border/60 pt-4",
              collapsed ? "items-center" : ""
            )}
          >
            {user ? (
              <>
                <Button
                  asChild
                  variant={pathname === profileItem.to ? "secondary" : "ghost"}
                  className={cn(
                    "w-full",
                    collapsed ? "justify-center px-2" : "justify-start"
                  )}
                  title={collapsed ? profileItem.label : undefined}
                >
                  <Link to={profileItem.to}>
                    <profileItem.icon
                      className={`${collapsed ? "" : "mr-2"} h-4 w-4`}
                    />
                    {!collapsed && profileItem.label}
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  className={cn(
                    "w-full",
                    collapsed ? "justify-center px-2" : "justify-start"
                  )}
                  title={collapsed ? "Logout" : undefined}
                  onClick={() => logoutFn()}
                >
                  <LogOut className={cn("h-4 w-4", { "mr-2": !collapsed })} />
                  {!collapsed && "Logout"}
                </Button>
              </>
            ) : (
              authItems.map(({ to, label, icon: Icon }) => {
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
                      <Icon className={cn("h-4 w-4", { "mr-2": !collapsed })} />
                      {!collapsed && label}
                    </Link>
                  </Button>
                );
              })
            )}
          </div>
        </nav>
      </aside>
    </>
  );
}
