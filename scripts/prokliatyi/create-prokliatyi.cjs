#!/usr/bin/env node
// Розділ «є. Проклятий» у прод-БД: дві приховані колекції (футболки й худі) під однією
// словомаркою — схема «Поламава» (scripts/polamav/create-polamav.cjs), але на рушії
// scripts/lib/seed-collections.cjs. Футболки — на tshirt.glb, худі — на крої №3 (hoodie-3.glb).
// Футболки — з 3d/є***/футболка-N-UV.png (власник, 2026-09-28): 7936² → 2048 JPEG q85;
// фото товарів — 3d/artists/prokliatyi/футболки/картинки товарів/.
// Худі («боби», той самий день) — розгортки під UV крою №3 з тих самих принтів
// (3d/artists/prokliatyi/худі/худі-N-UV.png, 8192²), підігнані під видиму зону
// scripts/3d/fit-hoodie-prints.py → WebP без втрат, як у «Бобів Оксани».
// Фази й прапорці — у рушії. Будь-який запис:
//   node scripts/prokliatyi/create-prokliatyi.cjs --phase=… --apply --confirm=prokliatyi
const { run } = require('../lib/seed-collections.cjs');

const texture = (file) => `/3d/textures/prokliatyi/${file}`;
const PLAIN = '#111111';

// [назва, файл текстури, свотч]; слаги нумеруються за порядком: prokliatyi-tee-01…
const TEES = [
  ['Проклятий Люцифер', 'tshirt-01.jpg'],
  ['Проклятий Астарот', 'tshirt-02.jpg'],
  ['Проклятий Вельзевул', 'tshirt-03.jpg'],
  ['Проклятий Асмодей', 'tshirt-04.jpg'],
  ['Проклятий Ліліт', 'tshirt-05.jpg'],
];
// Худі N — з принтів футболки N, тож і назва та сама, з «Боба» попереду (слово власника)
const HOODIES = TEES.map(([name], i) => [`Боба ${name}`, `hoodie-0${i + 1}.webp`]);

run({
  confirm: 'prokliatyi',
  sizes: ['M', 'L', 'XL'],
  // Передзамовлення (рішення власника, 2026-09-28): окремої механіки на сайті нема — бейдж
  // лише підпис, а купити дає сток. Того ж дня власник закрив продаж: --phase=stock --qty=0;
  // відкрити знову — --phase=stock --qty=100 і --phase=revalidate
  badge: { badgeText: 'передзамовлення', badgeColor: '#2b9ad9' },
  // Раніше за найстаріший публічний товар: інакше прихований розділ зайняв би першу
  // сторінку каталогу (каталог ховає його лише після пагінації)
  backdate: '2025-11-01T00:00:00.000Z',
  collections: [
    {
      slug: 'prokliatyi-futbolky',
      title: 'футболки',
      description: 'Прокуляті футболки для святих людей',
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
      title: 'Боби',
      description: 'Прокуляті боби для святих людей',
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
  ],
});
