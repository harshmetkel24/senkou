import { useSidebarStore } from "@/lib/stores";
import { cn } from "@/lib/utils";

interface MainContentProps {
  children: React.ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  const collapsed = useSidebarStore((state) => state.collapsed);
  return (
    <main
      className={cn(
        "flex-1 transition-all duration-300",
        collapsed ? "md:ml-16" : "md:ml-64"
      )}
    >
      {children}
    </main>
  );
}
