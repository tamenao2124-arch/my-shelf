# Artly

好きな音楽・本・映画をコレクションして、フォローした人の棚と共有する日本語UIです。

## できること

- 新規登録・ログイン・ログアウト
- ログインしたユーザーごとにマイ棚・フォローを保存
- プロフィール編集（アイコン、表示名、ハンドル、自己紹介）
- 作品カードのグリッド表示と、本 / 音楽 / 映画での絞り込み
- 0.5刻みの★評価、詳細レビュー、鑑賞日・鑑賞方法、5つのプリセットタグ、ネタバレ注意
- マイ棚の並び替え（追加日 / 評価）とタグ絞り込み、カードから開く詳細モーダル（レビュー保存・棚から外す）
- 公開APIからジャケット・タイトル・作者を検索して棚に追加（Netflix / Prime Video / U-NEXT / Kindle）
- フィード、いいね、コメント、ユーザー検索

## 認証とデータの保存

ヘッダー・マイ棚・フォロー・フィードから、ログイン／新規登録モーダルを開けます（`/login` と `/signup` も残しています）。

キーを置かない場合は、**このブラウザの localStorage** にアカウントと棚を保存します。デモログインは次のとおりです。

- メール: `ta@shelf.local`
- パスワード: `shelf-demo`

初回訪問ではデモユーザー「た」で入った状態になります。ログアウトして新規登録すると、空の棚が自分のアカウントに紐づきます。リロードしても残ります。ヘッダー右の「ローカル / Supabase」表示で、いまどちらの保存先かが分かります。

本番では [Supabase](https://supabase.com) を使います。クライアント入口は [`src/lib/supabase.ts`](src/lib/supabase.ts)、環境変数は [`src/lib/env.ts`](src/lib/env.ts) / [`src/lib/supabase/env.ts`](src/lib/supabase/env.ts) です。

1. プロジェクトを作成する
2. SQL Editor で [`supabase/schema.sql`](supabase/schema.sql) を実行する（`profiles`、`shelf_items`、`reviews`、`follows`、フィード、RLS、登録時プロフィール作成、アバター用 Storage）
3. Authentication → Providers で Email を有効にする。開発中は Confirm email をオフにするとすぐログインできます
4. `.env.local` に URL と anon key を入れる

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

設定後は Auth と Postgres が使われ、localStorage モードは使われません。

## 作品検索のAPI

`src/lib/catalog/` にメディアごとのサービスモジュールがあります。追加モーダルの検索は `/api/search` 経由です。認証はサーバー側だけで読みます（`src/lib/catalog/env.ts`）。

```bash
cp .env.example .env.local
```

| メディア | モジュール | キーなし | キーがあるとき |
| --- | --- | --- | --- |
| 音楽 | `itunes.ts` / `spotify.ts` | iTunes Search API | Spotify |
| 本 | `google-books.ts` / `open-library.ts` | Open Library（Google Books は環境によっては 429） | Google Books + Kindle / 電子書籍 |
| 映画 | `tmdb.ts` / `anilist.ts` / `wikipedia.ts` / 内蔵カタログ | 邦画・洋画のポスター付きカタログ、AniList、英語版 Wikipedia | TMDB のポスター、監督名、日本の配信先 |

追加ダイアログの「探す場所」で次を選べます。

- 映画: **Netflix** / **Prime Video** / **U-NEXT**（空欄検索でその配信の話題作）
- 本: **Kindle**（電子書籍を優先）

Netflix や Amazon の公式カタログAPIはないため、映画の配信情報は TMDB（JustWatch 連携）の日本リージョンを使います。Kindle も公式の全件APIはないので、Google Books の電子書籍 + Open Library で探します。

### 映画（TMDB）

1. [TMDB](https://www.themoviedb.org/settings/api) で無料アカウントを作る
2. API Key (v3) か Read Access Token (v4 JWT) を発行する
3. `.env.local` にどちらかを書く

```
TMDB_API_KEY=your_tmdb_v3_key
# または
TMDB_ACCESS_TOKEN=your_read_access_token
```

### 本（Google Books）

1. [Google Cloud](https://console.cloud.google.com/apis/library/books.googleapis.com) で Books API を有効化する
2. 認証情報から API キーを発行する
3. `.env.local` に書く

```
GOOGLE_BOOKS_API_KEY=your_google_books_key
```

未設定でも Open Library で検索できます。クラウド環境の匿名クォータが 0 のときはキーが必要です。

任意:

```
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
```

キーを変えたあとは開発サーバーを再起動してください。Vercel に載せるときは同じ変数を Project Settings → Environment Variables に追加します。`NEXT_PUBLIC_` 付きの同名もフォールバックとして読みます。

## GitHub に保存する

コードの保存先は [github.com/tamenao2124-arch/my-shelf](https://github.com/tamenao2124-arch/my-shelf) です。クラウドのエージェントは GitHub にログインできないので、**Cursor の GitHub 連携**と、手元（WSL）からの初回 push が必要です。`.env.local` は git 対象外です。キーはコミットしないでください。

### 1. Cursor と GitHub を繋ぐ

1. ブラウザで [cursor.com/dashboard](https://cursor.com/dashboard) を開く
2. **Integrations** で GitHub の **Connect** を押す
3. GitHub アカウント `tamenao2124-arch` で認可する
4. リポジトリは **All repositories**、または `my-shelf` だけを選ぶ

これ以降、GitHub 上の `my-shelf` を指定したクラウドエージェントは、そのリポジトリへ直接 push できます。いまのアートリーの履歴はまだ GitHub 側に無いので、次の初回 push を一度やってください。

### 2. WSL から初回 push（推奨）

Git と GitHub CLI を入れ、GitHub にログインします。

```bash
sudo apt update
sudo apt install -y git gh
gh auth login
```

`gh auth login` では GitHub.com → HTTPS → ブラウザログインを選びます。終わったら、Cursor Origin にあるアートリーをクローンして GitHub へ載せます。

```bash
git clone https://origin.cursor.com/git/tamenao2124/my-shelf.git artly
cd artly
git remote add github https://github.com/tamenao2124-arch/my-shelf.git
git push -u github main
```

Origin の clone で認証を求められたら、Cursor にログインした状態で再実行するか、エージェント画面の **Codebase** から手元へ取得してください。GitHub が空のうちは `git pull` は不要で、`git push -u github main` だけで載ります。

以降の更新は同じフォルダで:

```bash
git add -A
git commit -m "変更内容"
git push github main
```

HTTPS のパスワードには、GitHub のパスワードではなく [Personal Access Token](https://github.com/settings/tokens)（`repo` 権限）を使います。`gh auth login` 済みならトークン入力は不要です。

### 3. 手元クローンだけ使う場合

GitHub に載ったあと:

```bash
gh repo clone tamenao2124-arch/my-shelf
cd my-shelf
cp .env.example .env.local   # キーはここに書く
npm install
npm run dev
```

## 起動方法

```bash
npm install
npm run dev
```

ブラウザで [http://127.0.0.1:43141](http://127.0.0.1:43141) を開きます。
