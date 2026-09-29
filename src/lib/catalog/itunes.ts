import { fetchJson, fetchJsonOrNull, yearFromDate } from "@/lib/catalog/http";
import { SOURCE_LABEL, type SearchHit } from "@/lib/types";

type ItunesResult = {
  wrapperType?: string;
  kind?: string;
  collectionId?: number;
  trackId?: number;
  collectionName?: string;
  trackName?: string;
  artistName?: string;
  artworkUrl100?: string;
  releaseDate?: string;
};

type ItunesSearch = { results?: ItunesResult[] };

function artwork(url?: string) {
  if (!url) return "";
  return url.replace(/\/\d+x\d+bb\./, "/600x600bb.");
}

export async function searchItunesMusic(query: string): Promise<SearchHit[]> {
  const params = new URLSearchParams({
    term: query,
    country: "jp",
    lang: "ja_jp",
    entity: "album",
    limit: "10",
  });
  const data = await fetchJson<ItunesSearch>(
    `https://itunes.apple.com/search?${params}`
  );
  const albums = (data.results ?? [])
    .filter((item) => item.collectionName && item.artistName)
    .map((item) => ({
      id: `itunes-album-${item.collectionId}`,
      type: "music" as const,
      title: item.collectionName ?? "",
      artist: item.artistName ?? "",
      album: item.collectionName ?? "",
      coverUrl: artwork(item.artworkUrl100),
      year: yearFromDate(item.releaseDate),
      source: "itunes" as const,
      sourceLabel: SOURCE_LABEL.itunes,
    }));

  if (albums.length >= 4) return albums;

  const songParams = new URLSearchParams({
    term: query,
    country: "jp",
    lang: "ja_jp",
    entity: "song",
    limit: "6",
  });
  const songs = await fetchJson<ItunesSearch>(
    `https://itunes.apple.com/search?${songParams}`
  );
  const tracks = (songs.results ?? [])
    .filter((item) => item.trackName && item.artistName)
    .map((item) => ({
      id: `itunes-song-${item.trackId}`,
      type: "music" as const,
      title: item.trackName ?? "",
      artist: item.artistName ?? "",
      album: item.collectionName || item.trackName || "",
      coverUrl: artwork(item.artworkUrl100),
      year: yearFromDate(item.releaseDate),
      source: "itunes" as const,
      sourceLabel: SOURCE_LABEL.itunes,
    }));

  return [...albums, ...tracks];
}

export async function searchItunesEbooks(query: string): Promise<SearchHit[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const params = new URLSearchParams({
    term: trimmed,
    country: "jp",
    lang: "ja_jp",
    entity: "ebook",
    limit: "12",
  });
  const data = await fetchJsonOrNull<ItunesSearch>(
    `https://itunes.apple.com/search?${params}`
  );
  return (data?.results ?? [])
    .filter((item) => item.trackName || item.collectionName)
    .map((item) => ({
      id: `itunes-ebook-${item.trackId ?? item.collectionId}`,
      type: "book" as const,
      title: item.trackName || item.collectionName || "",
      author: item.artistName || "著者不明",
      publisher: "Apple Books",
      coverUrl: artwork(item.artworkUrl100),
      year: yearFromDate(item.releaseDate),
      source: "itunes" as const,
      sourceLabel: "Apple Books",
      ebook: true,
    }));
}
