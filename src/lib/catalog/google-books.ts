import { getGoogleBooksApiKey } from "@/lib/catalog/env";
import { fetchJsonOrNull, yearFromDate } from "@/lib/catalog/http";
import { SOURCE_LABEL, type SearchHit } from "@/lib/types";

type GoogleBooks = {
  items?: Array<{
    id: string;
    volumeInfo?: {
      title?: string;
      authors?: string[];
      publisher?: string;
      publishedDate?: string;
      language?: string;
      industryIdentifiers?: Array<{ type?: string; identifier?: string }>;
      imageLinks?: {
        extraLarge?: string;
        large?: string;
        thumbnail?: string;
        smallThumbnail?: string;
      };
    };
    saleInfo?: {
      isEbook?: boolean;
      saleability?: string;
      buyLink?: string;
    };
    accessInfo?: {
      epub?: { isAvailable?: boolean };
      pdf?: { isAvailable?: boolean };
    };
  }>;
  error?: { message?: string };
};

type GoogleBooksOptions = {
  ebook?: boolean;
};

function coverFromVolume(id: string, url?: string) {
  if (url) {
    return url
      .replace("http://", "https://")
      .replace("&edge=curl", "")
      .replace("zoom=1", "zoom=2");
  }
  if (!id) return "";
  return `https://books.google.com/books/content?id=${encodeURIComponent(id)}&printsec=frontcover&img=1&zoom=1&source=gbs_api`;
}

function isEbookItem(item: NonNullable<GoogleBooks["items"]>[number]) {
  if (item.saleInfo?.isEbook) return true;
  if (item.accessInfo?.epub?.isAvailable || item.accessInfo?.pdf?.isAvailable) {
    return true;
  }
  const buy = item.saleInfo?.buyLink ?? "";
  if (/kindle|amazon|play\.google\.com\/store\/books/i.test(buy)) return true;
  const publisher = item.volumeInfo?.publisher ?? "";
  return /kindle|amazon digital/i.test(publisher);
}

async function requestGoogleBooks(
  query: string,
  extras: { langRestrict?: string; filter?: string }
) {
  const params = new URLSearchParams({
    q: query,
    maxResults: "12",
    printType: "books",
    orderBy: "relevance",
  });
  if (extras.langRestrict) params.set("langRestrict", extras.langRestrict);
  if (extras.filter) params.set("filter", extras.filter);
  const key = getGoogleBooksApiKey();
  if (key) params.set("key", key);

  return fetchJsonOrNull<GoogleBooks>(
    `https://www.googleapis.com/books/v1/volumes?${params}`
  );
}

function toHits(data: GoogleBooks | null, assumeEbook = false): SearchHit[] {
  if (!data?.items?.length) return [];
  return data.items
    .filter((item) => item.volumeInfo?.title)
    .map((item) => {
      const links = item.volumeInfo?.imageLinks;
      const ebook = assumeEbook || isEbookItem(item);
      return {
        id: `gbooks-${item.id}`,
        type: "book" as const,
        title: item.volumeInfo?.title ?? "",
        author: item.volumeInfo?.authors?.join("、") || "著者不明",
        publisher: item.volumeInfo?.publisher || "出版社不明",
        coverUrl: coverFromVolume(
          item.id,
          links?.extraLarge ??
            links?.large ??
            links?.thumbnail ??
            links?.smallThumbnail
        ),
        year: yearFromDate(item.volumeInfo?.publishedDate),
        source: "google-books" as const,
        sourceLabel: SOURCE_LABEL["google-books"],
        ebook,
        providers: ebook ? ["Kindle"] : undefined,
      };
    });
}

function mergeHits(groups: SearchHit[][]) {
  const merged: SearchHit[] = [];
  const seen = new Set<string>();
  for (const group of groups) {
    for (const hit of group) {
      if (seen.has(hit.id)) continue;
      seen.add(hit.id);
      merged.push(hit);
    }
  }
  return merged;
}

export async function searchGoogleBooks(
  query: string,
  options: GoogleBooksOptions = {}
): Promise<SearchHit[]> {
  const trimmed = query.trim();
  const ebook = Boolean(options.ebook);
  const q = trimmed || (ebook ? "小説" : "");
  if (!q) return [];

  const filter = ebook ? "ebooks" : undefined;
  const first = await requestGoogleBooks(ebook && trimmed ? `${q}` : q, {
    langRestrict: "ja",
    filter,
  });
  if (!first) return [];
  if (first.error) return [];

  const groups = [toHits(first, ebook)];
  if (groups[0].length < 6 && trimmed) {
    const titled = await requestGoogleBooks(`intitle:${trimmed}`, {
      langRestrict: "ja",
      filter,
    });
    groups.push(toHits(titled, ebook));
  }
  if (ebook && trimmed && groups.flat().length < 6) {
    const kindleQ = await requestGoogleBooks(`${trimmed} Kindle`, {
      langRestrict: "ja",
      filter: "ebooks",
    });
    groups.push(toHits(kindleQ, true));
  }
  if (groups.flat().length < 4) {
    const open = await requestGoogleBooks(q, { filter });
    groups.push(toHits(open, ebook));
  }

  const merged = mergeHits(groups);
  return merged;
}
