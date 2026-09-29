"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { ImeTextInput } from "@/components/ime-text-input";
import { UserListRow } from "@/components/profile-header";
import { useSocial } from "@/components/social-provider";

export default function ExplorePage() {
  const { users, shelves, followingIds, followerIds } = useSocial();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return users.filter((user) => {
      if (!normalized) return true;
      return [user.name, user.handle, user.bio]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [query, users]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pt-8 pb-28 md:pb-16">
      <header className="mb-6">
        <p className="text-xs font-semibold tracking-[0.22em] text-foreground/55 uppercase">
          People
        </p>
        <h1 className="font-heading mt-1 text-4xl">探す</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          ユーザーを探してフォローすると、その人の棚がフィードに届きます。
        </p>
      </header>
      <label className="relative mb-6">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <ImeTextInput
          type="search"
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder="名前、ハンドル、自己紹介で検索"
          className="h-10 rounded-lg pl-8"
          aria-label="ユーザーを検索"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </label>
      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-foreground/20 bg-white px-6 py-12 text-center text-sm text-muted-foreground">
          「{query}」に一致するユーザーはいません。
        </p>
      ) : (
        <ul className="grid gap-2">
          {filtered.map((user) => (
            <li key={user.id}>
              <div className="grid gap-1">
                <UserListRow user={user} />
                <p className="px-3 pb-2 text-xs text-muted-foreground">
                  作品 {(shelves[user.id] ?? []).length} · フォロー{" "}
                  {followingIds(user.id).length} · フォロワー{" "}
                  {followerIds(user.id).length}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
