import { fetchText, yearFromDate } from "@/lib/catalog/http";
import { catalogTextMatches, normalizeCatalogText } from "@/lib/catalog/normalize";
import { SOURCE_LABEL, type SearchHit } from "@/lib/types";

const NOW_SHOWING_QUERIES = new Set(
  [
    "公開中",
    "上映中",
    "上映中の映画",
    "公開中の映画",
    "劇場公開",
    "劇場公開中",
    "映画館",
    "いま上映",
    "今上映",
    "nowplaying",
    "now showing",
  ].map(normalizeCatalogText)
);

const CACHE_MS = 30 * 60 * 1000;
const PAGE_COUNT = 8;
const THEATER_PROVIDER = "公開中";

type EigaMovie = {
  id: string;
  title: string;
  director: string;
  coverUrl: string;
  year?: number;
};

let cache: { at: number; movies: EigaMovie[] } | null = null;

export function isNowShowingQuery(query: string) {
  const n = normalizeCatalogText(query);
  return Boolean(n) && NOW_SHOWING_QUERIES.has(n);
}

function decodeEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function parseYear(timeLabel: string) {
  return yearFromDate(timeLabel) ?? new Date().getFullYear();
}

function parsePage(html: string): EigaMovie[] {
  const movies: EigaMovie[] = [];
  const chunks = html.split(/<div id="mv/);
  for (const chunk of chunks.slice(1)) {
    const idMatch = chunk.match(/^(\d+)"/);
    if (!idMatch) continue;
    const id = idMatch[1];
    const titleMatch = chunk.match(
      /<h2 class="title"><a href="\/movie\/\d+\/">([^<]+)<\/a><\/h2>/
    );
    if (!titleMatch) continue;
    const imgMatch = chunk.match(
      /src="(https:\/\/media\.eiga\.com\/images\/movie\/[^"]+)"/
    );
    const directorMatch = chunk.match(/<span>([^<]+)<\/span>\s*監督/);
    const timeMatch = chunk.match(/<small class="time">([^<]+)<\/small>/);
    movies.push({
      id,
      title: decodeEntities(titleMatch[1]),
      director: directorMatch ? decodeEntities(directorMatch[1]) : "監督不明",
      coverUrl: imgMatch?.[1] ?? "",
      year: parseYear(timeMatch?.[1] ?? ""),
    });
  }
  return movies;
}

async function fetchEigaNowShowing(): Promise<EigaMovie[]> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.movies;

  const htmls = await Promise.all(
    Array.from({ length: PAGE_COUNT }, (_, index) => {
      const page = index + 1;
      const url =
        page === 1
          ? "https://eiga.com/now/"
          : `https://eiga.com/now/all/release/${page}/`;
      return fetchText(url);
    })
  );

  const seen = new Set<string>();
  const movies: EigaMovie[] = [];
  for (const html of htmls) {
    if (!html) continue;
    for (const movie of parsePage(html)) {
      if (seen.has(movie.id) || !movie.title) continue;
      seen.add(movie.id);
      movies.push(movie);
    }
  }

  if (movies.length) {
    cache = { at: Date.now(), movies };
  }
  return movies;
}

function toHit(movie: EigaMovie): SearchHit {
  return {
    id: `eiga-${movie.id}`,
    type: "movie",
    title: movie.title,
    director: movie.director,
    coverUrl: movie.coverUrl,
    year: movie.year,
    source: "eiga",
    sourceLabel: SOURCE_LABEL.eiga,
    providers: [THEATER_PROVIDER],
  };
}

export function filterNowShowingHits(hits: SearchHit[], query: string) {
  const q = query.trim();
  if (!q || isNowShowingQuery(q)) return hits;
  return hits.filter(
    (hit) =>
      catalogTextMatches(hit.title, q) ||
      catalogTextMatches(hit.director ?? "", q)
  );
}

export async function searchNowShowing(query: string): Promise<SearchHit[]> {
  const movies = await fetchEigaNowShowing();
  return filterNowShowingHits(movies.map(toHit), query);
}
