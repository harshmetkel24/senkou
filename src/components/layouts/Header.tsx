import { Link, useLocation } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import _includes from "lodash/includes";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/ui/search-bar";
import { useSidebarStore } from "@/lib/stores";
import { cn } from "@/lib/utils";

const PATHS_TO_HIDE_SEARCH_BAR = ["/", "/profile"];

export default function Header() {
  const collapsed = useSidebarStore((state) => state.collapsed);
  const mobileOpen = useSidebarStore((state) => state.mobileOpen);
  const setMobileOpen = useSidebarStore((state) => state.setMobileOpen);
  const location = useLocation();

  const toggleMobileSidebar = () => setMobileOpen(!mobileOpen);

  const searchBarHidden = _includes(
    PATHS_TO_HIDE_SEARCH_BAR,
    location.pathname
  );

  return (
    <header
      className={cn(
        "border-b border-border bg-background/90 px-4 backdrop-blur md:px-6 transition-all duration-300 flex items-center",
        collapsed ? "md-[5rem]" : "md:ml-64",
        {
          "h-[5rem]": !searchBarHidden,
        }
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center">
        <div className="flex items-center gap-4">
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
            <Image
              src="/senkou-circle-logo.png"
              alt="Senkou Logo"
              width={1024}
              height={1024}
              className="h-10 w-10"
            />
            {searchBarHidden ? (
              <span className="text-xl font-bold uppercase tracking-tighter">
                senkō!
              </span>
            ) : null}
          </Link>
        </div>
        <div className="flex-1 flex justify-center px-4">
          {!searchBarHidden && <SearchBar />}
        </div>
      </div>
    </header>
  );
}
