"use client";

import { isSupabaseConfigured } from "@/lib/supabase";

export function PersistenceNote({ compact = false }: { compact?: boolean }) {
  const live = isSupabaseConfigured();

  if (compact) {
    return (
      <span
        className="hidden rounded-full border border-foreground/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:inline-flex"
        title={
          live
            ? "Supabase に接続済み。アカウントごとに棚が保存されます。"
            : "環境変数未設定のため、このブラウザのローカル保存で動いています。"
        }
      >
        {live ? "Supabase" : "ローカル"}
      </span>
    );
  }

  return (
    <div className="rounded-lg bg-muted px-3 py-3 text-xs leading-relaxed text-muted-foreground">
      {live ? (
        <>
          Supabase に接続しています。会員登録するとプロフィール・マイ棚・レビュー・フォローがクラウドに保存されます。
        </>
      ) : (
        <>
          いまはブラウザのローカル保存です。プロジェクト直下の{" "}
          <code className="font-mono">.env.local</code> に{" "}
          <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> と{" "}
          <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
          を入れると、同じ UI のままクラウド認証と DB に切り替わります。デモは{" "}
          <code className="font-mono">ta@shelf.local</code> /{" "}
          <code className="font-mono">shelf-demo</code> です。
        </>
      )}
    </div>
  );
}
