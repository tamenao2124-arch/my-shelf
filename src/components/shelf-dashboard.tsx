"use client";

import Link from "next/link";

import { useAuthDialog } from "@/components/auth-dialog";
import { ProfileHeader } from "@/components/profile-header";
import { ShelfGrid } from "@/components/shelf-grid";
import { useSocial } from "@/components/social-provider";
import { Button } from "@/components/ui/button";

export function ShelfDashboard() {
  const { currentUser, shelves, addToMyShelf, updateMyShelfItem, removeMyShelfItem, isAuthenticated, ready } = useSocial();
  const { openAuthDialog } = useAuthDialog();
  const items = currentUser ? (shelves[currentUser.id] ?? []) : [];

  if (!ready) {
    return <DashboardSkeleton />;
  }

  if (!isAuthenticated || !currentUser) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 pt-12 pb-28 md:pb-16">
        <p className="text-xs font-semibold tracking-[0.22em] text-foreground/55 uppercase">My shelf</p>
        <h1 className="font-heading mt-1 text-4xl">自分の棚を始める</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          登録すると、追加した作品・レビュー・マイタグとフォロー関係がこのアカウントに保存されます。ログアウトして
          も、同じメールで戻れば棚はそのままです。
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button onClick={() => openAuthDialog("signup")}>新規登録</Button>
          <Button variant="outline" onClick={() => openAuthDialog("login")}>
            ログイン
          </Button>
          <Button nativeButton={false} variant="ghost" render={<Link href="/explore" />}>
            みんなの棚を見る
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main id="shelf" className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pt-6 pb-28 md:pt-8 md:pb-16">
      <ProfileHeader user={currentUser} itemCount={items.length} />
      <div className="mt-8">
        <ShelfGrid
          items={items}
          onAdd={addToMyShelf}
          onUpdate={updateMyShelfItem}
          onDelete={removeMyShelfItem}
          showSearch
        />
      </div>
    </main>
  );
}

function DashboardSkeleton() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pt-8 pb-28 md:pb-16">
      <div className="h-40 animate-pulse rounded-lg bg-muted/40" />
      <div className="mt-8 h-48 animate-pulse rounded-lg bg-muted/30" />
    </main>
  );
}
