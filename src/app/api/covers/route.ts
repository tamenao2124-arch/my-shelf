import { hydrateSearchHitCovers } from "@/lib/catalog/covers";
import { isMediaType, type MediaType, type SearchHit } from "@/lib/types";

export const dynamic = "force-dynamic";

type CoverRequestHit = Pick<
  SearchHit,
  "id" | "type" | "title" | "coverUrl" | "coverHint"
>;

function parseHits(body: unknown): CoverRequestHit[] {
  if (!body || typeof body !== "object") return [];
  const hits = (body as { hits?: unknown }).hits;
  if (!Array.isArray(hits)) return [];
  const out: CoverRequestHit[] = [];
  for (const row of hits) {
    if (!row || typeof row !== "object") continue;
    const hit = row as Record<string, unknown>;
    const type = hit.type;
    const title = hit.title;
    if (typeof title !== "string" || !title.trim()) continue;
    if (typeof type !== "string" || !isMediaType(type)) continue;
    out.push({
      id: typeof hit.id === "string" ? hit.id : `cover-${type}-${title}`,
      type: type as MediaType,
      title,
      coverUrl: typeof hit.coverUrl === "string" ? hit.coverUrl : "",
      coverHint: typeof hit.coverHint === "string" ? hit.coverHint : undefined,
    });
  }
  return out;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const hits = parseHits(body);
    if (hits.length === 0) {
      return Response.json({ hits: [] });
    }
    await hydrateSearchHitCovers(hits);
    return Response.json({ hits });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "カバー画像の取得に失敗しました。" },
      { status: 502 },
    );
  }
}
