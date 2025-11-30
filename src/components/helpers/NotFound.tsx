import { Image } from "@unpic/react";

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 py-12 text-center animate-fade-in">
      <Image
        src="/senkou-circle-logo.png"
        alt="Senkou Logo"
        width={128}
        height={128}
        className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 opacity-50"
      />
      <h1 className="text-3xl md:text-5xl font-black mb-4 uppercase [letter-spacing:-0.08em]">
        404
      </h1>
      <p className="mx-auto max-w-md text-lg text-muted-foreground font-light">
        This page seems to have wandered off into the void. Try heading back to explore more anime adventures.
      </p>
    </div>
  );
}