const NON_ALPHANUMERIC = /[^a-z0-9]+/g;
const EDGE_DASHES = /^-+|-+$/g;

export function slugifyAnchor(value: string): string {
  const normalized = value.trim().toLowerCase();
  const slug = normalized.replace(NON_ALPHANUMERIC, '-').replace(EDGE_DASHES, '');

  return slug || 'section';
}

export function buildUniqueAnchor(
  title: string,
  countsByBaseAnchor: Record<string, number>,
): string {
  const baseAnchor = slugifyAnchor(title);
  const count = (countsByBaseAnchor[baseAnchor] || 0) + 1;
  countsByBaseAnchor[baseAnchor] = count;

  if (count === 1) {
    return baseAnchor;
  }

  return `${baseAnchor}-${count}`;
}
