"use client";

import { PRESET_TAGS, normalizeTags } from "@/lib/review";
import { cn } from "@/lib/utils";

export function TagEditor({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const selected = new Set(normalizeTags(tags));

  function toggle(tag: (typeof PRESET_TAGS)[number]) {
    const next = selected.has(tag)
      ? PRESET_TAGS.filter((entry) => selected.has(entry) && entry !== tag)
      : PRESET_TAGS.filter((entry) => selected.has(entry) || entry === tag);
    onChange(next);
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {PRESET_TAGS.map((tag) => {
        const on = selected.has(tag);
        return (
          <button
            key={tag}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(tag)}
            className={cn(
              "rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors",
              on
                ? "bg-[#111111] text-primary"
                : "border border-foreground/15 bg-white text-foreground/70 hover:border-foreground hover:text-foreground"
            )}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
