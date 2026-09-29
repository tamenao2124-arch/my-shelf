/** 表記ゆれを潰してタイトル照合する */
export function normalizeCatalogText(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s　]/g, "")
    .replace(/[・×xX:：!！?？\-ー‐–—'′"“”『』「」()（）\[\]【】.。,、]/g, "");
}

export function catalogTextMatches(haystack: string, needle: string) {
  const h = normalizeCatalogText(haystack);
  const n = normalizeCatalogText(needle);
  if (!h || !n) return false;
  return h.includes(n) || n.includes(h);
}
