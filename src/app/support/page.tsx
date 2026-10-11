import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "サポート",
  description: "Artly の問い合わせ先です。",
};

export default function SupportPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pt-8 pb-28 md:pb-16">
      <header className="mb-8">
        <p className="text-xs font-semibold tracking-[0.22em] text-foreground/55 uppercase">
          Help
        </p>
        <h1 className="font-heading mt-1 text-4xl">サポート</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          不具合、アカウントの削除、App Store 審査用の連絡は次のメールへどうぞ。
        </p>
      </header>
      <div className="rounded-lg border border-foreground/12 bg-white p-4">
        <p className="text-sm font-semibold">メール</p>
        <a
          href="mailto:tamenao2124@gmail.com"
          className="mt-1 inline-block text-sm underline"
        >
          tamenao2124@gmail.com
        </a>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          App Store Connect のサポートURLには、公開したサイトの{" "}
          <code className="font-mono text-foreground">/support</code> を貼ります。
        </p>
      </div>
    </main>
  );
}
