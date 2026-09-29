/**
 * Server-only catalog API credentials.
 * Copy `.env.example` to `.env.local` (or `.env`) and fill the values.
 * NEXT_PUBLIC_ prefixes are accepted as a fallback if keys were set that way on Vercel.
 */
function readEnv(name: string) {
  const keys = [name, `NEXT_PUBLIC_${name}`];
  for (const key of keys) {
    const raw = process.env[key];
    if (!raw) continue;
    const value = raw.trim().replace(/^["']|["']$/g, "");
    if (value) return value;
  }
  return "";
}

export function getGoogleBooksApiKey() {
  return readEnv("GOOGLE_BOOKS_API_KEY");
}

export function hasGoogleBooksKey() {
  return Boolean(getGoogleBooksApiKey());
}

export type TmdbAuth = {
  token: string;
  apiKey: string;
};

export function getTmdbAuth(): TmdbAuth | null {
  let token = readEnv("TMDB_ACCESS_TOKEN");
  let apiKey = readEnv("TMDB_API_KEY");
  if (token.toLowerCase().startsWith("bearer ")) {
    token = token.slice(7).trim();
  }
  // A v3 API key pasted into ACCESS_TOKEN should still work.
  if (token && !token.includes(".") && token.length <= 48 && !apiKey) {
    apiKey = token;
    token = "";
  }
  if (!token && !apiKey) return null;
  return { token, apiKey };
}

export function hasTmdbCredentials() {
  return Boolean(getTmdbAuth());
}

export function getSpotifyCredentials() {
  const id = readEnv("SPOTIFY_CLIENT_ID");
  const secret = readEnv("SPOTIFY_CLIENT_SECRET");
  if (!id || !secret) return null;
  return { id, secret };
}

export function hasSpotifyCredentials() {
  return Boolean(getSpotifyCredentials());
}

export function catalogProviderStatus() {
  return {
    tmdb: hasTmdbCredentials(),
    googleBooks: hasGoogleBooksKey(),
    spotify: hasSpotifyCredentials(),
  };
}
