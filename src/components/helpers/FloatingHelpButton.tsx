import { HotkeysModal } from "@/components/helpers/ShortcutsModal";
import { ThemeToggle } from "@/components/helpers/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/lib/stores";

export function FloatingHelpButton() {
  const helpDialogOpen = useSidebarStore((state) => state.helpDialogOpen);
  const setHelpDialogOpen = useSidebarStore((state) => state.setHelpDialogOpen);

  return (
    <div className="fixed bottom-6 right-6 z-50 hidden md:flex gap-2">
      <ThemeToggle />
      <HotkeysModal open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg bg-background/90 backdrop-blur-sm border-border hover:bg-accent text-lg font-bold"
          aria-label="Open help and keyboard shortcuts"
        >
          ?
        </Button>
      </HotkeysModal>
    </div>
  );
}
