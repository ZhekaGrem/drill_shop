import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { withStorefrontPath, STOREFRONT_BASE_PATH } from '../src/shared/config/storefront-path.ts';
import { buildMotoSrc } from '../src/app/moto/moto-bridge.ts';

assert.equal(STOREFRONT_BASE_PATH, '/v3');
for (const path of [
  '/',
  '/catalog?category=shirts',
  '/payment/success/order?orderId=order',
  '/3d/a.glb?v=2',
]) {
  assert.equal(withStorefrontPath(path), `/v3${path}`);
}
for (const path of [
  '/v3',
  '/v3/',
  '/v3?x=1',
  '/v3#main',
  '/v3/catalog',
  'https://cdn.test/a.jpg',
  '//cdn.test/a.jpg',
  'data:image/png;base64,a',
  '#main',
  'relative.jpg',
]) {
  assert.equal(withStorefrontPath(path), path);
}
assert.equal(withStorefrontPath('/v30/catalog'), '/v3/v30/catalog');
const game = new URL(buildMotoSrc('dark', STOREFRONT_BASE_PATH), 'https://shop.test');
assert.equal(game.pathname, '/v3/moto/index.html');
assert.equal(game.searchParams.get('tracks'), '/v3/moto/tracks/dril.mrg');
assert.equal(game.searchParams.get('theme'), 'dark');
const manifest = JSON.parse(readFileSync(new URL('../public/manifest.json', import.meta.url)));
const manifestUrl = 'https://shop.test/v3/manifest.json';
assert.equal(new URL(manifest.start_url, manifestUrl).pathname, '/v3/');
assert.equal(new URL(manifest.scope, manifestUrl).pathname, '/v3/');
for (const icon of manifest.icons)
  assert.ok(new URL(icon.src, manifestUrl).pathname.startsWith('/v3/assets/'));

// A later migration must also work when mounted at the domain root.
execFileSync(
  process.execPath,
  [
    '--input-type=module',
    '-e',
    `
  import assert from 'node:assert/strict';
  import { withStorefrontPath, STOREFRONT_BASE_PATH } from ${JSON.stringify(new URL('../src/shared/config/storefront-path.ts', import.meta.url).href)};
  assert.equal(STOREFRONT_BASE_PATH, '');
  assert.equal(withStorefrontPath('/catalog?x=1'), '/catalog?x=1');
`,
  ],
  { env: { ...process.env, NEXT_PUBLIC_STOREFRONT_BASE_PATH: '' }, stdio: 'pipe' }
);
console.log('ok - mounted/public URLs, external URLs, idempotence, Moto, manifest, future root migration');

// Optional integration check against a running production build. No orders or messages are sent.
if (process.argv[2]) {
  const origin = process.argv[2];
  const pages = [
    '/v3',
    '/v3/catalog',
    '/v3/cart',
    '/v3/checkout',
    '/v3/login',
    '/v3/profile',
    '/v3/contact',
    '/v3/about',
    '/v3/menu',
    '/v3/moto',
    '/v3/telegram/catalog',
    '/v3/payment/success/mount-check',
  ];
  const assets = new Set([
    '/v3/manifest.json',
    '/v3/svg/checkmark-white.svg',
    '/v3/3d/models/tshirt.glb',
    '/v3/moto/index.html',
    '/v3/moto/tracks/dril.mrg',
  ]);
  for (const path of pages) {
    const response = await fetch(`${origin}${path}`, { redirect: 'manual' });
    assert.equal(response.status, 200, `${path} HTTP status`);
    assert.match(response.headers.get('x-robots-tag') ?? '', /noindex/, `${path} indexing`);
    const html = await response.text();
    assert.match(html, /data-design="editorial"/, `${path} v3 layout`);
    assert.doesNotMatch(html, /(?:href|src)="\/(?!v3(?:[/?#"]|&)|\/)/, `${path} escaped mount`);
    for (const match of html.matchAll(/(?:src|href)="(\/v3\/[^"?]+(?:\?[^" ]*)?)"/g)) {
      const url = match[1].replaceAll('&amp;', '&');
      if (url.includes('/_next/') || /\.(?:webp|png|svg|woff2)(?:\?|$)/.test(url)) assets.add(url);
    }
  }
  for (const path of assets) {
    const response = await fetch(`${origin}${path}`);
    assert.equal(response.status, 200, `${path} asset status`);
    await response.arrayBuffer();
  }
  const admin = await fetch(`${origin}/v3/admin`, { redirect: 'manual' });
  assert.equal(admin.status, 307);
  const login = new URL(admin.headers.get('location'), origin);
  assert.equal(login.pathname, '/v3/login');
  assert.equal(login.searchParams.get('from'), '/admin');
  const api = await fetch(`${origin}/v3/api/telegram/wishes`);
  assert.equal(api.status, 405, 'Mounted POST-only route is reachable without sending a message');
  console.log(`ok - ${pages.length} pages, ${assets.size} assets, admin redirect, API routing`);
}
