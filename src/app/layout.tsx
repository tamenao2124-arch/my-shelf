import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";

import { AppShell } from "@/components/app-shell";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Artly",
    template: "%s · Artly",
  },
  description:
    "好きな音楽・本・映画をコレクションし、みんなの更新をタイムラインで見る Artly。",
  applicationName: "Artly",
  appleWebApp: {
    capable: true,
    title: "Artly",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#F5D22C",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${inter.variable} ${notoSansJp.variable} h-full antialiased`}
    >
      <body className="relative min-h-full flex flex-col">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
