"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Pencil, UserRound } from "lucide-react";

import { useAuthDialog } from "@/components/auth-dialog";
import { ProfileEditor } from "@/components/profile-editor";
import { UserAvatar } from "@/components/user-avatar";
import { useSocial } from "@/components/social-provider";
import { Button } from "@/components/ui/button";

export function AccountMenu() {
  const router = useRouter();
  const { currentUser, isAuthenticated, signOut, ready } = useSocial();
  const { openAuthDialog } = useAuthDialog();
  const [open, setOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  if (!ready) {
    return (
      <div className="h-8 w-24 animate-pulse rounded-lg bg-muted/40" />
    );
  }

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="sm" onClick={() => openAuthDialog("login")}>
          ログイン
        </Button>
        <Button size="sm" onClick={() => openAuthDialog("signup")}>
          新規登録
        </Button>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg py-1 pr-2 pl-1 hover:bg-white"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <UserAvatar
          name={currentUser.name}
          accent={currentUser.accent}
          avatarUrl={currentUser.avatarUrl}
          size="sm"
        />
        <span className="hidden text-sm sm:inline">{currentUser.name}</span>
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-52 rounded-lg border border-foreground/10 bg-white p-1.5 poster-shadow"
        >
          <Link
            href={`/users/${currentUser.id}`}
            role="menuitem"
            className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            <UserRound className="size-4" />
            マイプロフィール
          </Link>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm hover:bg-muted"
            onClick={() => {
              setOpen(false);
              setEditorOpen(true);
            }}
          >
            <Pencil className="size-4" />
            プロフィールを編集
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-destructive hover:bg-muted"
            onClick={() => {
              setOpen(false);
              void signOut().then(() => router.push("/"));
            }}
          >
            <LogOut className="size-4" />
            ログアウト
          </button>
        </div>
      ) : null}
      <ProfileEditor open={editorOpen} onOpenChange={setEditorOpen} />
    </div>
  );
}
