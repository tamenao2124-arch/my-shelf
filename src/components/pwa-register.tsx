"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return;

    void navigator.serviceWorker.register("/sw.js").catch(() => {
      // 登録に失敗してもサイト自体は使える
    });
  }, []);

  return null;
}
