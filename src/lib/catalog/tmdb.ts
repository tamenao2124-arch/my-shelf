import { getTmdbAuth, hasTmdbCredentials } from "@/lib/catalog/env";
import { fetchJsonOrNull, yearFromDate } from "@/lib/catalog/http";
import {
  catalogService,
  labelForTmdbProviderId,
  type CatalogServiceId,
} from "@/lib/catalog/services";
import { SOURCE_LABEL, type SearchHit } from "@/lib/types";

export { hasTmdbCredentials };

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE = "https://image.tmdb.org/t/p/w500";
const WATCH_KEY = "watch/providers";

type TmdbSearch = {
  results?: TmdbListMovie[];
};

type TmdbListMovie = {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
};

type TmdbProvider = {
  provider_id: number;
  provider_name?: string;
};

type TmdbWatchCountry = {
  flatrate?: TmdbProvider[];
  ads?: TmdbProvider[];
  free?: TmdbProvider[];
  rent?: TmdbProvider[];
  buy?: TmdbProvider[];
};

type TmdbMovie = TmdbListMovie & {
  credits?: {
    crew?: Array<{ job?: string; name?: string; original_name?: string }>;
    created_by?: Array<{ name?: string }>;
  };
  created_by?: Array<{ name?: string }>;
  [WATCH_KEY]?: { results?: Record<string, TmdbWatchCountry> };
};

type TmdbSearchOptions = {
  service?: CatalogServiceId;
  browse?: boolean;
};

async function tmdbJson<T>(path: string, params: Record<string, string>) {
  const auth = getTmdbAuth();
  if (!auth) return null;
  const url = new URL(`${TMDB_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  const headers: HeadersInit = {};
  if (auth.token) {
    headers.Authorization = `Bearer ${auth.token}`;
  } else if (auth.apiKey) {
    url.searchParams.set("api_key", auth.apiKey);
  }
  return fetchJsonOrNull<T>(url.toString(), { headers });
}

function directorName(movie: TmdbMovie) {
  const director = movie.credits?.crew?.find((person) => person.job === "Director");
  return (
    director?.name ||
    director?.original_name ||
    movie.created_by?.[0]?.name ||
    movie.credits?.created_by?.[0]?.name ||
    "監督不明"
  );
}

function uniqueMovies(items: TmdbListMovie[]) {
  const seen = new Set<number>();
  const unique: TmdbListMovie[] = [];
  for (const item of items) {
    if (!item?.id || seen.has(item.id)) continue;
    if (!item.title && !item.original_title && !item.name && !item.original_name) continue;
    seen.add(item.id);
    unique.push(item);
  }
  return unique;
}

function jpProviders(movie: TmdbMovie) {
  const country = movie[WATCH_KEY]?.results?.JP;
  const rows = [
    ...(country?.flatrate ?? []),
    ...(country?.ads ?? []),
    ...(country?.free ?? []),
    ...(country?.rent ?? []),
    ...(country?.buy ?? []),
  ];
  const labels: string[] = [];
  for (const row of rows) {
    const label = labelForTmdbProviderId(row.provider_id, row.provider_name ?? "");
    if (!label || labels.includes(label)) continue;
    labels.push(label);
  }
  return labels.slice(0, 4);
}

function toHits(movies: TmdbMovie[], kind: "movie" | "tv" = "movie"): SearchHit[] {
  return movies.map((movie) => {
    const poster = movie.poster_path;
    const providers = jpProviders(movie);
    return {
      id: `tmdb-${kind}-${movie.id}`,
      type: "movie" as const,
      title:
        movie.title ||
        movie.name ||
        movie.original_title ||
        movie.original_name ||
        "",
      director: directorName(movie),
      coverUrl: poster ? `${TMDB_IMAGE}${poster}` : "",
      year: yearFromDate(movie.release_date) ?? yearFromDate(movie.first_air_date),
      source: "tmdb" as const,
      sourceLabel: SOURCE_LABEL.tmdb,
      providers,
    };
  });
}

async function hydrateMovies(items: TmdbListMovie[]) {
  const details = await Promise.all(
    items.map(async (item) => {
      const movie = await tmdbJson<TmdbMovie>(`/movie/${item.id}`, {
        language: "ja-JP",
        append_to_response: "credits,watch/providers",
      });
      return (movie ?? item) as TmdbMovie;
    })
  );
  return toHits(details, "movie");
}

async function hydrateShows(items: TmdbListMovie[]) {
  const details = await Promise.all(
    items.map(async (item) => {
      const show = await tmdbJson<TmdbMovie>(`/tv/${item.id}`, {
        language: "ja-JP",
        append_to_response: "credits,watch/providers",
      });
      return (show ?? item) as TmdbMovie;
    })
  );
  return toHits(details, "tv");
}

async function searchByTitle(query: string) {
  const pages: TmdbListMovie[] = [];
  const ja = await tmdbJson<TmdbSearch>("/search/movie", {
    query,
    language: "ja-JP",
    include_adult: "false",
    region: "JP",
  });
  pages.push(...(ja?.results ?? []));

  if (pages.length < 8) {
    const open = await tmdbJson<TmdbSearch>("/search/movie", {
      query,
      language: "ja-JP",
      include_adult: "false",
    });
    pages.push(...(open?.results ?? []));
  }

  if (uniqueMovies(pages).length < 5) {
    const en = await tmdbJson<TmdbSearch>("/search/movie", {
      query,
      language: "en-US",
      include_adult: "false",
    });
    pages.push(...(en?.results ?? []));
  }

  return uniqueMovies(pages).slice(0, 12);
}

async function searchTvByTitle(query: string) {
  const data = await tmdbJson<TmdbSearch>("/search/tv", {
    query,
    language: "ja-JP",
    include_adult: "false",
  });
  return uniqueMovies(data?.results ?? []).slice(0, 8);
}

async function discoverOnService(serviceId: CatalogServiceId) {
  const service = catalogService(serviceId);
  if (!service?.tmdbProviderIds.length) return { movies: [] as TmdbListMovie[], shows: [] as TmdbListMovie[] };
  const shared = {
    language: "ja-JP",
    watch_region: "JP",
    with_watch_providers: service.tmdbProviderIds.join("|"),
    with_watch_monetization_types: "flatrate",
    sort_by: "popularity.desc",
    include_adult: "false",
  };
  const [movies, shows] = await Promise.all([
    tmdbJson<TmdbSearch>("/discover/movie", { ...shared, region: "JP" }),
    tmdbJson<TmdbSearch>("/discover/tv", shared),
  ]);
  return {
    movies: uniqueMovies(movies?.results ?? []).slice(0, 12),
    shows: uniqueMovies(shows?.results ?? []).slice(0, 8),
  };
}

function sortByService(hits: SearchHit[], serviceId?: CatalogServiceId) {
  const service = catalogService(serviceId);
  if (!service) return hits;
  return [...hits].sort((a, b) => {
    const aHit = a.providers?.includes(service.label) ? 0 : 1;
    const bHit = b.providers?.includes(service.label) ? 0 : 1;
    return aHit - bHit;
  });
}

export async function searchTmdbMovies(
  query: string,
  options: TmdbSearchOptions = {}
): Promise<SearchHit[]> {
  if (!hasTmdbCredentials()) return [];

  const trimmed = query.trim();
  const browse = options.browse || (!trimmed && Boolean(options.service));
  if (browse && options.service) {
    const discovered = await discoverOnService(options.service);
    const hits = [
      ...(await hydrateMovies(discovered.movies)),
      ...(await hydrateShows(discovered.shows)),
    ];
    return sortByService(hits, options.service);
  }
  if (!trimmed) return [];
  const [movies, shows] = await Promise.all([
    searchByTitle(trimmed),
    searchTvByTitle(trimmed),
  ]);
  const hits = [
    ...(await hydrateMovies(movies)),
    ...(await hydrateShows(shows)),
  ];
  return sortByService(hits, options.service);
}
