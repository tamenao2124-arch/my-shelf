"use client";

import { AuthPanel } from "@/components/auth-panel";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pt-12 pb-28 md:pb-16">
      <AuthPanel mode="login" />
    </main>
  );
}
