import type { CapacitorConfig } from "@capacitor/cli";

import { CAPACITOR_SERVER_URL } from "./src/native/live-url";

const liveUrl = (process.env.CAPACITOR_SERVER_URL || CAPACITOR_SERVER_URL).trim();

const config: CapacitorConfig = {
  appId: "com.tamenao.artly",
  appName: "Artly",
  webDir: "resources/www",
  backgroundColor: "#F5D22C",
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    scheme: "Artly",
  },
  plugins: {
    SplashScreen: {
      backgroundColor: "#F5D22C",
      launchShowDuration: 500,
      launchAutoHide: true,
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#F5D22C",
    },
  },
};

if (liveUrl) {
  const host = new URL(liveUrl).host;
  config.server = {
    url: liveUrl,
    allowNavigation: [host],
  };
}

export default config;
