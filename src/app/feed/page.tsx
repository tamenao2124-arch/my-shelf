"use client";

import { FeedCard } from "@/components/feed-card";
import { useSocial } from "@/components/social-provider";

export default function FeedPage() {
  const { feedPosts, followingIds, currentUserId, isAuthenticated } = useSocial();
  const followingCount = currentUserId ? followingIds(currentUserId).length : 0;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pt-8 pb-28 md:pb-16">
      <header className="mb-6">
        <p className="text-xs font-semibold tracking-[0.22em] text-foreground/55 uppercase">
          Timeline
        </p>
        <h1 className="font-heading mt-1 text-4xl">フィード</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isAuthenticated
            ? "フォロー中の人が棚に置いた作品と、評価・レビューが時系列で流れます。"
            : "公開されている棚の更新です。ログインすると、フォローした人だけに絞られます。"}
        </p>
      </header>
      {feedPosts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-foreground/20 bg-white px-6 py-16 text-center">
          <p className="font-heading text-2xl">まだ投稿がありません</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {followingCount === 0
              ? isAuthenticated
                ? "ユーザーをフォローすると、その人の棚の更新がここに届きます。"
                : "ログインしてフォローすると、タイムラインが自分用になります。"
              : "フォロー中の棚に、まだ新しい作品がありません。"}
          </p>
        </div>
      ) : (
        <ul className="grid gap-4">
          {feedPosts.map((post) => (
            <li key={post.id}>
              <FeedCard post={post} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
