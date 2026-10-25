"use client";

import { useState, type ReactNode } from "react";

import { ExploreQuickAddButton } from "@/components/explore-quick-add";
import { Badge } from "@/components/ui/badge";
import {
  MEDIA_EMOJI,
  MEDIA_LABEL,
  mediaCreator,
  type SearchHit,
  type ShelfItem,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export function ExploreHitCard({
  hit,
  existingItems,
  onAdd,
  footer,
}: {
  hit: SearchHit;
  existingItems: ShelfItem[];
  onAdd?: (item: ShelfItem) => void | Promise<void>;
  footer?: ReactNode;
}) {
  const [broken, setBroken] = useState(false);
  const showImage = Boolean(hit.coverUrl) && !broken;
  const creator = mediaCreator(hit);

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-lg border-2 border-primary bg-white p-2 shadow-[0_1px_0_rgb(17_17_17_/_0.05)]",
        hit.type === "music" ? "" : "",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-md bg-[#111111]",
          hit.type === "music" ? "aspect-square" : "aspect-[3/4]",
        )}
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hit.coverUrl}
            alt=""
            className="size-full object-cover"
            onError={() => setBroken(true)}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-3xl text-white/90">
            {MEDIA_EMOJI[hit.type]}
          </div>
        )}
        <Badge
          variant="outline"
          className="absolute top-1.5 left-1.5 border-foreground/10 bg-white/95 text-[10px] font-bold"
        >
          {MEDIA_LABEL[hit.type]}
        </Badge>
      </div>
      <div className="mt-2 flex min-h-0 flex-1 flex-col gap-1">
        <h3 className="line-clamp-2 text-[13px] font-bold leading-snug text-foreground">
          {hit.title}
        </h3>
        {creator ? (
          <p className="truncate text-[11px] text-muted-foreground">{creator}</p>
        ) : null}
        {hit.providers?.length ? (
          <p className="truncate text-[10px] text-muted-foreground">
            {hit.providers.slice(0, 2).join(" · ")}
          </p>
        ) : null}
        {footer ? (
          footer
        ) : onAdd ? (
          <div className="mt-auto pt-2">
            <ExploreQuickAddButton
              hit={hit}
              existingItems={existingItems}
              onAdd={onAdd}
              className="h-8 w-full rounded-md text-xs font-bold"
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}
