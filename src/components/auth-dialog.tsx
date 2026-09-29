"use client";

import { createContext, useContext, useMemo, useState } from "react";

import { AuthForm, type AuthMode } from "@/components/auth-form";
import { PersistenceNote } from "@/components/persistence-note";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AuthDialogContextValue = {
  openAuthDialog: (mode?: AuthMode) => void;
};

const AuthDialogContext = createContext<AuthDialogContextValue | null>(null);

export function useAuthDialog() {
  const ctx = useContext(AuthDialogContext);
  if (!ctx) {
    throw new Error("useAuthDialog must be used within AuthDialogProvider");
  }
  return ctx;
}

export function AuthDialogProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");

  const value = useMemo<AuthDialogContextValue>(
    () => ({
      openAuthDialog: (next = "login") => {
        setMode(next);
        setOpen(true);
      },
    }),
    [],
  );

  return (
    <AuthDialogContext.Provider value={value}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-lg sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{mode === "signup" ? "新規登録" : "ログイン"}</DialogTitle>
            <DialogDescription>
              会員になると、作品・レビュー・マイタグが自分の棚に保存されます。
            </DialogDescription>
          </DialogHeader>
          <AuthForm
            key={mode}
            defaultMode={mode}
            onModeChange={setMode}
            onSuccess={() => setOpen(false)}
          />
          <PersistenceNote />
        </DialogContent>
      </Dialog>
    </AuthDialogContext.Provider>
  );
}
