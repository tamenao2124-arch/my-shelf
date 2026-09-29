export const CATALOG_UA = "Artly/0.1 (https://cursor.com)";
const FETCH_MS = 10_000;

export function timeoutSignal() {
  return AbortSignal.timeout(FETCH_MS);
}

export async function fetchJson<T>(url: string, extra?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...extra,
    headers: {
      Accept: "application/json",
      "User-Agent": CATALOG_UA,
      ...extra?.headers,
    },
    signal: timeoutSignal(),
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `HTTP ${response.status} ${url}${detail ? ` ${detail.slice(0, 180)}` : ""}`
    );
  }
  return (await response.json()) as T;
}

export async function fetchJsonOrNull<T>(
  url: string,
  extra?: RequestInit
): Promise<T | null> {
  try {
    return await fetchJson<T>(url, extra);
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function yearFromDate(value?: string | number | null): number | undefined {
  if (value == null || value === "") return undefined;
  const match = String(value).match(/(18|19|20)\d{2}/);
  return match ? Number(match[0]) : undefined;
}
