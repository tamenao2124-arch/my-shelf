"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
};

export function InstallActions() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [standalone, setStandalone] = useState(false);
  const [localHost, setLocalHost] = useState(false);

  useEffect(() => {
    const host = window.location.hostname;
    setLocalHost(host === "localhost" || host === "127.0.0.1");
    const media = window.matchMedia("(display-mode: standalone)").matches;
      const ios =
        "standalone" in window.navigator &&
        Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
    setStandalone(media || ios);

    function onPrompt(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (standalone) {
    return (
      <p className="rounded-lg border border-foreground/12 bg-white px-4 py-3 text-sm">
        いまはホーム画面のアプリとして開いています。
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {localHost ? (
        <p className="rounded-lg border border-foreground/12 bg-white px-4 py-3 text-sm leading-relaxed">
          この画面はパソコンの開発用アドレスです。スマホのホーム画面に置くときは、先に{" "}
          <strong>Publish</strong> で公開した https のURLを、スマホのブラウザで開いてください。
        </p>
      ) : null}
      {installEvent ? (
        <Button
          size="lg"
          className="h-11 px-4"
          onClick={() => {
            void installEvent.prompt();
          }}
        >
          この端末に追加する
        </Button>
      ) : null}
    </div>
  );
}
