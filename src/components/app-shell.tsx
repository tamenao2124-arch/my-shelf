"use client";

import type { ReactNode } from "react";

import { AuthDialogProvider } from "@/components/auth-dialog";
import { BottomNav } from "@/components/bottom-nav";
import { GraphicBackdrop } from "@/components/graphic-backdrop";
import { InstallAppBanner } from "@/components/install-app-banner";
import { NativeShell } from "@/components/native-shell";
import { PwaRegister } from "@/components/pwa-register";
import { SiteHeader } from "@/components/site-header";
import { SocialProvider, useSocial } from "@/components/social-provider";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SocialProvider>
      <AuthDialogProvider>
        <GraphicBackdrop />
        <div className="relative z-10 flex min-h-full flex-col max-md:h-dvh max-md:min-h-0 max-md:overflow-hidden">
          <SiteHeader />
          <HydrateBanner />
          <ReadyGate>{children}</ReadyGate>
          <InstallAppBanner />
          <BottomNav />
          <PwaRegister />
          <NativeShell />
        </div>
      </AuthDialogProvider>
    </SocialProvider>
  );
}

function HydrateBanner() {
  const { hydrateError } = useSocial();
  if (!hydrateError) return null;
  return (
    <p className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
      {hydrateError}
    </p>
  );
}

function ReadyGate({ children }: { children: ReactNode }) {
  const { ready } = useSocial();
  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-24 text-sm text-muted-foreground">
        読み込んでいます…
      </div>
    );
  }
  return (
    <div className="flex min-h-0 flex-1 flex-col max-md:overflow-y-auto max-md:overscroll-y-contain max-md:[-webkit-overflow-scrolling:touch]">
      {children}
    </div>
  );
}
