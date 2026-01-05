export type ExperienceLevelInfo = {
  level: number;
  title: string;
  subtitle: string;
  emoji: string;
  badgeClass: string;
};

export const EXPERIENCE_LEVELS: ReadonlyArray<ExperienceLevelInfo> = [
  {
    level: 0,
    title: "Episode Zero",
    subtitle: "Just starting out",
    emoji: "\u{1F7E2}",
    badgeClass: "from-emerald-400/90 to-emerald-300/70 text-emerald-950",
  },
  {
    level: 1,
    title: "Opening Credits",
    subtitle: "Recognizes the classics",
    emoji: "\u{1F7E1}",
    badgeClass: "from-amber-300/90 to-amber-200/70 text-amber-950",
  },
  {
    level: 2,
    title: "Casual Binger",
    subtitle: "Knows the sub vs dub debate",
    emoji: "\u{1F7E0}",
    badgeClass: "from-orange-400/90 to-orange-300/70 text-orange-950",
  },
  {
    level: 3,
    title: "Season Finisher",
    subtitle: "Understands arcs and pacing",
    emoji: "\u{1F535}",
    badgeClass: "from-sky-400/90 to-sky-300/70 text-sky-950",
  },
  {
    level: 4,
    title: "Arc Survivor",
    subtitle: "Emotionally damaged but stronger",
    emoji: "\u{1F7E3}",
    badgeClass: "from-violet-400/90 to-violet-300/70 text-violet-950",
  },
  {
    level: 5,
    title: "Weeb in Training",
    subtitle: "Exploring beyond shonen",
    emoji: "\u{1F534}",
    badgeClass: "from-rose-500/90 to-rose-400/70 text-rose-50",
  },
  {
    level: 6,
    title: "Otaku Mode",
    subtitle: "Deep into culture and references",
    emoji: "\u{26AB}",
    badgeClass: "from-slate-950/90 to-slate-700/70 text-slate-100",
  },
  {
    level: 7,
    title: "Filler Skipper",
    subtitle: "Efficiency and wisdom",
    emoji: "\u{1F7E4}",
    badgeClass: "from-amber-800/90 to-amber-700/70 text-amber-50",
  },
  {
    level: 8,
    title: "Anime Archivist",
    subtitle: "Recommends hidden gems",
    emoji: "\u{1F7E6}",
    badgeClass: "from-blue-500/90 to-blue-400/70 text-blue-50",
  },
  {
    level: 9,
    title: "Legend of the 1000 Episodes",
    subtitle: "Survived One Piece",
    emoji: "\u{1F525}",
    badgeClass: "from-amber-500/90 to-orange-400/70 text-amber-950",
  },
] as const;

export function getExperienceLevelInfo(level?: number | null) {
  const normalized =
    typeof level === "number" && Number.isFinite(level) ? Math.floor(level) : 0;
  const clamped = Math.min(
    Math.max(normalized, 0),
    EXPERIENCE_LEVELS.length - 1,
  );
  return EXPERIENCE_LEVELS[clamped];
}
