#!/usr/bin/env node
// Розділ «є. Проклятий» у прод-БД: дві приховані колекції (футболки й худі) під однією
// словомаркою — схема «Поламава» (scripts/polamav/create-polamav.cjs), але на рушії
// scripts/lib/seed-collections.cjs. Футболки — на tshirt.glb, худі — на крої №3 (hoodie-3.glb).
// Футболки — з 3d/є***/футболка-N-UV.png (власник, 2026-09-28): 7936² → 2048 JPEG q85;
// фото товарів — 3d/artists/prokliatyi/футболки/картинки товарів/. Худі ще не прийшли.
// Фази й прапорці — у рушії. Будь-який запис:
//   node scripts/prokliatyi/create-prokliatyi.cjs --phase=… --apply --confirm=prokliatyi
const { run } = require('../lib/seed-collections.cjs');

const texture = (file) => `/3d/textures/prokliatyi/${file}.jpg`;
const PLAIN = '#111111';

// [назва, файл текстури, свотч]; слаги нумеруються за порядком: prokliatyi-tee-01…
const TEES = [
  ['Проклятий Люцифер', 'tshirt-01'],
  ['Проклятий Астарот', 'tshirt-02'],
  ['Проклятий Вельзевул', 'tshirt-03'],
  ['Проклятий Асмодей', 'tshirt-04'],
  ['Проклятий Ліліт', 'tshirt-05'],
];
const HOODIES = [];

run({
  confirm: 'prokliatyi',
  sizes: ['M', 'L', 'XL'],
  // Передзамовлення (рішення власника, 2026-09-28): окремої механіки на сайті нема — бейдж
  // лише підпис, а купити дає сток (create --qty=100, як у «Бобів Оксани»)
  badge: { badgeText: 'передзамовлення', badgeColor: '#2b9ad9' },
  // Раніше за найстаріший публічний товар: інакше прихований розділ зайняв би першу
  // сторінку каталогу (каталог ховає його лише після пагінації)
  backdate: '2025-11-01T00:00:00.000Z',
  collections: [
    {
      slug: 'prokliatyi-futbolky',
      title: 'Проклятий · Футболки',
      description: 'Пʼять футболок Проклятого. Оверсайз, чорні, розміри M, L, XL.',
      sortOrder: 102,
      labelText: null,
      labelColor: null,
      price: 1000,
      // null, а не пропуск: гейт activate порівнює з тим, що лежить у БД
      model3dPath: null,
      products: TEES.map(([name, file, swatch = PLAIN], i) => ({
        slug: `prokliatyi-tee-${String(i + 1).padStart(2, '0')}`,
        name,
        swatch,
        texture3dUrl: texture(file),
      })),
    },
    {
      slug: 'prokliatyi-hudi',
      title: 'Проклятий · Худі',
      description: '',
      sortOrder: 103,
      labelText: null,
      labelColor: null,
      price: 2000,
      model3dPath: '/3d/models/hoodie-3.glb',
      products: HOODIES.map(([name, file, swatch = PLAIN], i) => ({
        slug: `prokliatyi-hoodie-${String(i + 1).padStart(2, '0')}`,
        name,
        swatch,
        texture3dUrl: texture(file),
      })),
    },
  ]
    // Колекція без товарів у базу не йде: худі додадуться, щойно прийдуть дизайни
    .filter((c) => c.products.length),
});
