const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const filename = 'src/widgets/HomeHeroes/hero-links.ts';
const mod = { exports: {} };
if (fs.existsSync(filename))
  new Function(
    'exports',
    ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText
  )(mod.exports);
assert.equal(typeof mod.exports.readHeroSelection, 'function', 'URL selections must be restorable');
const { readHeroSelection, writeHeroSelection } = mod.exports;
const collections = [
  { key: 'tees', items: [{ slug: 'first' }, { slug: 'nirvana' }] },
  { key: 'hoodies', items: [{ slug: 'horse' }, { slug: 'key' }] },
];
const url = writeHeroSelection(
  new URL('https://example.com/prokliatyi?utm_source=friend'),
  collections,
  { tees: 'nirvana', hoodies: 'key' },
  'hoodies'
);
assert.equal(url.hash, '#collection-hoodies');
assert.equal(url.searchParams.get('utm_source'), 'friend');
assert.deepEqual(readHeroSelection(url, collections), { tees: 'nirvana', hoodies: 'key' });
assert.deepEqual(
  readHeroSelection(new URL('https://example.com/?pick.tees=deleted&pick.hoodies=nirvana'), collections),
  {}
);
const defaults = writeHeroSelection(new URL('https://example.com'), collections, {});
assert.equal(defaults.searchParams.get('pick.tees'), 'first');
assert.equal(defaults.searchParams.get('pick.hoodies'), 'horse');
console.log('Hero links: selection round-trip, scope validation, defaults and target passed');
