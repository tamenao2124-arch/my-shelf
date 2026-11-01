const ALLOWED_POSTER_HOSTS = new Set([
  "upload.wikimedia.org",
  "image.tmdb.org",
  "books.google.com",
  "covers.openlibrary.org",
  "images.unsplash.com",
  "m.media-amazon.com",
  "i.scdn.co",
]);

/** Same-origin proxy so posters load in iOS WebView / TestFlight. */
export function displayCoverUrl(url: string | undefined | null): string {
  const trimmed = url?.trim() ?? "";
  if (!trimmed) return "";
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") return trimmed;
    const host = parsed.hostname;
    const allowed =
      ALLOWED_POSTER_HOSTS.has(host) || host.endsWith(".mzstatic.com");
    if (!allowed) return trimmed;
    return `/api/poster?url=${encodeURIComponent(trimmed)}`;
  } catch {
    return trimmed;
  }
}

export function isAllowedPosterUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    return (
      parsed.protocol === "https:" &&
      (ALLOWED_POSTER_HOSTS.has(host) || host.endsWith(".mzstatic.com"))
    );
  } catch {
    return false;
  }
}
