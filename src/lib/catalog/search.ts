import { catalogTextMatches, normalizeCatalogText } from "@/lib/catalog/normalize";
import { searchAniListMovies } from "@/lib/catalog/anilist";
import { hydrateMovieCovers } from "@/lib/catalog/covers";
import { catalogProviderStatus } from "@/lib/catalog/env";
import { searchGoogleBooks } from "@/lib/catalog/google-books";
import { searchItunesEbooks, searchItunesMusic } from "@/lib/catalog/itunes";
import { movieOriginFilter, searchLocalCatalog } from "@/lib/catalog/local";
import { searchOpenLibrary } from "@/lib/catalog/open-library";
import {
  catalogService,
  serviceMatchesProviders,
  type CatalogServiceId,
} from "@/lib/catalog/services";
import { hasSpotifyCredentials, searchSpotifyMusic } from "@/lib/catalog/spotify";
import { hasTmdbCredentials, searchTmdbMovies } from "@/lib/catalog/tmdb";
import {
  searchWikipediaBooks,
  searchWikipediaMovies,
  searchWikipediaMoviesEn,
} from "@/lib/catalog/wikipedia";
import type { MediaType, SearchHit, SearchSource } from "@/lib/types";

export type CatalogProviderStatus = {
  tmdb: boolean;
  googleBooks: boolean;
  spotify: boolean;
};

export type CatalogSearchOptions = {
  service?: CatalogServiceId;
};

export type CatalogSearchResponse = {
  query: string;
  type: MediaType;
  service?: CatalogServiceId;
  results: SearchHit[];
  sources: SearchSource[];
  configured: CatalogProviderStatus;
  warnings: string[];
};

function settledHits(result: PromiseSettledResult<SearchHit[]>) {
  if (result.status === "fulfilled") return result.value;
  console.error(result.reason);
  return [] as SearchHit[];
}

function normalizeKey(hit: SearchHit) {
  const creator =
    hit.type === "music"
      ? hit.artist
      : hit.type === "book"
        ? hit.author
        : hit.director;
  return `${hit.type}:${hit.title}:${creator ?? ""}`
    .toLowerCase()
    .replace(/\s+/g, "");
}

function dedupeHits(hits: SearchHit[]) {
  const seen = new Set<string>();
  const unique: SearchHit[] = [];
  for (const hit of hits) {
    const key = hit.id || normalizeKey(hit);
    const fuzzy = normalizeKey(hit);
    if (seen.has(key) || seen.has(fuzzy)) continue;
    seen.add(key);
    seen.add(fuzzy);
    unique.push(hit);
  }
  return unique;
}

function rankHits(
  hits: SearchHit[],
  query: string,
  service?: CatalogServiceId
) {
  const q = normalizeCatalogText(query);
  const selected = catalogService(service);
  const sourceWeight: Partial<Record<SearchHit["source"], number>> = {
    tmdb: -4,
    local: -5,
    spotify: -3,
    itunes: -2,
    "google-books": -2,
    anilist: -1,
    wikipedia: 4,
  };
  const score = (hit: SearchHit) => {
    const title = normalizeCatalogText(hit.title);
    const creator = normalizeCatalogText(
      hit.artist ?? hit.author ?? hit.director ?? ""
    );
    let value = 24;
    if (q && title === q) value = 0;
    else if (q && creator === q) value = 8;
    else if (q && catalogTextMatches(hit.title, query)) value = 10;
    else if (q && creator.includes(q)) value = 12;
    if (!hit.coverUrl) value += 5;
    value += sourceWeight[hit.source] ?? 0;
    if (selected && serviceMatchesProviders(selected, hit.providers)) value -= 8;
    if (selected?.id === "kindle" && hit.ebook) value -= 8;
    return value;
  };
  return [...hits].sort((a, b) => score(a) - score(b));
}

async function searchMusic(query: string) {
  const jobs: Array<Promise<SearchHit[]>> = [];
  const sources: SearchSource[] = [];
  if (hasSpotifyCredentials()) {
    jobs.push(searchSpotifyMusic(query));
    sources.push("spotify");
  }
  jobs.push(searchItunesMusic(query));
  sources.push("itunes");
  return { jobs, sources };
}

function warningsFor(
  type: MediaType,
  service: CatalogServiceId | undefined,
  hits: SearchHit[]
): string[] {
  const configured = catalogProviderStatus();
  const selected = catalogService(service);
  const warnings: string[] = [];
  if (type === "movie" && !configured.tmdb) {
    warnings.push(
      selected
        ? `${selected.label} の配信カタログは TMDB キーがあるとより多く出ます。いまは内蔵カタログ、AniList、Wikipedia でも探しています。`
        : "TMDB キーがあるとポスターと配信情報が安定します。いまは内蔵の邦画・洋画カタログ、AniList、Wikipedia でも探しています。"
    );
  }
  if (type === "book" && !configured.googleBooks) {
    warnings.push(
      selected?.id === "kindle"
        ? "GOOGLE_BOOKS_API_KEY があると Kindle 向けの書誌が増えます。いまは Apple Books、Open Library、Wikipedia、内蔵カタログでも探しています。"
        : "GOOGLE_BOOKS_API_KEY があると表紙付きの書誌が安定します。いまは Apple Books、Open Library、Wikipedia、内蔵カタログでも探しています。"
    );
  }
  if (
    selected &&
    configured.tmdb &&
    type === "movie" &&
    hits.length > 0 &&
    !hits.some((hit) => serviceMatchesProviders(selected, hit.providers))
  ) {
    warnings.push(
      `TMDB 上では「${selected.label}」配信と確認できた候補が少なかったので、タイトル一致の作品も出しています。配信ラインナップは地域と時期で変わります。`
    );
  }
  return warnings;
}

async function searchBooks(query: string, service?: CatalogServiceId) {
  const ebook = service === "kindle";
  return {
    jobs: [
      searchLocalCatalog(query, "book", service),
      searchItunesEbooks(query).catch(() => [] as SearchHit[]),
      searchGoogleBooks(query, { ebook }).catch(() => [] as SearchHit[]),
      searchOpenLibrary(query, { ebook }).catch(() => [] as SearchHit[]),
      searchWikipediaBooks(query).catch(() => [] as SearchHit[]),
    ],
    sources: ["local", "itunes", "google-books", "openlibrary", "wikipedia"] as SearchSource[],
  };
}

async function searchMovies(query: string, service?: CatalogServiceId) {
  const origin = movieOriginFilter(query);
  const jobs: Array<Promise<SearchHit[]>> = [searchLocalCatalog(query, "movie", service)];
  const sources: SearchSource[] = ["local"];
  if (origin) return { jobs, sources };

  if (hasTmdbCredentials()) {
    jobs.push(
      searchTmdbMovies(query, { service, browse: !query.trim() && Boolean(service) }).catch(
        () => [] as SearchHit[]
      )
    );
    sources.push("tmdb");
  }
  if (query.trim()) {
    jobs.push(searchAniListMovies(query).catch(() => [] as SearchHit[]));
    sources.push("anilist");
    if (!/[\u3040-\u30ff\u4e00-\u9fff]/.test(query)) {
      jobs.push(searchWikipediaMoviesEn(query).catch(() => [] as SearchHit[]));
    }
  }
  jobs.push(searchWikipediaMovies(query, service).catch(() => [] as SearchHit[]));
  sources.push("wikipedia");
  return { jobs, sources };
}

export async function searchCatalog(
  query: string,
  type: MediaType,
  options: CatalogSearchOptions = {}
): Promise<CatalogSearchResponse> {
  const q = query.trim();
  const service = options.service;
  const configured = catalogProviderStatus();
  const browse = Boolean(service) && !q;

  if (!q && !browse) {
    return {
      query: q,
      type,
      service,
      results: [],
      sources: [],
      configured,
      warnings: [],
    };
  }

  if (type === "music" && !q) {
    return {
      query: q,
      type,
      service,
      results: [],
      sources: [],
      configured,
      warnings: [],
    };
  }

  const bundle =
    type === "music"
      ? await searchMusic(q)
      : type === "book"
        ? await searchBooks(q, service)
        : await searchMovies(q, service);

  const originQuery = type === "movie" ? movieOriginFilter(q) : null;
  const settled = await Promise.allSettled(bundle.jobs);
  let merged = rankHits(dedupeHits(settled.flatMap(settledHits)), q, service)
    .filter((hit) => hit.type === type)
    .slice(
      0,
      type === "movie"
        ? originQuery === "west"
          ? 120
          : originQuery
            ? 48
            : 36
        : 24
    );

  if (type === "movie") merged = await hydrateMovieCovers(merged);

  return {
    query: q,
    type,
    service,
    results: merged,
    sources: [...new Set(bundle.sources)],
    configured,
    warnings: warningsFor(type, service, merged),
  };
}
