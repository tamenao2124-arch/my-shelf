"use client";

import { useState } from "react";

import { MEDIA_EMOJI, type MediaType, type ShelfItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export function shelfItemSubtitle(item: ShelfItem): string {
  if (item.type === "music") {
    return item.artist || item.album || "";
  }
  if (item.type === "book") {
    return item.author || item.publisher || "";
  }
  return item.director || (item.year ? `${item.year}年` : "");
}

export function ShelfRowCard({
  item,
  onOpen,
}: {
  item: ShelfItem;
  onOpen?: (item: ShelfItem) => void;
}) {
  const [broken, setBroken] = useState(false);
  const showImage = Boolean(item.coverUrl) && !broken;
  const subtitle = shelfItemSubtitle(item);

  return (
    <button
      type="button"
      onClick={() => onOpen?.(item)}
      className="flex w-[7.25rem] shrink-0 flex-col gap-1.5 text-left sm:w-[7.75rem]"
    >
      <div
        className={cn(
          "overflow-hidden rounded-md border-2 border-primary bg-white p-0.5 shadow-[0_1px_0_rgb(17_17_17_/_0.06)]",
          item.type === "music" ? "aspect-square" : "aspect-[3/4]",
        )}
      >
        <div className="relative size-full overflow-hidden rounded-[4px] bg-[#111111]">
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.coverUrl}
              alt=""
              className="size-full object-cover"
              onError={() => setBroken(true)}
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center bg-muted text-2xl">
              {MEDIA_EMOJI[item.type]}
            </div>
          )}
        </div>
      </div>
      <div className="min-w-0 px-0.5">
        <p className="truncate text-[13px] font-bold leading-tight text-foreground">
          {item.title}
        </p>
        {subtitle ? (
          <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
    </button>
  );
}

export const SHELF_SECTION_ORDER: { type: MediaType; label: string }[] = [
  { type: "music", label: "音楽" },
  { type: "book", label: "本" },
  { type: "movie", label: "映画" },
];
