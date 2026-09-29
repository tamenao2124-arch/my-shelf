"use client";

import { Star } from "lucide-react";

import { clampRating, formatRating } from "@/lib/review";
import { cn } from "@/lib/utils";

type StarRatingProps = {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md";
  showValue?: boolean;
};

export function StarRating({
  value,
  onChange,
  size = "sm",
  showValue = false,
}: StarRatingProps) {
  const interactive = Boolean(onChange);
  const rating = clampRating(value);
  const starSize = size === "sm" ? "size-3.5" : "size-5";

  return (
    <div
      className="flex items-center gap-1.5"
      role={interactive ? "slider" : "img"}
      aria-label={`5段階中 ${formatRating(rating)} の評価`}
      aria-valuemin={interactive ? 0.5 : undefined}
      aria-valuemax={interactive ? 5 : undefined}
      aria-valuenow={interactive ? rating : undefined}
    >
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const fill = Math.min(1, Math.max(0, rating - (star - 1)));

          if (!interactive) {
            return (
              <StarFace key={star} fill={fill} className={starSize} />
            );
          }

          return (
            <button
              key={star}
              type="button"
              aria-label={`${star - 0.5} または ${star} つ星`}
              onClick={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const leftHalf = event.clientX - rect.left < rect.width / 2;
                onChange?.(leftHalf ? star - 0.5 : star);
              }}
              className="rounded-sm p-0.5 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none"
            >
              <StarFace fill={fill} className={starSize} />
            </button>
          );
        })}
      </div>
      {showValue ? (
        <span className="text-xs font-bold tabular-nums">{formatRating(rating)}</span>
      ) : null}
    </div>
  );
}

function StarFace({ fill, className }: { fill: number; className: string }) {
  return (
    <span className={cn("relative inline-flex", className)} aria-hidden="true">
      <Star className={cn(className, "fill-transparent text-foreground/25")} />
      <span
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${fill * 100}%` }}
      >
        <Star className={cn(className, "fill-primary text-foreground")} />
      </span>
    </span>
  );
}
