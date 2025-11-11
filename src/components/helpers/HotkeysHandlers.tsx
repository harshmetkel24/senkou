import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { useSidebarStore } from "@/lib/stores";

export function HotkeysHandlers() {
  const location = useLocation();
  const navigate = useNavigate();
  const toggleSidebar = useSidebarStore((state) => state.toggleSidebar);
  const setShouldFocusSearch = useSidebarStore(
    (state) => state.setShouldFocusSearch,
  );
  const setHelpDialogOpen = useSidebarStore((state) => state.setHelpDialogOpen);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "k") {
          e.preventDefault();
          setShouldFocusSearch(true);
          if (location.pathname !== "/") {
            navigate({ to: "/" });
          }
        } else if (e.key === "s") {
          e.preventDefault();
          toggleSidebar();
        }
      } else if (e.shiftKey && e.key === "?") {
        e.preventDefault();
        setHelpDialogOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    location.pathname,
    navigate,
    toggleSidebar,
    setShouldFocusSearch,
    setHelpDialogOpen,
  ]);

  return null;
}
