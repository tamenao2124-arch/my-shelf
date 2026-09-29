"use client";

import { useState } from "react";
import Link from "next/link";

import { FollowButton } from "@/components/follow-button";
import { ProfileEditor } from "@/components/profile-editor";
import { UserAvatar } from "@/components/user-avatar";
import { useSocial } from "@/components/social-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { UserProfile } from "@/lib/social";

type FollowListKind = "following" | "followers";

export function ProfileHeader({
  user,
  itemCount,
}: {
  user: UserProfile;
  itemCount: number;
}) {
  const { followingIds, followerIds, currentUserId } = useSocial();
  const [list, setList] = useState<FollowListKind | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const following = followingIds(user.id);
  const followers = followerIds(user.id);
  const isSelf = user.id === currentUserId;

  return (
    <section className="relative overflow-hidden rounded-lg border border-foreground/10 bg-white px-5 py-6 poster-card sm:px-8 sm:py-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <UserAvatar
            name={user.name}
            accent={user.accent}
            avatarUrl={user.avatarUrl}
            size="lg"
          />
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-foreground/55 uppercase">
              @{user.handle}
            </p>
            <h1 className="font-heading mt-1 text-3xl tracking-tight sm:text-5xl">
              {user.name}の棚
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {user.bio}
            </p>
          </div>
        </div>
        {isSelf ? (
          <Button variant="outline" onClick={() => setEditorOpen(true)}>
            プロフィールを編集
          </Button>
        ) : (
          <FollowButton userId={user.id} />
        )}
      </div>
      <dl className="mt-6 flex flex-wrap gap-6 text-sm">
        <Stat label="作品" value={itemCount} />
        <button type="button" onClick={() => setList("following")} className="text-left">
          <Stat label="フォロー" value={following.length} />
        </button>
        <button type="button" onClick={() => setList("followers")} className="text-left">
          <Stat label="フォロワー" value={followers.length} />
        </button>
      </dl>
      <FollowListDialog
        open={list !== null}
        onOpenChange={(open) => {
          if (!open) setList(null);
        }}
        title={list === "followers" ? "フォロワー" : "フォロー中"}
        userIds={list === "followers" ? followers : following}
      />
      <ProfileEditor open={editorOpen} onOpenChange={setEditorOpen} />
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-heading text-2xl text-foreground">{value}</dd>
    </div>
  );
}

function FollowListDialog({
  open,
  onOpenChange,
  title,
  userIds,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  userIds: string[];
}) {
  const { userById } = useSocial();
  const people = userIds
    .map((id) => userById(id))
    .filter((user): user is UserProfile => Boolean(user));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">{title}</DialogTitle>
          <DialogDescription>
            {people.length === 0
              ? "まだ誰もいません。"
              : `${people.length}人のユーザー`}
          </DialogDescription>
        </DialogHeader>
        {people.length > 0 ? (
          <ul className="grid max-h-80 gap-2 overflow-y-auto">
            {people.map((person) => (
              <li key={person.id}>
                <UserListRow user={person} onNavigate={() => onOpenChange(false)} />
              </li>
            ))}
          </ul>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export function UserListRow({
  user,
  onNavigate,
}: {
  user: UserProfile;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-foreground/10 bg-white px-3 py-2">
      <Link
        href={`/users/${user.id}`}
        onClick={onNavigate}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <UserAvatar
          name={user.name}
          accent={user.accent}
          avatarUrl={user.avatarUrl}
          size="sm"
        />
        <span className="min-w-0">
          <span className="block truncate font-medium">{user.name}</span>
          <span className="block truncate text-xs text-muted-foreground">
            @{user.handle}
          </span>
        </span>
      </Link>
      <FollowButton userId={user.id} />
    </div>
  );
}
