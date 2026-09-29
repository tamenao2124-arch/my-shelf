import { NextRequest } from "next/server";

import { catalogProviderStatus } from "@/lib/catalog/env";
import { parseCatalogService } from "@/lib/catalog/services";
import { searchCatalog } from "@/lib/catalog-search";
import { isMediaType } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const typeParam =
    request.nextUrl.searchParams.get("type") ??
    request.nextUrl.searchParams.get("category") ??
    "";
  const service = parseCatalogService(
    request.nextUrl.searchParams.get("service")
  );

  if (!q && !service) {
    return Response.json({
      query: "",
      type: isMediaType(typeParam) ? typeParam : null,
      service,
      results: [],
      sources: [],
      configured: catalogProviderStatus(),
      warnings: [],
    });
  }

  if (!isMediaType(typeParam)) {
    return Response.json(
      {
        error: "メディアタイプ（book / music / movie）を指定してください。",
        results: [],
        configured: catalogProviderStatus(),
        warnings: [],
      },
      { status: 400 }
    );
  }

  try {
    const payload = await searchCatalog(q, typeParam, { service });
    return Response.json(payload);
  } catch (error) {
    console.error(error);
    return Response.json(
      {
        error: "検索に失敗しました。時間をおいて再度お試しください。",
        results: [],
        configured: catalogProviderStatus(),
        warnings: [],
      },
      { status: 502 }
    );
  }
}
