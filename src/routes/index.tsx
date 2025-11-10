import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
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
  const editorialBoards = [
    {
      title: "Critics' Corner",
      description:
        "Award-ready dramas and experiments handpicked by the Senkou editorial room.",
      meta: "Updated every Friday",
    },
    {
      title: "Fan Drafts",
      description:
        "Playlists inspired by iconic IMDb user lists, tuned for weekend binges.",
      meta: "Voted in by the community",
    },
    {
      title: "Late Night Binge",
      description: "High-energy action and comedy under 25 minutes per episode.",
      meta: "Runtime under 25 min",
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
        className="absolute inset-0 bg-[url('/starfield.svg')] bg-cover bg-center opacity-30 starfield-pan"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 mix-blend-screen opacity-40 starfield-twinkle"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 20%, rgba(255,255,255,0.15), transparent 45%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.1), transparent 50%), radial-gradient(circle at 20% 60%, rgba(255,255,255,0.12), transparent 45%)",
        }}
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
        <div className="mb-10 text-center">
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

        {/* Editorial Billboard */}
        <section className="mx-auto mb-12 w-full max-w-4xl">
          <div className="rounded-[28px] border border-border/80 bg-card/90 p-8 text-left shadow-2xl shadow-black/40">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              Tonight on Senkou
            </p>
            <h2 className="mt-3 text-3xl font-black uppercase tracking-tight md:text-4xl">
              The watchlist millions are curating
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Follow cast, studios, and ratings just like you would on IMDb.
              Each card stacks metadata, staff previews, and cinematic stills so
              it feels like browsing a film set.
            </p>
          </div>
        </section>

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

        {/* IMDb-inspired boards (dummy content) */}
        <section className="mx-auto mb-14 w-full max-w-6xl">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              Boards in progress
            </p>
            <h3 className="text-2xl font-semibold">
              IMDb-style lists tailored for anime lovers
            </h3>
            <p className="text-sm text-muted-foreground">
              These modules will evolve into living charts, but for now enjoy a
              glimpse at the curation pillars.
            </p>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {editorialBoards.map((board) => (
              <article
                key={board.title}
                className="rounded-3xl border border-border/70 bg-card/70 p-6 text-left shadow-lg shadow-black/25"
              >
                <p className="text-[0.65rem] uppercase tracking-[0.4em] text-muted-foreground">
                  {board.meta}
                </p>
                <h4 className="mt-3 text-xl font-bold">{board.title}</h4>
                <p className="mt-3 text-sm text-muted-foreground">
                  {board.description}
                </p>
              </article>
            ))}
          </div>
        </section>

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
