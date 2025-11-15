import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";

import { useSidebar } from "@/components/contexts/SidebarContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  variant?: "header" | "hero";
}

export function SearchBar({ variant = "header" }: SearchBarProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const shouldFocusSearch = useSidebar((state) => state.shouldFocusSearch);
  const setShouldFocusSearch = useSidebar(
    (state) => state.setShouldFocusSearch,
  );

  const focusInputRefCallback = (node: HTMLInputElement | undefined) => {
    if (shouldFocusSearch) {
      node && node.focus();
      setShouldFocusSearch(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/anime", search: { q: searchQuery } });
    }
  };

  const isHero = variant === "hero";

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl">
      <div className="relative">
        <Search
          className={`absolute left-6 top-1/2 transform -translate-y-1/2 ${isHero ? "w-8 h-8" : "w-5 h-5"} text-muted-foreground`}
        />
        <Input
          ref={focusInputRefCallback}
          type="text"
          placeholder="⌘+K to search anime, manga, characters..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`${isHero ? "pl-20 pr-40 py-6 text-2xl rounded-3xl border-2 shadow-lg focus:ring-4" : "pl-12 pr-24 py-2 text-base rounded-2xl border focus:ring-2"} border-border bg-card/95 text-foreground placeholder-muted-foreground focus:ring-primary/50`}
        />
        <Button
          type="submit"
          size={isHero ? "lg" : "sm"}
          variant="outline"
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${isHero ? "px-4 py-1 rounded-2xl text-lg right-4" : "px-3 py-1 rounded-xl text-sm"}`}
        >
          Search
        </Button>
      </div>
    </form>
  );
}
