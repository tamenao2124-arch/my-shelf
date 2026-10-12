"use client";

import Link from "next/link";

import { TimelineExploreLink, TimelineFeed } from "@/components/timeline-feed";
import { useSocial } from "@/components/social-provider";

export default function FeedPage() {
  const { feedPosts, followingIds, currentUserId, isAuthenticated } = useSocial();
  const followingCount = currentUserId ? followingIds(currentUserId).length : 0;

  return (
    <TimelineFeed
      kicker="Following"
      title="フィード"
      description={
        isAuthenticated
          ? "フォロー中の人が棚に置いた作品と、評価・レビューが時系列で流れます。"
          : "フォローした人の更新だけが流れます。みんなの投稿はタイムラインで見られます。"
      }
      posts={feedPosts}
      emptyTitle="まだ投稿がありません"
      emptyDescription={
        followingCount === 0 ? (
          isAuthenticated ? (
            <>
              <TimelineExploreLink>ユーザーをフォロー</TimelineExploreLink>
              すると、その人の棚の更新がここに届きます。
            </>
          ) : (
            <>
              ログインしてフォローすると、フィードが自分用になります。みんなの更新は
              <Link href="/" className="font-semibold text-foreground underline-offset-2 hover:underline">
                タイムライン
              </Link>
              で見られます。
            </>
          )
        ) : (
          "フォロー中の棚に、まだ新しい作品がありません。"
        )
      }
    />
  );
}
