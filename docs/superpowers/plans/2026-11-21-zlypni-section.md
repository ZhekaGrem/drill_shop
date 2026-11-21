# Розділ «є. Злипні»: футболки й худі з фінальних комплектів — план імплементації

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Відкрити на ye-dril.com розділ «є. Злипні» з двома колекціями на продаж — «Футболляндручки» (5 футболок, 1300 грн) і «Боби» (3 худі, 2300 грн), S–XXL, — з готових комплектів у `../злипні дизайн /`. Лонгсліви (3 комплекти) — окремим рішенням пізніше.

**Architecture:** Той самий механізм, що в «є. \*\*\*» (`/prokliatyi`): приховані колекції в БД, своя сторінка `/zlypni` з героями `HomeHeroes`, своя словомарка в хедері, у каталозі й на головній товарів нема. Єдине джерело даних розділу — `src/shared/config/zlypni-merch.json`; `scripts/zlypni/import-kits.cjs` переносить із комплектів текстури, фото карток і оберти, `scripts/zlypni/create-collection.cjs` засіває БД фазами `seed-collections.cjs`. Прихована галерея `/zlypni/<ключ>` (200 старих дизайнів) лишається як є.

**Tech Stack:** Next.js 16 (App Router, FSD), sharp, scripts/lib/seed-collections.cjs (Prisma + Cloudinary з бекенда), 3d/pipeline/upload-turntables.mjs.

**Spec:** бриф власника «11-21 Завдання: UV-розгортки та запуск секції одягу «Є злипні»» (у чаті) + рішення 2026-11-21: «реалізуй футболки і худі, і будем думати про лонгсліви».

## Global Constraints

- Комплекти: `DRILL 2.0/злипні дизайн /<виріб>/дизайн N/` (назва теки з пробілом у кінці). Футболки — дизайни 7–11, худі — 1–3, лонгсліви — 4–6 (не беремо).
- Моделі сайту: `tshirt.glb` (mesh `T28 Oversized Tshirt`, 44818 вершин), `hoodie-3.glb` (`HoodieShape.002`, 35066). GLB у комплектах — та сама геометрія; текстура для сайту — `3D/текстура-4096.webp` (4096², WebP).
- Ціни: футболка **1300**, худі **2300**. Розміри **S, M, L, XL, XXL**. Залишок: **100 на кожен розмір** (прецедент «Радіо Цибуля» і «Злипні» 2026-11-16; бриф каже «100 на товар», розподіл не заданий — моє рішення, власник міняє одним числом у JSON або фазою `stock --qty`).
- Назви: розділ «Злипні» (хедер «є. Злипні», як було 2026-11-16), колекції **«Футболляндручки»** і **«Боби»** (написання з брифу, з великої як решта колекцій), назви товарів — із комплектів.
- Slug-и: колекції `zlypni-futbolliandruchky`, `zlypni-boby`; товари — внутрішні імена комплектів (`zlypni-t01-zhyve-teplo` … `zlypni-h03-tepla-chastota`). Старі `zlypni-futboliarchyky`/`zlypni-bobanochky` лишаються прихованими.
- Описи колекцій — чернетки виконавця в JSON; власник править до фази `create` (його ж `!`-команда).
- Прод-БД пише лише власник: по одній `!`-команді на повідомлення. Фронт деплоїться ПЕРЕД записом у БД (activate перевіряє асети на проді).
- Репозиторій публічний: ключ галереї в код і документи не потрапляє (лише хеш, як зараз).
- Код: FSD, `@/` аліаси, Prettier 110 символів, без Mantine-кольорів, компоненти до 150 рядків. Тестового раннера в репо нема — перевірка скриптами, `npm run lint`, `npx tsc --noEmit`, playwright.

## Review Focus

1. Комплект із чужою геометрією (інший mesh/кількість вершин) — `import-kits` має впасти, а не покласти текстуру, яка не ляже на модель. → Task 3, перевірка GLB.
2. Текстура чи оберт не в сайтовому форматі (не 4096², не 480×600×48) — скрипт зупиняється з назвою файлу. → Task 3.
3. Поки колекції в БД неактивні (між деплоєм фронта й `activate`), `/zlypni` показує «Розділ скоро відкриється», а не порожню сторінку чи помилку. → Task 2, перевірка в браузері до активації.
4. Галерея `/zlypni/<ключ>` після появи `/zlypni` і перейменування контент-блоку працює як раніше; голий `/zlypni` тепер розділ, не 404. → Task 2.
5. Повторний `create` не має вмикати товари і не міняє залишки (поведінка рушія) — у документації порядок фаз і попередження про старий магазин (shchilnuidrill.com бачить нові товари в каталозі). → Task 5.

---

### Task 1: Маніфест розділу і конфіг

**Files:**

- Create: `src/shared/config/zlypni-merch.json`
- Modify: `src/shared/config/zlypni.ts`
- Modify: `src/shared/config/hidden-collections.ts:20-46`
- Modify: `src/shared/config/content.ts:323-330`
- Modify: `src/widgets/ZlypniGallery/ZlypniGallery.tsx:13`, `src/widgets/ZlypniGallery/ZlypniShowcase.tsx:55,60`

**Interfaces:**

- Produces `zlypni-merch.json`:
  ```json
  {
    "sizes": ["S", "M", "L", "XL", "XXL"],
    "stockPerSize": 100,
    "collections": [
      { "slug": "zlypni-futbolliandruchky", "title": "Футболляндручки", "garment": "tshirt", "price": 1300,
        "description": "<чернетка>", "products": [
          { "slug": "zlypni-t01-zhyve-teplo", "name": "Живе тепло", "kit": "футболка/дизайн 7", "mapUrl": "" }, … t05 ] },
      { "slug": "zlypni-boby", "title": "Боби", "garment": "hoodie", "price": 2300, "description": "<чернетка>",
        "products": [ { "slug": "zlypni-h01-kvitnuty-razom", "name": "Квітнути разом", "kit": "худі/дизайн 1", "mapUrl": "" }, … h03 ] }
    ]
  }
  ```
  Відповідність комплектів: t01 Живе тепло — дизайн 7, t02 Лист на хвилі — 8, t03 Сонячне життя — 9, t04 Сад після дощу — 10, t05 Тепло своїх — 11; h01 Квітнути разом — 1, h02 Ніжний космос — 2, h03 Тепла частота — 3. `mapUrl` порожній — заповнює Task 3.
- Produces у `zlypni.ts`: `ZLYPNI_TITLE = 'Злипні'`, `ZLYPNI_HREF = '/zlypni'`, `ZLYPNI_SECTION_SLUGS: readonly string[]` (slug-и колекцій маніфесту в порядку показу), `ZLYPNI_RETIRED_SLUGS: readonly string[]` (колишній `ZLYPNI_COLLECTION_SLUGS` з gallery.json), решта (хеш ключа, типи галереї, `ZLYPNI_COLLECTIONS`) без змін.
- Produces у `content.ts`: `content.zlypni = { title: 'Злипні', description: 'Футболляндручки й боби від Злипнів із серії «Всім нашим»: кожен дизайн у 3D.', soon: 'Розділ скоро відкриється.' }`; блок галереї перейменовано на `content.zlypniGallery` (description, hint, designs — без змін тексту).

- [ ] **Step 1: Написати `zlypni-merch.json`** з даними вище. Описи-чернетки: «Футболляндручки від Злипнів із серії «Всім нашим»: п'ять теплих дизайнів, а на спині кожного — кого бережемо. Злипайся зі своїми.» і «Боби від Злипнів із серії «Всім нашим»: три худі з принтом на грудях, спині й рукавах, бірка під капюшоном. Тепло на всіх.»
- [ ] **Step 2: Переписати `zlypni.ts`**: шапка-коментар про розділ (продаж з 2026-11-21, галерея лишається), експорти з блоку Interfaces.
- [ ] **Step 3: `hidden-collections.ts`**: імпорт `ZLYPNI_RETIRED_SLUGS, ZLYPNI_SECTION_SLUGS, ZLYPNI_TITLE`; у `HIDDEN_COLLECTION_SLUGS` — `...ZLYPNI_SECTION_SLUGS, ...ZLYPNI_RETIRED_SLUGS`; у `HIDDEN_COLLECTION_WORDMARK` — `...Object.fromEntries(ZLYPNI_SECTION_SLUGS.map((slug) => [slug, ZLYPNI_TITLE]))`. Коментар над записом: розділ продається з 2026-11-21, старі колекції — лише галерея.
- [ ] **Step 4: `content.ts`**: додати блок `zlypni` (розділ) і перейменувати блок галереї на `zlypniGallery`; оновити три посилання в `ZlypniGallery.tsx` і `ZlypniShowcase.tsx`.
- [ ] **Step 5: Перевірити типи**: `npx tsc --noEmit` — Expected: без помилок.
- [ ] **Step 6: Commit** `git commit --no-verify -m "Add the Zlypni section manifest and config"` (лише свої файли).

### Task 2: Сторінка `/zlypni`, віджет героїв, світ хедера

**Files:**

- Create: `src/app/zlypni/page.tsx`, `src/app/zlypni/Zlypni.tsx`, `src/widgets/ZlypniSection/ZlypniSection.tsx`
- Modify: `src/shared/config/nav-worlds.ts:8,36-58`

**Interfaces:**

- Consumes: `ZLYPNI_SECTION_SLUGS`, `ZLYPNI_HREF`, `content.zlypni` (Task 1); `HomeHeroes({ collections, showAbout, intro })`; `useCollections()`; `PageHeader`, `Page`.
- Produces: `export const ZlypniSection = () => JSX` — як `NewMerchHeroes`, але колекції впорядковані за `ZLYPNI_SECTION_SLUGS` (`flatMap` по slug-ах), стан «скоро» при помилці або порожньому списку.

- [ ] **Step 1: `page.tsx`** за зразком `src/app/prokliatyi/page.tsx`: `revalidate = 86400`, metadata `title/description` з `content.zlypni`, canonical `https://www.ye-dril.com/zlypni`, рендерить `<Zlypni />`.
- [ ] **Step 2: `Zlypni.tsx`** (`'use client'`): `<Page><ZlypniSection /></Page>`.
- [ ] **Step 3: `ZlypniSection.tsx`** за блоком Interfaces (коментар: герої двох колекцій, як у «є. \*\*\*»; сітки нема — 5 і 3 дизайни видно з перемикача).
- [ ] **Step 4: `nav-worlds.ts`**: імпорт `ZLYPNI_HREF, ZLYPNI_SECTION_SLUGS` з `./zlypni`; у `NAV_WORLDS` після `prokliatyi` — `{ id: 'zlypni', wordmark: HIDDEN_COLLECTION_WORDMARK[ZLYPNI_SECTION_SLUGS[0]], href: ZLYPNI_HREF, navItems: seriesNav(ZLYPNI_HREF) }`.
- [ ] **Step 5: Lint і типи**: `npm run lint && npx tsc --noEmit && npx prettier --check src/app/zlypni src/widgets/ZlypniSection src/shared/config` — Expected: чисто.
- [ ] **Step 6: Перевірка в браузері** (dev `PORT=3100 ./node_modules/.bin/next dev`, playwright-core із `identica_codex/node_modules`): `/zlypni` → заголовок «Злипні» і текст «Розділ скоро відкриється» (колекцій у БД ще нема); хедер на `/zlypni` показує словомарку «Злипні»; `/zlypni/<ключ галереї, у власника>` → галерея з сіткою постерів, як раніше; `/zlypni/wrong` → «не знайдено». Expected: усі чотири так.
- [ ] **Step 7: Commit** `"Add the /zlypni section page and header world"`.

### Task 3: `import-kits.cjs` — текстури, фото карток, оберти з комплектів

**Files:**

- Create: `scripts/zlypni/import-kits.cjs`
- Modify: `src/shared/config/zlypni-merch.json` (поле `mapUrl` — пише скрипт)
- Output (git): `public/3d/textures/zlypni/<stem>.webp` ×8, де `stem` = slug без префікса `zlypni-` (`t01-zhyve-teplo`)
- Output (поза git, `3d/` в .gitignore): `3d/artists/zlypni/merch/catalog-images/<slug>-front.jpg|-back.jpg|-render3d.webp`, `3d/artists/zlypni/merch/turntables/<slug>.webp|<slug>-poster.webp`

**Interfaces:**

- Consumes: `zlypni-merch.json` (Task 1); комплект `<KITS>/<kit>/3D/{модель.glb, текстура-4096.webp, 3D-перед.png, 3D-спина.png}`, `<KITS>/<kit>/відео/{оберт.webp, постер.webp}`.
- Виклик: `node scripts/zlypni/import-kits.cjs [--kits="<тека комплектів>"] [--manifest=<json>]`, дефолти `path.resolve(FRONT, '../злипні дизайн ')` і `src/shared/config/zlypni-merch.json`.
- Produces: `mapUrl = '/3d/textures/zlypni/<stem>.webp?v=' + sha256(file).slice(0, 12)`, записаний у JSON (2 пробіли, `\n` у кінці).

- [ ] **Step 1: Написати скрипт.** Константи: `MESH = { tshirt: ['T28 Oversized Tshirt', 44818], hoodie: ['HoodieShape.002', 35066] }`. Функції: `glbMesh(file) → { name, vertices }` (читає заголовок GLB і JSON-чанк: `meshes[0].name`, сума `accessors[primitive.attributes.POSITION].count`); `expect(cond, message)` → throw. На кожен товар: перевірити mesh за `garment`; `sharp(texture).metadata()` → 4096×4096; оберт `metadata()` → 480×600, `pages === 48`; постер 480×600. Скопіювати текстуру, оберт і постер; `front/back` → `.flatten({ background: '#ffffff' }).resize(960, 1200).jpeg({ quality: 92 })`; `render3d` → перед у квадрат 1000² (`resize(1000, 1000, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })`) `.webp({ quality: 92 })`. Оновити `mapUrl`, записати JSON. У кінці вивести таблицю slug → розміри файлів.
- [ ] **Step 2: Запустити** `node scripts/zlypni/import-kits.cjs` — Expected: 8 рядків `OK`, без throw; у JSON усі `mapUrl` з `?v=`.
- [ ] **Step 3: Негативна перевірка**: тимчасова копія маніфесту, де `kit` першого товару замінено на `лонгслів/дизайн 4` (худі-геометрія в колекції футболок), запуск із `--manifest=<копія>`; Expected: падіння з повідомленням про mesh `HoodieShape.002` замість `T28 Oversized Tshirt`, файли не записані.
- [ ] **Step 4: Перевірити результат**: `find public/3d/textures/zlypni -maxdepth 1 -name '*.webp' | wc -l` → 8; `3d/artists/zlypni/merch/catalog-images` → 24 файли; `turntables` → 16.
- [ ] **Step 5: Commit** текстур, скрипта і JSON: `"Import the Zlypni kits: textures, card photos, turntables"`.

### Task 4: `create-collection.cjs` на маніфесті

**Files:**

- Modify (переписати): `scripts/zlypni/create-collection.cjs`

**Interfaces:**

- Consumes: `zlypni-merch.json` з заповненими `mapUrl` (Task 3); `run(config)` з `scripts/lib/seed-collections.cjs`.
- Produces config: `confirm: 'zlypni'`, `sizes: manifest.sizes`, `stockBySize: { S: 100, … }` з `stockPerSize`, `collections[i]`: `{ slug, title, description, sortOrder: 110 + i, price, model3dPath: garment === 'hoodie' ? '/3d/models/hoodie-3.glb' : null, products: [{ slug, name, swatch: '#080808', texture3dUrl: mapUrl }] }`.

- [ ] **Step 1: Переписати скрипт** (шапка: колекції розділу, порядок фаз; `catalog.json` більше не джерело — він лишається для галереї).
- [ ] **Step 2: План без БД**: `node scripts/zlypni/create-collection.cjs` — Expected: 2 колекції, 8 товарів, 40 варіантів; у футболок `model=tshirt.glb`, у худі `/3d/models/hoodie-3.glb`, `tex=/3d/textures/zlypni/…?v=…`.
- [ ] **Step 3: Перевірка БД (лише читання)**: `node scripts/zlypni/create-collection.cjs --phase=check` — Expected: `existingProducts: []`, `existingVariantSkus: 0`, усі `localAssets` `exists: true, gitTracked: true`.
- [ ] **Step 4: Commit** `"Seed the Zlypni section from the kit manifest"`.

### Task 5: Документація, памʼять, деплой фронта

**Files:**

- Modify: `docs/zlypni.md` (розділ «Продаж (вимкнено)» → «Розділ «є. Злипні» (продаж з 2026-11-21)» + лонгсліви; згадку `ZLYPNI_COLLECTION_SLUGS` замінити на `ZLYPNI_RETIRED_SLUGS`)
- Modify: `~/.claude/projects/-Users-bohdanlevkovych-development-DRILL-2-0/memory/zlypni-section.md`

- [ ] **Step 1: `docs/zlypni.md`**: де лежать комплекти, що в них є, маніфест, команди `import-kits → push v2 → create → images --dir=3d/artists/zlypni/merch/catalog-images → оберти (upload-turntables через копію в бекенді) → activate --probe → (stock --qty=N, якщо власник міняє залишки)`; лонгсліви: комплекти 4–6 на моделі худі, рішення відкладене; старий магазин бачить товари в каталозі.
- [ ] **Step 2: Памʼять**: розділ продається з 2026-11-21 з 8 товарів із комплектів; create-collection.cjs тепер маніфестний; лонгсліви відкладені.
- [ ] **Step 3: Push** `git push origin v2` (sandbox off, `GIT_SSH_COMMAND="ssh -o BatchMode=yes -o ConnectTimeout=15"`); дочекатись деплою Vercel: `curl -sI https://ye-dril.com/3d/textures/zlypni/t01-zhyve-teplo.webp` → 200 `image/webp`, `curl -s https://ye-dril.com/zlypni | grep -c "скоро"` → 1.

### Task 6: Запис у прод-БД (власник, по одній `!`-команді)

- [ ] **Step 1:** `cd drill_shop && node scripts/zlypni/create-collection.cjs --phase=create --apply --confirm=zlypni` — Expected: 8 × `✓ … (5 розміри)`.
- [ ] **Step 2:** `--phase=images --dir=3d/artists/zlypni/merch/catalog-images --apply --confirm=zlypni` — Expected: 8 × `↑ 960x1200 перед, 960x1200 спина`.
- [ ] **Step 3:** оберти: `cp 3d/pipeline/upload-turntables.mjs ../drill-shop-backend/scripts/.tmp-upload-turntables.mjs && (cd ../drill-shop-backend && node scripts/.tmp-upload-turntables.mjs ../drill_shop/3d/artists/zlypni/merch/turntables && rm scripts/.tmp-upload-turntables.mjs)` — Expected: `Готово: 8/8`.
- [ ] **Step 4:** `--phase=activate --probe=https://ye-dril.com --apply --confirm=zlypni` — Expected: гейт порожній, `isActive=true`.

### Task 7: Перевірка на проді й звіт

- [ ] **Step 1: API**: `GET /api/v1/products/zlypni-t01-zhyve-teplo` → 200, price 1300, 5 варіантів × 100; `GET /collections` містить обидві колекції з 5 і 3 товарами.
- [ ] **Step 2: Сайт** (playwright): `/zlypni` — два герої з перемикачем (5 і 3 дизайни), хедер «є. Злипні»; `/v2/a/zlypni-h01-kvitnuty-razom` — 3D худі з принтом, «2 300 грн», S–XXL; `/catalog` і `/` без товарів Злипнів; картка в «Інші колекції» крутиться (оберт).
- [ ] **Step 3: Звіт власнику** українською: що зроблено, які рішення мої (залишки, назви, описи), як змінити, лонгсліви — відкрите питання з варіантами.
