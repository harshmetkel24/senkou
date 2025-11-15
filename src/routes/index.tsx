import { keepPreviousData, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { RouteErrorBoundary } from "@/components/helpers/RouteErrorBoundary";
import { useSidebar } from "@/components/contexts/SidebarContext";
import { MediaGrid } from "@/components/media/media-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchTrendingAnime } from "@/data/queries/anime";

const trendingAnimeQueryOptions = () => ({
  queryKey: ["anime", "trending", 1],
  queryFn: () => fetchTrendingAnime(1, 8),
  staleTime: 1000 * 60 * 5,
  placeholderData: keepPreviousData,
});

export const Route = createFileRoute("/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(trendingAnimeQueryOptions()),
  component: App,
  errorComponent: (props) => (
    <RouteErrorBoundary
      {...props}
      title="We couldn't render the home showcase"
      description="Trending picks failed to load. The sidebar still works, so hop to another section or try again."
    />
  ),
});

function App() {
  const { data } = useSuspenseQuery(trendingAnimeQueryOptions());
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const shouldFocusSearch = useSidebar((state) => state.shouldFocusSearch);
  const setShouldFocusSearch = useSidebar((state) => state.setShouldFocusSearch);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (shouldFocusSearch && searchInputRef.current) {
      searchInputRef.current.focus();
      setShouldFocusSearch(false);
    }
  }, [shouldFocusSearch, setShouldFocusSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/anime", search: { q: searchQuery } });
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="flex flex-col items-center justify-center px-6 py-12">
        {/* Logo and Title */}
        <div className="mb-10 text-center animate-fade-in">
          <img
            src="/senkou-full.png"
            alt="Senkou Logo"
            className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6"
          />
          <h1 className="text-4xl md:text-6xl font-black mb-4 uppercase [letter-spacing:-0.08em]">
            senkō!
          </h1>
          <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground font-light">
            Endless light. Endless stories. Built with the same sleek, data-rich
            spirit you love on IMDb—now curated for anime-first adventures.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-12 w-full max-w-2xl">
          <div className="relative">
            <Search className="absolute left-8 top-1/2 transform -translate-y-1/2 w-8 h-8 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="⌘+K to search anime, manga, characters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-20 pr-40 py-6 text-2xl rounded-3xl border-2 border-border bg-card/95 text-foreground placeholder-muted-foreground focus:ring-4 focus:ring-primary/50 shadow-lg"
            />
            <Button
              type="submit"
              size="lg"
              variant="outline"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 px-4 py-1 rounded-2xl text-lg"
            >
              Search
            </Button>
          </div>
        </form>

        {/* Trending Anime */}
        <section className="w-full max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6">Trending Now</h2>
          <MediaGrid items={data.items.slice(1)} />
        </section>
      </div>
    </div>
  );
}
