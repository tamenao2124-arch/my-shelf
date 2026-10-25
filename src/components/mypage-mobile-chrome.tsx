"use client";

import { useState } from "react";
import { Bell, Settings2 } from "lucide-react";
import Link from "next/link";

import { FollowButton } from "@/components/follow-button";
import { ProfileEditor } from "@/components/profile-editor";
import { UserAvatar } from "@/components/user-avatar";
import { useSocial } from "@/components/social-provider";
import type { UserProfile } from "@/lib/social";

export function MypageMobileHeader({
  title = "マイページ",
  isSelf,
}: {
  title?: string;
  isSelf: boolean;
}) {
  const [editorOpen, setEditorOpen] = useState(false);
  const { currentUser } = useSocial();

  return (
    <>
      <header className="sticky top-0 z-40 bg-primary pt-[env(safe-area-inset-top)] md:hidden">
        <div className="flex h-12 items-center justify-between px-4">
          <span className="w-10" aria-hidden />
          <h1 className="font-heading text-base font-bold text-foreground">
            {title}
          </h1>
          <div className="flex w-10 items-center justify-end gap-1">
            <Link
              href="/feed"
              className="flex size-9 items-center justify-center rounded-lg text-foreground"
              aria-label="フィード"
            >
              <Bell className="size-[18px]" strokeWidth={2.25} />
            </Link>
            {isSelf ? (
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-lg text-foreground"
                aria-label="設定"
                onClick={() => setEditorOpen(true)}
              >
                <Settings2 className="size-[18px]" strokeWidth={2.25} />
              </button>
            ) : null}
          </div>
        </div>
      </header>
      {isSelf && currentUser ? (
        <ProfileEditor open={editorOpen} onOpenChange={setEditorOpen} />
      ) : null}
    </>
  );
}

export function MypageProfileStrip({
  user,
  isSelf,
}: {
  user: UserProfile;
  isSelf: boolean;
}) {
  const { followerIds } = useSocial();
  const followers = followerIds(user.id).length;

  return (
    <section className="border-b border-foreground/8 bg-[#fffdf5] px-4 py-5 md:hidden">
      <div className="flex items-center gap-4">
        <UserAvatar
          name={user.name}
          accent={user.accent}
          avatarUrl={user.avatarUrl}
          size="lg"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-foreground">
            @{user.handle}
          </p>
          <p className="truncate text-sm text-muted-foreground">{user.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            フォロワー: {followers.toLocaleString("ja-JP")}
          </p>
        </div>
        {!isSelf ? (
          <FollowButton userId={user.id} />
        ) : null}
      </div>
      {user.bio ? (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-foreground/75">
          {user.bio}
        </p>
      ) : null}
    </section>
  );
}
