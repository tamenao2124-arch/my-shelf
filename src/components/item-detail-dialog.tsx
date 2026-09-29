"use client";

import { useState } from "react";

import { ItemMeta } from "@/components/item-meta";
import { ReviewFields } from "@/components/review-fields";
import { SpoilerText } from "@/components/spoiler-text";
import { StarRating } from "@/components/star-rating";
import { TagPills } from "@/components/tag-pills";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  applyReviewDraft,
  draftFromItem,
  experienceDateLabel,
  experienceLabel,
  formatExperienceDate,
  type ReviewDraft,
} from "@/lib/review";
import { MEDIA_EMOJI, MEDIA_LABEL, mediaCreator, type ShelfItem } from "@/lib/types";

type ItemDetailDialogProps = {
  item: ShelfItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (item: ShelfItem) => void | Promise<void>;
  onDelete?: (itemId: string) => void | Promise<void>;
};

export function ItemDetailDialog({
  item,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
}: ItemDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && item ? (
        <ItemDetailBody
          key={item.id}
          item={item}
          onOpenChange={onOpenChange}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ) : null}
    </Dialog>
  );
}

function ItemDetailBody({
  item,
  onOpenChange,
  onUpdate,
  onDelete,
}: {
  item: ShelfItem;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (item: ShelfItem) => void | Promise<void>;
  onDelete?: (itemId: string) => void | Promise<void>;
}) {
  const canEdit = Boolean(onUpdate);
  const canDelete = Boolean(onDelete);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [draft, setDraft] = useState<ReviewDraft>(() => draftFromItem(item));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (!onUpdate) return;
    setPending(true);
    setError("");
    try {
      await onUpdate(applyReviewDraft(item, draft));
      setEditing(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "保存に失敗しました。");
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    if (!onDelete) return;
    setPending(true);
    setError("");
    try {
      await onDelete(item.id);
      onOpenChange(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "削除に失敗しました。");
    } finally {
      setPending(false);
    }
  }

  return (
    <DialogContent className="flex max-h-[min(90dvh,820px)] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
      <DialogHeader className="border-b border-foreground/10 p-4 pr-12">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-foreground/55 uppercase">
          {MEDIA_LABEL[item.type]}
        </p>
        <DialogTitle className="font-heading text-2xl tracking-tight">
          {item.title}
        </DialogTitle>
        <DialogDescription>{mediaCreator(item)}</DialogDescription>
      </DialogHeader>
      <div className="grid gap-5 overflow-y-auto p-4 md:grid-cols-[180px_1fr] md:items-start">
        <DetailCover item={item} />
        <div className="grid min-w-0 gap-4">
          {editing ? (
            <ReviewFields mediaType={item.type} value={draft} onChange={setDraft} />
          ) : (
            <DetailBody item={item} />
          )}
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>
      {canEdit || canDelete ? (
        <DialogFooter className="mx-0 mb-0 rounded-none">
          {editing ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDraft(draftFromItem(item));
                  setEditing(false);
                  setError("");
                }}
              >
                やめる
              </Button>
              <Button type="button" onClick={() => void save()} disabled={pending}>
                {pending ? "保存しています…" : "レビューを保存"}
              </Button>
            </>
          ) : confirmDelete ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setConfirmDelete(false);
                  setError("");
                }}
              >
                やめる
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => void remove()}
                disabled={pending}
              >
                {pending ? "外しています…" : "本当に外す"}
              </Button>
            </>
          ) : (
            <>
              {canDelete ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="mr-auto text-destructive hover:text-destructive"
                  onClick={() => setConfirmDelete(true)}
                >
                  棚から外す
                </Button>
              ) : null}
              {canEdit ? (
                <Button type="button" onClick={() => setEditing(true)}>
                  レビューを編集
                </Button>
              ) : null}
            </>
          )}
        </DialogFooter>
      ) : null}
    </DialogContent>
  );
}

function DetailCover({ item }: { item: ShelfItem }) {
  const [broken, setBroken] = useState(false);
  const showImage = Boolean(item.coverUrl) && !broken;

  return (
    <div className="relative mx-auto aspect-[3/4] w-40 overflow-hidden rounded-lg bg-[#111111] poster-card md:mx-0 md:w-full">
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.coverUrl}
          alt={`${item.title}のジャケット`}
          className="size-full object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <div className="flex size-full items-center justify-center bg-primary text-4xl">
          {MEDIA_EMOJI[item.type]}
        </div>
      )}
    </div>
  );
}

function DetailBody({ item }: { item: ShelfItem }) {
  const method = experienceLabel(item.type, item.experienceMethod);
  const date = formatExperienceDate(item.experiencedAt);

  return (
    <div className="grid gap-4">
      <div>
        <ItemMeta item={item} />
        <div className="mt-3">
          <StarRating value={item.rating} size="md" showValue />
        </div>
      </div>
      {(date || method) && (
        <dl className="grid gap-1 rounded-lg border border-foreground/10 bg-muted/40 px-3 py-2.5 text-sm">
          {date ? (
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{experienceDateLabel(item.type)}</dt>
              <dd className="font-semibold">{date}</dd>
            </div>
          ) : null}
          {method ? (
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">鑑賞方法</dt>
              <dd className="font-semibold">{method}</dd>
            </div>
          ) : null}
        </dl>
      )}
      <TagPills tags={item.tags} />
      <SpoilerText
        text={item.comment}
        spoiler={item.spoiler}
        className="text-sm leading-relaxed"
      />
    </div>
  );
}
