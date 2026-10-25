"use client";

import { useMemo, useState } from "react";

import { AddItemDialog } from "@/components/add-item-dialog";
import { ItemDetailDialog } from "@/components/item-detail-dialog";
import {
  SHELF_SECTION_ORDER,
  ShelfRowCard,
} from "@/components/shelf-row-card";
import { addedTimestamp } from "@/lib/review";
import type { ShelfItem } from "@/lib/types";

export function ProfileShelfSections({
  items,
  onAdd,
  onUpdate,
  onDelete,
  showAdd = false,
}: {
  items: ShelfItem[];
  onAdd?: (item: ShelfItem) => void | Promise<void>;
  onUpdate?: (item: ShelfItem) => void | Promise<void>;
  onDelete?: (itemId: string) => void | Promise<void>;
  showAdd?: boolean;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map: Record<string, ShelfItem[]> = {
      music: [],
      book: [],
      movie: [],
    };
    for (const item of items) {
      map[item.type]?.push(item);
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => addedTimestamp(b) - addedTimestamp(a));
    }
    return map;
  }, [items]);

  const activeItem = items.find((item) => item.id === activeId) ?? null;
  const hasAny = items.length > 0;

  return (
    <div className="space-y-7 pb-4">
      {showAdd && onAdd ? (
        <div className="hidden justify-end md:flex">
          <AddItemDialog onAdd={onAdd} existingItems={items} />
        </div>
      ) : null}

      {hasAny
        ? SHELF_SECTION_ORDER.map(({ type, label }) => {
            const sectionItems = grouped[type] ?? [];
            if (sectionItems.length === 0) {
              return null;
            }

            return (
              <section key={type} aria-labelledby={`shelf-${type}`}>
                <h2
                  id={`shelf-${type}`}
                  className="font-heading text-xl font-bold tracking-tight text-foreground"
                >
                  {label}
                </h2>
                <ul className="mt-3 flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {sectionItems.map((item) => (
                    <li key={item.id}>
                      <ShelfRowCard
                        item={item}
                        onOpen={(next) => setActiveId(next.id)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })
        : null}

      {!hasAny ? (
        <div className="rounded-lg border border-dashed border-foreground/15 bg-white/80 px-5 py-12 text-center">
          <p className="font-heading text-xl">棚はまだ空です</p>
          <p className="mt-2 text-sm text-muted-foreground">
            音楽・本・映画を追加すると、ここに並びます。
          </p>
        </div>
      ) : null}

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
