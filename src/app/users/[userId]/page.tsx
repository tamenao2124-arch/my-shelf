"use client";

import Link from "next/link";
import { use } from "react";

import { ProfileHeader } from "@/components/profile-header";
import { ShelfGrid } from "@/components/shelf-grid";
import { useSocial } from "@/components/social-provider";

export default function UserShelfPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const { userById, shelves, currentUserId, addToMyShelf, updateMyShelfItem, removeMyShelfItem } = useSocial();
  const user = userById(userId);
  const items = shelves[userId] ?? [];

  if (!user) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center px-4 py-24 text-center">
        <h1 className="font-heading text-3xl">ユーザーが見つかりません</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          このプロフィールは存在しないか、削除されています。
        </p>
        <Link
          href="/explore"
          className="mt-6 inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground"
        >
          ユーザーを探す
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pt-8 pb-28 md:pb-16">
      <ProfileHeader user={user} itemCount={items.length} />
      <div className="mt-8">
        <ShelfGrid
          items={items}
          onAdd={user.id === currentUserId ? addToMyShelf : undefined}
          onUpdate={user.id === currentUserId ? updateMyShelfItem : undefined}
          onDelete={user.id === currentUserId ? removeMyShelfItem : undefined}
          showSearch
        />
      </div>
    </main>
  );
}
