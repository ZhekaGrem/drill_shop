type Collection = { key: string; items: { slug: string }[] };

export function readHeroSelection(url: URL, collections: Collection[]): Record<string, string> {
  const selected: Record<string, string> = {};
  for (const col of collections) {
    const slug = url.searchParams.get(`pick.${col.key}`);
    if (slug && col.items.some((item) => item.slug === slug)) selected[col.key] = slug;
  }
  return selected;
}

export function writeHeroSelection(
  source: URL,
  collections: Collection[],
  selected: Record<string, string>,
  focusKey?: string
): URL {
  const url = new URL(source);
  for (const col of collections) {
    const slug = selected[col.key] ?? col.items[0]?.slug;
    if (slug) url.searchParams.set(`pick.${col.key}`, slug);
  }
  if (focusKey) url.hash = `collection-${focusKey}`;
  return url;
}
