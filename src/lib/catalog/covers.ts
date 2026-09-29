import { fetchJsonOrNull } from "@/lib/catalog/http";

type WikiSearch = {
  search?: Array<{ id?: string; label?: string }>;
};

type WikiEntities = {
  entities?: Record<
    string,
    {
      sitelinks?: { enwiki?: { title?: string } };
      labels?: { en?: { value?: string } };
    }
  >;
};

type WikiPages = {
  query?: {
    normalized?: Array<{ from: string; to: string }>;
    redirects?: Array<{ from: string; to: string }>;
    pages?: Record<
      string,
      {
        title?: string;
        missing?: boolean;
        thumbnail?: { source?: string };
      }
    >;
  };
};

const posterCache = new Map<string, string>();
const titleCache = new Map<string, string>();

function cleanImageUrl(url: string) {
  return url.replace(/\?.*$/, "").replace(/\/\d+px-/, "/800px-");
}

function cacheKey(title: string) {
  return title.trim().toLowerCase();
}

function followTitle(input: string, data: WikiPages) {
  let title = input;
  for (const row of data.query?.normalized ?? []) {
    if (row.from === title) title = row.to;
  }
  for (const row of data.query?.redirects ?? []) {
    if (row.from === title) title = row.to;
  }
  return title;
}

async function englishWikiPosters(titles: string[]) {
  const found = new Map<string, string>();
  const pending: string[] = [];
  for (const title of titles) {
    const trimmed = title.trim();
    if (!trimmed) continue;
    const cached = posterCache.get(cacheKey(trimmed));
    if (cached !== undefined) {
      found.set(trimmed, cached);
    } else {
      pending.push(trimmed);
    }
  }

  for (let i = 0; i < pending.length; i += 50) {
    const chunk = pending.slice(i, i + 50);
    const params = new URLSearchParams({
      action: "query",
      titles: chunk.join("|"),
      redirects: "1",
      prop: "pageimages",
      piprop: "thumbnail",
      pithumbsize: "800",
      pilicense: "any",
      format: "json",
      origin: "*",
    });
    const data = await fetchJsonOrNull<WikiPages>(
      `https://en.wikipedia.org/w/api.php?${params}`
    );
    const pages = Object.values(data?.query?.pages ?? {});
    for (const title of chunk) {
      const canonical = followTitle(title, data ?? {});
      const page = pages.find((item) => item.title === canonical);
      const url = page?.missing ? "" : cleanImageUrl(page?.thumbnail?.source ?? "");
      posterCache.set(cacheKey(title), url);
      found.set(title, url);
    }
  }
  return found;
}

async function englishWikiPoster(title: string) {
  const posters = await englishWikiPosters([title]);
  return posters.get(title.trim()) ?? "";
}

async function englishTitleFromWikidata(title: string) {
  const cached = titleCache.get(title);
  if (cached !== undefined) return cached;

  const search = await fetchJsonOrNull<WikiSearch>(
    `https://www.wikidata.org/w/api.php?${new URLSearchParams({
      action: "wbsearchentities",
      search: title,
      language: "ja",
      uselang: "en",
      type: "item",
      limit: "1",
      format: "json",
      origin: "*",
    })}`
  );
  const entityId = search?.search?.[0]?.id;
  let english = search?.search?.[0]?.label ?? "";
  if (entityId) {
    const entities = await fetchJsonOrNull<WikiEntities>(
      `https://www.wikidata.org/w/api.php?${new URLSearchParams({
        action: "wbgetentities",
        ids: entityId,
        props: "sitelinks|labels",
        sitefilter: "enwiki",
        languages: "en",
        format: "json",
        origin: "*",
      })}`
    );
    const entity = entities?.entities?.[entityId];
    english =
      entity?.sitelinks?.enwiki?.title || entity?.labels?.en?.value || english;
  }
  titleCache.set(title, english);
  return english;
}

export async function moviePosterUrl(title: string, wikiEn?: string) {
  if (wikiEn) {
    const direct = await englishWikiPoster(wikiEn);
    if (direct) return direct;
  }
  const english = await englishTitleFromWikidata(title);
  if (english) {
    const fromWiki = await englishWikiPoster(english);
    if (fromWiki) return fromWiki;
  }
  return englishWikiPoster(title);
}

async function mapPool<T>(items: T[], concurrency: number, fn: (item: T) => Promise<void>) {
  let index = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (index < items.length) {
      const current = index;
      index += 1;
      await fn(items[current]);
    }
  });
  await Promise.all(workers);
}

export async function hydrateMovieCovers<T extends { title: string; coverUrl: string; coverHint?: string }>(
  hits: T[]
): Promise<T[]> {
  const missing = hits.filter((hit) => !hit.coverUrl);
  const hinted = missing.filter((hit) => hit.coverHint);
  const posters = await englishWikiPosters(hinted.map((hit) => hit.coverHint ?? ""));
  for (const hit of hinted) {
    const url = posters.get(hit.coverHint ?? "") ?? "";
    if (url) hit.coverUrl = url;
  }

  const leftover = missing.filter((hit) => !hit.coverUrl);
  await mapPool(leftover, 6, async (hit) => {
    const url = await moviePosterUrl(hit.title, hit.coverHint);
    if (url) hit.coverUrl = url;
  });
  return hits;
}
