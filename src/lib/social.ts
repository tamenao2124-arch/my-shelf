import type { ShelfItem } from "@/lib/types";

export type UserProfile = {
  id: string;
  name: string;
  handle: string;
  bio: string;
  accent: string;
  avatarUrl?: string | null;
};

export const DEMO_USER_ID = "ta";
export const DEMO_EMAIL = "ta@shelf.local";
export const DEMO_PASSWORD = "shelf-demo";

export type FeedPost = {
  id: string;
  userId: string;
  item: ShelfItem;
  createdAt: string;
};

export type PostComment = {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
};

export const CURRENT_USER_ID = DEMO_USER_ID;

export function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

export function publicTimelinePosts(
  posts: FeedPost[],
  shelves: Record<string, ShelfItem[]>,
): FeedPost[] {
  const seenItems = new Set(posts.map((post) => post.item.id));
  const seenIds = new Set(posts.map((post) => post.id));
  const derived: FeedPost[] = [];

  for (const [userId, items] of Object.entries(shelves)) {
    for (const item of items) {
      const id = `p-${item.id}`;
      if (seenItems.has(item.id) || seenIds.has(id)) continue;
      derived.push({
        id,
        userId,
        item,
        createdAt: item.addedAt || item.experiencedAt || hoursAgo(72),
      });
    }
  }

  return [...posts, ...derived].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(0, Math.round(diffMs / 60000));
  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}日前`;
  return new Date(iso).toLocaleDateString("ja-JP");
}

export function followersOf(
  userId: string,
  following: Record<string, string[]>
) {
  return Object.entries(following)
    .filter(([, ids]) => ids.includes(userId))
    .map(([id]) => id);
}
