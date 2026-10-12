"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { FeedCard } from "@/components/feed-card";
import { FollowButton } from "@/components/follow-button";
import { UserAvatar } from "@/components/user-avatar";
import { useSocial } from "@/components/social-provider";
import type { FeedPost } from "@/lib/social";

export function TimelineFeed({
  kicker,
  title,
  description,
  posts,
  emptyTitle,
  emptyDescription,
  discover = false,
  beforeList,
}: {
  kicker: string;
  title: string;
  description: ReactNode;
  posts: FeedPost[];
  emptyTitle: string;
  emptyDescription: ReactNode;
  discover?: boolean;
  beforeList?: ReactNode;
}) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pt-8 pb-28 md:pb-16">
      <header className="mb-6">
        <p className="text-xs font-semibold tracking-[0.22em] text-foreground/55 uppercase">
          {kicker}
        </p>
        <h1 className="font-heading mt-1 text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </header>
      {beforeList}
      {posts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-foreground/20 bg-white px-6 py-16 text-center">
          <p className="font-heading text-2xl">{emptyTitle}</p>
          <p className="mt-2 text-sm text-muted-foreground">{emptyDescription}</p>
        </div>
      ) : (
        <ul className="grid gap-4">
          {posts.map((post) => (
            <li key={post.id}>
              <FeedCard post={post} discover={discover} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export function SuggestedPeople() {
  const { users, currentUserId, isFollowing } = useSocial();
  const suggestions = users.filter(
    (user) => user.id !== currentUserId && !isFollowing(user.id),
  );

  if (suggestions.length === 0) return null;

  return (
    <section className="mb-6">
      <p className="text-sm font-semibold">まだ知らない人</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        フォローしていなくても、投稿はタイムラインに流れます。
      </p>
      <ul className="-mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-1">
        {suggestions.map((user) => (
          <li
            key={user.id}
            className="w-36 shrink-0 rounded-lg border border-foreground/10 bg-white p-3"
          >
            <Link href={`/users/${user.id}`} className="flex flex-col items-center text-center">
              <UserAvatar
                name={user.name}
                accent={user.accent}
                avatarUrl={user.avatarUrl}
              />
              <span className="mt-2 w-full truncate text-sm font-medium">{user.name}</span>
              <span className="w-full truncate text-[11px] text-muted-foreground">
                @{user.handle}
              </span>
            </Link>
            <div className="mt-2 flex justify-center">
              <FollowButton userId={user.id} compact />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function TimelineExploreLink({ children }: { children: ReactNode }) {
  return (
    <Link href="/explore" className="font-semibold text-foreground underline-offset-2 hover:underline">
      {children}
    </Link>
  );
}
