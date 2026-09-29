import { getSpotifyCredentials } from "@/lib/catalog/env";
import { fetchJson, yearFromDate } from "@/lib/catalog/http";
import { SOURCE_LABEL, type SearchHit } from "@/lib/types";

export { hasSpotifyCredentials } from "@/lib/catalog/env";

type SpotifyToken = { access_token?: string; expires_in?: number };
type SpotifyImage = { url?: string };
type SpotifyArtist = { name?: string };
type SpotifyAlbum = {
  id: string;
  name?: string;
  artists?: SpotifyArtist[];
  images?: SpotifyImage[];
  release_date?: string;
};
type SpotifyTrack = {
  id: string;
  name?: string;
  artists?: SpotifyArtist[];
  album?: SpotifyAlbum;
};
type SpotifySearch = {
  albums?: { items?: SpotifyAlbum[] };
  tracks?: { items?: SpotifyTrack[] };
};

let cachedToken: { value: string; expiresAt: number } | null = null;

async function accessToken() {
  const creds = getSpotifyCredentials();
  if (!creds) return null;
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.value;
  }

  const body = new URLSearchParams({ grant_type: "client_credentials" });
  const data = await fetchJson<SpotifyToken>(
    "https://accounts.spotify.com/api/token",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${creds.id}:${creds.secret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    }
  );
  if (!data.access_token) return null;
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return cachedToken.value;
}

function cover(images?: SpotifyImage[]) {
  return images?.[0]?.url ?? images?.[1]?.url ?? "";
}

export async function searchSpotifyMusic(query: string): Promise<SearchHit[]> {
  const token = await accessToken();
  if (!token) return [];

  const params = new URLSearchParams({
    q: query,
    type: "album,track",
    market: "JP",
    limit: "8",
  });
  const data = await fetchJson<SpotifySearch>(
    `https://api.spotify.com/v1/search?${params}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const albums = (data.albums?.items ?? [])
    .filter((item) => item.name)
    .map((item) => ({
      id: `spotify-album-${item.id}`,
      type: "music" as const,
      title: item.name ?? "",
      artist: item.artists?.map((artist) => artist.name).filter(Boolean).join("、") || "アーティスト不明",
      album: item.name ?? "",
      coverUrl: cover(item.images),
      year: yearFromDate(item.release_date),
      source: "spotify" as const,
      sourceLabel: SOURCE_LABEL.spotify,
    }));

  const tracks = (data.tracks?.items ?? [])
    .filter((item) => item.name)
    .map((item) => ({
      id: `spotify-track-${item.id}`,
      type: "music" as const,
      title: item.name ?? "",
      artist: item.artists?.map((artist) => artist.name).filter(Boolean).join("、") || "アーティスト不明",
      album: item.album?.name || item.name || "",
      coverUrl: cover(item.album?.images),
      year: yearFromDate(item.album?.release_date),
      source: "spotify" as const,
      sourceLabel: SOURCE_LABEL.spotify,
    }));

  return [...albums, ...tracks];
}
