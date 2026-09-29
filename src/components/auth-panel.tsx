"use client";

import { useRouter } from "next/navigation";

import { AuthForm, type AuthMode } from "@/components/auth-form";
import { BrandMark } from "@/components/brand-mark";

export function AuthPanel({
  mode,
  next = "/",
}: {
  mode: AuthMode;
  next?: string;
}) {
  const router = useRouter();
  const title = mode === "login" ? "ログイン" : "新規登録";

  return (
    <div className="mx-auto w-full max-w-md rounded-lg border border-foreground/10 bg-white p-6 poster-card sm:p-8">
      <div className="flex items-center gap-2">
        <BrandMark className="size-8" />
        <p className="text-xs font-semibold tracking-[0.22em] text-foreground/55 uppercase">
          Artly
        </p>
      </div>
      <h1 className="font-heading mt-1 text-3xl">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {mode === "login"
          ? "自分の棚とフォロー関係を、この端末（または Supabase）に保存します。"
          : "メールとパスワードで棚を作ります。作品とフォローはアカウントごとに残ります。"}
      </p>
      <div className="mt-6">
        <AuthForm
          defaultMode={mode}
          showPersistenceNote
          onSuccess={() => {
            router.push(next);
            router.refresh();
          }}
        />
      </div>
    </div>
  );
}
