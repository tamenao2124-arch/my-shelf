import { isAllowedPosterUrl } from "@/lib/cover-display-url";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("url")?.trim();
  if (!raw || !isAllowedPosterUrl(raw)) {
    return new Response("Bad Request", { status: 400 });
  }

  try {
    const upstream = await fetch(raw, {
      headers: {
        Accept: "image/*",
        "User-Agent": "Artly/1.0 (poster proxy; +https://shelf-hojihoji.vercel.app)",
      },
      next: { revalidate: 60 * 60 * 24 * 7 },
    });
    if (!upstream.ok) {
      return new Response("Upstream error", { status: upstream.status });
    }
    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    const body = await upstream.arrayBuffer();
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=604800",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response("Fetch failed", { status: 502 });
  }
}
