import {
  EXPERIENCE_LEVELS,
  getExperienceLevelInfo,
} from "@/lib/constants/experience-levels";

type ExperienceSliderProps = {
  value: number;
  onChange: (value: number) => void;
};

export function ExperienceSlider({ value, onChange }: ExperienceSliderProps) {
  const info = getExperienceLevelInfo(value);

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl" aria-hidden="true">
            {info.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground">
              Level {info.level + 1}: {info.title}
            </p>
            <p className="text-xs text-muted-foreground">{info.subtitle}</p>
          </div>
        </div>

        <div className="flex gap-1 mb-2">
          {EXPERIENCE_LEVELS.map((expLevel, i) => (
            <button
              key={expLevel.level}
              type="button"
              className={`h-2 flex-1 rounded-full transition-all duration-200 cursor-pointer hover:opacity-80 ${
                i <= value
                  ? `bg-linear-to-r ${info.badgeClass}`
                  : "bg-muted/30 hover:bg-muted/50"
              }`}
              onClick={() => onChange(i)}
              aria-label={`Level ${i + 1}: ${expLevel.title}`}
            />
          ))}
        </div>

        <input
          type="range"
          min={0}
          max={9}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-primary"
          aria-label="Experience level"
        />
        <div className="flex justify-between text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
          <span>1</span>
          <span>10</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        We'll auto-calc this from your watch history later.
      </p>
    </div>
  );
}
