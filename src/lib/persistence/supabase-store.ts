import { createSupabaseClient } from "@/lib/supabase";
import type {
  AuthSession,
  ProfilePatch,
  SignUpInput,
  SocialSnapshot,
} from "@/lib/persistence/types";
import { accentFor, normalizeHandle } from "@/lib/profile";
import type { FeedPost, PostComment, UserProfile } from "@/lib/social";
import { normalizeShelfItem } from "@/lib/review";
import type { MediaType, ShelfItem } from "@/lib/types";

type ProfileRow = {
  id: string;
  name: string;
  handle: string;
  bio: string;
  avatar_url: string | null;
  accent: string;
};

type ShelfRow = {
  id: string;
  user_id: string;
  type: MediaType;
  title: string;
  rating: number;
  comment: string;
  cover_url: string;
  year: number | null;
  artist: string | null;
  album: string | null;
  author: string | null;
  publisher: string | null;
  director: string | null;
  tags?: string[] | null;
  spoiler?: boolean | null;
  experienced_at?: string | null;
  experience_method?: string | null;
  created_at?: string | null;
};

type ReviewRow = {
  item_id: string;
  user_id: string;
  rating: number;
  body: string;
  tags: string[] | null;
  spoiler: boolean | null;
  experienced_at: string | null;
  experience_method: string | null;
};

type FollowRow = { follower_id: string; following_id: string };
type PostRow = { id: string; user_id: string; item: ShelfItem; created_at: string };
type LikeRow = { post_id: string; user_id: string };
type CommentRow = {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
};

function requireClient() {
  const client = createSupabaseClient();
  if (!client) {
    throw new Error("Supabase が設定されていません。");
  }
  return client;
}

function profileFromRow(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    name: row.name,
    handle: row.handle,
    bio: row.bio,
    accent: row.accent,
    avatarUrl: row.avatar_url,
  };
}

function shelfFromRow(row: ShelfRow, review?: ReviewRow | null): ShelfItem {
  const rating = Number(review?.rating ?? row.rating);
  const comment = review?.body ?? row.comment;
  const tags = review?.tags ?? row.tags ?? [];
  const spoiler = Boolean(review?.spoiler ?? row.spoiler);
  const experiencedAt = review?.experienced_at ?? row.experienced_at ?? undefined;
  const experienceMethod =
    review?.experience_method || row.experience_method || undefined;
  const base = {
    id: row.id,
    title: row.title,
    rating,
    comment,
    coverUrl: row.cover_url,
    year: row.year ?? undefined,
    tags,
    spoiler,
    experiencedAt,
    experienceMethod,
    addedAt: row.created_at ?? undefined,
  };
  if (row.type === "music") {
    return normalizeShelfItem({
      ...base,
      type: "music",
      artist: row.artist || "アーティスト不明",
      album: row.album || row.title,
    });
  }
  if (row.type === "book") {
    return normalizeShelfItem({
      ...base,
      type: "book",
      author: row.author || "著者不明",
      publisher: row.publisher || "出版社不明",
    });
  }
  return normalizeShelfItem({
    ...base,
    type: "movie",
    director: row.director || "監督不明",
  });
}

export function shelfToRow(userId: string, item: ShelfItem) {
  const next = normalizeShelfItem(item);
  return {
    id: next.id,
    user_id: userId,
    type: next.type,
    title: next.title,
    rating: next.rating,
    comment: next.comment,
    cover_url: next.coverUrl,
    year: next.year ?? null,
    artist: next.type === "music" ? next.artist : null,
    album: next.type === "music" ? next.album : null,
    author: next.type === "book" ? next.author : null,
    publisher: next.type === "book" ? next.publisher : null,
    director: next.type === "movie" ? next.director : null,
    tags: next.tags ?? [],
    spoiler: next.spoiler ?? false,
    experienced_at: next.experiencedAt || null,
    experience_method: next.experienceMethod || "",
  };
}

function reviewToRow(userId: string, item: ShelfItem) {
  const next = normalizeShelfItem(item);
  return {
    item_id: next.id,
    user_id: userId,
    rating: next.rating,
    body: next.comment,
    tags: next.tags ?? [],
    spoiler: next.spoiler ?? false,
    experienced_at: next.experiencedAt || null,
    experience_method: next.experienceMethod || "",
  };
}

async function upsertReview(
  client: ReturnType<typeof requireClient>,
  userId: string,
  item: ShelfItem
) {
  const { error } = await client.from("reviews").upsert(reviewToRow(userId, item), {
    onConflict: "item_id",
  });
  if (!error) return;
  if (error.code === "PGRST205" || error.code === "42P01") return;
  throw new Error(error.message);
}

function isMissingTableError(error: { code?: string } | null) {
  return error?.code === "PGRST205" || error?.code === "42P01";
}

function shelfUpdateFields(item: ShelfItem) {
  const row = shelfToRow("", item);
  return {
    type: row.type,
    title: row.title,
    rating: row.rating,
    comment: row.comment,
    cover_url: row.cover_url,
    year: row.year,
    artist: row.artist,
    album: row.album,
    author: row.author,
    publisher: row.publisher,
    director: row.director,
    tags: row.tags,
    spoiler: row.spoiler,
    experienced_at: row.experienced_at,
    experience_method: row.experience_method,
  };
}

export async function hydrateSupabase(): Promise<{
  session: AuthSession | null;
  snapshot: SocialSnapshot;
}> {
  const client = requireClient();
  const {
    data: { session },
  } = await client.auth.getSession();

  const [
    { data: profiles, error: profileError },
    { data: items, error: itemError },
    reviewsResult,
    { data: follows, error: followError },
    { data: posts, error: postError },
    { data: likes, error: likeError },
    { data: comments, error: commentError },
  ] = await Promise.all([
    client.from("profiles").select("*"),
    client.from("shelf_items").select("*").order("created_at", { ascending: false }),
    client.from("reviews").select("*"),
    client.from("follows").select("*"),
    client.from("feed_posts").select("*").order("created_at", { ascending: false }),
    client.from("post_likes").select("*"),
    client.from("post_comments").select("*").order("created_at", { ascending: true }),
  ]);

  if (reviewsResult.error && !isMissingTableError(reviewsResult.error)) {
    throw new Error(reviewsResult.error.message);
  }

  const firstError =
    profileError || itemError || followError || postError || likeError || commentError;
  if (firstError) {
    throw new Error(firstError.message);
  }

  const reviewByItem = new Map<string, ReviewRow>();
  for (const row of (reviewsResult.data ?? []) as ReviewRow[]) {
    reviewByItem.set(row.item_id, row);
  }

  const users = ((profiles ?? []) as ProfileRow[]).map(profileFromRow);
  const shelves: Record<string, ShelfItem[]> = {};
  for (const user of users) shelves[user.id] = [];
  for (const row of (items ?? []) as ShelfRow[]) {
    shelves[row.user_id] = [
      ...(shelves[row.user_id] ?? []),
      shelfFromRow(row, reviewByItem.get(row.id)),
    ];
  }

  const following: Record<string, string[]> = {};
  for (const user of users) following[user.id] = [];
  for (const row of (follows ?? []) as FollowRow[]) {
    following[row.follower_id] = [
      ...(following[row.follower_id] ?? []),
      row.following_id,
    ];
  }

  const likesMap: Record<string, string[]> = {};
  for (const row of (likes ?? []) as LikeRow[]) {
    likesMap[row.post_id] = [...(likesMap[row.post_id] ?? []), row.user_id];
  }

  const commentsMap: Record<string, PostComment[]> = {};
  for (const row of (comments ?? []) as CommentRow[]) {
    commentsMap[row.post_id] = [
      ...(commentsMap[row.post_id] ?? []),
      {
        id: row.id,
        userId: row.user_id,
        text: row.body,
        createdAt: row.created_at,
      },
    ];
  }

  const feedPosts: FeedPost[] = ((posts ?? []) as PostRow[]).map((row) => ({
    id: row.id,
    userId: row.user_id,
    item: normalizeShelfItem(row.item),
    createdAt: row.created_at,
  }));

  return {
    session: session?.user
      ? { userId: session.user.id, email: session.user.email ?? "" }
      : null,
    snapshot: {
      users,
      shelves,
      following,
      posts: feedPosts,
      likes: likesMap,
      comments: commentsMap,
    },
  };
}

export async function supabaseSignIn(email: string, password: string) {
  const client = requireClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    throw new Error(error?.message || "ログインに失敗しました。");
  }
  return hydrateSupabase();
}

export async function supabaseSignUp(input: SignUpInput) {
  const client = requireClient();
  const handle = normalizeHandle(input.handle);
  const { data, error } = await client.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: {
        name: input.name.trim(),
        handle,
        bio: (input.bio ?? "").trim(),
        accent: accentFor(handle),
      },
    },
  });
  if (error) {
    throw new Error(error.message);
  }
  if (!data.session || !data.user) {
    throw new Error(
      "確認メールを送信しました。メール内のリンクを開いてからログインしてください。"
    );
  }
  return hydrateSupabase();
}

export async function supabaseSignOut() {
  const client = requireClient();
  const { error } = await client.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function supabaseAddShelfItem(userId: string, item: ShelfItem) {
  const client = requireClient();
  const next = normalizeShelfItem(item);
  const post = {
    id: `p-${next.id}`,
    user_id: userId,
    item: next,
  };
  const { error: itemError } = await client.from("shelf_items").insert(shelfToRow(userId, next));
  if (itemError) throw new Error(itemError.message);
  await upsertReview(client, userId, next);
  const { error: postError } = await client.from("feed_posts").insert(post);
  if (postError) throw new Error(postError.message);
}

export async function supabaseUpdateShelfItem(userId: string, item: ShelfItem) {
  const client = requireClient();
  const next = normalizeShelfItem(item);
  const { error } = await client
    .from("shelf_items")
    .update(shelfUpdateFields(next))
    .eq("id", next.id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  await upsertReview(client, userId, next);
  await client.from("feed_posts").update({ item: next }).eq("id", `p-${next.id}`);
}

export async function supabaseDeleteShelfItem(userId: string, itemId: string) {
  const client = requireClient();
  const { error: postError } = await client
    .from("feed_posts")
    .delete()
    .eq("id", `p-${itemId}`)
    .eq("user_id", userId);
  if (postError) throw new Error(postError.message);
  const { error: itemError } = await client
    .from("shelf_items")
    .delete()
    .eq("id", itemId)
    .eq("user_id", userId);
  if (itemError) throw new Error(itemError.message);
}

export async function supabaseSetFollow(
  followerId: string,
  followingId: string,
  nextFollowing: boolean
) {
  const client = requireClient();
  if (nextFollowing) {
    const { error } = await client.from("follows").insert({
      follower_id: followerId,
      following_id: followingId,
    });
    if (error && error.code !== "23505") throw new Error(error.message);
    return;
  }
  const { error } = await client
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId);
  if (error) throw new Error(error.message);
}

export async function supabaseToggleLike(postId: string, userId: string, liked: boolean) {
  const client = requireClient();
  if (liked) {
    const { error } = await client.from("post_likes").delete().eq("post_id", postId).eq("user_id", userId);
    if (error) throw new Error(error.message);
    return;
  }
  const { error } = await client.from("post_likes").insert({ post_id: postId, user_id: userId });
  if (error && error.code !== "23505") throw new Error(error.message);
}

export async function supabaseAddComment(comment: PostComment, postId: string) {
  const client = requireClient();
  const { error } = await client.from("post_comments").insert({
    id: comment.id,
    post_id: postId,
    user_id: comment.userId,
    body: comment.text,
  });
  if (error) throw new Error(error.message);
}

export async function supabaseUpdateProfile(userId: string, patch: ProfilePatch) {
  const client = requireClient();
  const handle = normalizeHandle(patch.handle);
  const { data, error } = await client
    .from("profiles")
    .update({
      name: patch.name.trim(),
      handle,
      bio: patch.bio.trim(),
      avatar_url: patch.avatarUrl === undefined ? undefined : patch.avatarUrl,
    })
    .eq("id", userId)
    .select("*")
    .single();
  if (error) {
    if (error.code === "23505") {
      throw new Error("このハンドルはすでに使われています。");
    }
    throw new Error(error.message);
  }
  return profileFromRow(data as ProfileRow);
}

export async function supabaseUploadAvatar(userId: string, file: File) {
  const client = requireClient();
  const path = `${userId}/avatar.jpg`;
  const { error } = await client.storage.from("avatars").upload(path, file, {
    upsert: true,
    contentType: file.type || "image/jpeg",
  });
  if (error) throw new Error(error.message);
  const { data } = client.storage.from("avatars").getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}
