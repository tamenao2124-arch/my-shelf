import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシー",
  description: "Artly が扱う情報と保存先についての説明です。",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pt-8 pb-28 md:pb-16">
      <header className="mb-8">
        <p className="text-xs font-semibold tracking-[0.22em] text-foreground/55 uppercase">
          Legal
        </p>
        <h1 className="font-heading mt-1 text-4xl">プライバシー</h1>
        <p className="mt-2 text-sm text-muted-foreground">最終更新: 2026年9月29日</p>
      </header>

      <div className="space-y-6 text-sm leading-relaxed text-foreground">
        <section className="rounded-lg border border-foreground/12 bg-white p-4">
          <h2 className="font-heading text-xl">このアプリが扱う情報</h2>
          <p className="mt-2 text-muted-foreground">
            Artly は、好きな音楽・本・映画のコレクション、評価、レビュー、フォロー、プロフィール（表示名、ハンドル、自己紹介、アイコン）を保存します。メールアドレスとパスワードは、アカウントを作ったときに使います。
          </p>
        </section>
        <section className="rounded-lg border border-foreground/12 bg-white p-4">
          <h2 className="font-heading text-xl">保存先</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              クラウドのキーを置いていない場合は、この端末のブラウザ（またはアプリ）内の localStorage に保存します。端末の外には送られません。
            </li>
            <li>
              Supabase の URL と anon key を設定している場合は、そのプロジェクトの認証とデータベースに保存します。
            </li>
          </ul>
        </section>
        <section className="rounded-lg border border-foreground/12 bg-white p-4">
          <h2 className="font-heading text-xl">作品検索</h2>
          <p className="mt-2 text-muted-foreground">
            棚に作品を足すとき、検索語句をサーバー経由で公開API（TMDB、Google Books、Open Library、Wikipedia、AniList、iTunes など）に送ります。検索に必要な範囲以外の個人情報は渡しません。
          </p>
        </section>
        <section className="rounded-lg border border-foreground/12 bg-white p-4">
          <h2 className="font-heading text-xl">売らないこと</h2>
          <p className="mt-2 text-muted-foreground">
            広告のためのトラッキングは入れていません。個人情報を第三者に販売しません。
          </p>
        </section>
        <section className="rounded-lg border border-foreground/12 bg-white p-4">
          <h2 className="font-heading text-xl">問い合わせ</h2>
          <p className="mt-2 text-muted-foreground">
            削除や内容の確認は{" "}
            <Link href="/support" className="font-semibold text-foreground underline">
              サポート
            </Link>
            から連絡してください。
          </p>
        </section>
      </div>
    </main>
  );
}
