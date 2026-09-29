"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  applyComment,
  applyFollow,
  applyLike,
  applyShelfAdd,
  applyShelfRemove,
  applyShelfUpdate,
  loadLocalDocument,
  localSignIn,
  localSignOut,
  localSignUp,
  localUpdateProfile,
  saveLocalSnapshot,
  sessionFromDocument,
} from "@/lib/persistence/local-store";
import {
  hydrateSupabase,
  supabaseAddComment,
  supabaseAddShelfItem,
  supabaseDeleteShelfItem,
  supabaseUpdateShelfItem,
  supabaseSetFollow,
  supabaseSignIn,
  supabaseSignOut,
  supabaseSignUp,
  supabaseToggleLike,
  supabaseUpdateProfile,
  supabaseUploadAvatar,
} from "@/lib/persistence/supabase-store";
import { fileToAvatarDataUrl } from "@/lib/persistence/crypto";
import type {
  AuthSession,
  PersistenceMode,
  ProfilePatch,
  SignUpInput,
  SocialSnapshot,
} from "@/lib/persistence/types";
import {
  createSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase";
import {
  followersOf,
  type FeedPost,
  type PostComment,
  type UserProfile,
} from "@/lib/social";
import type { ShelfItem } from "@/lib/types";

type SocialContextValue = {
  ready: boolean;
  hydrateError: string;
  mode: PersistenceMode;
  session: AuthSession | null;
  isAuthenticated: boolean;
  currentUserId: string | null;
  currentUser: UserProfile | null;
  users: UserProfile[];
  shelves: Record<string, ShelfItem[]>;
  following: Record<string, string[]>;
  posts: FeedPost[];
  likes: Record<string, string[]>;
  comments: Record<string, PostComment[]>;
  userById: (id: string) => UserProfile | undefined;
  isFollowing: (userId: string) => boolean;
  follow: (userId: string) => Promise<void>;
  unfollow: (userId: string) => Promise<void>;
  toggleFollow: (userId: string) => Promise<void>;
  followingIds: (userId: string) => string[];
  followerIds: (userId: string) => string[];
  addToMyShelf: (item: ShelfItem) => Promise<void>;
  updateMyShelfItem: (item: ShelfItem) => Promise<void>;
  removeMyShelfItem: (itemId: string) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  likedByMe: (postId: string) => boolean;
  addComment: (postId: string, text: string) => Promise<void>;
  feedPosts: FeedPost[];
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (patch: ProfilePatch) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
};

const SocialContext = createContext<SocialContextValue | null>(null);

const emptySnapshot: SocialSnapshot = {
  users: [],
  shelves: {},
  following: {},
  posts: [],
  likes: {},
  comments: {},
};

export function SocialProvider({ children }: { children: ReactNode }) {
  const mode: PersistenceMode = isSupabaseConfigured() ? "supabase" : "local";
  const [ready, setReady] = useState(false);
  const [hydrateError, setHydrateError] = useState("");
  const [session, setSession] = useState<AuthSession | null>(null);
  const [snapshot, setSnapshot] = useState<SocialSnapshot>(emptySnapshot);

  const applyHydrate = useCallback(
    (nextSession: AuthSession | null, nextSnapshot: SocialSnapshot) => {
      setSession(nextSession);
      setSnapshot(nextSnapshot);
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (mode === "supabase") {
          const result = await hydrateSupabase();
          if (cancelled) return;
          applyHydrate(result.session, result.snapshot);
        } else {
          const document = await loadLocalDocument();
          if (cancelled) return;
          applyHydrate(sessionFromDocument(document), document.snapshot);
        }
      } catch (error) {
        if (!cancelled) {
          setHydrateError(
            error instanceof Error
              ? error.message
              : "データの読み込みに失敗しました。"
          );
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applyHydrate, mode]);

  useEffect(() => {
    if (mode !== "supabase") return;
    const client = createSupabaseClient();
    if (!client) return;
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") {
        return;
      }
      void hydrateSupabase()
        .then((result) => applyHydrate(result.session, result.snapshot))
        .catch((error) => {
          setHydrateError(
            error instanceof Error
              ? error.message
              : "セッションの同期に失敗しました。"
          );
        });
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [applyHydrate, mode]);

  useEffect(() => {
    if (!ready || mode !== "local") return;
    void saveLocalSnapshot(snapshot, session?.userId ?? null);
  }, [mode, ready, session, snapshot]);

  const userById = useCallback(
    (id: string) => snapshot.users.find((user) => user.id === id),
    [snapshot.users]
  );

  const followingIds = useCallback(
    (userId: string) => snapshot.following[userId] ?? [],
    [snapshot.following]
  );

  const followerIds = useCallback(
    (userId: string) => followersOf(userId, snapshot.following),
    [snapshot.following]
  );

  const currentUserId = session?.userId ?? null;
  const currentUser = currentUserId ? userById(currentUserId) ?? null : null;

  const isFollowing = useCallback(
    (userId: string) =>
      Boolean(currentUserId && (snapshot.following[currentUserId] ?? []).includes(userId)),
    [currentUserId, snapshot.following]
  );

  const requireUserId = useCallback(() => {
    const userId = session?.userId;
    if (!userId) {
      throw new Error("ログインが必要です。");
    }
    return userId;
  }, [session]);

  const follow = useCallback(
    async (userId: string) => {
      const me = requireUserId();
      if (userId === me) return;
      const previous = snapshot;
      setSnapshot(applyFollow(previous, me, userId, true));
      if (mode === "supabase") {
        try {
          await supabaseSetFollow(me, userId, true);
        } catch (error) {
          setSnapshot(previous);
          throw error;
        }
      }
    },
    [mode, requireUserId, snapshot]
  );

  const unfollow = useCallback(
    async (userId: string) => {
      const me = requireUserId();
      const previous = snapshot;
      setSnapshot(applyFollow(previous, me, userId, false));
      if (mode === "supabase") {
        try {
          await supabaseSetFollow(me, userId, false);
        } catch (error) {
          setSnapshot(previous);
          throw error;
        }
      }
    },
    [mode, requireUserId, snapshot]
  );

  const toggleFollow = useCallback(
    async (userId: string) => {
      if (isFollowing(userId)) await unfollow(userId);
      else await follow(userId);
    },
    [follow, isFollowing, unfollow]
  );

  const addToMyShelf = useCallback(
    async (item: ShelfItem) => {
      const me = requireUserId();
      const previous = snapshot;
      const next = applyShelfAdd(previous, me, item);
      setSnapshot(next.snapshot);
      if (mode === "supabase") {
        try {
          await supabaseAddShelfItem(me, item);
        } catch (error) {
          setSnapshot(previous);
          throw error;
        }
      }
    },
    [mode, requireUserId, snapshot]
  );

  const updateMyShelfItem = useCallback(
    async (item: ShelfItem) => {
      const me = requireUserId();
      const previous = snapshot;
      setSnapshot(applyShelfUpdate(previous, me, item));
      if (mode === "supabase") {
        try {
          await supabaseUpdateShelfItem(me, item);
        } catch (error) {
          setSnapshot(previous);
          throw error;
        }
      }
    },
    [mode, requireUserId, snapshot]
  );

  const removeMyShelfItem = useCallback(
    async (itemId: string) => {
      const me = requireUserId();
      const previous = snapshot;
      setSnapshot(applyShelfRemove(previous, me, itemId));
      if (mode === "supabase") {
        try {
          await supabaseDeleteShelfItem(me, itemId);
        } catch (error) {
          setSnapshot(previous);
          throw error;
        }
      }
    },
    [mode, requireUserId, snapshot]
  );

  const toggleLike = useCallback(
    async (postId: string) => {
      const me = requireUserId();
      const previous = snapshot;
      const liked = (previous.likes[postId] ?? []).includes(me);
      setSnapshot(applyLike(previous, postId, me));
      if (mode === "supabase") {
        try {
          await supabaseToggleLike(postId, me, liked);
        } catch (error) {
          setSnapshot(previous);
          throw error;
        }
      }
    },
    [mode, requireUserId, snapshot]
  );

  const likedByMe = useCallback(
    (postId: string) =>
      Boolean(currentUserId && (snapshot.likes[postId] ?? []).includes(currentUserId)),
    [currentUserId, snapshot.likes]
  );

  const addComment = useCallback(
    async (postId: string, text: string) => {
      const me = requireUserId();
      const trimmed = text.trim();
      if (!trimmed) return;
      const comment: PostComment = {
        id: `c-${Date.now()}`,
        userId: me,
        text: trimmed,
        createdAt: new Date().toISOString(),
      };
      const previous = snapshot;
      setSnapshot(applyComment(previous, postId, comment));
      if (mode === "supabase") {
        try {
          await supabaseAddComment(comment, postId);
        } catch (error) {
          setSnapshot(previous);
          throw error;
        }
      }
    },
    [mode, requireUserId, snapshot]
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (mode === "supabase") {
        const result = await supabaseSignIn(email, password);
        applyHydrate(result.session, result.snapshot);
        return;
      }
      const result = await localSignIn(email, password);
      applyHydrate(result.session, result.snapshot);
    },
    [applyHydrate, mode]
  );

  const signUp = useCallback(
    async (input: SignUpInput) => {
      if (mode === "supabase") {
        const result = await supabaseSignUp(input);
        applyHydrate(result.session, result.snapshot);
        return;
      }
      const result = await localSignUp(input);
      applyHydrate(result.session, result.snapshot);
    },
    [applyHydrate, mode]
  );

  const signOut = useCallback(async () => {
    if (mode === "supabase") {
      await supabaseSignOut();
      const result = await hydrateSupabase();
      applyHydrate(result.session, result.snapshot);
      return;
    }
    await localSignOut();
    const document = await loadLocalDocument();
    applyHydrate(sessionFromDocument(document), document.snapshot);
  }, [applyHydrate, mode]);

  const updateProfile = useCallback(
    async (patch: ProfilePatch) => {
      const me = requireUserId();
      const previous = snapshot;
      if (mode === "supabase") {
        const profile = await supabaseUpdateProfile(me, patch);
        setSnapshot({
          ...previous,
          users: previous.users.map((user) => (user.id === me ? profile : user)),
        });
        return;
      }
      const profile = await localUpdateProfile(me, patch);
      setSnapshot({
        ...previous,
        users: previous.users.map((user) => (user.id === me ? profile : user)),
      });
    },
    [mode, requireUserId, snapshot]
  );

  const uploadAvatar = useCallback(
    async (file: File) => {
      const me = requireUserId();
      if (mode === "supabase") {
        return supabaseUploadAvatar(me, file);
      }
      return fileToAvatarDataUrl(file);
    },
    [mode, requireUserId]
  );

  const feedPosts = useMemo(() => {
    const visible = currentUserId
      ? new Set([currentUserId, ...(snapshot.following[currentUserId] ?? [])])
      : null;
    return snapshot.posts
      .filter((post) => (visible ? visible.has(post.userId) : true))
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [currentUserId, snapshot.following, snapshot.posts]);

  const value = useMemo<SocialContextValue>(
    () => ({
      ready,
      hydrateError,
      mode,
      session,
      isAuthenticated: Boolean(session),
      currentUserId,
      currentUser,
      users: snapshot.users,
      shelves: snapshot.shelves,
      following: snapshot.following,
      posts: snapshot.posts,
      likes: snapshot.likes,
      comments: snapshot.comments,
      userById,
      isFollowing,
      follow,
      unfollow,
      toggleFollow,
      followingIds,
      followerIds,
      addToMyShelf,
      updateMyShelfItem,
      removeMyShelfItem,
      toggleLike,
      likedByMe,
      addComment,
      feedPosts,
      signIn,
      signUp,
      signOut,
      updateProfile,
      uploadAvatar,
    }),
    [
      addComment,
      addToMyShelf,
      currentUser,
      currentUserId,
      feedPosts,
      follow,
      followerIds,
      followingIds,
      hydrateError,
      isFollowing,
      likedByMe,
      mode,
      ready,
      removeMyShelfItem,
      session,
      signIn,
      signOut,
      signUp,
      snapshot.comments,
      snapshot.following,
      snapshot.likes,
      snapshot.posts,
      snapshot.shelves,
      snapshot.users,
      toggleFollow,
      toggleLike,
      unfollow,
      updateMyShelfItem,
      updateProfile,
      uploadAvatar,
      userById,
    ]
  );

  return (
    <SocialContext.Provider value={value}>{children}</SocialContext.Provider>
  );
}

export function useSocial() {
  const value = useContext(SocialContext);
  if (!value) {
    throw new Error("useSocial must be used within SocialProvider");
  }
  return value;
}
