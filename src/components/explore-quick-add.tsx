"use client";

import { useMemo, useState } from "react";

import { useAuthDialog } from "@/components/auth-dialog";
import { SparkleBurst } from "@/components/sparkle-burst";
import { useSocial } from "@/components/social-provider";
import { Button } from "@/components/ui/button";
import { experienceMethodFromHit } from "@/lib/catalog/services";
import {
  identityKey,
  searchHitToShelfItem,
  type SearchHit,
  type ShelfItem,
} from "@/lib/types";

export function ExploreQuickAddButton({
  hit,
  existingItems,
  onAdd,
  className,
}: {
  hit: SearchHit;
  existingItems: ShelfItem[];
  onAdd: (item: ShelfItem) => void | Promise<void>;
  className?: string;
}) {
  const { openAuthDialog } = useAuthDialog();
  const { isAuthenticated } = useSocial();
  const [burst, setBurst] = useState(false);
  const [pending, setPending] = useState(false);

  const onShelf = useMemo(
    () => new Set(existingItems.map((item) => identityKey(item))).has(identityKey(hit)),
    [existingItems, hit],
  );

  async function handleAdd() {
    if (onShelf || pending) return;
    setPending(true);
    try {
      await onAdd(
        searchHitToShelfItem(hit, {
          rating: 3,
          comment: "さがすから追加しました。",
          tags: [],
          spoiler: false,
          experienceMethod: experienceMethodFromHit(hit) || undefined,
        }),
      );
      setBurst(true);
      window.setTimeout(() => setBurst(false), 420);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative">
      <SparkleBurst active={burst} />
      <Button
        type="button"
        size="sm"
        className={className}
        disabled={onShelf || pending}
        onClick={() => {
          if (onShelf) return;
          if (!isAuthenticated) {
            openAuthDialog("login");
            return;
          }
          void handleAdd();
        }}
      >
        {onShelf ? "追加済み" : pending ? "追加中…" : "棚に追加"}
      </Button>
    </div>
  );
}
