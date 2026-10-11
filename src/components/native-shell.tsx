"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";

export function NativeShell() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    void StatusBar.setStyle({ style: Style.Dark }).catch(() => undefined);
    void SplashScreen.hide().catch(() => undefined);
  }, []);

  return null;
}
