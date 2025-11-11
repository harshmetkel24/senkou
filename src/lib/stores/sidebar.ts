import { create } from "zustand";

interface SidebarState {
  collapsed: boolean;
  shouldFocusSearch: boolean;
  helpDialogOpen: boolean;
}

interface SidebarActions {
  setCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setShouldFocusSearch: (focus: boolean) => void;
  setHelpDialogOpen: (open: boolean) => void;
}

type SidebarStore = SidebarState & SidebarActions;

export const useSidebarStore = create<SidebarStore>((set) => ({
  collapsed: false,
  shouldFocusSearch: false,
  helpDialogOpen: false,

  setCollapsed: (collapsed) => set({ collapsed }),
  toggleSidebar: () => set((state) => ({ collapsed: !state.collapsed })),
  setShouldFocusSearch: (focus) => set({ shouldFocusSearch: focus }),
  setHelpDialogOpen: (open) => set({ helpDialogOpen: open }),
}));