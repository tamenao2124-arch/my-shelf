"use client";

import { TagEditor } from "@/components/tag-editor";
import { StarRating } from "@/components/star-rating";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  EXPERIENCE_METHODS,
  experienceDateLabel,
  type ReviewDraft,
} from "@/lib/review";
import type { MediaType } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ReviewFields({
  mediaType,
  value,
  onChange,
}: {
  mediaType: MediaType;
  value: ReviewDraft;
  onChange: (next: ReviewDraft) => void;
}) {
  const methods = EXPERIENCE_METHODS[mediaType];

  function patch(partial: Partial<ReviewDraft>) {
    onChange({ ...value, ...partial });
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>評価（0.5刻み）</Label>
        <StarRating value={value.rating} onChange={(rating) => patch({ rating })} size="md" showValue />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="review-comment">レビュー</Label>
        <Textarea
          id="review-comment"
          value={value.comment}
          onChange={(event) => patch({ comment: event.target.value })}
          placeholder="この作品を棚に置いた理由を、すこし長く書いてもいい。"
          rows={4}
        />
      </div>
      <div className="flex items-center justify-between gap-3 rounded-lg border border-foreground/10 bg-white px-3 py-2.5">
        <span>
          <span className="block text-sm font-semibold">ネタバレ注意</span>
          <span className="text-xs text-muted-foreground">
            ONにすると、タップするまで本文をボカシます。
          </span>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={value.spoiler}
          onClick={() => patch({ spoiler: !value.spoiler })}
          className={cn(
            "relative h-7 w-12 shrink-0 rounded-md border border-foreground/15 transition-colors",
            value.spoiler ? "bg-primary" : "bg-muted"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 size-5 rounded-sm bg-[#111111] transition-transform",
              value.spoiler ? "left-6" : "left-0.5"
            )}
          />
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="review-date">{experienceDateLabel(mediaType)}</Label>
          <input
            id="review-date"
            type="date"
            value={value.experiencedAt}
            onChange={(event) => patch({ experiencedAt: event.currentTarget.value })}
            className="h-9 rounded-lg border border-foreground/15 bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="review-method">鑑賞方法</Label>
          <select
            id="review-method"
            value={value.experienceMethod}
            onChange={(event) => patch({ experienceMethod: event.currentTarget.value })}
            className="h-9 rounded-lg border border-foreground/15 bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
          >
            <option value="">未設定</option>
            {methods.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label>タグ</Label>
        <TagEditor tags={value.tags} onChange={(tags) => patch({ tags })} />
      </div>
    </div>
  );
}
