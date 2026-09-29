"use client";

import { useState, type FormEvent } from "react";

import { ImeTextInput } from "@/components/ime-text-input";
import { PersistenceNote } from "@/components/persistence-note";
import { useSocial } from "@/components/social-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  normalizeHandle,
  validateEmail,
  validateHandle,
  validateName,
  validatePassword,
} from "@/lib/profile";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/social";
import { cn } from "@/lib/utils";

export type AuthMode = "login" | "signup";

export function AuthForm({
  defaultMode = "login",
  onSuccess,
  onModeChange,
  showPersistenceNote = false,
  className,
}: {
  defaultMode?: AuthMode;
  onSuccess?: () => void;
  onModeChange?: (mode: AuthMode) => void;
  showPersistenceNote?: boolean;
  className?: string;
}) {
  const { signIn, signUp, mode: persistenceMode } = useSocial();
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [email, setEmail] = useState(
    defaultMode === "login" && persistenceMode === "local" ? DEMO_EMAIL : "",
  );
  const [password, setPassword] = useState(
    defaultMode === "login" && persistenceMode === "local" ? DEMO_PASSWORD : "",
  );
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function switchMode(next: AuthMode) {
    setMode(next);
    setError("");
    onModeChange?.(next);
    if (next === "login" && persistenceMode === "local") {
      setEmail(DEMO_EMAIL);
      setPassword(DEMO_PASSWORD);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    if (emailError || passwordError) {
      setError(emailError || passwordError);
      return;
    }
    if (mode === "signup") {
      const nameError = validateName(name);
      const handleError = validateHandle(normalizeHandle(handle));
      if (nameError || handleError) {
        setError(nameError || handleError);
        return;
      }
    }

    setPending(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        await signUp({
          email,
          password,
          name,
          handle: normalizeHandle(handle),
        });
      }
      onSuccess?.();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "送信に失敗しました。");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={cn("grid gap-4", className)}>
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        <button
          type="button"
          onClick={() => switchMode("login")}
          className={cn(
            "flex-1 rounded-md py-2 text-sm font-semibold",
            mode === "login" ? "bg-background shadow-sm" : "text-muted-foreground",
          )}
        >
          ログイン
        </button>
        <button
          type="button"
          onClick={() => switchMode("signup")}
          className={cn(
            "flex-1 rounded-md py-2 text-sm font-semibold",
            mode === "signup" ? "bg-background shadow-sm" : "text-muted-foreground",
          )}
        >
          新規登録
        </button>
      </div>

      {showPersistenceNote ? <PersistenceNote /> : null}

      <form onSubmit={onSubmit} className="grid gap-3">
        {mode === "signup" ? (
          <>
            <label className="grid gap-1.5">
              <span className="text-xs font-medium">表示名</span>
              <ImeTextInput
                value={name}
                onChange={(event) => setName(event.currentTarget.value)}
                placeholder="た"
                autoComplete="nickname"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-medium">ハンドル</span>
              <ImeTextInput
                value={handle}
                onChange={(event) => setHandle(event.currentTarget.value)}
                placeholder="ta"
                autoComplete="username"
              />
            </label>
          </>
        ) : null}
        <label className="grid gap-1.5">
          <span className="text-xs font-medium">メールアドレス</span>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            autoComplete="email"
            required
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-medium">パスワード</span>
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
          />
        </label>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="mt-1" disabled={pending}>
          {pending ? "送信しています…" : mode === "login" ? "ログイン" : "アカウントを作る"}
        </Button>
      </form>
    </div>
  );
}
