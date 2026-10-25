"use client";

import Link from "next/link";
import { use } from "react";

import {
  MypageMobileHeader,
  MypageProfileStrip,
} from "@/components/mypage-mobile-chrome";
import { ProfileHeader } from "@/components/profile-header";
import { ProfileShelfSections } from "@/components/profile-shelf-sections";
import { ShelfGrid } from "@/components/shelf-grid";
import { useSocial } from "@/components/social-provider";

export default function UserShelfPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const { userById, shelves, currentUserId, addToMyShelf, updateMyShelfItem, removeMyShelfItem } =
    useSocial();
  const user = userById(userId);
  const items = shelves[userId] ?? [];
  const isSelf = userId === currentUserId;

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

  const shelfProps = {
    items,
    onAdd: isSelf ? addToMyShelf : undefined,
    onUpdate: isSelf ? updateMyShelfItem : undefined,
    onDelete: isSelf ? removeMyShelfItem : undefined,
  };

  return (
    <>
      <MypageMobileHeader title={isSelf ? "マイページ" : user.name} isSelf={isSelf} />
      <MypageProfileStrip user={user} isSelf={isSelf} />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col bg-[#fffdf5] md:bg-transparent">
        <div className="px-4 pt-5 pb-28 md:hidden">
          <ProfileShelfSections {...shelfProps} showAdd={isSelf} />
        </div>
        <div className="mx-auto hidden w-full flex-1 flex-col px-4 pt-8 pb-16 md:flex">
          <ProfileHeader user={user} itemCount={items.length} />
          <div className="mt-8">
            <ShelfGrid {...shelfProps} showSearch />
          </div>
        </div>
      </main>
    </>
  );
}
