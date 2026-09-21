// Build-time mount. Rebuild with NEXT_PUBLIC_STOREFRONT_BASE_PATH="" when v3 becomes the main shop.
export const STOREFRONT_BASE_PATH = process.env.NEXT_PUBLIC_STOREFRONT_BASE_PATH ?? '/v3';

/** Only browser/public URLs need this; Next Link and router add basePath themselves. */
export function withStorefrontPath(path: string): string {
  if (!STOREFRONT_BASE_PATH || !path.startsWith('/') || path.startsWith('//')) return path;
  const pathname = path.split(/[?#]/, 1)[0];
  if (pathname === STOREFRONT_BASE_PATH || pathname.startsWith(`${STOREFRONT_BASE_PATH}/`)) return path;
  return `${STOREFRONT_BASE_PATH}${path}`;
}
