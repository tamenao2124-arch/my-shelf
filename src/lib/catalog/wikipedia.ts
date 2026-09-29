import { fetchJsonOrNull, yearFromDate } from "@/lib/catalog/http";
import { catalogTextMatches } from "@/lib/catalog/normalize";
import { catalogService, type CatalogServiceId } from "@/lib/catalog/services";
import { SOURCE_LABEL, type SearchHit } from "@/lib/types";

type WikiPage = {
  pageid: number;
  title: string;
  index?: number;
  extract?: string;
  thumbnail?: { source?: string };
  terms?: { description?: string[] };
};

type WikiQuery = { query?: { pages?: Record<string, WikiPage> } };

const GENERIC_TITLE_RE =
  /映画祭|国際映画祭|アカデミー賞|金熊賞|金獅子|^映画$|^日本映画$|^アニメーション映画$|の映画$|^小説$|^文学$/;
const PERSON_RE =
  /女優|俳優|制作会社|お笑いタレント|小説家|声優|映画製作者|映画監督|脚本家|一覧記事|ウィキメディア/;
const SERVICE_PAGE_RE =
  /^(Netflix|Amazon|U-NEXT)|ストリーミングサービス|動画配信|配信サービス/;
const BOOK_DESC_RE = /小説|書籍|著作|文庫|エッセイ|新書|作品集|ノンフィクション/;
const WORK_DESC_RE =
  /映画|アニメ|ドラマ|漫画|劇場版|テレビ番組/;

function description(page: WikiPage) {
  return page.terms?.description?.[0] ?? "";
}

function parseDirector(extract?: string) {
  if (!extract) return undefined;
  const cleaned = extract.replace(
    /作画監督|美術監督|音響監督|撮影監督|演出監督/g,
    ""
  );
  const match = cleaned.match(
    /監督(?:・脚本)?[はのは：:\s]*([^\s。、（(]{1,20}?)(?:[。、\n・]|脚本|$)/
  );
  const name = match?.[1]?.replace(/[（(].*$/, "").trim();
  if (!name || name.length > 16 || /映画|作品|アニメ/.test(name)) return undefined;
  return name;
}

function parseAuthor(desc: string, extract?: string) {
  const fromDesc = desc.match(/^(.+?)の(?:小説|書籍|著作|エッセイ)/);
  if (fromDesc?.[1] && fromDesc[1].length <= 20) return fromDesc[1];
  const fromExtract = extract?.match(
    /(?:著|作者|書いた)[はのは：:\s]*([^\s。、（(]{1,20})/
  );
  return fromExtract?.[1] || "著者不明";
}

async function queryPages(search: string, lang: "ja" | "en" = "ja") {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: search,
    gsrlimit: lang === "en" ? "10" : "12",
    prop: "pageimages|pageterms|extracts",
    exintro: "1",
    explaintext: "1",
    exchars: "220",
    pithumbsize: lang === "en" ? "800" : "400",
    wbptterms: "description",
    format: "json",
    origin: "*",
  });
  if (lang === "en") params.set("pilicense", "any");
  const host = lang === "en" ? "en.wikipedia.org" : "ja.wikipedia.org";
  const data = await fetchJsonOrNull<WikiQuery>(
    `https://${host}/w/api.php?${params}`
  );
  return Object.values(data?.query?.pages ?? {}).sort(
    (a, b) => (a.index ?? 99) - (b.index ?? 99)
  );
}

function skipped(page: WikiPage) {
  const desc = description(page);
  if (GENERIC_TITLE_RE.test(page.title)) return true;
  if (SERVICE_PAGE_RE.test(page.title) || SERVICE_PAGE_RE.test(desc)) return true;
  return false;
}

function toMovieHit(page: WikiPage, providerLabel?: string): SearchHit {
  const desc = description(page);
  return {
    id: `wiki-${page.pageid}`,
    type: "movie",
    title: page.title.replace(/（映画）|\(映画\)/g, "").trim(),
    director:
      parseDirector(page.extract) ||
      desc.replace(/\s*\(\d{4}\)\s*$/, "") ||
      "監督不明",
    coverUrl: page.thumbnail?.source ?? "",
    year: yearFromDate(desc) ?? yearFromDate(page.extract),
    source: "wikipedia",
    sourceLabel: SOURCE_LABEL.wikipedia,
    providers: providerLabel ? [providerLabel] : undefined,
  };
}

function toBookHit(page: WikiPage): SearchHit {
  const desc = description(page);
  return {
    id: `wiki-book-${page.pageid}`,
    type: "book",
    title: page.title.replace(/（小説）|\(小説\)|（書籍）/g, "").trim(),
    author: parseAuthor(desc, page.extract),
    publisher: "出版社不明",
    coverUrl: page.thumbnail?.source ?? "",
    year: yearFromDate(desc) ?? yearFromDate(page.extract),
    source: "wikipedia",
    sourceLabel: SOURCE_LABEL.wikipedia,
  };
}

function keepMovie(page: WikiPage, query: string) {
  if (skipped(page)) return false;
  const desc = description(page);
  const blob = `${page.title} ${desc} ${page.extract ?? ""}`;
  if (PERSON_RE.test(desc) && !/（映画）|\(映画\)/.test(page.title)) return false;
  if (/サウンドトラック|アルバム|交響楽/.test(blob)) return false;
  if (/[（(][^）)]+[）)]/.test(page.title) && !/（映画）|\(映画\)|（アニメ）/.test(page.title)) {
    if (!/映画作品|劇場アニメ|アニメーション映画|\d{4}年.{0,24}映画/.test(desc)) return false;
  }
  if (query && catalogTextMatches(page.title, query)) {
    return WORK_DESC_RE.test(blob);
  }
  if (desc) return /映画作品|劇場アニメ|アニメーション映画|\d{4}年.{0,24}映画/.test(desc);
  return /（映画）|\(映画\)/.test(page.title);
}

function keepBook(page: WikiPage, query: string) {
  if (skipped(page)) return false;
  const desc = description(page);
  if (/小説家|タレント|出版社|漫画家/.test(desc) && !catalogTextMatches(page.title, query)) {
    return false;
  }
  if (query && catalogTextMatches(page.title, query)) {
    return BOOK_DESC_RE.test(desc) || BOOK_DESC_RE.test(page.title) || /（小説）|（書籍）/.test(page.title);
  }
  return BOOK_DESC_RE.test(desc);
}

export async function searchWikipediaMovies(
  query: string,
  service?: CatalogServiceId
): Promise<SearchHit[]> {
  const hint = catalogService(service)?.wikiHint ?? "";
  const label = catalogService(service)?.label;
  const trimmed = query.trim();
  const searches = trimmed
    ? [`${trimmed} 映画`, trimmed]
    : [[hint, "映画"].filter(Boolean).join(" ")];

  const pages = (
    await Promise.all(searches.map((term) => queryPages(term)))
  ).flat();
  const seen = new Set<number>();
  const unique = pages.filter((page) => {
    if (seen.has(page.pageid)) return false;
    seen.add(page.pageid);
    return true;
  });

  return unique
    .filter((page) => keepMovie(page, trimmed))
    .slice(0, 12)
    .map((page) => toMovieHit(page, trimmed ? undefined : label));
}

function keepEnMovie(page: WikiPage) {
  const title = page.title;
  const desc = description(page);
  if (/^List of /i.test(title)) return false;
  if (/\((?:producer|director|actor|actress|composer)\)/i.test(title)) return false;
  if (/\b(film producer|film director|screenwriter|voice actor|\d{4} births)\b/i.test(desc)) {
    return false;
  }
  return (
    /\(.*\b(?:film|movie|TV series|television series)\b.*\)/i.test(title) ||
    /^\d{4}\b.{0,80}\b(film|movie|anime film|animated film|television series)\b/i.test(desc)
  );
}

function toEnMovieHit(page: WikiPage): SearchHit {
  const desc = description(page);
  const cover = page.thumbnail?.source?.replace(/\?.*$/, "").replace(/\/\d+px-/, "/800px-") ?? "";
  return {
    id: `wiki-en-${page.pageid}`,
    type: "movie",
    title: page.title.replace(/\s*\((?:film|movie|20\d{2} film)\)/gi, "").trim(),
    director: parseDirector(page.extract) || "監督不明",
    coverUrl: cover,
    year: yearFromDate(desc) ?? yearFromDate(page.extract),
    source: "wikipedia",
    sourceLabel: SOURCE_LABEL.wikipedia,
    coverHint: page.title,
  };
}

export async function searchWikipediaMoviesEn(query: string): Promise<SearchHit[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const pages = (
    await Promise.all([queryPages(`${trimmed} film`, "en"), queryPages(trimmed, "en")])
  ).flat();
  const seen = new Set<number>();
  const unique = pages.filter((page) => {
    if (seen.has(page.pageid)) return false;
    seen.add(page.pageid);
    return true;
  });
  return unique.filter(keepEnMovie).slice(0, 10).map(toEnMovieHit);
}

export async function searchWikipediaBooks(query: string): Promise<SearchHit[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const pages = (
    await Promise.all([queryPages(`${trimmed} 小説`), queryPages(trimmed)])
  ).flat();
  const seen = new Set<number>();
  const unique = pages.filter((page) => {
    if (seen.has(page.pageid)) return false;
    seen.add(page.pageid);
    return true;
  });
  return unique.filter((page) => keepBook(page, trimmed)).slice(0, 10).map(toBookHit);
}
