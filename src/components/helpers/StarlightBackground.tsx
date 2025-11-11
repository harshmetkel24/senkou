export function StarlightBackground() {
  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-[url('/starfield.svg')] bg-cover bg-center opacity-20 starfield-pan"
      />
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none mix-blend-screen opacity-30 starfield-twinkle"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 20%, rgba(255,255,255,0.15), transparent 45%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.1), transparent 50%), radial-gradient(circle at 20% 60%, rgba(255,255,255,0.12), transparent 45%)",
        }}
      />
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-background/10"
      />
      <div
        aria-hidden="true"
        className="fixed -top-32 left-8 h-80 w-80 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="fixed bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-accent/8 blur-[180px]"
      />
    </>
  );
}