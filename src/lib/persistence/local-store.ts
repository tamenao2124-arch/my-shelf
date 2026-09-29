import {
  INITIAL_COMMENTS,
  INITIAL_FOLLOWING,
  INITIAL_LIKES,
  INITIAL_POSTS,
  INITIAL_SHELVES,
  USERS,
} from "@/data/community";
import { INITIAL_SHELF_ITEMS } from "@/data/shelf-items";
import { hashSecret } from "@/lib/persistence/crypto";
import type {
  AuthSession,
  ProfilePatch,
  SignUpInput,
  SocialSnapshot,
} from "@/lib/persistence/types";
import { accentFor, normalizeHandle } from "@/lib/profile";
import { normalizeShelfItem } from "@/lib/review";
import { DEMO_EMAIL, DEMO_PASSWORD, DEMO_USER_ID } from "@/lib/social";
import type { FeedPost, PostComment, UserProfile } from "@/lib/social";
import type { ShelfItem } from "@/lib/types";

const STORAGE_KEY = "artly:v1";

type LocalAccount = {
  id: string;
  email: string;
  salt: string;
  passwordHash: string;
};

type LocalDocument = {
  version: 1;
  accounts: LocalAccount[];
  sessionUserId: string | null;
  snapshot: SocialSnapshot;
};

function cloneSnapshot(snapshot: SocialSnapshot): SocialSnapshot {
  return structuredClone(snapshot);
}

function seedReviewById() {
  const map = new Map<string, ShelfItem>();
  for (const item of INITIAL_SHELF_ITEMS) map.set(item.id, item);
  for (const items of Object.values(INITIAL_SHELVES)) {
    for (const item of items) map.set(item.id, item);
  }
  return map;
}

const SEED_ITEMS = seedReviewById();

function hydrateShelfItem(item: ShelfItem): ShelfItem {
  const seed = SEED_ITEMS.get(item.id);
  if (!seed) return normalizeShelfItem(item);
  return normalizeShelfItem({
    ...item,
    tags: item.tags?.length ? item.tags : seed.tags,
    spoiler: item.spoiler ?? seed.spoiler,
    experiencedAt: item.experiencedAt || seed.experiencedAt,
    experienceMethod: item.experienceMethod || seed.experienceMethod,
    addedAt: item.addedAt || seed.addedAt,
  });
}

function hydrateSnapshot(snapshot: SocialSnapshot): SocialSnapshot {
  const shelves: Record<string, ShelfItem[]> = {};
  for (const [userId, items] of Object.entries(snapshot.shelves)) {
    shelves[userId] = items.map(hydrateShelfItem);
  }
  return {
    ...snapshot,
    shelves,
    posts: snapshot.posts.map((post) => ({
      ...post,
      item: hydrateShelfItem(post.item),
    })),
  };
}

function seedSnapshot(): SocialSnapshot {
  return {
    users: structuredClone(USERS),
    shelves: structuredClone(INITIAL_SHELVES),
    following: structuredClone(INITIAL_FOLLOWING),
    posts: structuredClone(INITIAL_POSTS),
    likes: structuredClone(INITIAL_LIKES),
    comments: structuredClone(INITIAL_COMMENTS),
  };
}

async function seedDocument(): Promise<LocalDocument> {
  const salt = DEMO_USER_ID;
  return {
    version: 1,
    accounts: [
      {
        id: DEMO_USER_ID,
        email: DEMO_EMAIL,
        salt,
        passwordHash: await hashSecret(DEMO_PASSWORD, salt),
      },
    ],
    sessionUserId: DEMO_USER_ID,
    snapshot: seedSnapshot(),
  };
}

function readRaw(): LocalDocument | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LocalDocument;
    if (parsed.version !== 1 || !parsed.snapshot) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeDocument(document: LocalDocument) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(document));
}

let writeQueue: Promise<void> = Promise.resolve();

function enqueueWrite(task: () => Promise<void>) {
  writeQueue = writeQueue.then(task, task);
  return writeQueue;
}

export async function loadLocalDocument(): Promise<LocalDocument> {
  const existing = readRaw();
  if (existing) {
    existing.snapshot = hydrateSnapshot({
      ...existing.snapshot,
      users: existing.snapshot.users.map((user) => ({
        ...user,
        avatarUrl: user.avatarUrl ?? null,
      })),
    });
    return existing;
  }
  const seeded = await seedDocument();
  writeDocument(seeded);
  return seeded;
}

export function sessionFromDocument(document: LocalDocument): AuthSession | null {
  if (!document.sessionUserId) return null;
  const account = document.accounts.find((entry) => entry.id === document.sessionUserId);
  if (!account) return null;
  return { userId: account.id, email: account.email };
}

export async function localSignIn(
  email: string,
  password: string
): Promise<{ session: AuthSession; snapshot: SocialSnapshot }> {
  const document = await loadLocalDocument();
  const normalized = email.trim().toLowerCase();
  const account = document.accounts.find((entry) => entry.email === normalized);
  if (!account) {
    throw new Error("メールアドレスまたはパスワードが違います。");
  }
  const passwordHash = await hashSecret(password, account.salt);
  if (passwordHash !== account.passwordHash) {
    throw new Error("メールアドレスまたはパスワードが違います。");
  }
  document.sessionUserId = account.id;
  writeDocument(document);
  return {
    session: { userId: account.id, email: account.email },
    snapshot: cloneSnapshot(document.snapshot),
  };
}

export async function localSignUp(
  input: SignUpInput
): Promise<{ session: AuthSession; snapshot: SocialSnapshot; profile: UserProfile }> {
  const document = await loadLocalDocument();
  const email = input.email.trim().toLowerCase();
  const handle = normalizeHandle(input.handle);
  if (document.accounts.some((account) => account.email === email)) {
    throw new Error("このメールアドレスはすでに登録されています。");
  }
  if (document.snapshot.users.some((user) => user.handle === handle)) {
    throw new Error("このハンドルはすでに使われています。");
  }

  const id =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `u-${Date.now()}`;
  const salt = id;
  const account: LocalAccount = {
    id,
    email,
    salt,
    passwordHash: await hashSecret(input.password, salt),
  };
  const profile: UserProfile = {
    id,
    name: input.name.trim(),
    handle,
    bio: (input.bio ?? "").trim(),
    accent: accentFor(handle),
    avatarUrl: null,
  };

  document.accounts.push(account);
  document.snapshot.users = [profile, ...document.snapshot.users];
  document.snapshot.shelves = { ...document.snapshot.shelves, [id]: [] };
  document.snapshot.following = { ...document.snapshot.following, [id]: [] };
  document.sessionUserId = id;
  writeDocument(document);

  return {
    session: { userId: id, email },
    snapshot: cloneSnapshot(document.snapshot),
    profile,
  };
}

export async function localSignOut() {
  return enqueueWrite(async () => {
    const document = await loadLocalDocument();
    document.sessionUserId = null;
    writeDocument(document);
  });
}

export async function saveLocalSnapshot(
  snapshot: SocialSnapshot,
  sessionUserId: string | null
) {
  return enqueueWrite(async () => {
    const existing = readRaw() ?? (await seedDocument());
    existing.snapshot = cloneSnapshot(snapshot);
    existing.sessionUserId = sessionUserId;
    writeDocument(existing);
  });
}

export async function localUpdateProfile(userId: string, patch: ProfilePatch) {
  const document = await loadLocalDocument();
  const handle = normalizeHandle(patch.handle);
  const taken = document.snapshot.users.some(
    (user) => user.id !== userId && user.handle === handle
  );
  if (taken) {
    throw new Error("このハンドルはすでに使われています。");
  }
  document.snapshot.users = document.snapshot.users.map((user) =>
    user.id === userId
      ? {
          ...user,
          name: patch.name.trim(),
          handle,
          bio: patch.bio.trim(),
          avatarUrl:
            patch.avatarUrl === undefined ? user.avatarUrl : patch.avatarUrl,
        }
      : user
  );
  writeDocument(document);
  return document.snapshot.users.find((user) => user.id === userId)!;
}

export function applyShelfAdd(
  snapshot: SocialSnapshot,
  userId: string,
  rawItem: ShelfItem
) {
  const item = normalizeShelfItem(rawItem);
  const post: FeedPost = {
    id: `p-${item.id}`,
    userId,
    item,
    createdAt: new Date().toISOString(),
  };
  return {
    snapshot: {
      ...snapshot,
      shelves: {
        ...snapshot.shelves,
        [userId]: [item, ...(snapshot.shelves[userId] ?? [])],
      },
      posts: [post, ...snapshot.posts],
    },
    post,
  };
}

export function applyShelfUpdate(
  snapshot: SocialSnapshot,
  userId: string,
  item: ShelfItem
) {
  const next = normalizeShelfItem(item);
  return {
    ...snapshot,
    shelves: {
      ...snapshot.shelves,
      [userId]: (snapshot.shelves[userId] ?? []).map((entry) =>
        entry.id === next.id ? next : entry
      ),
    },
    posts: snapshot.posts.map((post) =>
      post.userId === userId && post.item.id === next.id
        ? { ...post, item: next }
        : post
    ),
  };
}

export function applyShelfRemove(
  snapshot: SocialSnapshot,
  userId: string,
  itemId: string
): SocialSnapshot {
  const removedPostIds = new Set(
    snapshot.posts
      .filter((post) => post.userId === userId && post.item.id === itemId)
      .map((post) => post.id)
  );
  const likes = { ...snapshot.likes };
  const comments = { ...snapshot.comments };
  for (const postId of removedPostIds) {
    delete likes[postId];
    delete comments[postId];
  }
  return {
    ...snapshot,
    shelves: {
      ...snapshot.shelves,
      [userId]: (snapshot.shelves[userId] ?? []).filter((item) => item.id !== itemId),
    },
    posts: snapshot.posts.filter((post) => !removedPostIds.has(post.id)),
    likes,
    comments,
  };
}

export function applyFollow(
  snapshot: SocialSnapshot,
  followerId: string,
  followingId: string,
  nextFollowing: boolean
) {
  const mine = snapshot.following[followerId] ?? [];
  const ids = nextFollowing
    ? mine.includes(followingId)
      ? mine
      : [...mine, followingId]
    : mine.filter((id) => id !== followingId);
  return {
    ...snapshot,
    following: { ...snapshot.following, [followerId]: ids },
  };
}

export function applyLike(
  snapshot: SocialSnapshot,
  postId: string,
  userId: string
) {
  const usersWhoLiked = snapshot.likes[postId] ?? [];
  const next = usersWhoLiked.includes(userId)
    ? usersWhoLiked.filter((id) => id !== userId)
    : [...usersWhoLiked, userId];
  return {
    ...snapshot,
    likes: { ...snapshot.likes, [postId]: next },
  };
}

export function applyComment(
  snapshot: SocialSnapshot,
  postId: string,
  comment: PostComment
) {
  return {
    ...snapshot,
    comments: {
      ...snapshot.comments,
      [postId]: [...(snapshot.comments[postId] ?? []), comment],
    },
  };
}
