"use client";

import { useMemo, useState } from "react";

import { AddItemDialog } from "@/components/add-item-dialog";
import { ImeTextInput } from "@/components/ime-text-input";
import { ItemCard } from "@/components/item-card";
import { ItemDetailDialog } from "@/components/item-detail-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PRESET_TAGS, addedTimestamp, normalizeTags } from "@/lib/review";
import {
  MEDIA_EMOJI,
  MEDIA_LABEL,
  searchableText,
  type MediaType,
  type ShelfItem,
} from "@/lib/types";

type TabValue = "all" | MediaType;
type SortValue = "added-desc" | "added-asc" | "rating-desc";

const TABS: { value: TabValue; label: string; chip: string }[] = [
  { value: "all", label: "すべて", chip: "data-active:bg-primary data-active:text-foreground" },
  {
    value: "music",
    label: `${MEDIA_EMOJI.music} ${MEDIA_LABEL.music}`,
    chip: "data-active:bg-[#111111] data-active:text-primary",
  },
  {
    value: "book",
    label: `${MEDIA_EMOJI.book} ${MEDIA_LABEL.book}`,
    chip: "data-active:bg-[#3f4634] data-active:text-[#f5f5f0]",
  },
  {
    value: "movie",
    label: `${MEDIA_EMOJI.movie} ${MEDIA_LABEL.movie}`,
    chip: "data-active:bg-primary data-active:text-foreground",
  },
];

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: "added-desc", label: "追加が新しい順" },
  { value: "added-asc", label: "追加が古い順" },
  { value: "rating-desc", label: "評価が高い順" },
];

export function ShelfGrid({
  items,
  onAdd,
  onUpdate,
  onDelete,
  showSearch = false,
}: {
  items: ShelfItem[];
  onAdd?: (item: ShelfItem) => void | Promise<void>;
  onUpdate?: (item: ShelfItem) => void | Promise<void>;
  onDelete?: (itemId: string) => void | Promise<void>;
  showSearch?: boolean;
}) {
  const [tab, setTab] = useState<TabValue>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortValue>("added-desc");
  const [tag, setTag] = useState("all");
  const [activeId, setActiveId] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      all: items.length,
      music: items.filter((item) => item.type === "music").length,
      book: items.filter((item) => item.type === "book").length,
      movie: items.filter((item) => item.type === "movie").length,
    }),
    [items]
  );

  const visibleItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = items.filter((item) => {
      const matchesType = tab === "all" || item.type === tab;
      if (!matchesType) return false;
      if (tag !== "all" && !normalizeTags(item.tags).includes(tag as (typeof PRESET_TAGS)[number])) return false;
      if (!normalized) return true;
      return searchableText(item).toLowerCase().includes(normalized);
    });

    return filtered.slice().sort((a, b) => {
      if (sort === "rating-desc") {
        return b.rating - a.rating || addedTimestamp(b) - addedTimestamp(a);
      }
      const delta = addedTimestamp(a) - addedTimestamp(b);
      return sort === "added-asc" ? delta : -delta;
    });
  }, [items, query, sort, tab, tag]);

  const activeItem = items.find((item) => item.id === activeId) ?? null;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={tab}
          onValueChange={(value) => {
            if (
              value === "all" ||
              value === "music" ||
              value === "book" ||
              value === "movie"
            ) {
              setTab(value);
            }
          }}
        >
          <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-lg border border-foreground/10 bg-white p-1 sm:w-fit">
            {TABS.map((entry) => (
              <TabsTrigger
                key={entry.value}
                value={entry.value}
                className={`h-9 rounded-md px-3 font-semibold ${entry.chip}`}
              >
                {entry.label}
                <span className="ml-1.5 text-[11px] opacity-70">
                  {counts[entry.value]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {onAdd ? <AddItemDialog onAdd={onAdd} existingItems={items} /> : null}
      </div>
      <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {showSearch ? (
          <ImeTextInput
            type="search"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="タイトル、作者、感想、タグで検索"
            className="h-10 max-w-sm rounded-lg bg-white"
            aria-label="作品を検索"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        ) : (
          <span />
        )}
        <label className="flex items-center gap-2 text-sm">
          <span className="shrink-0 font-semibold">並び替え</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.currentTarget.value as SortValue)}
            className="h-9 rounded-lg border border-foreground/15 bg-white px-2.5 text-sm font-semibold outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
            aria-label="並び替え"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
          <TagChip
            label="すべて"
            active={tag === "all"}
            onClick={() => setTag("all")}
          />
          {PRESET_TAGS.map((entry) => (
            <TagChip
              key={entry}
              label={entry}
              active={tag === entry}
              onClick={() => setTag(entry)}
            />
          ))}
        </div>
      {visibleItems.length > 0 ? (
        <ul className="mt-5 grid grid-cols-3 gap-1 sm:mt-6 sm:grid-cols-3 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-4">
          {visibleItems.map((item) => (
            <li key={item.id}>
              <ItemCard item={item} onOpen={(next) => setActiveId(next.id)} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-10 flex flex-col items-center rounded-lg border border-dashed border-foreground/20 bg-white px-6 py-16 text-center">
          <p className="font-heading text-2xl">
            {query || tag !== "all"
              ? "条件に合う作品はありません"
              : tab === "all"
                ? "棚はまだ空です"
                : `${MEDIA_LABEL[tab]}の棚は空です`}
          </p>
          {query || tab !== "all" || tag !== "all" ? (
            <Button
              variant="outline"
              className="mt-5"
              onClick={() => {
                setQuery("");
                setTab("all");
                setTag("all");
              }}
            >
              条件をリセット
            </Button>
          ) : null}
        </div>
      )}
      <ItemDetailDialog
        item={activeItem}
        open={Boolean(activeItem)}
        onOpenChange={(next) => {
          if (!next) setActiveId(null);
        }}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </div>
  );
}

function TagChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-md bg-primary px-2.5 py-1 text-[11px] font-semibold text-foreground"
          : "rounded-md border border-foreground/15 bg-white px-2.5 py-1 text-[11px] font-semibold text-foreground/70 hover:border-foreground"
      }
    >
      {label}
    </button>
  );
}
