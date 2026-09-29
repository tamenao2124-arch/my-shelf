import type { MediaType, ShelfItem } from "@/lib/types";

export type ReviewDraft = {
  rating: number;
  comment: string;
  tags: string[];
  spoiler: boolean;
  experiencedAt: string;
  experienceMethod: string;
};

export type ExperienceOption = {
  value: string;
  label: string;
};

export const EXPERIENCE_METHODS: Record<MediaType, ExperienceOption[]> = {
  movie: [
    { value: "theater", label: "映画館" },
    { value: "netflix", label: "Netflix" },
    { value: "prime", label: "Prime Video" },
    { value: "unext", label: "U-NEXT" },
    { value: "streaming", label: "その他の配信" },
    { value: "disc", label: "Blu-ray / DVD" },
    { value: "tv", label: "テレビ" },
  ],
  book: [
    { value: "print", label: "紙の本" },
    { value: "kindle", label: "Kindle" },
    { value: "ebook", label: "その他の電子書籍" },
    { value: "audiobook", label: "オーディオブック" },
    { value: "library", label: "図書館" },
  ],
  music: [
    { value: "streaming", label: "配信" },
    { value: "vinyl", label: "レコード" },
    { value: "cd", label: "CD" },
    { value: "live", label: "ライブ" },
  ],
};

export const PRESET_TAGS = [
  "お気に入り",
  "殿堂入り",
  "あとで見る",
  "再訪",
  "2026年",
] as const;

export type PresetTag = (typeof PRESET_TAGS)[number];

const PRESET_TAG_SET = new Set<string>(PRESET_TAGS);

const LEGACY_TAG_MAP: Record<string, PresetTag> = {
  生涯の一本: "殿堂入り",
  必読: "殿堂入り",
  "2026年ハマった本": "2026年",
  再読: "再訪",
  再観: "再訪",
  レイトショー: "お気に入り",
  映画館: "お気に入り",
  雨の日: "お気に入り",
  夜更かし: "お気に入り",
  通勤: "あとで見る",
  朝: "お気に入り",
  京都: "お気に入り",
};

export const EMPTY_REVIEW_DRAFT: ReviewDraft = {
  rating: 4,
  comment: "",
  tags: [],
  spoiler: false,
  experiencedAt: "",
  experienceMethod: "",
};

export function clampRating(value: number) {
  if (!Number.isFinite(value)) return 4;
  const stepped = Math.round(value * 2) / 2;
  return Math.min(5, Math.max(0.5, stepped));
}

export function formatRating(value: number) {
  return clampRating(value).toFixed(1).replace(/\.0$/, "");
}

export function isPresetTag(value: string): value is PresetTag {
  return PRESET_TAG_SET.has(value);
}

export function normalizeTags(tags: string[] | undefined) {
  const seen = new Set<PresetTag>();
  for (const raw of tags ?? []) {
    const mapped = LEGACY_TAG_MAP[raw.trim()] ?? raw.trim();
    if (!isPresetTag(mapped) || seen.has(mapped)) continue;
    seen.add(mapped);
  }
  return PRESET_TAGS.filter((tag) => seen.has(tag));
}

export function displayTags(tags: string[] | undefined, limit = 5) {
  return normalizeTags(tags).slice(0, Math.max(0, limit));
}

export function experienceLabel(type: MediaType, value?: string) {
  if (!value) return "";
  return EXPERIENCE_METHODS[type].find((option) => option.value === value)?.label ?? value;
}

export function experienceDateLabel(type: MediaType) {
  if (type === "book") return "読書日";
  if (type === "music") return "聴いた日";
  return "鑑賞日";
}

export function formatExperienceDate(value?: string) {
  if (!value) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return value;
  return `${match[1]}年${Number(match[2])}月${Number(match[3])}日`;
}

export function addedTimestamp(item: Pick<ShelfItem, "addedAt" | "id">) {
  if (item.addedAt) {
    const time = Date.parse(item.addedAt);
    if (Number.isFinite(time)) return time;
  }
  return 0;
}

export function draftFromItem(item: ShelfItem): ReviewDraft {
  return {
    rating: clampRating(item.rating),
    comment: item.comment,
    tags: normalizeTags(item.tags),
    spoiler: Boolean(item.spoiler),
    experiencedAt: item.experiencedAt ?? "",
    experienceMethod: item.experienceMethod ?? "",
  };
}

export function applyReviewDraft<T extends ShelfItem>(item: T, draft: ReviewDraft): T {
  return {
    ...item,
    rating: clampRating(draft.rating),
    comment: draft.comment.trim() || "まだ感想は書いていません。",
    tags: normalizeTags(draft.tags),
    spoiler: draft.spoiler,
    experiencedAt: draft.experiencedAt || undefined,
    experienceMethod: draft.experienceMethod || undefined,
  };
}

export function normalizeShelfItem(item: ShelfItem): ShelfItem {
  return {
    ...item,
    rating: clampRating(item.rating),
    comment: item.comment || "",
    tags: normalizeTags(item.tags),
    spoiler: Boolean(item.spoiler),
    experiencedAt: item.experiencedAt || undefined,
    experienceMethod: item.experienceMethod || undefined,
    addedAt: item.addedAt || undefined,
  };
}

export function withReview(
  item: ShelfItem,
  extras: Partial<Pick<ShelfItem, "tags" | "spoiler" | "experiencedAt" | "experienceMethod" | "addedAt" | "rating" | "comment">>
): ShelfItem {
  return normalizeShelfItem({ ...item, ...extras });
}
