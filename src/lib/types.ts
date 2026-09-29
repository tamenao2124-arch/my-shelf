export type MediaType = "book" | "music" | "movie";

export type SearchSource =
  | "itunes"
  | "spotify"
  | "openlibrary"
  | "wikipedia"
  | "google-books"
  | "tmdb"
  | "anilist"
  | "local";

type ShelfItemBase = {
  id: string;
  title: string;
  rating: number;
  comment: string;
  coverUrl: string;
  year?: number;
  tags?: string[];
  spoiler?: boolean;
  experiencedAt?: string;
  experienceMethod?: string;
  addedAt?: string;
};

export type MusicItem = ShelfItemBase & {
  type: "music";
  artist: string;
  album: string;
};

export type BookItem = ShelfItemBase & {
  type: "book";
  author: string;
  publisher: string;
};

export type MovieItem = ShelfItemBase & {
  type: "movie";
  director: string;
};

export type ShelfItem = MusicItem | BookItem | MovieItem;

export type SearchHit = {
  id: string;
  type: MediaType;
  title: string;
  coverUrl: string;
  year?: number;
  source: SearchSource;
  sourceLabel: string;
  artist?: string;
  album?: string;
  author?: string;
  publisher?: string;
  director?: string;
  providers?: string[];
  ebook?: boolean;
  coverHint?: string;
};

export const MEDIA_TYPES: MediaType[] = ["book", "music", "movie"];

export const MEDIA_LABEL: Record<MediaType, string> = {
  music: "音楽",
  book: "本",
  movie: "映画",
};

export const MEDIA_EMOJI: Record<MediaType, string> = {
  music: "🎵",
  book: "📚",
  movie: "🎬",
};

export const MEDIA_OPTION_LABEL: Record<MediaType, string> = {
  book: "本 📚",
  music: "音楽 🎵",
  movie: "映画 🎬",
};

export const SOURCE_LABEL: Record<SearchSource, string> = {
  itunes: "Apple Music",
  spotify: "Spotify",
  openlibrary: "Open Library",
  wikipedia: "Wikipedia",
  "google-books": "Google Books",
  tmdb: "TMDB",
  anilist: "AniList",
  local: "カタログ",
};

export function isMediaType(value: string): value is MediaType {
  return MEDIA_TYPES.includes(value as MediaType);
}

export function mediaCreator(item: Pick<SearchHit, "type" | "artist" | "author" | "director">) {
  if (item.type === "music") return item.artist ?? "";
  if (item.type === "book") return item.author ?? "";
  return item.director ?? "";
}

export function searchableText(item: ShelfItem) {
  const shared = [
    item.title,
    item.comment,
    String(item.year ?? ""),
    ...(item.tags ?? []),
  ];
  if (item.type === "music") return [...shared, item.artist, item.album].join(" ");
  if (item.type === "book") return [...shared, item.author, item.publisher].join(" ");
  return [...shared, item.director].join(" ");
}

export function identityKey(item: {
  type: MediaType;
  title: string;
  artist?: string;
  author?: string;
  director?: string;
}) {
  return `${item.type}:${item.title}:${mediaCreator(item)}`.toLowerCase();
}

export function searchHitToShelfItem(
  hit: SearchHit,
  extras: {
    rating: number;
    comment: string;
    tags?: string[];
    spoiler?: boolean;
    experiencedAt?: string;
    experienceMethod?: string;
  }
): ShelfItem {
  const now = new Date().toISOString();
  const base = {
    id: `${hit.id}-${Date.now()}`,
    title: hit.title,
    rating: extras.rating,
    comment: extras.comment,
    coverUrl: hit.coverUrl,
    year: hit.year,
    tags: extras.tags ?? [],
    spoiler: extras.spoiler ?? false,
    experiencedAt: extras.experiencedAt,
    experienceMethod: extras.experienceMethod,
    addedAt: now,
  };

  if (hit.type === "music") {
    return {
      ...base,
      type: "music",
      artist: hit.artist || "アーティスト不明",
      album: hit.album || hit.title,
    };
  }

  if (hit.type === "book") {
    return {
      ...base,
      type: "book",
      author: hit.author || "著者不明",
      publisher: hit.publisher || "出版社不明",
    };
  }

  return {
    ...base,
    type: "movie",
    director: hit.director || "監督不明",
  };
}
