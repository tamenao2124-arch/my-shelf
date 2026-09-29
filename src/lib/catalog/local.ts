import { LOCAL_CATALOG } from "@/data/catalog-works";
import { catalogTextMatches, normalizeCatalogText } from "@/lib/catalog/normalize";
import { catalogService, type CatalogServiceId } from "@/lib/catalog/services";
import { SOURCE_LABEL, type MediaType, type SearchHit } from "@/lib/types";

const MOVIE_ORIGIN_QUERY: Record<string, "jp" | "west" | "all"> = {
  邦画: "jp",
  日本映画: "jp",
  邦画映画: "jp",
  洋画: "west",
  海外映画: "west",
  映画: "all",
};

export function movieOriginFilter(query: string): "jp" | "west" | "all" | null {
  return MOVIE_ORIGIN_QUERY[normalizeCatalogText(query)] ?? null;
}

function mixWestBrowse<T>(works: T[]) {
  const head = works.slice(0, 36);
  const rest = works.slice(36);
  const need = 84;
  if (rest.length <= need) return [...head, ...rest];
  const step = Math.max(1, Math.floor(rest.length / need));
  const sampled: T[] = [];
  for (let i = 0; i < rest.length && sampled.length < need; i += step) {
    sampled.push(rest[i]);
  }
  return [...head, ...sampled];
}

function mixOrigins<T extends { origin?: "jp" | "west" }>(works: T[]) {
  const jp = works.filter((work) => work.origin === "jp");
  const west = works.filter((work) => work.origin === "west");
  const other = works.filter((work) => work.origin !== "jp" && work.origin !== "west");
  const mixed: T[] = [];
  const max = Math.max(jp.length, west.length);
  for (let i = 0; i < max; i++) {
    if (west[i]) mixed.push(west[i]);
    if (jp[i]) mixed.push(jp[i]);
  }
  return [...mixed, ...other];
}

export async function searchLocalCatalog(
  query: string,
  type: MediaType,
  service?: CatalogServiceId
): Promise<SearchHit[]> {
  const q = query.trim();
  const selected = catalogService(service);
  const origin = type === "movie" ? movieOriginFilter(q) : null;
  const typed = LOCAL_CATALOG.filter((work) => work.type === type);

  const pool = typed.filter((work) => {
    if (origin) {
      if (origin === "all") return true;
      return work.origin === origin;
    }
    if (q) {
      const fields = [
        work.title,
        ...(work.aliases ?? []),
        work.wikiEn,
        work.director,
        work.author,
        work.artist,
      ];
      return fields.some((field) => field && catalogTextMatches(field, q));
    }
    if (selected) return Boolean(work.providers?.includes(selected.label));
    return false;
  });

  const ordered =
    origin === "all"
      ? mixOrigins(pool)
      : origin === "west"
        ? mixWestBrowse(pool)
        : pool;
  const limit =
    origin === "west" ? 120 : origin ? 48 : type === "movie" ? 24 : 16;
  const hits: SearchHit[] = ordered.slice(0, limit).map((work) => ({
    id: `local-${work.type}-${work.title}`,
    type: work.type,
    title: work.title,
    director: work.director,
    author: work.author,
    artist: work.artist,
    album: work.album,
    publisher: work.publisher,
    coverUrl: "",
    year: work.year,
    source: "local" as const,
    sourceLabel: SOURCE_LABEL.local,
    providers: work.providers,
    ebook: work.type === "book" && Boolean(work.providers?.includes("Kindle")),
    coverHint: work.wikiEn,
  }));
  return hits;
}
