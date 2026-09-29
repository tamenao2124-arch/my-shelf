"use client";

import { useState } from "react";

import { ItemMeta } from "@/components/item-meta";
import { StarRating } from "@/components/star-rating";
import { TagPills } from "@/components/tag-pills";
import { Badge } from "@/components/ui/badge";
import {
  MEDIA_EMOJI,
  MEDIA_LABEL,
  type ShelfItem,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPE_TONE: Record<ShelfItem["type"], string> = {
  music: "border-transparent bg-[#111111] text-primary",
  book: "border-transparent bg-[#3f4634] text-[#f5f5f0]",
  movie: "border-transparent bg-primary text-foreground",
};

export function ItemCard({
  item,
  onOpen,
}: {
  item: ShelfItem;
  onOpen?: (item: ShelfItem) => void;
}) {
  const [broken, setBroken] = useState(false);
  const showImage = Boolean(item.coverUrl) && !broken;

  return (
    <button
      type="button"
      onClick={() => onOpen?.(item)}
      className="group relative flex w-full flex-col overflow-hidden rounded-lg bg-white text-left poster-card transition duration-300 hover:-translate-y-0.5"
    >
      <div className="relative aspect-square overflow-hidden bg-[#111111] md:aspect-[3/4]">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.coverUrl}
            alt={`${item.title}のジャケット`}
            className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.04]"
            onError={() => setBroken(true)}
          />
        ) : (
          <FallbackCover title={item.title} type={item.type} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10 md:from-black/45" />
        <Badge
          variant="outline"
          className={cn(
            "absolute top-2 left-2 font-bold max-md:h-5 max-md:px-1.5 max-md:text-[10px]",
            TYPE_TONE[item.type]
          )}
        >
          {MEDIA_EMOJI[item.type]}
          <span className="max-md:hidden"> {MEDIA_LABEL[item.type]}</span>
        </Badge>
        {item.spoiler ? (
          <span className="absolute top-2 right-2 rounded-md bg-[#111111] px-1.5 py-0.5 text-[10px] font-bold text-primary">
            ネタバレ
          </span>
        ) : null}
        <p className="absolute inset-x-1.5 bottom-1.5 truncate text-[11px] font-bold text-white drop-shadow md:hidden">
          {item.title}
        </p>
      </div>
      <div className="hidden flex-1 flex-col gap-2 px-3.5 pt-3 pb-4 md:flex">
        <div>
          <h3 className="font-heading text-[1.05rem] leading-snug text-balance">
            {item.title}
          </h3>
          <div className="mt-1.5">
            <ItemMeta item={item} />
          </div>
        </div>
        <StarRating value={item.rating} />
        <TagPills tags={item.tags} limit={1} />
        <p
          className="mt-auto line-clamp-3 text-[13px] leading-relaxed text-foreground/75"
          style={item.spoiler ? { filter: "blur(5px)" } : undefined}
        >
          {item.comment}
        </p>
      </div>
    </button>
  );
}

function FallbackCover({
  title,
  type,
}: {
  title: string;
  type: ShelfItem["type"];
}) {
  const tones: Record<ShelfItem["type"], string> = {
    music: "bg-[#111111] text-primary",
    book: "bg-[#3f4634] text-[#f5f5f0]",
    movie: "bg-primary text-foreground",
  };

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center px-4 text-center",
        tones[type]
      )}
    >
      <span className="text-3xl">{MEDIA_EMOJI[type]}</span>
      <span className="mt-2 hidden font-heading text-lg leading-snug md:block">
        {title}
      </span>
    </div>
  );
}
