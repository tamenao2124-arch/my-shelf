import { LOCAL_CATALOG } from "@/data/catalog-works";
import { SOURCE_LABEL, type MediaType, type SearchHit } from "@/lib/types";

export type ExploreTab = "all" | MediaType;

export function localCatalogHits(type?: MediaType): SearchHit[] {
  return LOCAL_CATALOG.filter((work) => !type || work.type === type).map(
    (work, index) => ({
      id: `local-${work.type}-${index}-${work.title}`,
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
      ebook:
        work.type === "book" && Boolean(work.providers?.includes("Kindle")),
      coverHint: work.wikiEn,
    }),
  );
}

export function partitionExploreSections(hits: SearchHit[]) {
  if (hits.length === 0) {
    return { trend: [], newArrival: [], recommended: [] } as const;
  }
  if (hits.length <= 4) {
    return { trend: hits, newArrival: [], recommended: [] } as const;
  }
  const size = Math.max(2, Math.ceil(hits.length / 3));
  return {
    trend: hits.slice(0, size),
    newArrival: hits.slice(size, size * 2),
    recommended: hits.slice(size * 2),
  } as const;
}

export function filterHitsByTab(hits: SearchHit[], tab: ExploreTab) {
  if (tab === "all") return hits;
  return hits.filter((hit) => hit.type === tab);
}
