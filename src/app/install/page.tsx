import type { Metadata } from "next";
import Link from "next/link";
import { Smartphone } from "lucide-react";

import { InstallActions } from "@/components/install-actions";

export const metadata: Metadata = {
  title: "App Store",
  description: "Artly を App Store に出す手順と、ホーム画面への追加方法です。",
};

export default function InstallPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pt-8 pb-28 md:pb-16">
      <header className="mb-8">
        <p className="text-xs font-semibold tracking-[0.22em] text-foreground/55 uppercase">
          App Store
        </p>
        <h1 className="font-heading mt-1 text-4xl">App Store に出す</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          iPhone のストアに並べるには、Apple の有料登録と Mac の Xcode が必要です。こちらから審査ボタンは押せません。準備（アイコン、プライバシーページ、iOS
          プロジェクト設定）はリポジトリに入れてあります。
        </p>
      </header>

      <ol className="space-y-4">
        <li className="rounded-lg border border-foreground/12 bg-white p-4">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-xs">
              1
            </span>
            Apple Developer に登録する
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            <a
              href="https://developer.apple.com/programs/"
              className="font-semibold text-foreground underline"
            >
              Apple Developer Program
            </a>
            に個人で登録します。年額 99 ドルです。審査にはこのアカウントが必須です。
          </p>
        </li>
        <li className="rounded-lg border border-foreground/12 bg-white p-4">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-xs">
              2
            </span>
            サイトを https で公開する
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            この画面の <strong>Publish</strong> で Vercel に出します。出た https
            のURLを控えてください。App Store のアプリはこのURLを開きます。プライバシーポリシーは{" "}
            <Link href="/privacy" className="font-semibold text-foreground underline">
              /privacy
            </Link>
            、サポートは{" "}
            <Link href="/support" className="font-semibold text-foreground underline">
              /support
            </Link>
            です。
          </p>
        </li>
        <li className="rounded-lg border border-foreground/12 bg-white p-4">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-xs">
              3
            </span>
            公開URLをアプリに書く
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            リポジトリの <code className="font-mono text-foreground">src/native/live-url.ts</code>{" "}
            を、例えば次のようにします。
          </p>
          <pre className="mt-2 overflow-x-auto rounded-md bg-[#111] px-3 py-2 text-xs text-[#F5D22C]">
            {`export const CAPACITOR_SERVER_URL = "https://あなたのURL";`}
          </pre>
        </li>
        <li className="rounded-lg border border-foreground/12 bg-white p-4">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-xs">
              4
            </span>
            Mac の Xcode でビルドする
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Mac に Xcode を入れ、プロジェクトフォルダで次を実行します。
          </p>
          <pre className="mt-2 overflow-x-auto rounded-md bg-[#111] px-3 py-2 text-xs leading-relaxed text-[#F5D22C]">
            {`npm install
npx cap add ios
npx cap sync
npx cap open ios`}
          </pre>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Xcode で Team に Developer アカウントを選び、Product → Archive → Distribute App → App
            Store Connect でアップロードします。バンドルIDは{" "}
            <code className="font-mono text-foreground">com.tamenao.artly</code>、1024px
            アイコンは <code className="font-mono text-foreground">resources/icon.png</code> です。
          </p>
        </li>
        <li className="rounded-lg border border-foreground/12 bg-white p-4">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-xs">
              5
            </span>
            App Store Connect で審査に出す
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>カテゴリ: エンターテインメント</li>
            <li>プライバシーポリシーURL: 公開サイトの /privacy</li>
            <li>サポートURL: 公開サイトの /support</li>
            <li>暗号化: 標準の HTTPS とパスワードのハッシュのみ（免除にチェック）</li>
            <li>スクリーンショット: iPhone の実機またはシミュレータで撮影</li>
          </ul>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Apple は、中身がウェブサイトだけのアプリを却下することがあります。アイコン・スプラッシュ・プライバシーページを入れてあるので、公開URLが開く状態で出してください。
          </p>
        </li>
      </ol>

      <section className="mt-10">
        <h2 className="font-heading text-2xl">先にホーム画面へ置く</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          ストアの審査を待たずに使うなら、公開URLを Safari / Chrome で開いてホーム画面に追加できます。
        </p>
        <InstallActions />
        <ol className="mt-4 space-y-4">
          <li className="rounded-lg border border-foreground/12 bg-white p-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Smartphone className="size-4" />
              iPhone（Safari）
            </p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>共有ボタン（四角から矢印）をタップする</li>
              <li>「ホーム画面に追加」を選ぶ</li>
            </ol>
          </li>
          <li className="rounded-lg border border-foreground/12 bg-white p-4">
            <p className="text-sm font-semibold">Android（Chrome）</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>右上の「︙」</li>
              <li>「アプリをインストール」または「ホーム画面に追加」</li>
            </ol>
          </li>
        </ol>
      </section>
    </main>
  );
}
