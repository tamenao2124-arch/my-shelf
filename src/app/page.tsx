"use client";

import Link from "next/link";

import { SuggestedPeople, TimelineExploreLink, TimelineFeed } from "@/components/timeline-feed";
import { useSocial } from "@/components/social-provider";

export default function Home() {
  const { timelinePosts } = useSocial();

  return (
    <TimelineFeed
      kicker="Timeline"
      title="タイムライン"
      description={
        <>
          フォローしていない人の投稿も、新しい順に流れます。知っている人だけ見るときは
          <Link href="/feed" className="font-semibold text-foreground underline-offset-2 hover:underline">
            フィード
          </Link>
          へ。
        </>
      }
      posts={timelinePosts}
      discover
      beforeList={<SuggestedPeople />}
      emptyTitle="まだ更新がありません"
      emptyDescription={
        <>
          公開されている棚の投稿が、ここに時系列で並びます。
          <TimelineExploreLink>さがす</TimelineExploreLink>
          からユーザーを見てみましょう。
        </>
      }
    />
  );
}
