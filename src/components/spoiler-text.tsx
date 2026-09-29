"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

export function SpoilerText({
  text,
  spoiler,
  className,
}: {
  text: string;
  spoiler?: boolean;
  className?: string;
}) {
  const [revealed, setRevealed] = useState(false);

  if (!spoiler) {
    return <p className={className}>{text}</p>;
  }

  if (revealed) {
    return (
      <div className="grid gap-1.5">
        <p className="text-[11px] font-bold tracking-wide text-foreground/55 uppercase">
          ネタバレ注意
        </p>
        <p className={className}>{text}</p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setRevealed(true)}
      className="grid w-full gap-1.5 rounded-lg border border-foreground/10 bg-muted/50 px-3 py-2.5 text-left"
    >
      <span className="text-[11px] font-bold tracking-wide text-foreground uppercase">
        ネタバレ注意 · タップして表示
      </span>
      <span
        className={cn("line-clamp-3 text-sm leading-relaxed text-foreground/80", className)}
        style={{ filter: "blur(6px)", userSelect: "none" }}
      >
        {text}
      </span>
    </button>
  );
}
