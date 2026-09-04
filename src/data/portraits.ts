const PORTRAIT_MODULES = import.meta.glob("../assets/portraits/*.{png,jpg,jpeg,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const PORTRAITS = new Map<string, string>();
for (const [path, url] of Object.entries(PORTRAIT_MODULES)) {
  const stem = path
    .split("/")
    .pop()
    ?.replace(/\.(png|jpe?g|webp)$/i, "");
  if (stem) PORTRAITS.set(stem.toLowerCase(), url);
}

const FALLBACK_EXPRESSIONS = ["calm", "pleased", "concerned", "tense"];

/**
 * Drop-in portrait convention: place `<id>-<expression>.png` (or jpg/webp)
 * under src/assets/portraits/ and it is picked up automatically, no code
 * changes needed. Falls back expression -> calm -> any known expression ->
 * bare `<id>` file -> null (caller should fall back to a procedural face).
 */
export function portraitUrl(id: string, expression?: string): string | null {
  const key = id.toLowerCase();
  if (expression) {
    const exact = PORTRAITS.get(`${key}-${expression}`.toLowerCase());
    if (exact) return exact;
  }
  const calm = PORTRAITS.get(`${key}-calm`);
  if (calm) return calm;
  for (const fallback of FALLBACK_EXPRESSIONS) {
    const found = PORTRAITS.get(`${key}-${fallback}`);
    if (found) return found;
  }
  return PORTRAITS.get(key) ?? null;
}
