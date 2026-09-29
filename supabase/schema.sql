-- Artly Supabase スキーマ
-- ダッシュボードの SQL Editor でこのファイルを実行してください。
--
-- テーブル:
--   profiles     ユーザー名 / アイコン URL / 自己紹介
--   shelf_items  ユーザーごとの保存作品（book | music | movie、タイトル、画像、メタデータ）
--   reviews      ★評価・感想・シンプルタグ・鑑賞日（作品 1 件につき 1 件）
--   follows      ユーザー同士のフォロー関係
-- ---------------------------------------------------------------------------

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- プロフィール（auth.users と 1:1）
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  handle text not null,
  bio text not null default '',
  avatar_url text,
  accent text not null default 'oklch(0.8 0.09 78)',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_handle_format check (handle ~ '^[a-z0-9][a-z0-9._]{1,23}$')
);

create unique index if not exists profiles_handle_unique on public.profiles (handle);

-- ---------------------------------------------------------------------------
-- マイ棚（作品のカタログ行）
-- 評価・本文・マイタグの正本は public.reviews（作品 1 件につき 1 レビュー）
-- shelf_items 側の rating / comment / tags はフィード用の複製です
-- ---------------------------------------------------------------------------
create table if not exists public.shelf_items (
  id text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('music', 'book', 'movie')),
  title text not null,
  rating numeric(3,1) not null check (rating >= 0.5 and rating <= 5),
  comment text not null default '',
  cover_url text not null default '',
  year integer,
  artist text,
  album text,
  author text,
  publisher text,
  director text,
  tags text[] not null default '{}',
  spoiler boolean not null default false,
  experienced_at date,
  experience_method text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shelf_items_user_created_idx
  on public.shelf_items (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- レビュー（マイ棚の作品 1 件につき 1 件。評価・本文・マイタグ）
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  item_id text not null references public.shelf_items (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating numeric(3,1) not null check (rating >= 0.5 and rating <= 5),
  body text not null default '',
  tags text[] not null default '{}',
  spoiler boolean not null default false,
  experienced_at date,
  experience_method text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reviews_item_unique unique (item_id)
);

create index if not exists reviews_user_idx on public.reviews (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- フォロー
-- ---------------------------------------------------------------------------
create table if not exists public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint follows_no_self check (follower_id <> following_id)
);

create index if not exists follows_following_idx on public.follows (following_id);

-- ---------------------------------------------------------------------------
-- フィード投稿（棚追加時に item のスナップショットを保存）
-- ---------------------------------------------------------------------------
create table if not exists public.feed_posts (
  id text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  item jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists feed_posts_created_idx
  on public.feed_posts (created_at desc);

-- ---------------------------------------------------------------------------
-- いいね / コメント
-- ---------------------------------------------------------------------------
create table if not exists public.post_likes (
  post_id text not null references public.feed_posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.post_comments (
  id text primary key,
  post_id text not null references public.feed_posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists post_comments_post_idx
  on public.post_comments (post_id, created_at);

-- ---------------------------------------------------------------------------
-- 新規登録時にプロフィールを自動作成
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  next_handle text;
  base_handle text;
begin
  base_handle := lower(coalesce(
    new.raw_user_meta_data->>'handle',
    split_part(new.email, '@', 1)
  ));
  base_handle := regexp_replace(base_handle, '[^a-z0-9._]', '', 'g');
  if length(base_handle) < 2 then
    base_handle := 'user' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;
  next_handle := left(base_handle, 24);

  begin
    insert into public.profiles (id, name, handle, bio, accent)
    values (
      new.id,
      coalesce(nullif(trim(new.raw_user_meta_data->>'name'), ''), '新しい棚'),
      next_handle,
      coalesce(new.raw_user_meta_data->>'bio', ''),
      coalesce(new.raw_user_meta_data->>'accent', 'oklch(0.8 0.09 78)')
    );
  exception
    when unique_violation then
      insert into public.profiles (id, name, handle, bio, accent)
      values (
        new.id,
        coalesce(nullif(trim(new.raw_user_meta_data->>'name'), ''), '新しい棚'),
        left(next_handle, 16) || substr(replace(new.id::text, '-', ''), 1, 8),
        coalesce(new.raw_user_meta_data->>'bio', ''),
        coalesce(new.raw_user_meta_data->>'accent', 'oklch(0.8 0.09 78)')
      );
  end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_profile_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.touch_profile_updated_at();

drop trigger if exists shelf_items_set_updated_at on public.shelf_items;
create trigger shelf_items_set_updated_at
  before update on public.shelf_items
  for each row execute function public.touch_profile_updated_at();

drop trigger if exists reviews_set_updated_at on public.reviews;
create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute function public.touch_profile_updated_at();

-- ---------------------------------------------------------------------------
-- マイタグのプリセット（アプリの PRESET_TAGS と同期）
-- ---------------------------------------------------------------------------
create table if not exists public.tag_presets (
  label text primary key,
  sort_order smallint not null
);

insert into public.tag_presets (label, sort_order) values
  ('お気に入り', 1),
  ('殿堂入り', 2),
  ('あとで見る', 3),
  ('再訪', 4),
  ('2026年', 5)
on conflict (label) do nothing;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.shelf_items enable row level security;
alter table public.reviews enable row level security;
alter table public.follows enable row level security;
alter table public.feed_posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_comments enable row level security;
alter table public.tag_presets enable row level security;

drop policy if exists "tag presets are readable" on public.tag_presets;
create policy "tag presets are readable" on public.tag_presets
  for select using (true);

drop policy if exists "profiles are readable" on public.profiles;
create policy "profiles are readable" on public.profiles
  for select using (true);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "shelf items are readable" on public.shelf_items;
create policy "shelf items are readable" on public.shelf_items
  for select using (true);

drop policy if exists "users insert own shelf items" on public.shelf_items;
create policy "users insert own shelf items" on public.shelf_items
  for insert with check (auth.uid() = user_id);

drop policy if exists "users update own shelf items" on public.shelf_items;
create policy "users update own shelf items" on public.shelf_items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "users delete own shelf items" on public.shelf_items;
create policy "users delete own shelf items" on public.shelf_items
  for delete using (auth.uid() = user_id);

drop policy if exists "reviews are readable" on public.reviews;
create policy "reviews are readable" on public.reviews
  for select using (true);

drop policy if exists "users insert own reviews" on public.reviews;
create policy "users insert own reviews" on public.reviews
  for insert with check (auth.uid() = user_id);

drop policy if exists "users update own reviews" on public.reviews;
create policy "users update own reviews" on public.reviews
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "users delete own reviews" on public.reviews;
create policy "users delete own reviews" on public.reviews
  for delete using (auth.uid() = user_id);

drop policy if exists "follows are readable" on public.follows;
create policy "follows are readable" on public.follows
  for select using (true);

drop policy if exists "users follow others" on public.follows;
create policy "users follow others" on public.follows
  for insert with check (auth.uid() = follower_id);

drop policy if exists "users unfollow" on public.follows;
create policy "users unfollow" on public.follows
  for delete using (auth.uid() = follower_id);

drop policy if exists "feed posts are readable" on public.feed_posts;
create policy "feed posts are readable" on public.feed_posts
  for select using (true);

drop policy if exists "users insert own posts" on public.feed_posts;
create policy "users insert own posts" on public.feed_posts
  for insert with check (auth.uid() = user_id);

drop policy if exists "users update own posts" on public.feed_posts;
create policy "users update own posts" on public.feed_posts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "likes are readable" on public.post_likes;
create policy "likes are readable" on public.post_likes
  for select using (true);

drop policy if exists "users like posts" on public.post_likes;
create policy "users like posts" on public.post_likes
  for insert with check (auth.uid() = user_id);

drop policy if exists "users unlike posts" on public.post_likes;
create policy "users unlike posts" on public.post_likes
  for delete using (auth.uid() = user_id);

drop policy if exists "comments are readable" on public.post_comments;
create policy "comments are readable" on public.post_comments
  for select using (true);

drop policy if exists "users insert comments" on public.post_comments;
create policy "users insert comments" on public.post_comments
  for insert with check (auth.uid() = user_id);

-- 既存プロジェクト向け: レビュー詳細カラム
alter table public.shelf_items add column if not exists tags text[] not null default '{}';
alter table public.shelf_items add column if not exists spoiler boolean not null default false;
alter table public.shelf_items add column if not exists experienced_at date;
alter table public.shelf_items add column if not exists experience_method text not null default '';

alter table public.shelf_items drop constraint if exists shelf_items_rating_check;
alter table public.shelf_items alter column rating type numeric(3,1) using rating::numeric;
alter table public.shelf_items
  add constraint shelf_items_rating_check check (rating >= 0.5 and rating <= 5);

alter table public.shelf_items add column if not exists updated_at timestamptz not null default now();

insert into public.reviews (
  item_id, user_id, rating, body, tags, spoiler, experienced_at, experience_method
)
select
  id, user_id, rating, comment, tags, spoiler, experienced_at, experience_method
from public.shelf_items
on conflict (item_id) do nothing;

-- ---------------------------------------------------------------------------
-- アバター用ストレージ
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatar images are public" on storage.objects;
create policy "avatar images are public"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "users upload own avatar" on storage.objects;
create policy "users upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "users update own avatar" on storage.objects;
create policy "users update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "users delete own avatar" on storage.objects;
create policy "users delete own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
