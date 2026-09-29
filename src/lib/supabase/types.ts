export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type ProfileRow = {
  id: string;
  name: string;
  handle: string;
  bio: string;
  avatar_url: string | null;
  accent: string;
  created_at: string;
  updated_at: string;
};

type ShelfItemRow = {
  id: string;
  user_id: string;
  type: "music" | "book" | "movie";
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
  tags: string[];
  spoiler: boolean;
  experienced_at: string | null;
  experience_method: string;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: {
          id: string;
          name: string;
          handle: string;
          bio?: string;
          avatar_url?: string | null;
          accent?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          handle?: string;
          bio?: string;
          avatar_url?: string | null;
          accent?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      shelf_items: {
        Row: ShelfItemRow;
        Insert: Omit<ShelfItemRow, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ShelfItemRow, "id" | "user_id">>;
        Relationships: [
          {
            foreignKeyName: "shelf_items_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      follows: {
        Row: {
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      feed_posts: {
        Row: {
          id: string;
          user_id: string;
          item: Json;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          item: Json;
          created_at?: string;
        };
        Update: {
          item?: Json;
        };
        Relationships: [];
      };
      post_likes: {
        Row: {
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      post_comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id: string;
          post_id: string;
          user_id: string;
          body: string;
          created_at?: string;
        };
        Update: {
          body?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          item_id: string;
          user_id: string;
          rating: number;
          body: string;
          tags: string[];
          spoiler: boolean;
          experienced_at: string | null;
          experience_method: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          user_id: string;
          rating: number;
          body?: string;
          tags?: string[];
          spoiler?: boolean;
          experienced_at?: string | null;
          experience_method?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          rating?: number;
          body?: string;
          tags?: string[];
          spoiler?: boolean;
          experienced_at?: string | null;
          experience_method?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: true;
            referencedRelation: "shelf_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      tag_presets: {
        Row: {
          label: string;
          sort_order: number;
        };
        Insert: {
          label: string;
          sort_order: number;
        };
        Update: {
          sort_order?: number;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
