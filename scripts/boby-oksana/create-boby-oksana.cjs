#!/usr/bin/env node
// Колекція «Боби Оксана» у прод-БД: 7 худі на спільному крої hoodie-3.glb, принти —
// ті самі, що у футболок «Ніжної Оксани» (3d/серія боб ніжна оксана /дизайни.pdf).
// Назви, свотчі й порядок дзеркалять футболки; ціна й розміри — як у «Культурного Фронту».
// Фази й прапорці — у scripts/lib/seed-collections.cjs. Будь-який запис:
//   node scripts/boby-oksana/create-boby-oksana.cjs --phase=… --apply --confirm=boby-oksana
const { run } = require('../lib/seed-collections.cjs');

const texture = (name) => `/3d/textures/dril/hoodie-oksana-${name}.webp`;

// [назва, текстура, свотч]: свотчі перших шести — з однойменних футболок
const PRODUCTS = [
  ['Боба Червона Оксана', 'chervona', '#c8102e'],
  ['Боба Філовето Оксана', 'fioletova', '#8b2fc9'],
  ['Боба Зелена Оксана', 'zelena', '#35d221'],
  ['Боба Жовта Оксана', 'zhovta', '#f5d800'],
  ['Боба Білонька Оксана', 'bilonka', '#f4f2f7'],
  ['Боба Рунічна Оксана', 'runichna', '#74ad40'],
  ['Боба Зелена Рунічна Оксана', 'zelena-runichna', '#0b8932'],
];

run({
  confirm: 'boby-oksana',
  sizes: ['M', 'L', 'XL', 'XXL'],
  // Одразу в продаж (рішення власника, 2026-09-21): без бейджа, сток дає create --qty=100
  badge: null,
  backdate: null, // публічна новинка: у каталозі має стати першою
  collections: [
    {
      slug: 'boby-oksana',
      title: 'Боби Оксана',
      description:
        'Сім худі з принтами «Ніжної Оксани» і «Батятичі Блек Метал Туром» на всю спину. Оверсайз, розміри M, L, XL, XXL.',
      sortOrder: 3,
      labelText: 'новинка',
      labelColor: 'var(--gradient-brand)',
      price: 2200,
      model3dPath: '/3d/models/hoodie-3.glb',
      products: PRODUCTS.map(([name, file, swatch], i) => ({
        slug: `boba-oksana-${String(i + 1).padStart(2, '0')}`,
        name,
        swatch,
        texture3dUrl: texture(file),
      })),
    },
  ],
});
