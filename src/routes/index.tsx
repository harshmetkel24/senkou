import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Play, Search } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const popularAnime = [
    {
      title: "One Piece",
      image: "https://cdn.myanimelist.net/images/anime/6/73245.jpg",
    },
    {
      title: "Attack on Titan",
      image: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
    },
    {
      title: "Demon Slayer",
      image: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
    },
    {
      title: "My Hero Academia",
      image: "https://cdn.myanimelist.net/images/anime/10/78745.jpg",
    },
    {
      title: "Naruto",
      image: "https://cdn.myanimelist.net/images/anime/13/17405.jpg",
    },
    {
      title: "Death Note",
      image: "https://cdn.myanimelist.net/images/anime/9/9453.jpg",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % (popularAnime.length - 2));
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) =>
        (prev - 1 + (popularAnime.length - 2)) % (popularAnime.length - 2),
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[url('/starfield.svg')] bg-cover bg-center opacity-20"
      />
      <div
        aria-hidden="true"
        className="absolute -top-32 left-8 h-80 w-80 rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-accent/15 blur-[180px]"
      />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12">
        {/* Logo and Title */}
        <div className="text-center mb-12">
          <img
            src="/senkou-full.png"
            alt="Senkou Logo"
            className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6"
          />
          <h1 className="text-4xl md:text-6xl font-black mb-4 uppercase [letter-spacing:-0.08em]">
            senkō!
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-light">
            Endless light. Endless stories.
          </p>
        </div>

        {/* Dominant Search Section */}
        <div className="w-full max-w-2xl mx-auto mb-12">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
            <form className="flex items-center gap-4">
              <Search className="w-6 h-6 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder="Search for anime, manga, characters..."
                className="flex-1 bg-transparent text-foreground placeholder-muted-foreground text-lg outline-none"
              />
              <button
                type="submit"
                className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
              >
                Search
              </button>
            </form>
          </div>

          {/* Top Searches */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground mb-3">Popular searches:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "One Piece",
                "Attack on Titan",
                "Demon Slayer",
                "My Hero Academia",
                "Naruto",
                "Death Note",
              ].map((item) => (
                <button
                  key={item}
                  className="bg-muted hover:bg-muted/80 text-muted-foreground px-4 py-2 rounded-full text-sm transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Popular Anime Carousel */}
        <div className="w-full max-w-6xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-center mb-6">
            Most Popular Anime
          </h2>
          <div className="relative">
            <div className="flex overflow-hidden rounded-2xl">
              {popularAnime
                .slice(currentSlide, currentSlide + 3)
                .map((anime, index) => (
                  <div key={index} className="flex-shrink-0 w-1/3 px-2">
                    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                      <img
                        src={anime.image}
                        alt={anime.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-sm">{anime.title}</h3>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background border border-border rounded-full p-2 shadow-md text-foreground"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background border border-border rounded-full p-2 shadow-md text-foreground"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <button className="mx-auto flex items-center gap-3 rounded-2xl bg-secondary px-8 py-4 text-lg font-bold text-secondary-foreground shadow-[0_25px_80px_rgba(0,0,0,0.45)] transition-all hover:-translate-y-0.5 hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/70">
            <Play className="w-5 h-5 text-secondary-foreground" />
            Explore Anime Universe
          </button>
          <p className="text-muted-foreground mt-4 text-sm">
            Dive into thousands of anime and manga titles
          </p>
        </div>
      </div>
    </div>
  );
}
