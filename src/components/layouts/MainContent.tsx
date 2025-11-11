import { useSidebarStore } from "@/lib/stores";

interface MainContentProps {
  children: React.ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  const collapsed = useSidebarStore((state) => state.collapsed);
  return (
    <main
      className={`transition-all duration-300 ${collapsed ? "md:ml-16" : "md:ml-64"}`}
    >
      {children}
    </main>
  );
}
