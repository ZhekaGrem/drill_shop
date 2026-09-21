#!/usr/bin/env node
// Колекція «Боби Оксана» у прод-БД: 5 чорних худі на спільному крої hoodie-3.glb, принти —
// ті самі, що у футболок «Ніжної Оксани» (3d/серія боб ніжна оксана /дизайни.pdf).
// Назви, свотчі й порядок дзеркалять футболки; ціна й розміри — як у «Культурного Фронту».
// Фази й прапорці — у scripts/lib/seed-collections.cjs. Будь-який запис:
//   node scripts/boby-oksana/create-boby-oksana.cjs --phase=… --apply --confirm=boby-oksana
const { run } = require('../lib/seed-collections.cjs');

const texture = (name) => `/3d/textures/dril/hoodie-oksana-${name}.webp`;

// [номер слага, назва, текстура, свотч]: свотчі — з однойменних футболок. Номери 05 (біле
// «Білонька») і 07 (зелене «Зелена Рунічна») власник прибрав 2026-09-21: видалені з бази
// фазою purge, слаги решти не зсуваються.
const PRODUCTS = [
  ['01', 'Боба Червона Оксана', 'chervona', '#c8102e'],
  ['02', 'Боба Філовето Оксана', 'fioletova', '#8b2fc9'],
  ['03', 'Боба Зелена Оксана', 'zelena', '#35d221'],
  ['04', 'Боба Жовта Оксана', 'zhovta', '#f5d800'],
  ['06', 'Боба Рунічна Оксана', 'runichna', '#74ad40'],
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
        'Пʼять худі з принтами «Ніжної Оксани» і «Батятичі Блек Метал Туром» на всю спину. Оверсайз, розміри M, L, XL, XXL.',
      sortOrder: 3,
      labelText: 'новинка',
      labelColor: 'var(--gradient-brand)',
      price: 2200,
      model3dPath: '/3d/models/hoodie-3.glb',
      products: PRODUCTS.map(([number, name, file, swatch]) => ({
        slug: `boba-oksana-${number}`,
        name,
        swatch,
        texture3dUrl: texture(file),
      })),
    },
  ],
});
