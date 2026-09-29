import type { FeedPost, PostComment, UserProfile } from "@/lib/social";
import type { ShelfItem } from "@/lib/types";

export type AuthSession = {
  userId: string;
  email: string;
};

export type SocialSnapshot = {
  users: UserProfile[];
  shelves: Record<string, ShelfItem[]>;
  following: Record<string, string[]>;
  posts: FeedPost[];
  likes: Record<string, string[]>;
  comments: Record<string, PostComment[]>;
};

export type SignUpInput = {
  email: string;
  password: string;
  name: string;
  handle: string;
  bio?: string;
};

export type ProfilePatch = {
  name: string;
  handle: string;
  bio: string;
  avatarUrl?: string | null;
};

export type PersistenceMode = "local" | "supabase";
