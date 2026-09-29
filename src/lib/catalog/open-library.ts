import { fetchJsonOrNull, yearFromDate } from "@/lib/catalog/http";
import { SOURCE_LABEL, type SearchHit } from "@/lib/types";

type OpenLibrary = {
  docs?: Array<{
    key?: string;
    title?: string;
    author_name?: string[];
    publisher?: string[];
    cover_i?: number;
    first_publish_year?: number;
    ebook_access?: string;
    has_fulltext?: boolean;
  }>;
};

type OpenLibraryOptions = {
  ebook?: boolean;
};

function isEbookDoc(doc: NonNullable<OpenLibrary["docs"]>[number]) {
  const access = doc.ebook_access ?? "";
  if (access === "borrowable" || access === "public") return true;
  return Boolean(doc.has_fulltext);
}

export async function searchOpenLibrary(
  query: string,
  options: OpenLibraryOptions = {}
): Promise<SearchHit[]> {
  const trimmed = query.trim();
  const ebook = Boolean(options.ebook);
  const q = trimmed || (ebook ? 'subject:"Japanese fiction"' : "");
  if (!q) return [];

  const params = new URLSearchParams({
    q,
    limit: "20",
    fields:
      "key,title,author_name,cover_i,first_publish_year,publisher,ebook_access,has_fulltext",
  });
  const data = await fetchJsonOrNull<OpenLibrary>(
    `https://openlibrary.org/search.json?${params}`
  );
  if (!data) return [];

  const hits = (data.docs ?? [])
    .filter((doc) => doc.title)
    .map((doc) => {
      const ebookHit = isEbookDoc(doc);
      return {
        id: `ol-${(doc.key ?? doc.title ?? "work").replace(/\W+/g, "-")}`,
        type: "book" as const,
        title: doc.title ?? "",
        author: doc.author_name?.join("、") || "著者不明",
        publisher: doc.publisher?.[0] || "出版社不明",
        coverUrl: doc.cover_i
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
          : "",
        year: yearFromDate(doc.first_publish_year),
        source: "openlibrary" as const,
        sourceLabel: SOURCE_LABEL.openlibrary,
        ebook: ebookHit,
        providers: ebookHit ? ["Kindle"] : undefined,
      };
    });

  if (!ebook) return hits;
  const ebooks = hits.filter((hit) => hit.ebook);
  return ebooks.length ? ebooks : hits;
}
