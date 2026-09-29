import { fetchJson, yearFromDate } from "@/lib/catalog/http";
import { SOURCE_LABEL, type SearchHit } from "@/lib/types";

type StaffEdge = {
  role?: string;
  node?: { name?: { native?: string; full?: string } };
};

type AniListMedia = {
  id: number;
  format?: string;
  title?: { native?: string; romaji?: string; english?: string };
  coverImage?: { extraLarge?: string; large?: string };
  startDate?: { year?: number };
  staff?: { edges?: StaffEdge[] };
};

type AniListResponse = {
  data?: { Page?: { media?: AniListMedia[] } };
};

const QUERY = `
query ($search: String) {
  Page(perPage: 16) {
    media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
      id
      format
      title { native romaji english }
      coverImage { extraLarge large }
      startDate { year }
      staff(perPage: 12) {
        edges {
          role
          node { name { native full } }
        }
      }
    }
  }
}
`;

function directorFromStaff(edges?: StaffEdge[]) {
  const directors = (edges ?? []).filter((edge) => {
    const role = edge.role ?? "";
    return /Director|監督/.test(role) && !/Assistant|助監督|副監督|ADR|English|Dub/.test(role);
  });
  const withNative = directors.find((edge) => edge.node?.name?.native);
  const pick = withNative ?? directors[0];
  return pick?.node?.name?.native || pick?.node?.name?.full || "監督不明";
}

export async function searchAniListMovies(query: string): Promise<SearchHit[]> {
  if (!query.trim()) return [];
  const data = await fetchJson<AniListResponse>("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: QUERY, variables: { search: query } }),
  });

  const media = (data.data?.Page?.media ?? []).filter(
    (item) => item.format !== "MUSIC"
  );

  return media
    .map((item) => ({
      id: `anilist-${item.id}`,
      type: "movie" as const,
      title:
        item.title?.native || item.title?.romaji || item.title?.english || "",
      director: directorFromStaff(item.staff?.edges),
      coverUrl: item.coverImage?.extraLarge || item.coverImage?.large || "",
      year: yearFromDate(item.startDate?.year),
      source: "anilist" as const,
      sourceLabel: SOURCE_LABEL.anilist,
      providers: item.format && item.format !== "MOVIE" ? ["アニメ"] : undefined,
    }))
    .filter((hit) => hit.title);
}
