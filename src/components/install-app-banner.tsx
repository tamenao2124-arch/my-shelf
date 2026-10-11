"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Smartphone, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const DISMISS_KEY = "artly-hide-install";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandaloneDisplay() {
  if (typeof window === "undefined") return false;
  const media = window.matchMedia("(display-mode: standalone)").matches;
  const ios =
    "standalone" in window.navigator &&
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
  return media || ios;
}

export function InstallAppBanner() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(
    null,
  );

  useEffect(() => {
    if (pathname === "/install") {
      setHidden(true);
      setReady(true);
      return;
    }
    if (isStandaloneDisplay()) {
      setHidden(true);
      setReady(true);
      return;
    }
    if (window.localStorage.getItem(DISMISS_KEY) === "1") {
      setHidden(true);
      setReady(true);
      return;
    }
    setHidden(false);
    setReady(true);

    function onPrompt(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, [pathname]);

  if (!ready || hidden) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(4.35rem+env(safe-area-inset-bottom))] z-40 px-3 md:hidden">
      <div className="pointer-events-auto mx-auto flex max-w-lg items-start gap-2 rounded-lg border border-foreground/12 bg-white/95 px-3 py-2.5 shadow-[0_18px_40px_-24px_rgb(17_17_17_/_0.45)] backdrop-blur-xl">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary">
          <Smartphone className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug">ホーム画面に置く</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            アイコンからアプリのように開けます。
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {installEvent ? (
              <Button
                size="sm"
                onClick={() => {
                  void installEvent.prompt().then(() => {
                    setInstallEvent(null);
                    window.localStorage.setItem(DISMISS_KEY, "1");
                    setHidden(true);
                  });
                }}
              >
                追加する
              </Button>
            ) : null}
            <Button size="sm" variant={installEvent ? "outline" : "default"} nativeButton={false} render={<Link href="/install" />}>
              手順を見る
            </Button>
          </div>
        </div>
        <button
          type="button"
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="閉じる"
          onClick={() => {
            window.localStorage.setItem(DISMISS_KEY, "1");
            setHidden(true);
          }}
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
