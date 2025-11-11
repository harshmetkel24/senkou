import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";

interface ShortcutsModalProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function HotkeysModal({
  children,
  open,
  onOpenChange,
}: ShortcutsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Help & Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these hotkeys to navigate quickly. Use{" "}
            <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl</kbd> on
            Windows/Linux.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Open Search</span>
            <kbd className="px-3 py-2 bg-muted rounded-md text-base font-mono border">
              ⌘+K
            </kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Toggle Sidebar</span>
            <kbd className="px-3 py-2 bg-muted rounded-md text-base font-mono border">
              ⌘+S
            </kbd>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Open Help</span>
            <kbd className="px-3 py-2 bg-muted rounded-md text-base font-mono border">
              Shift+?
            </kbd>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
