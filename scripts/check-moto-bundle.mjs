// Перевірки scripts/lib/moto-bundle.mjs на тимчасових теках-фікстурах:
//   node scripts/check-moto-bundle.mjs
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import {
  CODEBREW_SHA256,
  checkRelativeBase,
  checkUpstreamName,
  findCodebrewTraces,
  gzipTotal,
  listFiles,
  resolveBundleRoot,
} from './lib/moto-bundle.mjs';

let n = 0;
const check = (name, fn) => {
  fn();
  n += 1;
  console.log('ok -', name);
};

const withTree = (files, fn) => {
  const root = mkdtempSync(join(tmpdir(), 'moto-bundle-'));
  try {
    for (const [path, body] of Object.entries(files)) {
      mkdirSync(join(root, path, '..'), { recursive: true });
      writeFileSync(join(root, path), body);
    }
    fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};

// «Заборонений» блоб фікстури: справжніх файлів Codebrew у репо нема,
// тож перевірка отримує власну мапу хешів.
const BLOB = Buffer.from('not-a-real-sprite');
const FORBIDDEN = new Map([[createHash('sha256').update(BLOB).digest('hex'), 'helmet.png']]);

check('CODEBREW_SHA256: 12 відбитків оригінальних асетів', () => {
  assert.equal(CODEBREW_SHA256.size, 12);
  for (const [hash, name] of CODEBREW_SHA256) {
    assert.match(hash, /^[0-9a-f]{64}$/);
    assert.match(name, /\.(png|mrg|gif)$/);
  }
});

check('resolveBundleRoot: тека з index.html, її dist/, корінь форку → dist/, інакше null', () => {
  const files = {
    'a/index.html': '<!doctype html>',
    'b/dist/index.html': '<!doctype html>',
    'c/x.txt': 'x',
    'fork/index.html': '<!doctype html>',
    'fork/package.json': '{}',
    'fork/dist/index.html': '<!doctype html>',
    'src/index.html': '<!doctype html>',
    'src/package.json': '{}',
  };
  withTree(files, (root) => {
    assert.equal(resolveBundleRoot(join(root, 'a')), join(root, 'a'));
    assert.equal(resolveBundleRoot(join(root, 'b')), join(root, 'b', 'dist'));
    assert.equal(resolveBundleRoot(join(root, 'c')), null);
    assert.equal(resolveBundleRoot(join(root, 'fork')), join(root, 'fork', 'dist'));
    assert.equal(resolveBundleRoot(join(root, 'src')), null);
  });
});

check('listFiles: рекурсивно, через «/», відсортовано, без dot-файлів', () => {
  withTree(
    { 'index.html': '', 'assets/b.js': '', 'assets/a.css': '', '.nojekyll': '', 'fonts/x/f.woff2': '' },
    (root) => {
      assert.deepEqual(listFiles(root), ['assets/a.css', 'assets/b.js', 'fonts/x/f.woff2', 'index.html']);
    }
  );
});

check('findCodebrewTraces: чистий бандл без проблем (NOTICE.txt може згадувати levels.mrg)', () => {
  const files = {
    'index.html': '<script src="./assets/i.js"></script>',
    'assets/i.js': 'fetch("./tracks/dril.mrg")',
    'NOTICE.txt': 'оригінальні треки (levels.mrg) видалені у першому коміті форку',
  };
  withTree(files, (root) => assert.deepEqual(findCodebrewTraces(root, listFiles(root), FORBIDDEN), []));
});

check('findCodebrewTraces: файл за хешем, data:-URI, пак levels*.mrg, рядок levels.mrg', () => {
  const files = {
    'assets/helmet-1a2b.png': BLOB,
    'assets/index-3c4d.js': `const s="data:image/png;base64,${BLOB.toString('base64')}";const u="levels.mrg";`,
    'assets/levels-5e6f.mrg': 'x',
  };
  withTree(files, (root) => {
    const problems = findCodebrewTraces(root, listFiles(root), FORBIDDEN);
    assert.equal(problems.length, 4, problems.join(' | '));
    assert.ok(problems.some((p) => p.startsWith('assets/helmet-1a2b.png: це оригінальний helmet.png')));
    assert.ok(problems.some((p) => p.includes('вбудований data:-URI — оригінальний helmet.png')));
    assert.ok(problems.some((p) => p.includes('імʼя оригінального пака')));
    assert.ok(problems.some((p) => p.includes('згадка levels.mrg')));
  });
});

check('checkRelativeBase: відносні шляхи ок, абсолютні /assets — проблема', () => {
  assert.equal(checkRelativeBase('<script type="module" src="./assets/i.js"></script>'), null);
  assert.match(checkRelativeBase('<script type="module" src="/assets/i.js"></script>'), /base: '\.\/'/);
  assert.equal(checkRelativeBase('<link href="https://fonts.example/x.css">'), null);
});

check('checkUpstreamName: назва upstream у метаданих index.html — проблема', () => {
  assert.equal(checkUpstreamName('<title>Дріл Мото</title>'), null);
  assert.match(checkUpstreamName('<title>Gravity Defied</title>'), /Gravity Defied/);
  assert.match(checkUpstreamName('<meta name="keywords" content="gravity-defied, game">'), /Gravity Defied/);
});

check('gzipTotal: сумує gzip усіх файлів, крім *.map і *.txt', () => {
  const js = 'const a = 1;'.repeat(200);
  const files = { 'assets/i.js': js, 'assets/i.js.map': js, 'LICENSE.txt': js };
  withTree(files, (root) => {
    assert.equal(gzipTotal(root, listFiles(root)), gzipSync(Buffer.from(js), { level: 9 }).length);
  });
});

console.log(`ok: ${n} checks`);
