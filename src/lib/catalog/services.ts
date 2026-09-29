import type { MediaType, SearchHit } from "@/lib/types";

export type CatalogServiceId = "netflix" | "prime" | "unext" | "kindle";

export type CatalogService = {
  id: CatalogServiceId;
  label: string;
  media: MediaType;
  tmdbProviderIds: number[];
  wikiHint: string;
  experienceMethod: string;
};

export const CATALOG_SERVICES: CatalogService[] = [
  {
    id: "netflix",
    label: "Netflix",
    media: "movie",
    tmdbProviderIds: [8],
    wikiHint: "Netflix",
    experienceMethod: "netflix",
  },
  {
    id: "prime",
    label: "Prime Video",
    media: "movie",
    tmdbProviderIds: [9, 10, 119],
    wikiHint: "Amazonプライム",
    experienceMethod: "prime",
  },
  {
    id: "unext",
    label: "U-NEXT",
    media: "movie",
    tmdbProviderIds: [84],
    wikiHint: "U-NEXT",
    experienceMethod: "unext",
  },
  {
    id: "kindle",
    label: "Kindle",
    media: "book",
    tmdbProviderIds: [],
    wikiHint: "",
    experienceMethod: "kindle",
  },
];

const BY_ID = new Map(CATALOG_SERVICES.map((service) => [service.id, service]));

export function servicesForMedia(type: MediaType) {
  return CATALOG_SERVICES.filter((service) => service.media === type);
}

export function catalogService(id?: string | null) {
  if (!id) return undefined;
  return BY_ID.get(id as CatalogServiceId);
}

export function parseCatalogService(value?: string | null): CatalogServiceId | undefined {
  if (!value || value === "all") return undefined;
  return BY_ID.has(value as CatalogServiceId)
    ? (value as CatalogServiceId)
    : undefined;
}

export function isCatalogServiceId(value: string): value is CatalogServiceId {
  return BY_ID.has(value as CatalogServiceId);
}

/** TMDB / JustWatch の provider_id を Artly の表示名に揃える */
export function labelForTmdbProviderId(id: number, fallback = "") {
  for (const service of CATALOG_SERVICES) {
    if (service.tmdbProviderIds.includes(id)) return service.label;
  }
  return fallback;
}

export function serviceMatchesProviders(
  service: CatalogService | undefined,
  providerLabels: string[] | undefined
) {
  if (!service) return false;
  return (providerLabels ?? []).includes(service.label);
}

export function experienceMethodFromHit(hit: SearchHit) {
  if (hit.type === "book" && (hit.ebook || hit.providers?.includes("Kindle"))) {
    return "kindle";
  }
  const providers = hit.providers ?? [];
  for (const service of CATALOG_SERVICES) {
    if (service.media !== hit.type) continue;
    if (providers.includes(service.label)) return service.experienceMethod;
  }
  return "";
}
