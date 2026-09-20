# Колекції в БД: герой = колекція товарів (артист, мерч-дроп)

**Дата:** 2026-08-13
**Статус:** затверджено власником у діалозі; paymentMethod свідомо ВИКРЕСЛЕНО
**Базується на:** `docs/model-3d-extendance-task.md` (3D-поля товару) — те ТЗ
лишається чинним, цей документ додає рівень колекцій поверх нього.
**Сід-пакет:** `seed/collections-3d/` (мапінг + скрипт-шаблон, готовий до запуску)

---

## Семантика

Колекція — кураторський набір товарів для героя головної. Може репрезентувати
артиста (slug = хендл, title = ім'я), може бути тематичним дропом. В одній
колекції співіснують різні типи речей: 2 футболки, худі, вініл, касета — кожен
товар зі своєю 3D-подачею або без неї (фото-only теж валідний учасник героя).

Колекція ≠ категорія: категорії — таксономія типів (навігація), колекції —
дропи (герої). Осі незалежні, Category не чіпаємо.

## Схема (Prisma; все адитивне, нічого не ламається)

```prisma
model Collection {
  id          String    @id @default(cuid())
  slug        String    @unique
  title       String    // заголовок героя (ім'я артиста)
  description String?   // підзаголовок героя
  sortOrder   Int       @default(0)  // порядок героїв на головній
  isActive    Boolean   @default(true)
  heroEnabled Boolean   @default(true) // колекція може існувати без героя
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Product {
  // ...усе наявне без змін...
  collectionId      String?
  collection        Collection? @relation(fields: [collectionId], references: [id])
  collectionOrder   Int         @default(0) // позиція в перемикачі героя

  // 3D-поля — з docs/model-3d-extendance-task.md, без змін:
  model3dPath       String?  // '/3d/models/tshirt.glb' — непрозорий шлях крою
  texture3dUrl      String?  // Cloudinary: запечена під UV крою basecolor
  texture3dPublicId String?
  // Нове (досвід сесії 13.08): CSS-фон кружечка перемикача — hex АБО
  // conic-gradient(...). Рахується автоматично з render3d (порт palette-
  // алгоритму на sharp, бекенд = Node), руками перекривається в адмінці.
  switcherSwatch    String?
}

model ProductImage {
  // ...наявне...
  kind String @default("photo") // 'photo' | 'render3d'
}
```

`kind='render3d'` — прозорий фронтальний рендер для мініатюри перемикача і
фолбека 3D-сцени. Немає render3d → герой бере primaryImage (фото-only товари
працюють у героях без жодних умов).

**Рішення зафіксовані:** 1 товар = 1 колекція (FK, не junction — дубль товару
в двох колекціях поки не потрібен); героїв на головній стільки, скільки
активних колекцій з heroEnabled (демонтаж сцен поза екраном — окрема фронтова
задача, передумова для 5+ героїв); paymentMethod НЕ існує.

## Реєстр моделей — у коді фронта (НЕ в БД)

`src/shared/config/models3d.ts`: `{ path, label, cloth }`. `cloth: false`
(вініл, касета) вимикає тканинний вітер-шейдер — це метадані геометрії,
спарені з шейдерним кодом, тому живуть і версіонуються з ним. БД зберігає
лише path. Додавання крою = GLB у `public/3d/models/` + рядок реєстру
(конвеєр збірки — `docs/model-3d-extendance-task.md` §12.2).

## API

**Публічний** `GET /collections` (кеш ISR): активні колекції за sortOrder,
кожна з товарами за collectionOrder — повна картка товару (той самий
серіалізатор, що каталог) + `model3dPath, texture3dUrl, switcherSwatch` +
`images` з `kind`. Головна сторінка = один запит.

**Адмінські:** CRUD колекцій (`/admin/collections`), у продукті — collectionId,
collectionOrder, 3D-поля (upload текстури — ТЗ §A4), upload render3d
(наявний механізм images + kind), POST перерахунку switcherSwatch.

## Порядок впровадження (вирішено в діалозі)

1. **Міграція схеми** — колонки мусять існувати до будь-якого зв'язування.
2. **Сід-скрипт** — одразу за міграцією: всі дані вже готові
   (`seed/collections-3d/`): мапінг 8 живих товарів «Ніжної Оксани»,
   текстури 2048, рендери, пораховані свотчі. Без адмінки.
3. **GET /collections** — фронт читає.
4. **Фронт:** CollectionHero мапить API-колекцію в наявну механіку
   (`label←name, fallback←render3d??primaryImage, mapUrl←texture3dUrl,
modelUrl←model3dPath, swatch←switcherSwatch, slug`) + панель кошика з
   героя 3. Хардкод-конфіги DESIGNS/DRIL/TEST лишаються seed-джерелом і
   зникають після переходу.
5. **Адмінка** — останньою: потрібна менеджеру для майбутніх товарів,
   запуск живе на сіді.

## Наповнення v1

Колекція «Ніжна Оксана» — 8 товарів з каталогу, повністю зв'язані (мапінг у
сід-пакеті). Колекція «Щільний Дріл» (16 дизайнів dril1/dril2) чекає
відповідності дизайн→товар: товари в каталозі схожі є, але звірки принтів не
було — розширення mapping.json, коли власник підтвердить пари. Вініл/касета —
після появи геометрій (`vinyl.glb`, `cassette.glb`) у реєстрі.

## YAGNI

paymentMethod (викреслено остаточно); M:N товар↔колекції; сутність Artist
(поля артиста — коли реально знадобляться); Model3d-таблиця в БД; порядок
товарів drag&drop в адмінці (число вистачить).
