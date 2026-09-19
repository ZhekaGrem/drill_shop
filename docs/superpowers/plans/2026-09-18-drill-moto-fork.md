# «Дріл Мото», план A: форк гри `drill-moto` — план імплементації

<!-- prettier-ignore-start -->

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Публічний GPL-2.0 форк веб-порту Gravity Defied, який без асетів Codebrew (ні в дереві, ні в історії git), з нашими треками, тач-керуванням, DOM-меню українською і мостом до сайту збирається в самодостатню статичну теку `dist/`.

**Architecture:** Двигун порту (`GamePhysics`, `GameLevel`, `LevelLoader`, `GameCanvas`, `lcdui/*`, `rms/*`, `MathF16`) лишається як є, крім кількох точкових правок `GameCanvas.ts`. Точкою входу замість `app.ts` + `MenuManager.ts` стає оболонка `src/shell/` (самі файли upstream лишаються в репозиторії, але з `main.ts` недосяжні й у бандл не потрапляють): `engine.ts` збирає двигун, `RaceLoop.ts` веде цикл заїзду (перенесений із `app.ts`), `RaceSession.ts` тримає все, що живе під час заїзду (HUD, клавіатура, тач-кнопки), `GameShell.ts` — стан-машина DOM-екранів `screens/*`, `Progress.ts` — рекорди й відкриття, `pack.ts`/`config.ts`/`bridge.ts` — пак треків, параметри URL і `postMessage` до сайту, `mrg.ts`/`trackJson.ts` — кодек пака `.mrg` і наш JSON-формат треку з правилами геометрії двигуна.

**Tech Stack:** TypeScript 5.9, Vite 7, Canvas 2D, без runtime-залежностей; Node 24 для перевірочних скриптів (`.mjs`, що імпортують `.ts`: Node 24 стріпає типи, а tsconfig форку дозволяє лише такий синтаксис — `erasableSyntaxOnly`).

**Spec:** `docs/superpowers/specs/2026-09-18-drill-moto-game-design.md` (у репозиторії сайту `drill_shop`; план B — `2026-09-18-drill-moto-site.md`).

## Global Constraints

- Репозиторій форку: `/Users/bohdanlevkovych/Desktop/development/DRILL 2.0/drill-moto`, сусід `drill_shop`. Upstream: https://github.com/yurkagon/gravity-defied-web, гілка `main`; форк має власну історію від знімка upstream (без `.git`), коміт upstream закріплюється в `NOTICE.md`; довідковий клон upstream лежить у `../gd-upstream` і не пушиться. Ліцензія GPL-2.0 без змін (`LICENSE.md` з upstream).
- Цей план лежить у репозиторії сайту `drill_shop`, чий pre-commit хук робить `prettier --write .` по всьому робочому каталогу. Тіло плану обгорнуте маркерами `<!-- prettier-ignore-start -->` / `<!-- prettier-ignore-end -->`, інакше будь-який коміт сайту переписав би блоки коду (крапки з комою, відступи) і точні «заміни … на …» для `GameCanvas.ts`/`app.ts` перестали б збігатися з upstream. Маркери не прибирати.
- Усі команди плану, крім першого блоку Task 1 Step 1 (він сам робить `cd`), виконуються з кореня форку `/Users/bohdanlevkovych/Desktop/development/DRILL 2.0/drill-moto`; відносні шляхи `../gd-upstream` і `../drill_shop` — від нього. У середовищі агента cwd скидається між викликами, тож кожну команду починай з `cd "/Users/bohdanlevkovych/Desktop/development/DRILL 2.0/drill-moto" && …`.
- У репозиторій форку не потрапляє жоден файл Codebrew — ні в дерево, ні в жоден коміт, ні в обʼєкти git: `src/assets/levels.mrg`, `logo.png`, `splash.png`, `preview.gif`, оригінальні `helmet.png`, `engine.png`, `fender.png`, `bluearm.png`, `bluebody.png`, `blueleg.png`, `sprites.png`, `raster.png`. Оригінальний `levels.mrg` для калібрування лежить лише в довідковому клоні: `GD_ORIGINAL_MRG=../gd-upstream/src/assets/levels.mrg`.
- Двигун не редагується, крім: `GameCanvas.ts` — прибирання лого/сплешу (Task 1), хук палітри `colorMap` у `setColor`/`clearScreenWithWhite` і DPR у `resize`/`beginFrame` (Task 12); `app.ts` — імпорт дев-пака замість `levels.mrg` (Task 1); `main.ts` замінюється (Task 4). Решта файлів upstream (`app.ts`, `MenuManager.ts`, `GameMenu.ts`, `SettingsStringRender.ts`, `TextRender.ts`, `IGameMenuElement.ts`, `IMenuManager.ts`, `RecordManager.ts`, `index.css`, `rms/*`) лишається в репозиторії без змін: `TimerOrMotoPartOrMenuElem.ts` (спека забороняє його чіпати) імпортує типи з трьох із них, `GameMenu.ts` читає `micro.menuManager`, а Vite бандлить лише модулі, досяжні з `main.ts`, тож канвасні меню й RMS у `dist/` не потрапляють. Виняток — ризик спеки «Продуктивність на старих телефонах» (секція 6): якщо замір FPS на iPhone 11 / Android 2021 (план B, задача 6, кроки 3–4) нижчий за 58, BigInt у `src/cpp.ts` (`toInt`, `truncDiv`, `multiplyF16`, `divideF16`) і `src/GameCanvas.ts` замінюється на `Number` там, де значення вкладаються в 53 біти, — умовна Task 14 цього плану; після неї `node scripts/sim-track.mjs` мусить дати ті самі рядки, що в Task 3, Step 5. `cpp.ts` до спекового списку незмінних файлів не входить; `GamePhysics.ts`, `LevelLoader.ts` і решта того списку не чіпаються й тоді.
- Коди дій порту: `1` газ, `6` гальмо, `2` нахил назад, `5` нахил вперед, `8` підтвердження (без `MenuManager` канвас на нього не реагує; підтвердження в меню — нативна активація сфокусованої DOM-кнопки). Виклики: `gameCanvas.keyPressed(code)` / `keyReleased(code)`.
- Одиниці треку: точки — цілі числа в одиницях треку (1 одиниця = 1 px канвасу на базовому масштабі; **y росте вгору** — `GameCanvas.addDy` малює `-y + dy`). В оригінальному «Intro» 45 точок, x від −380 до 798, y від −55 до 139, старт (−49, 24) при землі 8,7 під ним, фініш (433, 0). У `.mrg` старт/фініш зберігаються як `одиниця × 8192` (`int32`, big endian), точки — перша абсолютно (`int32` x, y), далі дельти `int8 dx, int8 dy`; `dx = −1` (`0xFF`) означає, що далі абсолютні `int32 x, int32 y`. Маркер треку `0x33` (для `0x32` двигун пропускає ще 20 байт). Кількість точок `int16`. Назва — до 39 байт ASCII і `0x00`, `_` двигун показує пробілом. Правила геометрії, без яких двигун провалює байк, зависає або не зараховує фініш, живуть у `src/shell/trackJson.ts` (Task 3, Step 2) і перевіряються `scripts/sim-track.mjs` (Task 3, Step 5).
- Таймінги заїзду з порту (`app.ts`): зовнішній крок 30 мс, `numPhysicsLoops = 2`, `gameTimeMs += 20` на кожен виклик `updatePhysics()`, поки годинник іде (ігровий час іде 40 мс на 30 мс реального — як у порту); поки `updatePhysics()` повертає 4 (переднє колесо до стартового прапорця), годинник на нулі; фініш — код 1/2 (для 2 мінус 10 мс), далі goal-loop ≈1 с (33 кроки по 30 мс) без годинника. Падіння (код 3 або 5): upstream рестартує до 3 с після коду 3 і до 1 с після коду 5; у «Дріл Мото» за спекою рестарт рівно через 3 с від першого коду 3/5 з відліком 3…2…1 від `RaceLoop`. Усі відліки — у виконаних кроках, не в `Date.now()`: пауза й прихована вкладка їх зупиняють, довгий кадр обрізається до 100 мс.
- Секундомір — `м:сс.сс` (`formatTime`, `1:05.30`; спека, секція 2, «Заїзд», як `GameCanvas.drawTime` порту), єдиний формат у HUD, списках треків, на фініші й у рекордах.
- Ключ `localStorage`: `${ns}:progress:v1`; заїзди з `?debug&json=` пишуть окремо в `${ns}:json:progress:v1`. `ns` за замовчуванням `dril-moto`. Емуляцію RMS порту (`rms/*`) оболонка не викликає.
- Рядки оболонки лише в `src/shell/strings.uk.ts`. Назва гри «Дріл Мото». Слова «Gravity Defied» лише в екрані «Про гру» (як назва порту-джерела) і `NOTICE.md`.
- Кольори DOM-шару й канвасу — лише токени сайту (`src/shell/theme.css`, Task 11): з Task 6 `shell.css` пише кольори тільки як `var(--токен, #hex)` (до Task 11 діють фолбеки), канвас перефарбовує `GameCanvas.colorMap` (Task 12). Спрайти палітрою не перефарбовуються: кожен читається і на `#ffffff`, і на `#101413` (контраст ≥ 3:1).
- Бюджети (спека, секція 2): `dist/` ≤ 300 КБ gzip разом зі шрифтами; перший кадр гри (сплеш) — LCP документа гри ≤ 1,5 с у мобільному профілі Lighthouse за замовчуванням (міряє план B, задача 6: крок 1 — прогноз на dev-сервері до пушу, крок 6 — прод; план A досягає його сплешем-заглушкою в `index.html` з preload e-Ukraine Bold (Task 11) і міряє Lighthouse на `vite preview` (Task 11, Step 4; Task 13, Step 5)); 60 fps на iPhone 11 / середньому Android 2021 року (міряє план B, задача 6, кроки 3–4; нижче 58 fps — умовна Task 14).
- TypeScript форку (`tsconfig.app.json` upstream): `strict`, `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly` (жодних parameter properties, `enum`, `namespace`), `verbatimModuleSyntax` (типи — лише `import type`). Кожна задача закінчується чистими `npx tsc -b` і `npm run build`, з Task 4 — ще й `npm run lint` (до `eslint.config.js` з Task 4 upstream дає 20 помилок лінту в коді двигуна).
- Коміти англійським префіксом і українським підметом, як у сайті; кожен коміт закінчується `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`. Пушить власник.
- Тестового раннера нема: чисті модулі перевіряються `node scripts/check-*.mjs`, прохідність треків — `node scripts/sim-track.mjs` (водії ai, «лише газ», бот і планувальник), UI — руками в браузері за кроками задач.
- Середовище агента: `npm install --cache "$TMPDIR/npm-cache"` (кеш `~/.npm` у пісочниці недоступний на запис), так само `npm uninstall … --cache "$TMPDIR/npm-cache"`; `git clone` і npm потребують мережі до `github.com` і `registry.npmjs.org` (`allowed_domains`); `npm run dev`/`vite preview` і `curl localhost` працюють лише з вимкненою пісочницею. Node 24.2 друкує `ExperimentalWarning: Type Stripping…` для check-скриптів — це не помилка (`node --no-warnings` прибирає).
- Свідоме відхилення від тексту спеки одне: сплеш поки текстовий («Дріл Мото» шрифтом e-Ukraine Bold), доки дизайнер не віддасть лого-кадр (спека, секція 2, «Потік екранів», п. 1). Той самий заголовок стоїть в `index.html` як сплеш-заглушка першого кадру (Task 11): браузер малює її до модуля гри, тож разом із `<title>` це єдиний рядок інтерфейсу поза `strings.uk.ts` (секція 2, «Локалізація»); без заглушки LCP документа гри ≈ 1,8 с замість ≤ 1,5 с (секція 2, «Бюджети»). Решта колишніх пунктів цього списку тепер записана у виправленій спеці (2026-09-19): історія форку від знімка `git archive` без історії upstream (секція 1); RMS без нового префікса, «Скинути прогрес» стирає лише `${ns}:progress:v1` (секція 2); DPR і палітра — правками `GameCanvas.ts`, `lcdui/Graphics.ts` без змін (секція 1); правила двигуна в `parseTrackJson` — старт на 15–30 одиниць над землею, обидва колеса ≥ 7 від ламаної, ≥ 40 одиниць ламаної до `start.x`, ≥ 2 точки між стартом і фінішем, ≥ 150 після `finish.x` (секція 4); внутрішні правила сайту (старт 16–20, ≥ 150 до старту) перевіряє лише скрипт сайту (план B), а приклад JSON секції 4 спеки `parseTrackJson` приймає і `sim-track` проходить; шини й полотнища прапорців — спрайти `sprites.png`, токеном фарбуються лише спиці, дуга над колесом, маточини й древка, `raster.png` у заїзді не малюється (секція 5); до першого кадру меню — лише ваги e-Ukraine 700 і 500, «решта довантажується після» (секція 2, «Локалізація»): Regular (400) — одразу після першого кадру, а Light (300) у бандлі є, але жоден стиль оболонки його не вживає, тож браузер його не запитує.

---

## Структура файлів форку після плану

| Файл | Дія | Відповідальність |
| ---- | --- | ---------------- |
| `NOTICE.md`, `CHANGELOG.md`, `README.md` | новий/зміна | походження, коміт upstream, кредит шрифту, перелік змін, як зібрати |
| `vite.config.ts`, `index.html`, `package.json`, `eslint.config.js` | зміна | `base: './'`, `appType: 'mpa'`, версія, наш title, тема й сплеш-заглушка до першого кадру, назва пакета, скрипти, лінт двигуна |
| `src/shell/mrg.ts` | новий | `encodeMrg`, `decodeMrg`, типи `MrgPack`/`MrgTrack` |
| `src/shell/trackJson.ts` | новий | JSON треку/пака → `MrgPack`, правила геометрії двигуна |
| `scripts/png.mjs` | новий | мінімальний PNG-енкодер для скриптів |
| `scripts/sprite-layout.mjs` | новий | розкладка спрайтів, яку ріже двигун (кадри, кути, `sprites.png`) |
| `scripts/make-placeholder-sprites.mjs` | новий | плейсхолдери спрайтів тих самих розмірів |
| `scripts/make-sprite-template.mjs` | новий | шаблони для дизайнера + `docs/sprites.md` |
| `scripts/build-dev-pack.mjs` | новий | `tracks/dev/*.json` → `src/assets/dev-pack.mrg` |
| `scripts/sim-track.mjs` | новий | безголовий прогін треків на фізиці двигуна (ai, газ, бот, планувальник) |
| `scripts/check-mrg.mjs`, `scripts/check-progress.mjs`, `scripts/check-palette.mjs` | новий | перевірки чистих модулів |
| `tracks/dev/01-lanka.json`, `02-hirka.json`, `03-yama.json` | новий | дев-треки |
| `src/shell/engine.ts` | новий | збирає `Micro`, `GameCanvas`, `GamePhysics`, `LevelLoader` |
| `src/shell/RaceLoop.ts` | новий | цикл заїзду з `app.ts` без меню, пауза, відлік падіння, події |
| `src/shell/keyboard.ts` | новий | стрілки → коди дій, Escape → пауза, відпускання на blur |
| `src/shell/RaceSession.ts` | новий | усе, що живе під час заїзду: RaceLoop, HUD, тач-шар, клавіатура, тап-рестарт, пауза при прихованій вкладці, вібрація, FPS |
| `src/shell/Progress.ts` | новий | рекорди, відкриття, скидання (чистий модуль + обгортки `localStorage`) |
| `src/shell/strings.uk.ts` | новий | усі рядки |
| `src/shell/screens/dom.ts`, `RaceHud.ts` | новий | DOM-помічники й базовий `Screen`, HUD заїзду |
| `src/shell/screens/*Screen.ts` | новий | DOM-екрани: splash, main, leagues, tracks, pause, finish, records, about |
| `src/shell/screens/menus.ts` | новий | збирає DOM-екрани меню в одну мапу для `GameShell` |
| `src/shell/TouchControls.ts` | новий | тач-кнопки → коди дій |
| `src/shell/config.ts`, `src/shell/bridge.ts`, `src/shell/pack.ts` | новий | параметри URL, `postMessage`, пак треків і індекс назв |
| `src/shell/FpsMeter.ts` | новий | FPS у HUD для `?debug` |
| `src/shell/palette.ts` | новий | ролі кольорів порту → токени теми |
| `src/shell/theme.css`, `src/shell/shell.css` | новий | токени сайту (копія) і шрифт, стилі DOM-шару |
| `src/shell/GameShell.ts` | новий | стан-машина екранів, склеює все |
| `src/main.ts`, `src/vite-env.d.ts` | зміна/новий | стартує `GameShell`; тип `VITE_APP_VERSION` |
| `src/GameCanvas.ts` | зміна | без лого/сплешу, `colorMap`, DPR |
| `src/assets/*.png`, `src/assets/dev-pack.mrg` | зміна/новий | плейсхолдери спрайтів, дев-пак |
| `public/fonts/e-ukraine/e-Ukraine-{Light,Regular,Medium,Bold}.woff2` | новий | шрифти з `drill_shop/public/fonts/e-ukraine/` |
| `public/LICENSE.txt`, `public/NOTICE.txt` | новий | копії для бандла |
| `docs/sprites.md`, `docs/sprite-templates/*@8x.png` | новий | вимоги до спрайтів для дизайнера |
| `.github/workflows/release.yml` | новий | тег → перевірки, збірка, GitHub Release з `dist.zip` |
| `src/cpp.ts`, `scripts/check-cpp.mjs` | зміна/новий (лише умовна Task 14) | int32-арифметика без `BigInt` із тими самими результатами; перевірка проти BigInt-еталона upstream |

---


### Task 1: Форк без асетів Codebrew, кодек `.mrg`, дев-пак

**Files:**

- Create: довідковий клон `../gd-upstream`; репозиторій `../drill-moto` (знімок upstream + `git init`); `NOTICE.md`, `CHANGELOG.md`
- Create: `scripts/png.mjs`, `scripts/sprite-layout.mjs`, `scripts/make-placeholder-sprites.mjs`, `scripts/check-mrg.mjs`, `scripts/build-dev-pack.mjs`
- Create: `src/shell/mrg.ts`, `tracks/dev/01-lanka.json`, `tracks/dev/02-hirka.json`, `tracks/dev/03-yama.json`, `src/assets/dev-pack.mrg` (генерується)
- Delete (до першого коміту): `src/assets/levels.mrg`, `src/assets/logo.png`, `src/assets/splash.png`, `src/assets/react.svg`, `preview.gif`, `public/vite.svg` (логотип шаблону Vite, ніде не використовується), `public/.nojekyll` (маркер GitHub Pages для видаленого в Step 2 скрипта `deploy`)
- Modify: `src/assets/{helmet,engine,fender,bluearm,bluebody,blueleg,sprites,raster}.png` (перезаписуються плейсхолдерами), `src/app.ts` (імпорт пака), `src/GameCanvas.ts` (лого/сплеш), `vite.config.ts`, `index.html`, `package.json`, `package-lock.json`

**Interfaces:**

- Produces: `encodeMrg(pack: MrgPack): ArrayBuffer` (кидає помилку, якщо назва не ASCII або довша за 39 символів), `decodeMrg(buffer: ArrayBuffer): MrgPack`, `interface MrgTrack { name: string; start: [number, number]; finish: [number, number]; points: [number, number][] }`, `interface MrgPack { leagues: [MrgTrack[], MrgTrack[], MrgTrack[]] }`, `START_SCALE = 8192`; `scripts/check-mrg.mjs` з помічником `check(name, fn)` і блоком калібрування на `intro` (правила JSON-треку в нього дописує Task 3).
- Produces для Task 2: `scripts/png.mjs` — `createCanvas(width, height)`, `setPixel(c, x, y, [r, g, b, a?])`, `fillRect(c, x, y, w, h, color)`, `encodePng(c): Buffer`, `drawLine(c, x0, y0, x1, y1, color)`, `strokeRect(c, x, y, w, h, color)`; `scripts/sprite-layout.mjs` — `STEP_DEG`, `SHEETS: { file, width, height, cols, rows, used, kind: 'turn' | 'limb', levelFrame?, what }[]`, `frameDirection(sheet, i): [number, number]`, `SPRITES_PNG`, `SPRITES: { no, x, y, w, h, race, what }[]`, `RASTER_PNG`.
- Produces: файл `src/assets/dev-pack.mrg` (3 ліги: Lanka, Hirka, Yama в першій, по копії «Lanka» у другій і третій), який їсть незмінений `LevelLoader` (на нього спираються Task 3, 4, 6, 7 і дев-фолбек `pack.ts` у Task 10); `tracks/dev/*.json`; `scripts/build-dev-pack.mjs` (через `parseTrackJson` його переводить Task 3); npm-скрипти `check` (= `node scripts/check-mrg.mjs`), `dev-pack`, `sprites:placeholder`.

- [ ] **Step 1: Довідковий клон upstream і чиста історія форку**

```bash
cd "/Users/bohdanlevkovych/Desktop/development/DRILL 2.0"
# Довідковий клон upstream поза форком: калібрувальний levels.mrg ($GD_ORIGINAL_MRG)
# і джерело для ручного перенесення оновлень. Ніколи не пушиться.
git clone https://github.com/yurkagon/gravity-defied-web.git gd-upstream
git -C gd-upstream checkout -q 889a0914da5fd40405190907e493fc6be72c38a2  # коміт, на якому звірено всі правки й очікувані виводи плану
UP=$(git -C gd-upstream rev-parse HEAD); echo "upstream commit: $UP"
# Форк стартує з чистої історії: знімок файлів upstream без .git, тож жоден блоб
# Codebrew не потрапить у жоден коміт форку (перший коміт — Step 9, уже без них).
mkdir drill-moto
git -C gd-upstream archive "$UP" | tar -x -C drill-moto
cd drill-moto
git init -b main
# пісочниця агента: allowed_domains github.com (clone) і registry.npmjs.org (npm)
npm install --cache "$TMPDIR/npm-cache"
npm run build && echo "upstream build ok"
```

Expected: `upstream commit: 889a0914da5fd40405190907e493fc6be72c38a2`; `dist/` зібрано без помилок (в `dist/assets/` ще лежить `levels-*.mrg` — він зникне в Step 4), останній рядок `upstream build ok`. Оновлення upstream надалі переносяться руками, як каже спека: `git -C ../gd-upstream fetch && git -C ../gd-upstream diff $UP origin/main -- src ':!src/assets' > "$TMPDIR/up.patch" && git apply --3way "$TMPDIR/up.patch"`. Калібрування в наступних кроках: `GD_ORIGINAL_MRG=../gd-upstream/src/assets/levels.mrg`.

- [ ] **Step 2: `NOTICE.md`, `CHANGELOG.md`, `package.json`, `index.html`, `vite.config.ts`**

`NOTICE.md`:

```markdown
# NOTICE

Цей репозиторій — форк **gravity-defied-web** (https://github.com/yurkagon/gravity-defied-web),
веб-порту класичної мототріал-гри 2004 року, ліцензія GNU GPL-2.0 (див. LICENSE.md).
Автор gravity-defied-web: Yurii Khvyshchuk (https://github.com/yurkagon).
Точка форку: upstream коміт `<UP>` (гілка main). Історія форку починається зі знімка
файлів цього коміту без історії upstream; оновлення upstream переносяться руками.

Порт, у свою чергу, походить від C++-порту https://github.com/rgimad/gravity_defied_cpp
(rgimad і контриб'ютори) — перекладу декомпільованого J2ME-коду.

Гра «Дріл Мото» не повʼязана з Codebrew Software. Усі права на оригінальну
Gravity Defied, її назву, логотип і бренд належать Codebrew Software. У цьому
репозиторії немає файлів Codebrew: оригінальні треки (levels.mrg), спрайти,
логотип і сплеш не потрапили в жоден коміт форку; треки, графіка й назва — наші.

Зміни відносно upstream перелічені в CHANGELOG.md.
```

`CHANGELOG.md`:

```markdown
# Changelog

## Unreleased

- Форк від upstream `<UP>` без асетів Codebrew (levels.mrg, logo, splash, спрайти байка);
  плейсхолдери спрайтів тих самих розмірів;
  енкодер/декодер `.mrg`; дев-пак із JSON-треків.
```

Підстав коміт upstream і онови `package.json` (скрипти `sprites:template` і `sim` додадуть Task 2 і Task 3):

```bash
UP=$(git -C ../gd-upstream rev-parse HEAD)
sed -i '' "s/<UP>/$UP/" NOTICE.md CHANGELOG.md
grep -c "$UP" NOTICE.md CHANGELOG.md
npm pkg set name=drill-moto version=0.1.0 \
  scripts.check="node scripts/check-mrg.mjs" \
  scripts.dev-pack="node scripts/build-dev-pack.mjs" \
  scripts.sprites:placeholder="node scripts/make-placeholder-sprites.mjs"
npm pkg delete keywords scripts.build:gh-pages scripts.deploy
npm uninstall cross-env --cache "$TMPDIR/npm-cache"
npm pkg get name version keywords
```

Expected: `NOTICE.md:1`, `CHANGELOG.md:1`; останній вивід — JSON лише з `"name": "drill-moto"` і `"version": "0.1.0"` (ключа `keywords` із `gravity-defied` більше нема); `cross-env` зник із `devDependencies` і `package-lock.json` (його вживав лише `build:gh-pages`).

`index.html` повністю:

```html
<!doctype html>
<html lang="uk">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="description" content="Дріл Мото — мототріал у браузері" />
    <title>Дріл Мото</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

`vite.config.ts` повністю:

```ts
import { defineConfig } from 'vite'

// base './' — бандл живе під /moto/ на сайті, усі шляхи відносні
export default defineConfig({
  base: './',
  server: { port: 3100 },
})
```

- [ ] **Step 3: PNG-енкодер для скриптів (без залежностей)**

`scripts/png.mjs`:

```js
// scripts/png.mjs — мінімальний енкодер PNG (RGBA, без фільтрів) для скриптів,
// що генерують плейсхолдери й шаблони спрайтів. Залежностей у проєкті нема,
// тому zlib з node і власний CRC32.
import { deflateSync } from 'node:zlib'

const CRC_TABLE = new Uint32Array(256).map((_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

const crc32 = (buf) => {
  let c = 0xffffffff
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

const chunk = (type, data) => {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(typeAndData))
  return Buffer.concat([len, typeAndData, crc])
}

/** Створює полотно width×height (RGBA), заповнене прозорим. */
export const createCanvas = (width, height) => ({ width, height, data: Buffer.alloc(width * height * 4) })

export const setPixel = (c, x, y, [r, g, b, a = 255]) => {
  if (x < 0 || y < 0 || x >= c.width || y >= c.height) return
  const i = (y * c.width + x) * 4
  c.data[i] = r
  c.data[i + 1] = g
  c.data[i + 2] = b
  c.data[i + 3] = a
}

export const fillRect = (c, x, y, w, h, color) => {
  for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) setPixel(c, xx, yy, color)
}

export const encodePng = (c) => {
  const raw = Buffer.alloc((c.width * 4 + 1) * c.height)
  for (let y = 0; y < c.height; y++) {
    raw[y * (c.width * 4 + 1)] = 0 // фільтр None
    c.data.copy(raw, y * (c.width * 4 + 1) + 1, y * c.width * 4, (y + 1) * c.width * 4)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(c.width, 0)
  ihdr.writeUInt32BE(c.height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

/** Лінія Брезенгема від (x0, y0) до (x1, y1) включно; координати округлюються. */
export const drawLine = (c, x0, y0, x1, y1, color) => {
  let x = Math.round(x0)
  let y = Math.round(y0)
  const xEnd = Math.round(x1)
  const yEnd = Math.round(y1)
  const dx = Math.abs(xEnd - x)
  const dy = -Math.abs(yEnd - y)
  const sx = x < xEnd ? 1 : -1
  const sy = y < yEnd ? 1 : -1
  let err = dx + dy
  for (;;) {
    setPixel(c, x, y, color)
    if (x === xEnd && y === yEnd) return
    const e2 = 2 * err
    if (e2 >= dy) {
      err += dy
      x += sx
    }
    if (e2 <= dx) {
      err += dx
      y += sy
    }
  }
}

/** Рамка 1px по периметру прямокутника. */
export const strokeRect = (c, x, y, w, h, color) => {
  fillRect(c, x, y, w, 1, color)
  fillRect(c, x, y + h - 1, w, 1, color)
  fillRect(c, x, y, 1, h, color)
  fillRect(c, x + w - 1, y, 1, h, color)
}
```

- [ ] **Step 4: Розкладка спрайтів, плейсхолдери, прибирання файлів Codebrew**

Двигун ріже спрайти кодом: розмір кадру аркуша = розмір файлу / сітка, прямокутники `sprites.png` зашиті в `GameCanvas.spriteOffsetX/Y`, `spriteSizeX/Y`. Тому плейсхолдери мають ті самі розміри, а розкладку, з якої їх малюємо (і з якої Task 2 зробить шаблони для дизайнера), описує один модуль.

`scripts/sprite-layout.mjs`:

```js
// scripts/sprite-layout.mjs — розкладка спрайтів, яку двигун порту ріже кодом.
// Джерело правди — src/GameCanvas.ts:
//  - аркуші з кадрами: розмір кадру = розмір файлу / сітка (конструктор і
//    loadSprites), кадр n лежить у колонці n % 6 і рядку floor(n / 6), номер кадру
//    дає calcSpriteNo(кут, offset, range, count, flip): рука/нога/тулуб —
//    renderBodyPart, шолом — drawHelmet, двигун — renderEngine, крило — renderFender;
//  - sprites.png: статичні масиви spriteOffsetX/Y (лівий верхній кут у файлі) і
//    spriteSizeX/Y (розмір).
// Розміри файлів міняти не можна: розкладка sprites.png зашита в код, а кадри
// аркушів рахуються з розміру файлу.

export const STEP_DEG = 11.25

/**
 * kind 'turn' — деталь повертається разом із байком: кадр i = поза «байк стоїть
 * рівно», повернута проти годинникової стрілки на (i − levelFrame) × 11,25°;
 * 32 кадри — повне коло. kind 'limb' — сегмент тіла вершника: кадр i = сегмент,
 * повернутий за годинниковою стрілкою від вертикалі на i × 11,25° (0 — вертикально,
 * 8 — горизонтально); 16 кадрів — пів кола, сегмент і його розворот на 180°
 * беруть той самий кадр. Кадр покриває один крок 11,25° поруч зі своїм кутом:
 * рівний байк у шолома лягає на межу кадрів 31/0, у двигуна — на кадр 0, у крила —
 * на кадр 1 (перевірено розрахунком calcSpriteNo для стартової пози байка).
 */
export const SHEETS = [
  { file: 'helmet.png', width: 48, height: 48, cols: 6, rows: 6, used: 32, kind: 'turn', levelFrame: 0, what: 'шолом вершника' },
  { file: 'engine.png', width: 120, height: 120, cols: 6, rows: 6, used: 32, kind: 'turn', levelFrame: 0, what: 'рама й двигун байка' },
  { file: 'fender.png', width: 108, height: 108, cols: 6, rows: 6, used: 32, kind: 'turn', levelFrame: 1, what: 'заднє крило' },
  { file: 'bluearm.png', width: 48, height: 24, cols: 6, rows: 3, used: 16, kind: 'limb', what: 'рука' },
  { file: 'blueleg.png', width: 72, height: 36, cols: 6, rows: 3, used: 16, kind: 'limb', what: 'нога (стегно й гомілка — той самий аркуш)' },
  { file: 'bluebody.png', width: 60, height: 30, cols: 6, rows: 3, used: 16, kind: 'limb', what: 'тулуб (одяг вершника — Дріл-мерч)' },
]

/** Напрям «вперед» деталі в кадрі i на екрані (x праворуч, y донизу), одиничний вектор. */
export const frameDirection = (sheet, i) => {
  if (sheet.kind === 'turn') {
    const a = ((i - sheet.levelFrame) * STEP_DEG * Math.PI) / 180
    return [Math.cos(a), -Math.sin(a)]
  }
  const a = (i * STEP_DEG * Math.PI) / 180
  return [Math.sin(a), -Math.cos(a)]
}

export const SPRITES_PNG = { file: 'sprites.png', width: 49, height: 40 }

// race: чи малює спрайт заїзд «Дріл Мото». Канвасні меню порту (MenuManager) і
// екран завантаження з лого з main.ts недосяжні, тож їхні спрайти не малюються.
export const SPRITES = [
  { no: 0, x: 0, y: 10, w: 15, h: 15, race: true, what: 'тонка шина: ліга 0 — обидва колеса, ліга 1 — переднє' },
  { no: 1, x: 0, y: 25, w: 15, h: 15, race: true, what: 'товста шина: ліга 1 — заднє колесо, ліги 2–3 — обидва' },
  { no: 2, x: 15, y: 16, w: 8, h: 4, race: false, what: 'стрілка прокрутки канвасного меню вгору' },
  { no: 3, x: 15, y: 20, w: 8, h: 4, race: false, what: 'стрілка прокрутки канвасного меню вниз' },
  { no: 4, x: 15, y: 10, w: 3, h: 3, race: true, what: 'точка-шарнір вершника (дві на кадр)' },
  { no: 5, x: 0, y: 0, w: 6, h: 10, race: false, what: 'медаль 1-го місця (канвасні рекорди)' },
  { no: 6, x: 6, y: 0, w: 6, h: 10, race: false, what: 'медаль 2-го місця' },
  { no: 7, x: 12, y: 0, w: 6, h: 10, race: false, what: 'медаль 3-го місця' },
  { no: 8, x: 18, y: 8, w: 7, h: 8, race: false, what: 'закритий замок у канвасному меню' },
  { no: 9, x: 18, y: 0, w: 7, h: 8, race: false, what: 'відкритий замок у канвасному меню' },
  { no: 10, x: 25, y: 0, w: 12, h: 6, race: true, what: 'прапор старту, кадр A (цикл 12 → 10 → 11 → 10)' },
  { no: 11, x: 25, y: 6, w: 12, h: 6, race: true, what: 'прапор старту, кадр B' },
  { no: 12, x: 25, y: 12, w: 12, h: 6, race: true, what: 'прапор старту, кадр C' },
  { no: 13, x: 37, y: 0, w: 12, h: 6, race: true, what: 'прапор фінішу, кадр A (цикл 14 → 13 → 15 → 13)' },
  { no: 14, x: 37, y: 6, w: 12, h: 6, race: true, what: 'прапор фінішу, кадр B' },
  { no: 15, x: 37, y: 12, w: 12, h: 6, race: true, what: 'прапор фінішу, кадр C' },
  { no: 16, x: 15, y: 29, w: 16, h: 11, race: false, what: 'НЕ МАЛЮВАТИ: місце лого Codebrew на екрані завантаження, лишити прозорим' },
  { no: 17, x: 32, y: 18, w: 17, h: 22, race: false, what: 'НЕ МАЛЮВАТИ: місце лого Codebrew на екрані завантаження, лишити прозорим' },
]

// raster.png малює лише MenuManager.fillCanvasWithImage: тайл поверх гри під
// канвасними меню. Заїзд і DOM-меню його не використовують.
export const RASTER_PNG = { file: 'raster.png', width: 64, height: 64 }
```

`scripts/make-placeholder-sprites.mjs`:

```js
// scripts/make-placeholder-sprites.mjs — тимчасові спрайти замість файлів Codebrew.
// Ті самі розміри й розкладка, що ріже двигун (scripts/sprite-layout.mjs). У кожному
// вжитому кадрі аркуша — промінь «вперед», повернутий за правилом кадру, тож на
// екрані видно, що кадри повертаються разом із байком. Фон прозорий, як в оригіналах:
// непрозорий фон закрив би лінії треку за байком. Кольори деталей, шин і прапорів —
// середні тони з контрастом ≥ 3:1 і до #ffffff (світла тема), і до #101413 (темна):
// спрайти палітрою теми не перефарбовуються.
// Запуск: node scripts/make-placeholder-sprites.mjs
import { writeFileSync } from 'node:fs'
import { createCanvas, drawLine, encodePng, fillRect, setPixel, strokeRect } from './png.mjs'
import { RASTER_PNG, SHEETS, SPRITES, SPRITES_PNG, frameDirection } from './sprite-layout.mjs'

const COLORS = {
  'helmet.png': [240, 60, 60],
  'engine.png': [110, 110, 110],
  'fender.png': [140, 140, 140],
  'bluearm.png': [50, 110, 220],
  'blueleg.png': [50, 110, 220],
  'bluebody.png': [60, 140, 100],
}
const BLACK = [0, 0, 0]
const WHITE = [255, 255, 255]
const GREY = [128, 128, 128] // шини й шарнір: 3,95:1 на білому, 4,7:1 на #101413
const GREEN = [40, 160, 70]

const save = (file, canvas) => {
  writeFileSync(new URL(`../src/assets/${file}`, import.meta.url), encodePng(canvas))
  console.log('ok -', file, `${canvas.width}x${canvas.height}`)
}

const disk = (c, cx, cy, r, color) => {
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) setPixel(c, x, y, color)
    }
  }
}

const ring = (c, cx, cy, r, width, color) => {
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      const d = Math.hypot(x - cx, y - cy)
      if (d <= r && d > r - width) setPixel(c, x, y, color)
    }
  }
}

for (const sheet of SHEETS) {
  const c = createCanvas(sheet.width, sheet.height)
  const fw = sheet.width / sheet.cols
  const fh = sheet.height / sheet.rows
  const color = COLORS[sheet.file]
  for (let i = 0; i < sheet.used; i++) {
    const cx = (i % sheet.cols) * fw + (fw - 1) / 2
    const cy = Math.floor(i / sheet.cols) * fh + (fh - 1) / 2
    const r = Math.min(fw, fh) / 2 - 1
    const [dx, dy] = frameDirection(sheet, i)
    if (sheet.kind === 'turn') {
      disk(c, cx, cy, r * 0.45, color)
      drawLine(c, cx, cy, cx + dx * r, cy + dy * r, color)
      setPixel(c, Math.round(cx + dx * r), Math.round(cy + dy * r), WHITE)
    } else {
      drawLine(c, cx - dx * r, cy - dy * r, cx + dx * r, cy + dy * r, color)
      drawLine(c, cx - dx * r + 1, cy - dy * r, cx + dx * r + 1, cy + dy * r, color)
    }
  }
  save(sheet.file, c)
}

{
  const c = createCanvas(SPRITES_PNG.width, SPRITES_PNG.height)
  const at = (no) => SPRITES.find((s) => s.no === no)
  for (const no of [0, 1]) {
    const s = at(no)
    ring(c, s.x + (s.w - 1) / 2, s.y + (s.h - 1) / 2, s.w / 2, no === 0 ? 1.5 : 2.5, GREY)
  }
  for (const no of [2, 3]) {
    const s = at(no)
    for (let row = 0; row < s.h; row++) {
      const half = no === 2 ? row + 1 : s.h - row
      fillRect(c, s.x + s.w / 2 - half, s.y + row, half * 2, 1, BLACK)
    }
  }
  fillRect(c, at(4).x, at(4).y, 3, 3, GREY)
  const medals = { 5: [230, 190, 40], 6: [190, 190, 200], 7: [190, 120, 60] }
  for (const [no, medal] of Object.entries(medals)) {
    const s = at(Number(no))
    fillRect(c, s.x + 1, s.y + 4, s.w - 2, s.h - 4, medal)
    fillRect(c, s.x + 2, s.y, 2, 4, [200, 40, 40])
  }
  for (const no of [8, 9]) {
    const s = at(no)
    strokeRect(c, s.x + 1, s.y, s.w - 2, 4, BLACK)
    fillRect(c, s.x, s.y + 3, s.w, s.h - 3, no === 8 ? BLACK : [230, 190, 40])
  }
  // прапори: колонка 0 лягає на стовпчик, який малює код; тканина праворуч
  for (const [frame, no] of [10, 11, 12].entries()) {
    const s = at(no)
    fillRect(c, s.x + 1, s.y + (frame % 2), s.w - 1 - frame, s.h - 1, GREEN)
  }
  for (const [frame, no] of [13, 14, 15].entries()) {
    const s = at(no)
    for (let y = 0; y < s.h - 1; y++) {
      for (let x = 1; x < s.w - frame; x++) {
        setPixel(c, s.x + x, s.y + y + (frame % 2), (Math.floor(x / 2) + Math.floor(y / 2)) % 2 ? WHITE : BLACK)
      }
    }
  }
  // 16 і 17 лишаються прозорими: це місце лого Codebrew, двигун його не малює
  save(SPRITES_PNG.file, c)
}

{
  // тайл під канвасними меню порту (MenuManager): 50% сітка світло-сірого
  const c = createCanvas(RASTER_PNG.width, RASTER_PNG.height)
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) if ((x + y) % 2 === 0) setPixel(c, x, y, [236, 236, 236])
  }
  save(RASTER_PNG.file, c)
}
```

Run: `node scripts/make-placeholder-sprites.mjs`
Expected:

```
ok - helmet.png 48x48
ok - engine.png 120x120
ok - fender.png 108x108
ok - bluearm.png 48x24
ok - blueleg.png 72x36
ok - bluebody.png 60x30
ok - sprites.png 49x40
ok - raster.png 64x64
```

Видали файли Codebrew (у форку ще немає жодного коміту, тож досить видалити їх із диска):

```bash
rm -f src/assets/levels.mrg src/assets/logo.png src/assets/splash.png src/assets/react.svg preview.gif public/vite.svg public/.nojekyll
ls src/assets
ls -A public
```

Expected: `bluearm.png bluebody.png blueleg.png engine.png fender.png helmet.png raster.png sprites.png`; `ls -A public` нічого не друкує. Тека `public/` тепер порожня (разом із маркером GitHub Pages `.nojekyll`): план B копіює на сайт усе з `dist/`, крім `tracks/`; шрифти туди кладе Task 11, ліцензію — Task 13.

У `src/GameCanvas.ts` прибери лого й сплеш Codebrew. Поля `splashImage`/`logoImage` уже `Image | null` і лишаються; `drawGame` перевіряє їх на `null`, тож екран завантаження малюється без картинок і без спрайтів 16/17. `tsc` відсутній файл `?url` не помітить (`vite/client` оголошує модуль `*?url`), помилку дасть лише Vite, тому правки точні:

1. Видали рядки

```ts
import SPLASH_URL from './assets/splash.png?url'
import LOGO_URL from './assets/logo.png?url'
```

2. Тип кешу повністю:

```ts
type GameCanvasAssetCaches = {
  helmetImage: Image
  spritesImage: Image
  bluearmImage: Image
  bluelegImage: Image
  bluebodyImage: Image
  engineImage: Image
  fenderImage: Image
}
```

3. `create` повністю:

```ts
  static async create(canvas: HTMLCanvasElement, micro: Micro): Promise<GameCanvas> {
    // Лого й сплеш Codebrew у форку видалені: екран завантаження без картинок.
    const [
      helmetImage,
      spritesImage,
      bluearmImage,
      bluelegImage,
      bluebodyImage,
      engineImage,
      fenderImage,
    ] = await Promise.all([
      Image.load(HELMET_URL),
      Image.load(SPRITES_URL),
      Image.load(BLUEARM_URL),
      Image.load(BLUELEG_URL),
      Image.load(BLUEBODY_URL),
      Image.load(ENGINE_URL),
      Image.load(FENDER_URL),
    ])

    return new GameCanvas(canvas, micro, {
      helmetImage,
      spritesImage,
      bluearmImage,
      bluelegImage,
      bluebodyImage,
      engineImage,
      fenderImage,
    })
  }
```

4. У конструкторі заміни

```ts
    this.splashImage = assetCaches.splashImage
    this.logoImage = assetCaches.logoImage
```

на

```ts
    this.splashImage = null
    this.logoImage = null
```

Run: `npx tsc -b`
Expected: без помилок. (`npm run build` зараз упаде на `./assets/levels.mrg?url` у `app.ts` — це лагодить Step 7.)

- [ ] **Step 5: Перевірка енкодера — спершу червона**

`scripts/check-mrg.mjs`:

```js
// scripts/check-mrg.mjs — round-trip енкодера/декодера .mrg і, якщо задано GD_ORIGINAL_MRG
// (оригінальний пак поза репозиторієм), калібрування.
//   node scripts/check-mrg.mjs
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { encodeMrg, decodeMrg, START_SCALE } from '../src/shell/mrg.ts'

let n = 0
const check = (name, fn) => {
  fn()
  n += 1
  console.log('ok -', name)
}

// Лише для кодека: геометрія тут не валідується. y росте вгору, старт на 18 вище першої точки.
const track = (name, points) => ({
  name,
  start: [points[0][0] + 10, points[0][1] + 18],
  finish: [points.at(-1)[0] - 10, 0],
  points,
})

const simple = track('Lanka', [[0, 100], [50, 100], [100, 80], [150, 90]])
// дельти за межами байта і dx = -1 мусять іти escape-гілкою
const wide = track('Wide', [[0, 0], [300, 10], [299, 12], [420, -140], [421, -139]])
const pack = { leagues: [[simple, wide], [simple], [wide]] }

check('round-trip зберігає ліги, назви, старт, фініш і точки', () => {
  const back = decodeMrg(encodeMrg(pack))
  assert.deepEqual(back, pack)
})

check('старт/фініш у файлі помножені на START_SCALE', () => {
  const buf = Buffer.from(encodeMrg({ leagues: [[simple], [], []] }))
  // заголовок: int32 count ліги 0, далі int32 offset першого треку
  const off = buf.readInt32BE(4)
  assert.equal(buf[off], 0x33)
  assert.equal(buf.readInt32BE(off + 1), simple.start[0] * START_SCALE)
  assert.equal(buf.readInt32BE(off + 5), simple.start[1] * START_SCALE)
  assert.equal(START_SCALE, 8192)
})

check('дельта dx = -1 не плутається з escape', () => {
  const t = track('Minus', [[0, 0], [-1, 5], [-2, 5]])
  assert.deepEqual(decodeMrg(encodeMrg({ leagues: [[t], [], []] })).leagues[0][0].points, t.points)
})

check('назва в .mrg лише ASCII', () => {
  assert.throws(() => encodeMrg({ leagues: [[{ ...simple, name: 'Ланка' }], [], []] }), /ASCII/)
  assert.throws(() => encodeMrg({ leagues: [[{ ...simple, name: 'x'.repeat(40) }], [], []] }), /ASCII/)
})

const original = process.env.GD_ORIGINAL_MRG
if (original && existsSync(original)) {
  check('калібрування: оригінальний пак читається і пишеться байт у байт', () => {
    const file = readFileSync(original)
    // Buffer може бути виглядом у більший спільний ArrayBuffer — ріжемо рівно файл
    const buffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength)
    const p = decodeMrg(buffer)
    const intro = p.leagues[0][0]
    assert.equal(intro.name, 'Intro')
    assert.equal(intro.points.length, 45)
    assert.deepEqual(intro.points[0], [-380, 136])
    assert.deepEqual(intro.start, [-49, 24])
    assert.deepEqual(intro.finish, [433, 0])
    assert.ok(Buffer.from(encodeMrg(p)).equals(file), 'encodeMrg(decodeMrg(оригінал)) має збігатися байт у байт')
  })
} else {
  console.log('skip - калібрування (GD_ORIGINAL_MRG не задано)')
}

console.log(`ok: ${n} checks`)
```

Run: `node scripts/check-mrg.mjs`
Expected: `ERR_MODULE_NOT_FOUND` на `src/shell/mrg.ts` — модуля ще нема.

- [ ] **Step 6: `mrg.ts`**

`src/shell/mrg.ts`:

```ts
// src/shell/mrg.ts — пак треків у форматі .mrg (той, що читає LevelLoader/GameLevel).
// Big endian. Заголовок: для кожної з 3 ліг int32 count, далі для кожного треку
// int32 offset + назва (байти ASCII) + 0x00. Дані треку: 0x33, старт x/y і
// фініш x/y як int32 × START_SCALE, int16 кількість точок, перша точка int32 x, y,
// далі дельти int8 dx, int8 dy; dx = -1 — escape, за ним абсолютні int32 x, y.
// Без імпортів: перевіряється scripts/check-mrg.mjs під node.

export interface MrgTrack {
  name: string
  start: [number, number]
  finish: [number, number]
  points: [number, number][]
}

export interface MrgPack {
  leagues: [MrgTrack[], MrgTrack[], MrgTrack[]]
}

/** Старт і фініш у файлі лежать як (unit << 16) >> 3, тобто unit × 8192. */
export const START_SCALE = 8192
const MARK = 0x33
const ESCAPE = -1

const fitsByte = (v: number) => v >= -128 && v <= 127
/** LevelLoader.loadLevels читає назву до 40 байт разом із 0x00 як ASCII, '_' показує пробілом. */
const MRG_NAME = /^[\x20-\x7e]{1,39}$/

const trackBytes = (t: MrgTrack): Uint8Array => {
  const out: number[] = []
  const i32 = (v: number) => out.push((v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255)
  const i16 = (v: number) => out.push((v >>> 8) & 255, v & 255)
  const i8 = (v: number) => out.push(v & 255)
  out.push(MARK)
  i32(t.start[0] * START_SCALE)
  i32(t.start[1] * START_SCALE)
  i32(t.finish[0] * START_SCALE)
  i32(t.finish[1] * START_SCALE)
  i16(t.points.length)
  i32(t.points[0][0])
  i32(t.points[0][1])
  for (let i = 1; i < t.points.length; i++) {
    const dx = t.points[i][0] - t.points[i - 1][0]
    const dy = t.points[i][1] - t.points[i - 1][1]
    if (fitsByte(dx) && fitsByte(dy) && dx !== ESCAPE) {
      i8(dx)
      i8(dy)
    } else {
      i8(ESCAPE)
      i32(t.points[i][0])
      i32(t.points[i][1])
    }
  }
  return Uint8Array.from(out)
}

export const encodeMrg = (pack: MrgPack): ArrayBuffer => {
  for (const t of pack.leagues.flat()) {
    if (!MRG_NAME.test(t.name)) throw new Error(`назва «${t.name}»: у .mrg лише ASCII від пробілу до ~, 1–39 символів`)
  }
  const bodies = pack.leagues.map((l) => l.map(trackBytes))
  let headerSize = 0
  for (const league of pack.leagues) {
    headerSize += 4
    for (const t of league) headerSize += 4 + t.name.length + 1
  }
  const total = headerSize + bodies.flat().reduce((s, b) => s + b.length, 0)
  const buf = new Uint8Array(total)
  const view = new DataView(buf.buffer)
  let h = 0
  let d = headerSize
  for (let l = 0; l < 3; l++) {
    view.setInt32(h, pack.leagues[l].length)
    h += 4
    for (let i = 0; i < pack.leagues[l].length; i++) {
      view.setInt32(h, d)
      h += 4
      for (const ch of pack.leagues[l][i].name) buf[h++] = ch.charCodeAt(0)
      buf[h++] = 0
      buf.set(bodies[l][i], d)
      d += bodies[l][i].length
    }
  }
  return buf.buffer
}

export const decodeMrg = (buffer: ArrayBuffer): MrgPack => {
  const view = new DataView(buffer)
  const bytes = new Uint8Array(buffer)
  let p = 0
  const entries: { name: string; offset: number }[][] = [[], [], []]
  for (let l = 0; l < 3; l++) {
    const count = view.getInt32(p)
    p += 4
    for (let i = 0; i < count; i++) {
      const offset = view.getInt32(p)
      p += 4
      let name = ''
      while (bytes[p] !== 0) name += String.fromCharCode(bytes[p++])
      p++
      entries[l].push({ name, offset })
    }
  }
  const readTrack = (name: string, offset: number): MrgTrack => {
    let q = offset
    const mark = view.getInt8(q++)
    if (mark === 0x32) q += 20
    const start: [number, number] = [view.getInt32(q) / START_SCALE, view.getInt32(q + 4) / START_SCALE]
    const finish: [number, number] = [view.getInt32(q + 8) / START_SCALE, view.getInt32(q + 12) / START_SCALE]
    q += 16
    const count = view.getInt16(q)
    q += 2
    let x = view.getInt32(q)
    let y = view.getInt32(q + 4)
    q += 8
    const points: [number, number][] = [[x, y]]
    for (let i = 1; i < count; i++) {
      const dx = view.getInt8(q++)
      if (dx === ESCAPE) {
        x = view.getInt32(q)
        y = view.getInt32(q + 4)
        q += 8
      } else {
        x += dx
        y += view.getInt8(q++)
      }
      points.push([x, y])
    }
    return { name, start, finish, points }
  }
  return {
    leagues: [
      entries[0].map((e) => readTrack(e.name, e.offset)),
      entries[1].map((e) => readTrack(e.name, e.offset)),
      entries[2].map((e) => readTrack(e.name, e.offset)),
    ],
  }
}
```

Run: `node scripts/check-mrg.mjs`
Expected: `ok - …` ×4, `skip - калібрування (GD_ORIGINAL_MRG не задано)`, `ok: 4 checks`.

Калібрування (один раз): `GD_ORIGINAL_MRG=../gd-upstream/src/assets/levels.mrg node scripts/check-mrg.mjs`
Expected: `ok - …` ×5, серед них `ok - калібрування: оригінальний пак читається і пишеться байт у байт`, і `ok: 5 checks`.

- [ ] **Step 7: Дев-треки і дев-пак**

Координати y ростуть вгору. Старт — на 15–30 (краще 16–20) одиниць вище землі, під обома колесами (start.x ± 14) рівно; фініш — лише x, y = 0. Орієнтири легких оригіналів на ділянці старт→фініш: сегменти 12–64 одиниці, схили в межах ±0,8 (короткі до ±1,3), крок y за сегмент ≤ 32, перепад висот до ~120; зліва від старту стінка, після фінішу щонайменше 150 одиниць землі.

`tracks/dev/01-lanka.json` (рівнина з двома горбами; 35 точок, x −300…900, схили ±0,40):

```json
{
  "name": "Lanka",
  "start": [-40, 18],
  "finish": [660, 0],
  "points": [
    [-300, 110], [-270, 80], [-245, 52], [-220, 30], [-190, 14], [-150, 4], [-100, 0], [-60, 0], [0, 0], [40, 0],
    [80, 6], [110, 16], [140, 24], [170, 28], [200, 24], [230, 14], [260, 4], [290, 0], [340, 0],
    [370, 8], [400, 20], [430, 32], [460, 38], [490, 34], [520, 22], [550, 10], [580, 2], [610, 0],
    [650, 0], [700, 0], [750, 0], [800, 8], [840, 24], [870, 44], [900, 70]
  ]
}
```

`tracks/dev/02-hirka.json` (підйом до 100, трамплін і спуск −1,07; 38 точок):

```json
{
  "name": "Hirka",
  "start": [-40, 18],
  "finish": [850, 0],
  "points": [
    [-280, 96], [-256, 72], [-232, 50], [-208, 32], [-184, 18], [-156, 8], [-124, 2], [-90, 0], [-20, 0], [20, 0],
    [60, 6], [100, 16], [140, 28], [180, 42], [220, 56], [260, 68], [300, 76], [340, 80], [380, 80], [410, 80],
    [440, 86], [465, 94], [485, 100], [500, 84], [520, 66], [560, 44], [600, 28], [640, 16], [680, 8], [720, 4],
    [760, 2], [800, 0], [840, 0], [880, 0], [920, 4], [960, 16], [990, 34], [1020, 58]
  ]
}
```

`tracks/dev/03-yama.json` (яма глибиною 58 і сходинка 44; 39 точок):

```json
{
  "name": "Yama",
  "start": [-40, 18],
  "finish": [850, 0],
  "points": [
    [-290, 100], [-265, 74], [-240, 52], [-214, 34], [-186, 20], [-154, 9], [-118, 2], [-80, 0], [-10, 0], [30, 0],
    [70, -6], [100, -18], [130, -34], [160, -48], [190, -56], [220, -58], [250, -54], [280, -44], [310, -30], [340, -16],
    [370, -6], [400, 0], [440, 0], [470, 6], [500, 18], [530, 32], [560, 40], [600, 44], [640, 42], [680, 34],
    [720, 22], [760, 10], [800, 3], [840, 0], [870, 0], [910, 0], [950, 6], [985, 20], [1010, 40]
  ]
}
```

`scripts/build-dev-pack.mjs`:

```js
// scripts/build-dev-pack.mjs — tracks/dev/*.json → src/assets/dev-pack.mrg.
// Дев-пак потрібен, щоб гра збиралась і запускалась без пака сайту.
// Правила геометрії (parseTrackJson) сюди підключає Task 3.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { encodeMrg } from '../src/shell/mrg.ts'

const dir = new URL('../tracks/dev/', import.meta.url)
const tracks = readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => JSON.parse(readFileSync(new URL(f, dir), 'utf8')))
// три ліги: усі дев-треки в першій, по першому в решті — щоб LevelLoader мав що вантажити
const pack = { leagues: [tracks, [tracks[0]], [tracks[0]]] }
writeFileSync(new URL('../src/assets/dev-pack.mrg', import.meta.url), Buffer.from(encodeMrg(pack)))
console.log('ok - dev-pack.mrg:', tracks.map((t) => t.name).join(', '))
```

Run: `node scripts/build-dev-pack.mjs && ls -l src/assets/dev-pack.mrg`
Expected: `ok - dev-pack.mrg: Lanka, Hirka, Yama`, файл 550 байт.

У `src/app.ts` заміни

```ts
import LEVELS_MRG_URL from './assets/levels.mrg?url'
```

на

```ts
import LEVELS_MRG_URL from './assets/dev-pack.mrg?url'
```

- [ ] **Step 8: Збірка і запуск з оригінальними (поки що) канвасними меню**

Run: `npx tsc -b && npm run build` → без помилок. Dev-сервер форку (порт 3100; сайт на 3000 не чіпати) — лише з вимкненою пісочницею і у фоні (для агента — `run_in_background`), після перевірки зупини його. `npm run dev`, відкрий `http://localhost:3100/`: меню порту англійською, Play → перший трек «Lanka», байк із кольорових плейсхолдерів стоїть на землі біля стартового прапорця, стрілки керують, байк їде по нашій ламаній, фініш працює. y треку росте вгору, старт на 15–30 вище землі — правила перевіряє `parseTrackJson` (Task 3), дев-треки плану їм уже відповідають; на фізиці двигуна треки без браузера проганяє `sim-track` (Task 3). Якщо байк у браузері поводиться не так, перевір, що `dev-pack.mrg` перегенеровано після правки JSON; енкодер не чіпай — він підтверджений байт у байт на оригінальному паку в Step 6. Якщо вкладка зависає на першому кадрі меню (CPU 100%, сторінка не відповідає) — це гонка upstream, а не дефект форку: `MenuManager.fillCanvasWithImage` крутиться вічно, поки `raster.png` з `Image.fromSrc` ще не декодовано (ширина 0). Закрий вкладку й відкрий сторінку ще раз (з кешем браузера); після Task 4 `MenuManager` недосяжний і гонки нема.

Перевір, що жодного файлу Codebrew не лишилось:

```bash
for f in src/assets/levels.mrg src/assets/logo.png src/assets/splash.png preview.gif; do [ -e "$f" ] && echo "ЛИШИВСЯ: $f"; done; echo "перевірка файлів завершена"
for f in helmet engine fender bluearm bluebody blueleg sprites raster; do cmp -s src/assets/$f.png ../gd-upstream/src/assets/$f.png && echo "$f.png НЕ ЗМІНЕНО — це ще Codebrew" || echo "$f.png замінено"; done
```

Expected: жодного рядка `ЛИШИВСЯ`, `перевірка файлів завершена`, усі вісім — `замінено`.

- [ ] **Step 9: Commit**

Перший коміт великий: знімок upstream мусить бути першим комітом історії (спека, секція 1) і вже без файлів Codebrew, а кожна задача закінчується чистою збіркою. Рев'юеру — справжній дифф відносно знімка upstream, а не порожнього дерева:

```bash
diff -rq -x node_modules -x .git -x dist ../gd-upstream .
```

Expected: лише шляхи з блоку Files цієї задачі (`Only in …` / `Files … differ`).

```bash
git add -A
git commit -m "chore: форк gravity-defied-web без асетів Codebrew — енкодер .mrg, дев-пак, плейсхолдери спрайтів

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
git rev-list --count HEAD
# жоден обʼєкт репозиторію форку не є блобом Codebrew
for f in src/assets/levels.mrg src/assets/logo.png src/assets/splash.png src/assets/helmet.png src/assets/engine.png src/assets/fender.png src/assets/bluearm.png src/assets/bluebody.png src/assets/blueleg.png src/assets/sprites.png src/assets/raster.png preview.gif; do
  h=$(git -C ../gd-upstream rev-parse "HEAD:$f")
  git cat-file -e "$h" 2>/dev/null && echo "БЛОБ CODEBREW У РЕПО: $f" || echo "ok - $f"
done
```

Expected: `1` (історія форку починається з цього коміту) і 12 × `ok -`.

---


### Task 2: Шаблони спрайтів для дизайнера

**Files:**

- Create: `scripts/make-sprite-template.mjs`, `docs/sprites.md`, `docs/sprite-templates/{helmet,engine,fender,bluearm,blueleg,bluebody,sprites}@8x.png` (генеруються)
- Modify: `package.json` (скрипт `sprites:template`), `CHANGELOG.md` (рядок у «Unreleased»)

**Interfaces:**

- Consumes (Task 1): `createCanvas`, `drawLine`, `encodePng`, `fillRect`, `setPixel`, `strokeRect` з `scripts/png.mjs`; `RASTER_PNG`, `SHEETS`, `SPRITES`, `SPRITES_PNG`, `STEP_DEG`, `frameDirection` з `scripts/sprite-layout.mjs` (сигнатури й поля — в Interfaces Task 1).
- Produces: `docs/sprites.md` і `docs/sprite-templates/*@8x.png` — шаблони спрайтів для дизайнера (спека, секція 5); npm-скрипт `sprites:template`. Код гри від цієї задачі не залежить.

- [ ] **Step 1: `scripts/make-sprite-template.mjs`**

Шаблони — окрема задача одразу після форку, щоб дизайнер малював спрайти паралельно з рештою задач (спека, секція 5). Скрипт читає `scripts/sprite-layout.mjs` і `drawLine`/`strokeRect` з `scripts/png.mjs` (Task 1, Step 3–4). Правило кута кадру взяте з `GameCanvas.calcSpriteNo`: для шолома, двигуна й крила (`flip = true`) кадри ростуть проти годинникової стрілки, рівний байк — кадр 0 двигуна і кадр 1 крила; для руки, ноги й тулуба (`flip = false`, пів кола) кадр i — сегмент, повернутий від вертикалі за годинниковою на i × 11,25°.

`scripts/make-sprite-template.mjs`:

```js
// scripts/make-sprite-template.mjs — шаблони для дизайнера й docs/sprites.md.
// Для кожного файлу з scripts/sprite-layout.mjs малює збільшений у SCALE разів
// шаблон docs/sprite-templates/<name>@8x.png: сітка пікселів, межі кадрів
// (зелена — кадр «байк стоїть рівно» / вертикальний сегмент, червона — решта),
// синій промінь «вперед» за правилом кадру, сіре штрихування — клітинки, які
// двигун не читає. Сам спрайт дизайнер віддає в розмірі 1×, рівно як у таблиці.
// Запуск: node scripts/make-sprite-template.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import { createCanvas, drawLine, encodePng, fillRect, setPixel, strokeRect } from './png.mjs'
import { RASTER_PNG, SHEETS, SPRITES, SPRITES_PNG, STEP_DEG, frameDirection } from './sprite-layout.mjs'

const SCALE = 8
const GRID = [225, 225, 225]
const RED = [230, 30, 30]
const GREEN = [0, 170, 60]
const BLUE = [0, 90, 255]
const HATCH = [170, 170, 170]
const STEP = String(STEP_DEG).replace('.', ',')
const outDir = new URL('../docs/sprite-templates/', import.meta.url)
mkdirSync(outDir, { recursive: true })

const pixelGrid = (c) => {
  for (let x = 0; x < c.width; x += SCALE) fillRect(c, x, 0, 1, c.height, GRID)
  for (let y = 0; y < c.height; y += SCALE) fillRect(c, 0, y, c.width, 1, GRID)
}

const hatch = (c, x, y, w, h) => {
  for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) if ((xx + yy) % 6 === 0) setPixel(c, xx, yy, HATCH)
}

const save = (name, c) => {
  writeFileSync(new URL(name, outDir), encodePng(c))
  console.log('ok -', `docs/sprite-templates/${name}`)
}

for (const sheet of SHEETS) {
  const c = createCanvas(sheet.width * SCALE, sheet.height * SCALE)
  pixelGrid(c)
  const fw = (sheet.width / sheet.cols) * SCALE
  const fh = (sheet.height / sheet.rows) * SCALE
  for (let i = 0; i < sheet.cols * sheet.rows; i++) {
    const x = (i % sheet.cols) * fw
    const y = Math.floor(i / sheet.cols) * fh
    if (i >= sheet.used) {
      hatch(c, x, y, fw, fh)
      continue
    }
    const isLevel = sheet.kind === 'turn' ? i === sheet.levelFrame : i === 0
    strokeRect(c, x, y, fw, fh, isLevel ? GREEN : RED)
    const [dx, dy] = frameDirection(sheet, i)
    const r = Math.min(fw, fh) / 2 - SCALE
    const cx = x + fw / 2
    const cy = y + fh / 2
    const from = sheet.kind === 'turn' ? 0 : -r
    drawLine(c, cx + dx * from, cy + dy * from, cx + dx * r, cy + dy * r, BLUE)
  }
  save(sheet.file.replace('.png', '@8x.png'), c)
}

{
  const c = createCanvas(SPRITES_PNG.width * SCALE, SPRITES_PNG.height * SCALE)
  pixelGrid(c)
  for (const s of SPRITES) {
    const [x, y, w, h] = [s.x * SCALE, s.y * SCALE, s.w * SCALE, s.h * SCALE]
    if (s.no === 16 || s.no === 17) hatch(c, x, y, w, h)
    else strokeRect(c, x, y, w, h, s.race ? GREEN : RED)
  }
  save('sprites@8x.png', c)
}

const sheetRows = SHEETS.map((s) => {
  const rule =
    s.kind === 'turn'
      ? `кадр ${s.levelFrame} — байк стоїть рівно; кадр i повернутий проти годинникової на ${s.levelFrame === 0 ? 'i' : `(i − ${s.levelFrame})`} × ${STEP}°`
      : `кадр 0 — сегмент вертикально, кадр i повернутий за годинниковою на i × ${STEP}°, кадр 8 — горизонтально`
  return `| \`${s.file}\` | ${s.width}×${s.height} | ${s.cols}×${s.rows} | ${s.width / s.cols}×${s.height / s.rows} | ${s.used} з ${s.cols * s.rows} | ${s.what} | ${rule} |`
})

const spriteRows = SPRITES.map((s) => `| ${s.no} | ${s.x} | ${s.y} | ${s.w} | ${s.h} | ${s.race ? 'так' : 'ні'} | ${s.what} |`)

const md = `# Спрайти «Дріл Мото»

Згенеровано \`node scripts/make-sprite-template.mjs\` з \`scripts/sprite-layout.mjs\`; руками не
редагувати. Шаблони — \`docs/sprite-templates/*@8x.png\` (збільшені у ${SCALE} разів, лише для
орієнтира). Готові файли кладуться в \`src/assets/\` у розмірі 1×, рівно як у таблицях: двигун
ріже їх за розміром файлу і за таблицями в \`src/GameCanvas.ts\`. Фон прозорий (альфа 0).

Спрайти палітрою теми не перефарбовуються: кольори такі, як намальовані. Кожен кадр має
читатися і на #ffffff (світла тема), і на #101413 (темна): основні форми з контрастом не менше
3:1 до обох фонів, наприклад середній тон або світла заливка з темним контуром 1px. Шини — теж
спрайти (sprites.png, кадри 0 і 1, 15×15), а не код; кодом малюються лише спиці, дуга над
переднім колесом, маточини, вилка (сіра лінія від рами до осі переднього колеса) і древка
прапорців, їх колір дає палітра; вилку в engine.png не малювати.

## Аркуші з кадрами за кутом

Кадр n лежить у колонці n % 6 і рядку ⌊n / 6⌋ (нумерація по рядках зліва направо).
Кожен кадр малюється по центру точки, яку рахує фізика, тож деталь має бути по центру
кадру. Кадр покриває один крок 11,25° поруч зі своїм кутом; на розмірі 8–20 px різниця
в межах кроку не видна, тож малюй кадр рівно під кутом із таблиці.

| Файл | Розмір | Сітка | Кадр | Вжито | Що | Кут кадру |
| ---- | ------ | ----- | ---- | ----- | -- | --------- |
${sheetRows.join('\n')}

- Шолом, двигун, крило: 32 кадри — повне коло; кадр i+1 — той самий малюнок, повернутий ще
  на ${STEP}° проти годинникової стрілки. Коли вершник нахиляється
  (\`riderPoseBlendF16 > 32768\`), шолом бере кадр ще на 18° за годинниковою стрілкою.
- Рука, нога, тулуб: 16 кадрів — пів кола; сегмент від суглоба до суглоба і той самий сегмент,
  розвернутий на 180°, беруть той самий кадр, тож малюнок має читатися в обидва боки. Нога
  малюється двічі (стегно й гомілка) з одного аркуша.
- Клітинки поза «Вжито» двигун не читає; їх лишити прозорими.

## sprites.png (${SPRITES_PNG.width}×${SPRITES_PNG.height})

Прямокутники зашиті в код (\`spriteOffsetX/Y\`, \`spriteSizeX/Y\`); x, y — лівий верхній кут
у файлі. «У заїзді: ні» — спрайти канвасних меню порту, які «Дріл Мото» не показує; їх
можна лишити простими.

| № | x | y | w | h | У заїзді | Що |
| - | - | - | - | - | -------- | -- |
${spriteRows.join('\n')}

- Шини 0 і 1: центр прямокутника = центр колеса, радіус колеса на екрані ≈ 7 px. Спиці
  й дугу поверх шини малює код; середина шини має бути прозорою.
- Прапори 10–15: стовпчик (лінія 32 px від точки треку вгору) малює код кольором палітри;
  лівий верхній кут прапора стоїть на верхівці стовпчика, тож колонка 0 лягає на стовпчик,
  а тканина — праворуч.
- 4: точка 3×3 по центру шарніра вершника.

## raster.png (${RASTER_PNG.width}×${RASTER_PNG.height})

Тайл, яким \`MenuManager\` порту притіняє гру під канвасними меню. «Дріл Мото» його не
показує (DOM-меню), у \`dist/\` він не потрапляє; файл лишається плейсхолдером.
`

writeFileSync(new URL('../docs/sprites.md', import.meta.url), md)
console.log('ok - docs/sprites.md')
```

- [ ] **Step 2: Скрипт `sprites:template` і шаблони**

Run: `npm pkg set scripts.sprites:template="node scripts/make-sprite-template.mjs" && npm run sprites:template`
Expected:

```
ok - docs/sprite-templates/helmet@8x.png
ok - docs/sprite-templates/engine@8x.png
ok - docs/sprite-templates/fender@8x.png
ok - docs/sprite-templates/bluearm@8x.png
ok - docs/sprite-templates/blueleg@8x.png
ok - docs/sprite-templates/bluebody@8x.png
ok - docs/sprite-templates/sprites@8x.png
ok - docs/sprites.md
```

У таблиці `docs/sprites.md` рядок `engine.png` каже «кадр 0 — байк стоїть рівно», `fender.png` — «кадр 1 — байк стоїть рівно».

- [ ] **Step 3: `CHANGELOG.md` і збірка**

```bash
printf '%s\n' '- Шаблони спрайтів для дизайнера: `docs/sprites.md`, `docs/sprite-templates/*@8x.png` (`npm run sprites:template`).' >> CHANGELOG.md
npx tsc -b && npm run build
git status --short
```

Expected: `tsc` і `vite build` без помилок; `git status --short` показує лише ` M CHANGELOG.md`, ` M package.json`, `?? docs/` і `?? scripts/make-sprite-template.mjs`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "docs: шаблони спрайтів для дизайнера — docs/sprites.md і *@8x.png

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---


### Task 3: Правила JSON-треку і безголовий прогін на фізиці двигуна

**Files:**

- Create: `src/shell/trackJson.ts`, `scripts/sim-track.mjs`
- Modify: `scripts/check-mrg.mjs` (перевірка правил), `scripts/build-dev-pack.mjs` (через `parseTrackJson`), `package.json` (скрипт `sim`), `CHANGELOG.md` (рядок у «Unreleased»)

**Interfaces:**

- Consumes (Task 1): `interface MrgTrack { name: string; start: [number, number]; finish: [number, number]; points: [number, number][] }`, `interface MrgPack { leagues: [MrgTrack[], MrgTrack[], MrgTrack[]] }`, `encodeMrg(pack: MrgPack): ArrayBuffer`, `decodeMrg(buffer: ArrayBuffer): MrgPack` з `src/shell/mrg.ts`; `scripts/check-mrg.mjs` (помічник `check(name, fn)`, блок калібрування з `intro`); `scripts/build-dev-pack.mjs`; `tracks/dev/*.json`, `src/assets/dev-pack.mrg`.
- Consumes (двигун upstream без змін): `new GamePhysics(levels)`, `setMode(1)`, `setMotoLeague(l)`, `enableGenerateInputAI()`, `setInputDirection(x, y)`, `updatePhysics(): number` (0 їде, 1/2 фініш, 3/5 падіння, 4 до стартового прапорця), `syncRenderStateFromSimulation()`, `bikeParts[1|2].motoComponents[5].xF16/yF16`; `new LevelLoader(new FileStream(buffer))`, `loadLevel(l, t)`, статики `LevelLoader.isEnabledPerspective` і `visibleStartPointIndex`/`visibleEndPointIndex`/`visibleStartPointX`/`visibleEndPointX` (планувальник зберігає й відновлює їх разом із копією фізики); статичний `GameCanvas.advanceFlagAnimation()` — скрипт підміняє модуль заглушкою.
- Produces: `parseTrackJson(json: unknown): MrgTrack` (форма + правила геометрії двигуна, кидає `Error`), `parsePackJson(json: unknown): MrgPack` — їх споживають `sim-track.mjs` (ця задача) і `pack.ts` (Task 10); CLI `node scripts/sim-track.mjs [пак.mrg | трек.json] [--driver ai,gas,bot,plan] [--seconds N] [--no-plan]`: за замовчуванням водії `ai,gas,bot`; `plan` — планувальник (спека, секція 4, «Авторинг»), який без `--driver` запускається й сам для треку, що його не пройшов жоден із `ai`, `gas`, `bot` (`--no-plan` це вимикає); з `--driver` працюють рівно названі водії (`--driver ai,gas,bot` — лише автопілоти, `--driver ai,gas,bot,plan` — усі чотири на кожному треку, як у воротах плану B); exit 1, якщо якийсь трек не фінішує жодним водієм. Еталонний вивід на дев-паку (Step 5) — для умовної Task 14 і плану B (передумова 9, задача 3, кроки 7 і 9); npm-скрипт `sim`.

- [ ] **Step 1: Перевірка правил — спершу червона**

Правила геометрії двигуна (спека, секція 4, «Правила двигуна») живуть в одному модулі `src/shell/trackJson.ts`: його вживають `check-mrg`, дев-пак, `sim-track` (ця задача) і `pack.ts` (Task 10). Спершу перевірка. `scripts/check-mrg.mjs` повністю (до версії Task 1 додано імпорт `parseTrackJson`, трек `valid` з перевіркою правил і рядок калібрування «наші правила пропускають еталонний трек»):

```js
// scripts/check-mrg.mjs — round-trip енкодера/декодера .mrg, правила JSON-треку і,
// якщо задано GD_ORIGINAL_MRG (оригінальний пак поза репозиторієм), калібрування.
//   node scripts/check-mrg.mjs
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { encodeMrg, decodeMrg, START_SCALE } from '../src/shell/mrg.ts'
import { parseTrackJson } from '../src/shell/trackJson.ts'

let n = 0
const check = (name, fn) => {
  fn()
  n += 1
  console.log('ok -', name)
}

// Лише для кодека: геометрія тут не валідується. y росте вгору, старт на 18 вище першої точки.
const track = (name, points) => ({
  name,
  start: [points[0][0] + 10, points[0][1] + 18],
  finish: [points.at(-1)[0] - 10, 0],
  points,
})

const simple = track('Lanka', [[0, 100], [50, 100], [100, 80], [150, 90]])
// дельти за межами байта і dx = -1 мусять іти escape-гілкою
const wide = track('Wide', [[0, 0], [300, 10], [299, 12], [420, -140], [421, -139]])
const pack = { leagues: [[simple, wide], [simple], [wide]] }

check('round-trip зберігає ліги, назви, старт, фініш і точки', () => {
  const back = decodeMrg(encodeMrg(pack))
  assert.deepEqual(back, pack)
})

check('старт/фініш у файлі помножені на START_SCALE', () => {
  const buf = Buffer.from(encodeMrg({ leagues: [[simple], [], []] }))
  // заголовок: int32 count ліги 0, далі int32 offset першого треку
  const off = buf.readInt32BE(4)
  assert.equal(buf[off], 0x33)
  assert.equal(buf.readInt32BE(off + 1), simple.start[0] * START_SCALE)
  assert.equal(buf.readInt32BE(off + 5), simple.start[1] * START_SCALE)
  assert.equal(START_SCALE, 8192)
})

check('дельта dx = -1 не плутається з escape', () => {
  const t = track('Minus', [[0, 0], [-1, 5], [-2, 5]])
  assert.deepEqual(decodeMrg(encodeMrg({ leagues: [[t], [], []] })).leagues[0][0].points, t.points)
})

check('назва в .mrg лише ASCII', () => {
  assert.throws(() => encodeMrg({ leagues: [[{ ...simple, name: 'Ланка' }], [], []] }), /ASCII/)
  assert.throws(() => encodeMrg({ leagues: [[{ ...simple, name: 'x'.repeat(40) }], [], []] }), /ASCII/)
})

const valid = { name: 'A', start: [100, 18], finish: [300, 0], points: [[0, 0], [150, 0], [250, 0], [300, 0], [500, 0]] }

check('parseTrackJson приймає правильний трек і ловить помилки геометрії', () => {
  assert.deepEqual(parseTrackJson(valid), valid)
  const bad = (patch, re) => assert.throws(() => parseTrackJson({ ...valid, ...patch }), re)
  bad({ points: [[0, 0], [150, 0], [140, 0], [300, 0], [500, 0]] }, /зростати/)
  bad({ start: [300, 18], finish: [100, 0] }, /фініш/)
  bad({ start: [100, -40] }, /вище землі/) // старий «y вниз» — старт під землею
  bad({ start: [100, 8] }, /вище землі/) // колеса в землі — двигун зациклиться
  bad({ start: [20, 18] }, /першої точки/)
  bad({ finish: [400, 0] }, /після finish/)
  bad({ start: [100, 28], points: [[0, 0], [80, 0], [200, 60], [300, 60], [500, 60]] }, /вʼязне/)
})

const original = process.env.GD_ORIGINAL_MRG
if (original && existsSync(original)) {
  check('калібрування: оригінальний пак читається і пишеться байт у байт', () => {
    const file = readFileSync(original)
    // Buffer може бути виглядом у більший спільний ArrayBuffer — ріжемо рівно файл
    const buffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength)
    const p = decodeMrg(buffer)
    const intro = p.leagues[0][0]
    assert.equal(intro.name, 'Intro')
    assert.equal(intro.points.length, 45)
    assert.deepEqual(intro.points[0], [-380, 136])
    assert.deepEqual(intro.start, [-49, 24])
    assert.deepEqual(intro.finish, [433, 0])
    assert.deepEqual(parseTrackJson(intro), intro) // наші правила пропускають еталонний трек
    assert.ok(Buffer.from(encodeMrg(p)).equals(file), 'encodeMrg(decodeMrg(оригінал)) має збігатися байт у байт')
  })
} else {
  console.log('skip - калібрування (GD_ORIGINAL_MRG не задано)')
}

console.log(`ok: ${n} checks`)
```

Run: `node scripts/check-mrg.mjs`
Expected: `ERR_MODULE_NOT_FOUND` на `src/shell/trackJson.ts` — модуля ще нема.

- [ ] **Step 2: `trackJson.ts`**

`src/shell/trackJson.ts`:

```ts
// src/shell/trackJson.ts — наш авторський формат треку (JSON) → MrgTrack.
// Координати в одиницях треку (цілі). y росте ВГОРУ (GameCanvas.addDy малює -y).
// Правила взяті з двигуна, перевірені scripts/sim-track.mjs на оригінальному паку:
// - x строго зростає: GameLevel.addPoint мовчки викидає точку з x ≤ попереднього;
// - |координата| ≤ 32767: (x << 16) >> 3 у GameLevel.addPointSimple переповнюється;
// - колеса стоять на висоті start.y в x = start.x ± 14; з перспективою двигун міряє
//   колесо на 8 одиниць нижче, внутрішній радіус колеса 5,8: ближче — вічний цикл у
//   GamePhysics.solvePhysicsStep (вкладка зависає), під землею — провал крізь трек;
// - старт-прапорець = друга точка правіше start.x, фініш = перша точка правіше
//   finish.x (LevelLoader.prepareLevelGeometry); якщо вони збігаються або фініш
//   лівіше старту, фініш ніколи не зарахується; finish.y двигун не читає.
import type { MrgPack, MrgTrack } from './mrg.ts'

const MAX_COORD = 32767
const WHEEL_DX = 14
const PERSPECTIVE_DY = 8
const MIN_WHEEL_GAP = 7 // внутрішній радіус 5,8 + запас
const START_HEIGHT: [number, number] = [15, 30] // над землею в start.x; в оригіналах 14,8–30
const MIN_LEAD_IN = 40 // від першої точки до start.x: заднє колесо на землі
const MIN_RUN_OUT = 150 // від finish.x до останньої точки: 1 с goal-loop після фінішу

type Point = [number, number]

const isPair = (v: unknown): v is Point =>
  Array.isArray(v) &&
  v.length === 2 &&
  v.every((n) => Number.isInteger(n) && Math.abs(n as number) <= MAX_COORD)

const groundY = (points: Point[], x: number): number => {
  for (let i = 1; i < points.length; i++) {
    if (x <= points[i][0]) {
      const [x0, y0] = points[i - 1]
      const [x1, y1] = points[i]
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)
    }
  }
  return Number.NaN
}

const distanceToGround = (points: Point[], x: number, y: number): number => {
  let best = Number.POSITIVE_INFINITY
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1]
    const dx = points[i][0] - x0
    const dy = points[i][1] - y0
    const t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy)))
    best = Math.min(best, Math.hypot(x - x0 - t * dx, y - y0 - t * dy))
  }
  return best
}

const checkGeometry = (name: string, start: Point, finish: Point, points: Point[]): void => {
  for (let i = 1; i < points.length; i++) {
    if (points[i][0] <= points[i - 1][0]) throw new Error(`${name}: points[${i}] — x має строго зростати`)
  }
  if (start[0] - points[0][0] < MIN_LEAD_IN) throw new Error(`${name}: start.x має бути щонайменше на ${MIN_LEAD_IN} правіше першої точки`)
  if (points[points.length - 1][0] - finish[0] < MIN_RUN_OUT) throw new Error(`${name}: після finish.x потрібно щонайменше ${MIN_RUN_OUT} одиниць ламаної`)
  const between = points.filter(([x]) => x > start[0] && x <= finish[0]).length
  if (between < 2) throw new Error(`${name}: фініш має бути правіше старту, між ними щонайменше дві точки ламаної`)
  const height = start[1] - groundY(points, start[0])
  if (height < START_HEIGHT[0] || height > START_HEIGHT[1]) {
    throw new Error(`${name}: старт має бути на ${START_HEIGHT[0]}–${START_HEIGHT[1]} одиниць вище землі (y росте вгору), зараз ${height.toFixed(1)}`)
  }
  for (const dx of [-WHEEL_DX, WHEEL_DX]) {
    if (distanceToGround(points, start[0] + dx, start[1] - PERSPECTIVE_DY) < MIN_WHEEL_GAP) {
      throw new Error(`${name}: колесо в x=${start[0] + dx} на старті вʼязне в землі — підніми старт або вирівняй землю під ним`)
    }
  }
}

export const parseTrackJson = (json: unknown): MrgTrack => {
  const j = json as Partial<MrgTrack>
  // як validateTrack сайту (план B): непорожня назва до 20 символів (кодових точок) після trim
  const name = typeof j.name === 'string' ? j.name.trim() : ''
  if (name.length === 0 || [...name].length > 20) throw new Error('name: непорожній рядок до 20 символів')
  if (!isPair(j.start) || !isPair(j.finish)) throw new Error(`${name}: start/finish — пара цілих у межах ±${MAX_COORD}`)
  if (!Array.isArray(j.points) || j.points.length < 4 || !j.points.every(isPair)) {
    throw new Error(`${name}: points — щонайменше чотири пари цілих у межах ±${MAX_COORD}`)
  }
  checkGeometry(name, j.start, j.finish, j.points)
  return { name, start: [j.start[0], j.start[1]], finish: [j.finish[0], j.finish[1]], points: j.points.map((p) => [p[0], p[1]]) }
}

/** Пак: { leagues: [[track, …], [...], [...]] } або один трек → пак з цим треком у кожній лізі. */
export const parsePackJson = (json: unknown): MrgPack => {
  const j = json as { leagues?: unknown[] }
  if (!Array.isArray(j.leagues)) {
    const single = parseTrackJson(json)
    return { leagues: [[single], [single], [single]] }
  }
  if (j.leagues.length !== 3) throw new Error('leagues: рівно три ліги')
  const leagues = j.leagues.map((l) => (Array.isArray(l) ? l.map(parseTrackJson) : [])) as MrgPack['leagues']
  if (leagues[0].length === 0) throw new Error('перша ліга має містити хоча б один трек')
  return { leagues }
}
```

Run: `node scripts/check-mrg.mjs`
Expected: `ok - …` ×5, `skip - калібрування (GD_ORIGINAL_MRG не задано)`, `ok: 5 checks`.

Калібрування: `GD_ORIGINAL_MRG=../gd-upstream/src/assets/levels.mrg node scripts/check-mrg.mjs`
Expected: `ok - …` ×6, серед них `ok - калібрування: оригінальний пак читається і пишеться байт у байт`, і `ok: 6 checks` — правила пропускають оригінальний «Intro».

- [ ] **Step 3: Дев-пак через `parseTrackJson`**

`scripts/build-dev-pack.mjs` повністю (до версії Task 1 додано `parseTrackJson`: зламаний дев-трек зупиняє збірку пака):

```js
// scripts/build-dev-pack.mjs — tracks/dev/*.json → src/assets/dev-pack.mrg.
// Дев-пак потрібен, щоб гра збиралась і запускалась без пака сайту.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { encodeMrg } from '../src/shell/mrg.ts'
import { parseTrackJson } from '../src/shell/trackJson.ts'

const dir = new URL('../tracks/dev/', import.meta.url)
const tracks = readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => parseTrackJson(JSON.parse(readFileSync(new URL(f, dir), 'utf8'))))
// три ліги: усі дев-треки в першій, по першому в решті — щоб LevelLoader мав що вантажити
const pack = { leagues: [tracks, [tracks[0]], [tracks[0]]] }
writeFileSync(new URL('../src/assets/dev-pack.mrg', import.meta.url), Buffer.from(encodeMrg(pack)))
console.log('ok - dev-pack.mrg:', tracks.map((t) => t.name).join(', '))
```

Run: `npm run dev-pack && git diff --exit-code src/assets/dev-pack.mrg && echo "dev-pack без змін"`
Expected: `ok - dev-pack.mrg: Lanka, Hirka, Yama` і `dev-pack без змін` — дев-треки Task 1 уже відповідають правилам. Якщо скрипт падає з повідомленням `parseTrackJson` — правиться JSON, а не валідатор.

- [ ] **Step 4: `scripts/sim-track.mjs`**

Трек, який двигун не проїде (старт під землею — провал, старт у землі — вічний цикл і завмерла вкладка, фініш на останній точці — фініш не зараховується), видно за секунду без браузера. Спека (секція 4, «Авторинг») робить цей прогін воротами перед комітом треку: кожен трек мусить фінішувати хоча б одним водієм — демо-AI порту, «лише газ» або планувальник. Водії: `ai` — вбудований демо-автопілот двигуна, `gas` — лише газ, `bot` — газ і нахил проти тангажу відносно схилу, `plan` — планувальник: кожні 100 мс він перебирає на копії стану фізики 123 послідовності натискань на 2,4 с уперед і бере першу дію найкращої, а знайдені натискання потім програє на свіжому двигуні, тож його фініш — справжній заїзд. Планувальник дорогий (≈1 хв CPU на трек), тому без `--driver` він запускається лише для треку, який не пройшов жоден із `ai`, `gas`, `bot`, а з `--driver` працюють рівно названі водії: `--driver ai,gas,bot` — лише автопілоти (менше секунди), `--driver ai,gas,bot,plan` — усі чотири на кожному треку. Двигун не редагується: `GameCanvas.ts` імпортує PNG через `?url`, чого node не вміє, а фізиці з нього потрібен лише статичний `GameCanvas.advanceFlagAnimation()` (`GamePhysics.updatePhysics`), тож скрипт через `registerHooks` з `node:module` підміняє `GameCanvas.ts` однорядковою заглушкою.

`scripts/sim-track.mjs`:

```js
// scripts/sim-track.mjs — безголовий прогін треків на справжній фізиці двигуна
// (GamePhysics + LevelLoader) без канвасу й асетів. Для кожного треку пака і
// кожного водія каже: фініш за скільки, падіння де, провал під землю, застряг.
//   node scripts/sim-track.mjs                          # src/assets/dev-pack.mrg
//   node scripts/sim-track.mjs tracks/dev/02-hirka.json # один JSON-трек (усі 3 байки)
//   node scripts/sim-track.mjs pack.mrg --driver bot --seconds 120
//   node scripts/sim-track.mjs pack.mrg --no-plan      # лише ai, gas, bot
// Водії: ai — вбудований демо-автопілот двигуна (enableGenerateInputAI),
// gas — лише газ, bot — газ + нахил проти тангажу відносно схилу,
// plan — планувальник (спека, секція 4, «Авторинг»): кожні 100 мс перебирає
// 120 випадкових послідовностей натискань на 2,4 с уперед на копії стану фізики
// й бере найкращу — верхня межа вправності гравця. Знайдені натискання plan
// програє заново на свіжому двигуні, тож його «finish» — це справжній заїзд.
// Без --driver (водії ai, gas, bot) plan запускається сам для треку, який не
// пройшов жоден із них (≈1 хв CPU на трек); --no-plan це вимикає. З --driver
// працюють рівно названі водії: --driver ai,gas,bot,plan — усі чотири.
// Exit 1, якщо якийсь трек не фінішує жодним водієм. JSON проходить parseTrackJson;
// готовий .mrg береться як є — старт у землі там зациклить двигун (як і в браузері).
// GameCanvas.ts тягне '?url'-імпорти PNG, які node не вантажить, а фізиці з
// нього потрібен лише статичний GameCanvas.advanceFlagAnimation() (анімація
// прапорця). Тому хук підміняє модуль заглушкою; двигун не редагується.
import { registerHooks } from 'node:module'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const CANVAS_STUB = 'export class GameCanvas { static advanceFlagAnimation() {} }'
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (/(^|\/)GameCanvas\.ts$/.test(specifier)) {
      return { url: `data:text/javascript,${encodeURIComponent(CANVAS_STUB)}`, shortCircuit: true }
    }
    return nextResolve(specifier, context)
  },
})

const { GamePhysics } = await import('../src/GamePhysics.ts')
const { LevelLoader } = await import('../src/LevelLoader.ts')
const { FileStream } = await import('../src/utils/FileStream.ts')
const { decodeMrg, encodeMrg } = await import('../src/shell/mrg.ts')
const { parsePackJson } = await import('../src/shell/trackJson.ts')

const args = process.argv.slice(2)
const VALUE_FLAGS = new Set(['--driver', '--seconds'])
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : fallback
}
const file = args.find((a, i) => !a.startsWith('--') && !VALUE_FLAGS.has(args[i - 1])) ?? fileURLToPath(new URL('../src/assets/dev-pack.mrg', import.meta.url))
const drivers = (flag('driver', 'ai,gas,bot') ?? '').split(',')
const planFallback = !args.includes('--no-plan') && !args.includes('--driver')
const limitMs = Number(flag('seconds', '90')) * 1000

const loadPack = (path) => {
  const raw = readFileSync(resolve(path))
  if (path.endsWith('.json')) {
    const pack = parsePackJson(JSON.parse(raw.toString('utf8')))
    // кирилиця в назві дозволена в JSON (спека, секція 4), а .mrg бере лише ASCII — як fromJson у pack.ts
    const leagues = pack.leagues.map((l) => l.map((t, i) => (/^[\x20-\x7e]{1,39}$/.test(t.name) ? t : { ...t, name: `track ${i + 1}` })))
    return encodeMrg({ leagues })
  }
  // Buffer може бути виглядом у більший ArrayBuffer (пул для файлів < 4 КБ)
  return raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength)
}

const UNIT = 16384 // координати байка = одиниця треку << 14 (LevelLoader.getStartPosX)
const PHYSICS_MS = 20 // app.ts: 2 цикли фізики на зовнішній крок 30 мс, +20 мс гри на цикл
const STUCK_MS = 10000
// Натискання планувальника: [газ(1)/гальмо(-1), нахил], як GamePhysics.setInputDirection
const OPTIONS = [[1, 0], [1, -1], [1, 1], [0, 0], [0, -1], [0, 1], [-1, 0], [-1, -1], [-1, 1]]
const IDLE = 3
const PLAN_STEP = 5 // рішення кожні 5 кроків фізики = 100 мс
const PLAN_HORIZON = 24 // 24 рішення = 2,4 с уперед
const PLAN_CANDIDATES = 120
// Статичні поля LevelLoader, які фізика міняє на кожному кроці (updateVisiblePointRange)
const LOADER_STATICS = ['visibleStartPointIndex', 'visibleEndPointIndex', 'visibleStartPointX', 'visibleEndPointX']

const slopeAt = (points, x) => {
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i]
    const [x1, y1] = points[i + 1]
    if (x >= x0 && x <= x1) return Math.atan2(y1 - y0, x1 - x0)
  }
  return 0
}

const bikeState = (physics) => {
  const front = physics.bikeParts[1].motoComponents[5]
  const rear = physics.bikeParts[2].motoComponents[5]
  const fx = front.xF16 / UNIT
  const fy = front.yF16 / UNIT
  const rx = rear.xF16 / UNIT
  const ry = rear.yF16 / UNIT
  return { x: Math.max(fx, rx), y: Math.min(fy, ry), midX: (fx + rx) / 2, pitch: Math.atan2(fy - ry, fx - rx) }
}

const drive = (physics, driver, points, inputs, step) => {
  if (driver === 'plan') physics.setInputDirection(...OPTIONS[inputs[step] ?? IDLE])
  if (driver === 'gas') physics.setInputDirection(1, 0)
  if (driver !== 'bot') return
  const s = bikeState(physics)
  const rel = s.pitch - slopeAt(points, s.midX)
  physics.setInputDirection(1, rel > 0.3 ? 1 : rel < -0.3 ? -1 : 0)
}

/** Свіжий двигун на старті треку: група треків L — водночас байк L. */
const createRun = (buffer, league, track) => {
  const levels = new LevelLoader(new FileStream(buffer))
  LevelLoader.isEnabledPerspective = true
  const physics = new GamePhysics(levels)
  physics.setMode(1)
  levels.loadLevel(league, track)
  physics.setMotoLeague(league) // сам робить resetSmth — байк на старті треку
  physics.syncRenderStateFromSimulation()
  return { levels, physics }
}

const run = (buffer, league, track, driver, points, inputs = []) => {
  const { physics } = createRun(buffer, league, track)
  if (driver === 'ai') physics.enableGenerateInputAI()
  const minY = Math.min(...points.map((p) => p[1]))
  let gameMs = 0
  let running = false
  let bestX = -Infinity
  let bestAt = 0
  for (let t = 0; t < limitMs; t += PHYSICS_MS) {
    drive(physics, driver, points, inputs, t / PHYSICS_MS)
    if (running) gameMs += PHYSICS_MS
    const code = physics.updatePhysics()
    physics.syncRenderStateFromSimulation()
    const s = bikeState(physics)
    const where = `x=${Math.round(s.x)} y=${Math.round(s.y)}`
    if (code === 1 || code === 2) return `finish ${((gameMs - (code === 2 ? 10 : 0)) / 1000).toFixed(2)}s`
    if (code === 3 || code === 5) return `crash(${code}) ${(t / 1000).toFixed(1)}s ${where}`
    if (s.y < minY - 100) return `fell ${(t / 1000).toFixed(1)}s ${where}`
    if (code === 4) {
      gameMs = 0
      running = false
    } else {
      running = true
    }
    if (s.x > bestX + 5) {
      bestX = s.x
      bestAt = t
    } else if (t - bestAt > STUCK_MS) {
      return `stuck ${(t / 1000).toFixed(1)}s ${where}`
    }
  }
  return `timeout ${limitMs / 1000}s`
}

// Глибока копія стану фізики з прототипами; спільний LevelLoader (дані треку) не копіюється
const cloneDeep = (value, shared, memo = new Map()) => {
  if (value === null || typeof value !== 'object' || value === shared) return value
  if (memo.has(value)) return memo.get(value)
  const copy = Array.isArray(value) ? new Array(value.length) : Object.create(Object.getPrototypeOf(value))
  memo.set(value, copy)
  for (const key of Object.keys(value)) copy[key] = cloneDeep(value[key], shared, memo)
  return copy
}

const snapshot = (physics, levels) => ({ physics: cloneDeep(physics, levels), statics: LOADER_STATICS.map((key) => LevelLoader[key]) })

const restore = (snap, levels) => {
  LOADER_STATICS.forEach((key, i) => {
    LevelLoader[key] = snap.statics[i]
  })
  return cloneDeep(snap.physics, levels)
}

const stepWith = (physics, option) => {
  physics.setInputDirection(...OPTIONS[option])
  const code = physics.updatePhysics()
  physics.syncRenderStateFromSimulation()
  return code
}

/** Оцінка послідовності: фініш — що раніше, то краще; падіння — що пізніше й далі; інакше — як далеко заїхав. */
const score = (physics, sequence) => {
  for (let k = 0; k < sequence.length; k++) {
    for (let i = 0; i < PLAN_STEP; i++) {
      const code = stepWith(physics, sequence[k])
      const steps = k * PLAN_STEP + i
      if (code === 1 || code === 2) return 1e7 - steps
      if (code === 3 || code === 5) return -1e7 + steps * 10 + bikeState(physics).x
    }
  }
  return bikeState(physics).x
}

/** Натискання планувальника на кожен крок фізики — до фінішу, падіння чи ліміту часу. */
const planInputs = (buffer, league, track) => {
  const { levels, physics: first } = createRun(buffer, league, track)
  let physics = first
  let seed = 12345 + league * 100 + track
  const random = () => (seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff) / 0x7fffffff
  let previous = new Array(PLAN_HORIZON).fill(0)
  const inputs = []
  while (inputs.length * PHYSICS_MS < limitMs) {
    const base = snapshot(physics, levels)
    const shifted = [...previous.slice(1), previous[PLAN_HORIZON - 1]]
    const candidates = [shifted, new Array(PLAN_HORIZON).fill(0), new Array(PLAN_HORIZON).fill(1)]
    for (let n = 0; n < PLAN_CANDIDATES; n++) {
      candidates.push(Array.from({ length: PLAN_HORIZON }, (_, i) => (n % 2 && random() < 0.7 ? shifted[i] : Math.floor(random() * OPTIONS.length))))
    }
    let best = candidates[0]
    let bestScore = -Infinity
    for (const candidate of candidates) {
      const s = score(restore(base, levels), candidate)
      if (s > bestScore) {
        bestScore = s
        best = candidate
      }
    }
    physics = restore(base, levels)
    for (let i = 0; i < PLAN_STEP; i++) {
      inputs.push(best[0])
      const code = stepWith(physics, best[0])
      if (code === 1 || code === 2 || code === 3 || code === 5) return inputs
    }
    previous = best
  }
  return inputs
}

const buffer = loadPack(file)
const pack = decodeMrg(buffer)
let finished = 0
let total = 0
pack.leagues.forEach((tracks, league) => {
  tracks.forEach((t, track) => {
    const result = (d) => `${d}: ${run(buffer, league, track, d, t.points, d === 'plan' ? planInputs(buffer, league, track) : [])}`
    const results = drivers.map(result)
    if (planFallback && !results.some((r) => r.includes(': finish'))) results.push(result('plan'))
    total += 1
    if (results.some((r) => r.includes(': finish'))) finished += 1
    console.log(`L${league} T${track} ${t.name.padEnd(12)} ${results.join(' | ')}`)
  })
})
console.log(`${finished}/${total} треків фінішують хоча б одним водієм`)
process.exitCode = finished === total ? 0 : 1
```

```bash
npm pkg set scripts.sim="node scripts/sim-track.mjs"
```

- [ ] **Step 5: Прогін дев-пака, одного треку, планувальника й оригіналу**

Run: `node scripts/sim-track.mjs`
Expected (фізика детермінована; на upstream `889a091` рядки саме такі; кожен дев-трек фінішує без планувальника, тож він тут не запускається), exit 0:

```
L0 T0 Lanka        ai: finish 14.15s | gas: finish 12.07s | bot: finish 10.86s
L0 T1 Hirka        ai: finish 19.14s | gas: finish 13.19s | bot: finish 13.17s
L0 T2 Yama         ai: finish 18.66s | gas: finish 14.17s | bot: finish 14.17s
L1 T0 Lanka        ai: finish 8.51s | gas: finish 7.31s | bot: finish 7.40s
L2 T0 Lanka        ai: finish 7.69s | gas: crash(5) 3.3s x=246 y=44 | bot: finish 6.59s
5/5 треків фінішують хоча б одним водієм
```

Один JSON-трек: `node scripts/sim-track.mjs tracks/dev/02-hirka.json` → `L0 T0 Hirka        ai: finish 19.14s | gas: finish 13.19s | bot: finish 13.17s`, ще два рядки `L1 T0 Hirka`, `L2 T0 Hirka` з фінішем і `3/3 треків фінішують хоча б одним водієм`, exit 0. Трек із кириличною назвою (як треки сайту в плані B) проходить так само, лише в рядках назва `track 1`: `.mrg` бере тільки ASCII.

Планувальник окремо (≈4 хв CPU; агенту — `run_in_background` або `timeout 600000`): `node scripts/sim-track.mjs --driver plan` → exit 0 і

```
L0 T0 Lanka        plan: finish 9.12s
L0 T1 Hirka        plan: finish 11.05s
L0 T2 Yama         plan: finish 12.19s
L1 T0 Lanka        plan: finish 6.78s
L2 T0 Lanka        plan: finish 5.83s
5/5 треків фінішують хоча б одним водієм
```

Калібрування водіїв на оригіналі (один раз): `node scripts/sim-track.mjs ../gd-upstream/src/assets/levels.mrg --driver ai,gas` (з `--driver` планувальник сам не вмикається, тож прогін триває секунди) → перший рядок `L0 T0 Intro        ai: finish 12.15s | gas: finish 8.21s`, останній `3/30 треків фінішують хоча б одним водієм` і exit 1 — для оригіналу це нормально: складні треки автопілот не проходить. Як читати результат: `fell` — старт під землею або ламана обривається до фінішу; `crash(3|5)` чи `stuck` у `ai`, `gas` і `bot`, після яких не фінішує й `plan`, — трек заважкий: пологіші схили, нижчі сходинки.

- [ ] **Step 6: `CHANGELOG.md` і збірка**

```bash
printf '%s\n' '- Правила геометрії JSON-треку (`src/shell/trackJson.ts`) і безголовий прогін треків на фізиці двигуна: `scripts/sim-track.mjs` (`npm run sim`), водії ai, «лише газ», бот і планувальник.' >> CHANGELOG.md
npx tsc -b && npm run build
```

Expected: без помилок.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(shell): правила JSON-треку і sim-track — безголовий прогін треків на фізиці двигуна

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---


### Task 4: Оболонка двигуна і цикл заїзду без канвасних меню

**Files:**

- Create: `src/shell/engine.ts`, `src/shell/RaceLoop.ts`, `src/shell/keyboard.ts`, `src/shell/GameShell.ts` (тимчасова версія), `src/shell/shell.css` (тимчасова версія)
- Modify: `src/main.ts` (повністю), `eslint.config.js` (повністю)
- Delete: нічого (див. кінець Step 3)

**Interfaces:**

- Consumes: файл `src/assets/dev-pack.mrg` (Task 1); двигун: `Micro` (статики `isGameVisible`, `isInGameMenu`; поля `timeMs`, `gameTimeMs`, `crashRestartDeadlineMs`, `isTimerRunning`, `numPhysicsLoops`), `GameCanvas.create(canvas, micro)`, `init`, `loadSprites`, `setInputMode`, `isDrawingTime`, `setRepaintHandler`, `requestRepaint(0)`, `resize`, `paint(getGraphics())`, `keyPressed/keyReleased`, `resetInputState`, `handleUpdatedInput`; `GamePhysics(levelLoader)`, `applyLoadedSpriteFlags`, `setEnableLookAhead`, `setMode(1)`, `setMotoLeague(l)`, `setMinimalScreenWH`, `disableGenerateInputAI`, `resetSmth(true)`, `updatePhysics()`, `syncRenderStateFromSimulation()`; `new LevelLoader(new FileStream(buffer))`, `loadLevel(l, t)`, статики `LevelLoader.isEnabledPerspective/isEnabledShadows`. Оболонка НЕ кличе `scheduleGameTimerTask`, `micro.menuToGame()`/`gameToMenu()`, `openPauseMenu`: вони малюють на канвасі англійський текст або вмикають секундомір порту; увесь текст заїзду — DOM-HUD. `setMenuManager(null)` і `setUiOverlayEnabled` теж не потрібні: поле `menuManager` уже `null`, а `setUiOverlayEnabled` лише `void`-ить прапорець.
- Produces:
  - `createEngine(canvas: HTMLCanvasElement, packBuffer: ArrayBuffer): Promise<Engine>` де `interface Engine { micro: Micro; canvas: GameCanvas; physics: GamePhysics; levels: LevelLoader; resize(): void; render(): void }`
  - `class RaceLoop { constructor(engine: Engine, events: RaceEvents); start(league: number, track: number): void; restart(): void /* лише поки running */; pause(): void; resume(): void; stop(): void; readonly running: boolean; readonly paused: boolean; readonly crashed: boolean /* іде відлік після падіння */ }` з `interface RaceEvents { onTick(gameTimeMs: number): void; onCrash(): void; onCrashCountdown(secondsLeft: number): void; onFinish(timeMs: number): void; onRestart(): void }`
  - `formatTime(ms: number): string` → `м:сс.сс` (`1:05.30`), єдиний формат часу в HUD, треках, фініші й рекордах.
  - `bindKeyboard(target: KeyboardTarget): void` з `interface KeyboardTarget { isRacing(): boolean; isPaused(): boolean; press(code: number): void; release(code: number): void; releaseAll(): void; pause(): void; resume(): void }`

- [ ] **Step 1: `engine.ts`**

`src/shell/engine.ts`:

```ts
// src/shell/engine.ts — збирає двигун порту без MenuManager. Повторює те, що
// app.ts і MenuManager.initPart(1..7) роблять із двигуном до першого кадру заїзду
// (налаштування за замовчуванням: перспектива, тіні, look-ahead, спрайти байка й
// вершника увімкнені, Keyset 1). Логіка заїзду — у RaceLoop.
import { GameCanvas } from '../GameCanvas.ts'
import { GamePhysics } from '../GamePhysics.ts'
import { LevelLoader } from '../LevelLoader.ts'
import { Micro } from '../Micro.ts'
import { FileStream } from '../utils/FileStream.ts'

export interface Engine {
  micro: Micro
  canvas: GameCanvas
  physics: GamePhysics
  levels: LevelLoader
  resize(): void
  render(): void
}

// Біт 1 — двигун і крило спрайтами (engine.png, fender.png), біт 2 — вершник
// спрайтами (bluearm/blueleg/bluebody.png + helmet.png). Те саме дає
// MenuManager.getLoadedSpriteFlags() з налаштуваннями за замовчуванням.
const ALL_SPRITES = 3
// Keyset 1, як MenuManager.inputMode за замовчуванням. Впливає лише на цифрові
// коди 48–57; оболонка шле тільки коди дій 1/2/5/6/8.
const DEFAULT_INPUT_MODE = 0

export const createEngine = async (canvasElement: HTMLCanvasElement, packBuffer: ArrayBuffer): Promise<Engine> => {
  const micro = new Micro()
  Micro.isGameVisible = true // без цього GameCanvas.drawGame нічого не малює
  Micro.isInGameMenu = false // канвасних меню нема: повні кольори, шини малюються
  const levels = new LevelLoader(new FileStream(packBuffer))
  const physics = new GamePhysics(levels)
  const canvas = await GameCanvas.create(canvasElement, micro)
  micro.levelLoader = levels
  micro.gamePhysics = physics
  micro.gameCanvas = canvas
  canvas.init(physics)
  physics.applyLoadedSpriteFlags(await canvas.loadSprites(ALL_SPRITES))
  // MenuManager.initPart(3) із налаштуваннями за замовчуванням
  LevelLoader.isEnabledPerspective = true
  LevelLoader.isEnabledShadows = true
  physics.setEnableLookAhead(true)
  canvas.setInputMode(DEFAULT_INPUT_MODE)
  canvas.isDrawingTime = false // секундомір малює DOM-HUD, не канвас
  physics.setMode(1)

  const resize = () => {
    const rect = canvasElement.parentElement?.getBoundingClientRect()
    let width = Math.floor(rect?.width ?? 0)
    let height = Math.floor(rect?.height ?? 0)
    if (width <= 0 || height <= 0) {
      width = window.innerWidth
      height = window.innerHeight
    }
    canvas.resize(width, height)
    physics.setMinimalScreenWH(Math.min(width, height))
  }
  const render = () => canvas.paint(canvas.getGraphics())
  canvas.setRepaintHandler(render)
  resize()
  // GameCanvas стартує з loadingScreenMode = 1: drawGame малює лише білий екран і
  // смужку завантаження, доки хтось не викличе requestRepaint(0) (app.ts робить це
  // перед першим кадром). Без цього рядка заїзд ніколи не зʼявиться на канвасі.
  canvas.requestRepaint(0)
  return { micro, canvas, physics, levels, resize, render }
}
```

- [ ] **Step 2: `RaceLoop.ts` — перенесення `outerStep`/`goalLoop`/`restart` з `app.ts`**

`src/shell/RaceLoop.ts`:

```ts
// src/shell/RaceLoop.ts — цикл заїзду з app.ts порту без меню.
// Таймінги порту: зовнішній крок 30 мс; на крок micro.numPhysicsLoops (2)
// виклики updatePhysics(), кожен +20 мс ігрового часу, поки годинник іде.
// Коди updatePhysics() (GamePhysics.ts, updatePhysics і solvePhysicsStep):
//   0 — їде;
//   1/2 — перетнув фінішну лінію (2: мінус 10 мс, як в app.ts). Далі 1 с
//         goal-loop: фізика крокує без годинника. Upstream малює 'Finished',
//         якщо переднє колесо хоч раз торкалось землі після старту
//         (isTrackFinished), і 'Wheelie!', якщо весь трек проїхано на задньому;
//   3 — байк зламався (isCrashed): вершник ще падає, фізика триває;
//   4 — переднє колесо ще до стартового прапорця: годинник стоїть на нулі;
//   5 — вершник торкнувся землі або колізія не розвʼязалась: фізика замирає.
// Годинник гонки рахує лише виконані кроки: пауза, прихована вкладка й меню не
// дають «наздогнати» пропущене, а довгий кадр обрізається до MAX_FRAME_MS.
// Відхилення від app.ts (свідомі):
// - рестарт рівно через 3 с від першого коду 3 або 5 з чесним відліком 3…2…1
//   (спека; в app.ts — до 3 с від коду 3 і до 1 с після коду 5);
// - рестарт не чистить ввід: resetInputState() в app.ts чистить лише масиви
//   канвасу, а прапорці GamePhysics лишаються, тож стан розʼїжджався з тач-шаром.
//   Ввід повністю відпускається (releaseInput) на start/stop/pause/resume;
// - scheduleGameTimerTask не викликається: жодних англійських підписів на
//   канвасі ('Crashed', 'Finished', 'Wheelie!', назва треку), тексти малює DOM-HUD.
import type { Engine } from './engine.ts'

export interface RaceEvents {
  onTick(gameTimeMs: number): void
  onCrash(): void
  onCrashCountdown(secondsLeft: number): void
  onFinish(timeMs: number): void
  onRestart(): void
}

const OUTER_STEP_MS = 30
const GAME_MS_PER_PHYSICS_LOOP = 20
const GOAL_STEPS = Math.floor(1000 / OUTER_STEP_MS) // 33 кроки ≈ 1 с goal-loop з app.ts
const CRASH_STEPS = 3000 / OUTER_STEP_MS // 100 кроків = 3 с до авто-рестарту
const MAX_FRAME_MS = 100 // довший кадр (фон, дебагер) не наздоганяється

/** Секундомір за спекою (секція 2, «Заїзд»): `м:сс.сс`, як GameCanvas.drawTime порту; ігровий час іде кроками по 10–20 мс, тож соті точні. */
export const formatTime = (ms: number): string => {
  const hundredths = Math.max(0, Math.floor(ms / 10))
  const minutes = Math.floor(hundredths / 6000)
  const seconds = Math.floor((hundredths % 6000) / 100)
  return `${minutes}:${String(seconds).padStart(2, '0')}.${String(hundredths % 100).padStart(2, '0')}`
}

export class RaceLoop {
  private readonly engine: Engine
  private readonly events: RaceEvents
  private raf = 0
  private lastFrameMs = -1
  private accumulatorMs = 0
  private isRunning = false
  private isPaused = false
  private goalStepsLeft = 0
  private crashStepsLeft = 0
  private crashSecondsShown = 0
  private isFrozen = false

  // Без parameter properties: tsconfig форку має erasableSyntaxOnly.
  constructor(engine: Engine, events: RaceEvents) {
    this.engine = engine
    this.events = events
  }

  get running(): boolean {
    return this.isRunning
  }

  get paused(): boolean {
    return this.isPaused
  }

  /** Іде відлік після падіння — тап по канвасу може рестартнути одразу. */
  get crashed(): boolean {
    return this.crashStepsLeft > 0
  }

  /**
   * Старт треку тією ж послідовністю, що MenuManager (taskStart) + app.ts restart(true):
   * disableGenerateInputAI → loadLevel(група .mrg, трек) → setMotoLeague(байк) → скидання.
   * У «Дріл Мото» ліга L — це водночас група треків L у паку і байк L (spec, секція 2).
   */
  start(league: number, track: number): void {
    const { physics, levels } = this.engine
    this.stop()
    physics.disableGenerateInputAI()
    levels.loadLevel(league, track)
    physics.setMotoLeague(league)
    this.reset()
    this.isRunning = true
    this.schedule()
  }

  /** «Заново», тап під час падіння, авто-рестарт. Лише поки заїзд іде; стан паузи не змінює. */
  restart(): void {
    if (!this.isRunning) return
    this.reset()
    this.events.onRestart()
  }

  pause(): void {
    if (!this.isRunning || this.isPaused) return
    this.isPaused = true
    cancelAnimationFrame(this.raf)
    this.releaseInput()
  }

  resume(): void {
    if (!this.isRunning || !this.isPaused) return
    this.isPaused = false
    this.releaseInput()
    this.schedule()
  }

  stop(): void {
    cancelAnimationFrame(this.raf)
    this.isRunning = false
    this.isPaused = false
    this.releaseInput()
  }

  private schedule(): void {
    this.lastFrameMs = -1
    this.accumulatorMs = 0
    this.raf = requestAnimationFrame(this.loop)
  }

  /** resetInputState() чистить лише масиви канвасу; handleUpdatedInput() доносить нуль до фізики. */
  private releaseInput(): void {
    this.engine.canvas.resetInputState()
    this.engine.canvas.handleUpdatedInput()
  }

  private reset(): void {
    const { physics, micro } = this.engine
    physics.resetSmth(true)
    physics.syncRenderStateFromSimulation()
    micro.timeMs = 0
    micro.gameTimeMs = 0
    micro.crashRestartDeadlineMs = 0
    micro.isTimerRunning = false
    this.goalStepsLeft = 0
    this.crashStepsLeft = 0
    this.crashSecondsShown = 0
    this.isFrozen = false
  }

  private beginCrash(): void {
    if (this.crashStepsLeft > 0) return
    this.crashStepsLeft = CRASH_STEPS
    this.crashSecondsShown = 0
    this.events.onCrash()
    this.reportCountdown()
  }

  private reportCountdown(): void {
    const seconds = Math.ceil((this.crashStepsLeft * OUTER_STEP_MS) / 1000)
    if (seconds !== this.crashSecondsShown) {
      this.crashSecondsShown = seconds
      this.events.onCrashCountdown(seconds)
    }
  }

  private finish(): void {
    this.goalStepsLeft = 0
    this.isRunning = false
    cancelAnimationFrame(this.raf)
    this.events.onFinish(this.engine.micro.gameTimeMs)
  }

  /** goalLoopStep з app.ts: фізика без годинника; код 5 завершує одразу. */
  private goalStep(): void {
    const { physics, micro } = this.engine
    for (let i = micro.numPhysicsLoops; i > 0; --i) {
      if (physics.updatePhysics() === 5) {
        this.finish()
        return
      }
    }
    physics.syncRenderStateFromSimulation()
    this.goalStepsLeft -= 1
    if (this.goalStepsLeft === 0) this.finish()
  }

  /** outerStep з app.ts; відлік падіння — у кроках годинника гонки. */
  private outerStep(): void {
    if (this.goalStepsLeft > 0) {
      this.goalStep()
      return
    }
    if (this.crashStepsLeft > 0) {
      this.crashStepsLeft -= 1
      if (this.crashStepsLeft === 0) {
        this.restart()
        return
      }
      this.reportCountdown()
      if (this.isFrozen) return
    }
    const { physics, micro } = this.engine
    for (let i = micro.numPhysicsLoops; i > 0; --i) {
      if (micro.isTimerRunning) micro.gameTimeMs += GAME_MS_PER_PHYSICS_LOOP
      const code = physics.updatePhysics()
      if (code === 3 || code === 5) {
        this.beginCrash()
        if (code === 5) {
          this.isFrozen = true
          return
        }
      } else if (code === 4) {
        micro.gameTimeMs = 0
      } else if (code === 1 || code === 2) {
        if (code === 2) micro.gameTimeMs -= 10
        micro.isTimerRunning = true
        this.goalStepsLeft = GOAL_STEPS
        return
      }
      micro.isTimerRunning = code !== 4
    }
    physics.syncRenderStateFromSimulation()
  }

  private readonly loop = (now: number): void => {
    if (!this.isRunning || this.isPaused) return
    if (this.lastFrameMs < 0) this.lastFrameMs = now
    this.accumulatorMs += Math.min(now - this.lastFrameMs, MAX_FRAME_MS)
    this.lastFrameMs = now
    while (this.isRunning && this.accumulatorMs >= OUTER_STEP_MS) {
      this.accumulatorMs -= OUTER_STEP_MS
      this.outerStep()
    }
    this.engine.render()
    if (!this.isRunning) return
    this.events.onTick(this.engine.micro.gameTimeMs)
    this.raf = requestAnimationFrame(this.loop)
  }
}
```

Перевірені значення `formatTime`: `0` → `0:00.00`, `7980` → `0:07.98`, `12070` → `0:12.07`, `65300` → `1:05.30`, `600000` → `10:00.00`.

- [ ] **Step 3: Клавіатура, тимчасовий `GameShell.ts`, `shell.css`, `main.ts` — заїзд із клавіатури без меню**

`src/shell/keyboard.ts`:

```ts
// src/shell/keyboard.ts — клавіатура десктопа: стрілки → коди дій двигуна, Escape → пауза.
// Коди 1/2/5/6 ідуть у GameCanvas.activeActions → actionInputDelta і не залежать від
// setInputMode (той впливає лише на цифрові коди 48–57), тож setInputMode не потрібен.
// Автоповтор keydown лише повторно ставить той самий прапорець — і саме він «підхоплює»
// утримувану клавішу після рестарту, тому e.repeat не фільтруємо.
const KEY_TO_CODE = new Map<string, number>([
  ['ArrowUp', 1],
  ['ArrowDown', 6],
  ['ArrowLeft', 2],
  ['ArrowRight', 5],
])

export interface KeyboardTarget {
  isRacing(): boolean
  isPaused(): boolean
  press(code: number): void
  release(code: number): void
  releaseAll(): void
  pause(): void
  resume(): void
}

export const bindKeyboard = (target: KeyboardTarget): void => {
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      if (target.isRacing()) target.pause()
      else if (target.isPaused()) target.resume()
      else return
      e.preventDefault()
      return
    }
    const code = KEY_TO_CODE.get(e.code)
    if (code === undefined || !target.isRacing()) return
    e.preventDefault()
    target.press(code)
  })
  window.addEventListener('keyup', (e) => {
    const code = KEY_TO_CODE.get(e.code)
    if (code === undefined) return
    target.release(code)
    if (target.isRacing()) e.preventDefault()
  })
  // keyup, відпущений в іншому вікні/вкладці, сюди не прийде — інакше газ «залипає».
  window.addEventListener('blur', () => target.releaseAll())
}
```

`src/shell/GameShell.ts` (у Task 6 його замінить заїзд через `RaceSession`, у Task 7 — стан-машина екранів; зараз лише заїзд першого дев-треку і текстовий HUD):

```ts
// src/shell/GameShell.ts — склеює двигун, цикл заїзду, ввід і DOM-шар.
// Тимчасова версія Task 4: заїзд першого дев-треку і текстовий HUD; у Task 6–7 виросте в стан-машину.
import { createEngine, type Engine } from './engine.ts'
import { RaceLoop, formatTime } from './RaceLoop.ts'
import { bindKeyboard } from './keyboard.ts'
import DEV_PACK_URL from '../assets/dev-pack.mrg?url'

export class GameShell {
  private engine!: Engine
  private race!: RaceLoop
  private hud!: HTMLDivElement

  async start(root: HTMLElement): Promise<void> {
    root.replaceChildren()
    const stage = document.createElement('div')
    stage.className = 'stage'
    const canvas = document.createElement('canvas')
    canvas.className = 'game-canvas'
    this.hud = document.createElement('div')
    this.hud.className = 'hud'
    stage.append(canvas, this.hud)
    root.append(stage)

    const pack = await (await fetch(DEV_PACK_URL)).arrayBuffer()
    this.engine = await createEngine(canvas, pack)
    this.race = new RaceLoop(this.engine, {
      // onTick приходить щокадру; під час відліку падіння годинник HUD не перетирає підпис
      onTick: (ms) => {
        if (!this.race.crashed) this.hud.textContent = formatTime(ms)
      },
      onCrash: () => undefined,
      onCrashCountdown: (s) => {
        this.hud.textContent = `падіння — ще раз через ${s}…`
      },
      onFinish: (ms) => {
        this.hud.textContent = `фініш ${formatTime(ms)} — Enter: ще раз`
      },
      onRestart: () => undefined,
    })
    new ResizeObserver(() => {
      this.engine.resize()
      this.engine.render()
    }).observe(stage)
    bindKeyboard({
      isRacing: () => this.race.running && !this.race.paused,
      isPaused: () => this.race.paused,
      press: (code) => this.engine.canvas.keyPressed(code),
      release: (code) => this.engine.canvas.keyReleased(code),
      releaseAll: () => {
        this.engine.canvas.resetInputState()
        this.engine.canvas.handleUpdatedInput()
      },
      pause: () => this.race.pause(),
      resume: () => this.race.resume(),
    })
    window.addEventListener('keydown', (e) => {
      if ((e.code === 'Enter' || e.code === 'NumpadEnter') && !e.repeat) {
        e.preventDefault()
        this.race.start(0, 0)
      }
    })
    canvas.addEventListener('pointerdown', () => {
      if (this.race.crashed) this.race.restart()
    })
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.race.pause()
    })
    this.race.start(0, 0)
  }
}
```

`src/shell/shell.css`:

```css
/* src/shell/shell.css — розкладка DOM-шару над канвасом. Тимчасова версія Task 4;
   у Task 6 файл замінюється повністю. */
/* Атрибут hidden мусить перемагати display: flex у правилах екранів і тач-шару. */
[hidden] {
  display: none !important;
}
html,
body,
#root {
  margin: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #f4f4f4;
}
.stage {
  position: relative;
  width: 100%;
  height: 100%;
}
.game-canvas {
  display: block;
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
  touch-action: none;
  background: #fff;
}
.hud {
  position: absolute;
  top: 12px;
  right: 16px;
  font: 500 18px/1 system-ui, sans-serif;
  pointer-events: none;
}
.error-view {
  margin: 16px;
  white-space: pre-wrap;
  font: 13px/1.4 ui-monospace, monospace;
}
```

`src/main.ts` повністю:

```ts
import './shell/shell.css'
import { GameShell } from './shell/GameShell.ts'

const root = document.getElementById('root')
if (!(root instanceof HTMLDivElement)) throw new Error('Missing #root container')
new GameShell().start(root).catch((error: unknown) => {
  const pre = document.createElement('pre')
  pre.className = 'error-view'
  pre.textContent = error instanceof Error ? (error.stack ?? error.message) : String(error)
  root.replaceChildren(pre)
})
```

Нічого з upstream не видаляй (мінімальний дифф з upstream). `app.ts`, `MenuManager.ts`, `GameMenu.ts`, `SettingsStringRender.ts`, `TextRender.ts`, `IGameMenuElement.ts`, `IMenuManager.ts`, `RecordManager.ts`, `index.css` і `rms/*` лишаються без змін. Новий `main.ts` їх не імпортує, тож Vite їх не бандлить. `tsc -b` (include `src`) і далі перевіряє їх і проходить, бо жодна їхня залежність не зникла. Видаляти їх не можна: `TimerOrMotoPartOrMenuElem.ts:1-3` (за спекою не чіпається) імпортує типи з `IGameMenuElement.ts`, `GameMenu.ts`, `IMenuManager.ts`, а `GameMenu.ts:291` читає `micro.menuManager`.

- [ ] **Step 4: `eslint.config.js` — лінт чистий разом із кодом двигуна**

Upstream `npx eslint .` дає 20 помилок у дослівно перекладеному J2ME-коді (`no-empty`, `prefer-const`, `no-self-assign`, невикористані `_`-параметри). Спека вимагає чистого `npm run lint`, а переписувати двигун не можна, тож правила вимикаються лише для файлів двигуна.

`eslint.config.js` повністю:

```js
import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    rules: {
      // upstream позначає навмисно невикористані параметри підкресленням
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // дослівний переклад J2ME-двигуна з upstream: стиль не переписуємо, щоб диф з upstream лишався малим
    files: ['src/*.ts', 'src/lcdui/**/*.ts', 'src/rms/**/*.ts', 'src/utils/**/*.ts'],
    rules: {
      'no-empty': 'off',
      'prefer-const': 'off',
      'no-self-assign': 'off',
    },
  },
])
```

- [ ] **Step 5: Перевірка**

```bash
npx tsc -b && npm run lint && npm run build
grep -c 'fillCanvasWithImage\|gravity_defied_record_store' dist/assets/*.js
```

Expected: `tsc`, `eslint`, `vite build` без помилок; `grep` друкує `0` (канвасні меню й RMS не в бандлі).

Dev-сервер форку (порт 3100; сайт на 3000 не чіпати) — лише з вимкненою пісочницею і у фоні (для агента — `run_in_background`), після перевірки зупини його. `npm run dev`, `http://localhost:3100/`: байк і трек видно одразу (не білий екран); годинник `0:00.00` стоїть, доки переднє колесо не перетне стартовий прапорець, далі росте; ↑ газ, ↓ гальмо, ← нахил назад, → нахил вперед. ↑, натиснутий разом зі стартом заїзду (Enter і одразу ↑) і утриманий, доводить «Lanka» до фінішу за ≈0:12.07, як водій `gas` у `sim-track` (Task 3), що тисне газ із першого кроку. Якщо ↑ натиснуто пізніше, «лише газ» може зламати байк на другому горбі (x≈460, близько 5-ї секунди): із затримкою газу 0–6 с таке падіння буває приблизно в третині випадків. Це фізика треку, а не дефект оболонки: горб проходь із відпущеним газом або з нахилом ←/→. Падіння (↑ і ← одразу): «падіння — ще раз через 3…», відлік 3→2→1 і рестарт рівно через 3 с; клік по канвасу під час відліку рестартує одразу. Фініш: «фініш 0:xx.xx — Enter: ще раз» лишається на екрані; Enter запускає знову. Esc — пауза (годинник і байк стоять), Esc — продовжити без стрибка часу. Під час заїзду перемкни вкладку на 30 с — після повернення заїзд на паузі, час той самий; Esc продовжує. Затисни ↑, перемкни вкладку, відпусти ↑ там, повернись, Esc — байк не їде сам. Зміни розмір вікна — канвас підлаштовується.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(shell): двигун без канвасних меню — engine, RaceLoop з паузою й відліком, клавіатура, тимчасовий HUD, лінт

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---


### Task 5: Прогрес — рекорди й відкриття

**Files:**

- Create: `src/shell/Progress.ts`, `scripts/check-progress.mjs`
- Modify: `package.json` (скрипт `check`)

**Interfaces:**

- Consumes: npm-скрипт `check` = `node scripts/check-mrg.mjs` (Task 1).
- Produces:
  - `interface Progress { best: Record<string, number>; unlockedTracks: [number, number, number] }` (`unlockedTracks[l]` = скільки треків ліги відкрито; `[1, 0, 0]` на старті)
  - `emptyProgress(): Progress`, `loadProgress(ns: string): Progress`, `saveProgress(ns: string, p: Progress): void`, `resetProgress(ns: string): void`; ключ `localStorage` — `${ns}:progress:v1`
  - `isTrackUnlocked(p: Progress, league: number, track: number): boolean`
  - `recordFinish(p: Progress, league: number, track: number, timeMs: number, trackCounts: [number, number, number]): { progress: Progress; isBest: boolean; unlockedNextTrack: boolean; unlockedNextLeague: boolean }` — чиста функція, повертає новий обʼєкт
  - `bestKey(league: number, track: number): string` → `"L-T"`
  - npm-скрипт `check` = `node scripts/check-mrg.mjs && node scripts/check-progress.mjs`

- [ ] **Step 1: Перевірка прогресу — червона**

`scripts/check-progress.mjs`:

```js
// scripts/check-progress.mjs — чиста логіка рекордів і відкриття.
//   node scripts/check-progress.mjs
import assert from 'node:assert/strict'
import { recordFinish, isTrackUnlocked, bestKey, emptyProgress } from '../src/shell/Progress.ts'

let n = 0
const check = (name, fn) => {
  fn()
  n += 1
  console.log('ok -', name)
}
const counts = [3, 3, 3]

check('на старті відкритий лише перший трек першої ліги', () => {
  const p = emptyProgress()
  assert.equal(isTrackUnlocked(p, 0, 0), true)
  assert.equal(isTrackUnlocked(p, 0, 1), false)
  assert.equal(isTrackUnlocked(p, 1, 0), false)
})

check('фініш відкриває наступний трек і записує рекорд', () => {
  const r = recordFinish(emptyProgress(), 0, 0, 12345, counts)
  assert.equal(r.isBest, true)
  assert.equal(r.unlockedNextTrack, true)
  assert.equal(r.unlockedNextLeague, false)
  assert.equal(isTrackUnlocked(r.progress, 0, 1), true)
  assert.equal(r.progress.best[bestKey(0, 0)], 12345)
})

check('гірший час не перезаписує рекорд, кращий — перезаписує', () => {
  let p = recordFinish(emptyProgress(), 0, 0, 10000, counts).progress
  const worse = recordFinish(p, 0, 0, 11000, counts)
  assert.equal(worse.isBest, false)
  assert.equal(worse.progress.best[bestKey(0, 0)], 10000)
  const better = recordFinish(p, 0, 0, 9000, counts)
  assert.equal(better.isBest, true)
  assert.equal(better.progress.best[bestKey(0, 0)], 9000)
})

check('останній трек ліги відкриває наступну лігу', () => {
  let p = emptyProgress()
  for (let t = 0; t < 3; t++) p = recordFinish(p, 0, t, 5000, counts).progress
  assert.equal(isTrackUnlocked(p, 1, 0), true)
  assert.equal(isTrackUnlocked(p, 1, 1), false)
  const last = recordFinish(p, 0, 2, 4000, counts)
  assert.equal(last.unlockedNextLeague, false, 'повторний фініш не відкриває двічі')
})

check('повторний фініш не відкриває треки понад кількість', () => {
  let p = emptyProgress()
  for (let i = 0; i < 5; i++) p = recordFinish(p, 0, 2, 5000, counts).progress
  assert.equal(p.unlockedTracks[0] <= 3, true)
})

console.log(`ok: ${n} checks`)
```

Run: `node scripts/check-progress.mjs`
Expected: `ERR_MODULE_NOT_FOUND` на `src/shell/Progress.ts`.

- [ ] **Step 2: `Progress.ts`**

`src/shell/Progress.ts`:

```ts
// src/shell/Progress.ts — рекорди й відкриття. Чиста логіка (recordFinish,
// isTrackUnlocked) без DOM/localStorage, щоб її ганяв scripts/check-progress.mjs;
// load/save/reset — тонкі обгортки над localStorage.
export interface Progress {
  best: Record<string, number>
  unlockedTracks: [number, number, number]
}

export const bestKey = (league: number, track: number): string => `${league}-${track}`

export const emptyProgress = (): Progress => ({ best: {}, unlockedTracks: [1, 0, 0] })

export const isTrackUnlocked = (p: Progress, league: number, track: number): boolean => track < p.unlockedTracks[league]

export const recordFinish = (
  p: Progress,
  league: number,
  track: number,
  timeMs: number,
  trackCounts: [number, number, number],
): { progress: Progress; isBest: boolean; unlockedNextTrack: boolean; unlockedNextLeague: boolean } => {
  const key = bestKey(league, track)
  const prev = p.best[key]
  const isBest = prev === undefined || timeMs < prev
  const best = isBest ? { ...p.best, [key]: timeMs } : { ...p.best }
  const unlocked: [number, number, number] = [...p.unlockedTracks]
  let unlockedNextTrack = false
  let unlockedNextLeague = false
  if (track + 1 < trackCounts[league] && unlocked[league] < track + 2) {
    unlocked[league] = track + 2
    unlockedNextTrack = true
  }
  if (track + 1 === trackCounts[league] && league + 1 < 3 && unlocked[league + 1] === 0) {
    unlocked[league + 1] = 1
    unlockedNextLeague = true
  }
  return { progress: { best, unlockedTracks: unlocked }, isBest, unlockedNextTrack, unlockedNextLeague }
}

const key = (ns: string) => `${ns}:progress:v1`

const isCount = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 0

export const loadProgress = (ns: string): Progress => {
  try {
    const raw = localStorage.getItem(key(ns))
    if (!raw) return emptyProgress()
    const parsed = JSON.parse(raw) as { best?: unknown; unlockedTracks?: unknown }
    const u = parsed.unlockedTracks
    if (!Array.isArray(u) || u.length !== 3 || !u.every(isCount)) return emptyProgress()
    if (typeof parsed.best !== 'object' || parsed.best === null || Array.isArray(parsed.best)) return emptyProgress()
    const best: Record<string, number> = {}
    for (const [k, v] of Object.entries(parsed.best)) {
      if (/^[0-2]-\d+$/.test(k) && typeof v === 'number' && v > 0) best[k] = v
    }
    return { best, unlockedTracks: [Math.max(1, u[0]), u[1], u[2]] }
  } catch {
    return emptyProgress()
  }
}

export const saveProgress = (ns: string, p: Progress): void => {
  try {
    localStorage.setItem(key(ns), JSON.stringify(p))
  } catch {
    /* приватний режим — прогрес живе лише в памʼяті */
  }
}

export const resetProgress = (ns: string): void => {
  try {
    localStorage.removeItem(key(ns))
  } catch {
    /* ignore */
  }
}
```

`loadProgress` відкидає зіпсований запис: `best` лише з ключів `L-T` і додатних чисел, `unlockedTracks` — три невідʼємні цілі, перший трек першої ліги відкритий завжди.

```bash
node scripts/check-progress.mjs
npm pkg set scripts.check="node scripts/check-mrg.mjs && node scripts/check-progress.mjs"
npm run check
```

Expected: `ok: 5 checks` від `check-progress`; `npm run check` проганяє обидва скрипти (`ok: 5 checks` двічі).

- [ ] **Step 3: Типи, лінт і збірка**

Run: `npx tsc -b && npm run lint && npm run build`
Expected: без помилок. `Progress.ts` ще недосяжний із `main.ts` (його підключає `GameShell` у Task 7), але `tsc -b` і `eslint` його вже перевіряють.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(shell): прогрес — рекорди й відкриття треків і ліг

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---


### Task 6: Сесія заїзду — рядки, DOM-HUD, `RaceSession`

**Files:**

- Create: `src/shell/strings.uk.ts`, `src/shell/screens/dom.ts`, `src/shell/screens/RaceHud.ts`, `src/shell/RaceSession.ts`
- Modify: `src/shell/GameShell.ts` (повністю, тимчасова версія), `src/shell/shell.css` (повністю — розкладка DOM-шару на токенах)

**Interfaces:**

- Consumes (Task 4):
  - `createEngine(canvas: HTMLCanvasElement, packBuffer: ArrayBuffer): Promise<Engine>` і `Engine` (`canvas.keyPressed/keyReleased/resetInputState/handleUpdatedInput`, `resize()`, `render()`);
  - `new RaceLoop(engine: Engine, events: RaceEvents)` з `start(league, track)`, `restart()`, `pause()`, `resume()`, `stop()` і геттерами `running`, `paused`, `crashed`;
  - `interface RaceEvents { onTick(gameTimeMs: number): void; onCrash(): void; onCrashCountdown(secondsLeft: number): void; onFinish(timeMs: number): void; onRestart(): void }`;
  - `formatTime(ms: number): string` (`м:сс.сс`);
  - `bindKeyboard(target: KeyboardTarget): void` з `interface KeyboardTarget { isRacing(): boolean; isPaused(): boolean; press(code: number): void; release(code: number): void; releaseAll(): void; pause(): void; resume(): void }`.
- Consumes (Task 1): `decodeMrg`, `src/assets/dev-pack.mrg`.
- Produces:
  - `strings` — обʼєкт з усіма рядками оболонки (серед них `strings.controls` для тач-кнопок Task 9 і `strings.race.fps` для Task 10)
  - `el(tag, className?, text?)`, `button(label, className, onClick)`, `lockIcon(): SVGSVGElement` (замок закритої ліги чи треку), `abstract class Screen { readonly root: HTMLElement; show(): void /* перебудовує вміст і фокусує першу доступну кнопку */; hide(): void; abstract render(): void }` — основа екранів Task 7–8
  - `class RaceHud { readonly root: HTMLDivElement; constructor(onPause: () => void); setTrack(name: string): void; setTime(ms: number): void; showCrash(secondsLeft: number): void; clearNotice(): void }` (`onPause` кличе і `click`, і `pointerup` другого пальця)
  - `class RaceSession { constructor(engine: Engine, events: RaceSessionEvents); league: number; track: number; readonly racing: boolean; mount(stage: HTMLElement, canvas: HTMLCanvasElement): void; show(visible: boolean): void; start(league: number, track: number, name: string): void; pause(): void; resume(): void; restart(): void; stop(): void }`, `interface RaceSessionEvents { onPaused(): void; onResumeRequest(): void; onFinish(league: number, track: number, timeMs: number): void }`
  - `src/shell/shell.css` — повна розкладка DOM-шару (HUD, екрани меню, картки, рекорди), кольори лише як `var(--токен, #hex)`

- [ ] **Step 1: `strings.uk.ts`**

`src/shell/strings.uk.ts`:

```ts
// src/shell/strings.uk.ts — усі рядки оболонки. Назва гри — «Дріл Мото».
export const strings = {
  title: 'Дріл Мото',
  main: { play: 'Грати', records: 'Рекорди', about: 'Про гру', exit: 'Вийти' },
  leagues: {
    heading: 'Ліга',
    names: ['Легка', 'Середня', 'Важка'] as const,
    progress: (done: number, total: number) => `${done} з ${total}`,
    locked: (left: number, prev: string) => `Пройди ще ${left} у лізі «${prev}»`,
    back: 'Назад',
  },
  tracks: { heading: (league: string) => `Треки · ${league}`, noBest: '—', locked: 'Закрито', back: 'До ліг' },
  race: {
    pause: 'Пауза',
    crashed: 'Падіння',
    restartIn: (s: number) => `Ще раз через ${s}…`,
    tapToRestart: 'Тап — одразу',
    fps: (n: number) => `${n} fps`, // лише з ?debug (Task 10)
  },
  pause: { heading: 'Пауза', resume: 'Продовжити', restart: 'Заново', tracks: 'До треків', exit: 'Вийти з гри' },
  finish: {
    heading: 'Фініш',
    time: 'Час',
    prevBest: 'Попередній рекорд',
    newBest: 'Новий рекорд',
    leagueUnlocked: 'Відкрито наступну лігу',
    next: 'Далі',
    restart: 'Заново',
    tracks: 'До треків',
  },
  records: {
    heading: 'Рекорди',
    reset: 'Скинути прогрес',
    confirm: 'Скинути весь прогрес? Це не скасувати.',
    yes: 'Скинути',
    no: 'Лишити',
    back: 'Назад',
  },
  about: {
    heading: 'Про гру',
    // текст кредитів дослівно зі спеки (секція 6); посилання на код стоїть між другим і третім реченням
    text: ['Дріл Мото — мототріал у стилі класики 2004 року.', 'Механіка — з відкритого порту gravity-defied-web (GPL-2.0).'],
    source: 'Наш код: github.com/ZhekaGrem/drill-moto',
    sourceUrl: 'https://github.com/ZhekaGrem/drill-moto',
    disclaimer: 'Гра не повʼязана з Codebrew Software; треки, графіка й назва — наші.',
    version: (v: string) => `Версія ${v}`,
    back: 'Назад',
  },
  controls: {
    back: '◀ назад',
    forward: 'вперед ▶',
    brake: 'гальмо',
    gas: 'ГАЗ',
    backAria: 'Нахил назад',
    forwardAria: 'Нахил вперед',
    brakeAria: 'Гальмо',
    gasAria: 'Газ',
    keys: '← → нахил · ↑ газ · ↓ гальмо · Esc пауза',
  },
} as const
```

- [ ] **Step 2: DOM-помічники і HUD заїзду**

`src/shell/screens/dom.ts` (фокус у `show()`: Enter/пробіл одразу підтверджують першу доступну кнопку, бо код 8 без `MenuManager` нічого не робить; `lockIcon` — замок закритих ліг і треків зі спеки):

```ts
// src/shell/screens/dom.ts — крихітні помічники, щоб екрани читались як розмітка.
export const el = <K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = ''): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text) node.textContent = text
  return node
}

export const button = (label: string, className: string, onClick: () => void): HTMLButtonElement => {
  const b = el('button', className, label)
  b.type = 'button'
  b.addEventListener('click', onClick)
  return b
}

/** Екран — контейнер, що вміє показатись/сховатись; вміст перебудовується при показі. */
export abstract class Screen {
  readonly root = el('section', 'screen')

  protected constructor(id: string) {
    this.root.dataset.screen = id
    this.root.hidden = true
  }

  abstract render(): void

  show(): void {
    this.root.replaceChildren()
    this.render()
    this.root.hidden = false
    // Enter/пробіл одразу підтверджують першу доступну кнопку екрана (spec, «Керування»)
    this.root.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus()
  }

  hide(): void {
    this.root.hidden = true
  }
}

const SVG_NS = 'http://www.w3.org/2000/svg'

/** Замок закритої ліги чи треку (spec, «Потік екранів», п. 3–4). Колір — currentColor, тобто токен тексту. */
export const lockIcon = (): SVGSVGElement => {
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('class', 'lock')
  svg.setAttribute('viewBox', '0 0 16 16')
  svg.setAttribute('aria-hidden', 'true')
  const shackle = document.createElementNS(SVG_NS, 'path')
  shackle.setAttribute('d', 'M5 7V5a3 3 0 0 1 6 0v2')
  shackle.setAttribute('fill', 'none')
  shackle.setAttribute('stroke', 'currentColor')
  shackle.setAttribute('stroke-width', '1.5')
  const body = document.createElementNS(SVG_NS, 'rect')
  body.setAttribute('x', '3')
  body.setAttribute('y', '7')
  body.setAttribute('width', '10')
  body.setAttribute('height', '7')
  body.setAttribute('rx', '1.5')
  body.setAttribute('fill', 'currentColor')
  svg.append(shackle, body)
  return svg
}
```

`src/shell/screens/RaceHud.ts` (секунди відліку приходять із `RaceLoop.onCrashCountdown`, власного таймера нема; «Пауза» слухає ще й `pointerup` не-primary пальця: браузер не шле `click` від другого пальця, поки перший тримає тач-кнопку Task 9, а подвійний виклик нешкідливий — `RaceSession.pause()` поза заїздом нічого не робить):

```ts
// src/shell/screens/RaceHud.ts — DOM-HUD заїзду: назва треку ліворуч, секундомір і
// пауза праворуч угорі, підпис падіння по центру. Секунди відліку приходять із
// RaceLoop.onCrashCountdown, тож текст збігається з рестартом і стоїть у паузі.
import { strings } from '../strings.uk.ts'
import { formatTime } from '../RaceLoop.ts'
import { button, el } from './dom.ts'

export class RaceHud {
  readonly root = el('div', 'hud')
  private readonly name = el('span', 'hud-name')
  private readonly time = el('span', 'hud-time', formatTime(0))
  private readonly notice = el('div', 'hud-notice')

  constructor(onPause: () => void) {
    const bar = el('div', 'hud-bar')
    const pause = button(strings.race.pause, 'btn btn-hud', onPause)
    // click не приходить від другого пальця (не-primary pointer), поки перший тримає ГАЗ
    pause.addEventListener('pointerup', (e) => {
      if (!e.isPrimary) onPause()
    })
    bar.append(this.name, this.time, pause)
    this.root.append(bar, this.notice)
    this.root.hidden = true
    this.notice.hidden = true
  }

  setTrack(name: string): void {
    this.name.textContent = name
  }

  setTime(ms: number): void {
    this.time.textContent = formatTime(ms)
  }

  showCrash(secondsLeft: number): void {
    this.notice.textContent = `${strings.race.crashed}. ${strings.race.restartIn(secondsLeft)} ${strings.race.tapToRestart}`
    this.notice.hidden = false
  }

  clearNotice(): void {
    this.notice.hidden = true
  }
}
```

- [ ] **Step 3: `RaceSession`, стилі DOM-шару, тимчасовий `GameShell`**

`src/shell/RaceSession.ts`:

```ts
// src/shell/RaceSession.ts — усе, що живе під час заїзду: цикл RaceLoop, DOM-HUD,
// клавіатура, тап-рестарт після падіння і пауза при прихованій вкладці. Екранами
// меню не керує: про паузу й фініш повідомляє GameShell через RaceSessionEvents.
import type { Engine } from './engine.ts'
import { bindKeyboard } from './keyboard.ts'
import { RaceLoop } from './RaceLoop.ts'
import { RaceHud } from './screens/RaceHud.ts'

export interface RaceSessionEvents {
  /** Заїзд став на паузу (кнопка HUD, Escape, прихована вкладка) — показати екран паузи. */
  onPaused(): void
  /** Escape на екрані паузи — продовжити. */
  onResumeRequest(): void
  onFinish(league: number, track: number, timeMs: number): void
}

export class RaceSession {
  league = 0
  track = 0
  private readonly engine: Engine
  private readonly events: RaceSessionEvents
  private readonly hud: RaceHud
  private readonly race: RaceLoop
  private visible = false

  constructor(engine: Engine, events: RaceSessionEvents) {
    this.engine = engine
    this.events = events
    this.hud = new RaceHud(() => this.pause())
    this.race = new RaceLoop(engine, {
      onTick: (ms) => this.hud.setTime(ms),
      onCrash: () => undefined,
      onCrashCountdown: (seconds) => this.hud.showCrash(seconds),
      onFinish: (ms) => this.events.onFinish(this.league, this.track, ms),
      onRestart: () => {
        this.hud.clearNotice()
        this.hud.setTime(0)
      },
    })
  }

  /** Їде зараз: екран заїзду показаний, цикл іде, не пауза. */
  get racing(): boolean {
    return this.visible && this.race.running && !this.race.paused
  }

  /** HUD — у stage над канвасом; клавіатура, тап по канвасу, пауза при прихованій вкладці. */
  mount(stage: HTMLElement, canvas: HTMLCanvasElement): void {
    stage.append(this.hud.root)
    bindKeyboard({
      isRacing: () => this.racing,
      isPaused: () => this.race.paused,
      press: (code) => this.engine.canvas.keyPressed(code),
      release: (code) => this.engine.canvas.keyReleased(code),
      releaseAll: () => this.releaseAll(),
      pause: () => this.pause(),
      resume: () => this.events.onResumeRequest(),
    })
    // .hud прозорий для дотиків (крім кнопки паузи), тож тап по екрану доходить до канвасу
    canvas.addEventListener('pointerdown', () => {
      if (this.racing && this.race.crashed) this.race.restart()
    })
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.pause()
    })
  }

  /** HUD видно лише на екрані заїзду. */
  show(visible: boolean): void {
    this.visible = visible
    this.hud.root.hidden = !visible
  }

  start(league: number, track: number, name: string): void {
    this.league = league
    this.track = track
    this.hud.clearNotice()
    this.hud.setTrack(name)
    this.hud.setTime(0)
    this.race.start(league, track)
  }

  pause(): void {
    if (!this.racing) return
    this.race.pause()
    this.events.onPaused()
  }

  resume(): void {
    this.race.resume()
  }

  /** Той самий трек з нуля; пауза лишається, доки GameShell не викличе resume(). */
  restart(): void {
    this.race.restart()
  }

  stop(): void {
    this.race.stop()
    this.hud.clearNotice()
  }

  /** Вікно втратило фокус: keyup туди не прийде, тож відпускаємо все й доносимо нуль до фізики. */
  private releaseAll(): void {
    this.engine.canvas.resetInputState()
    this.engine.canvas.handleUpdatedInput()
  }
}
```

`src/shell/shell.css` повністю (замінює тимчасовий файл Task 4; кольори лише через токени з фолбеками, тож у Task 11 файл не переписується; правила екранів меню — `.screen`, `.card`, `.row`, `.records` тощо — тут одразу, їх уживають екрани Task 7–8):

```css
/* src/shell/shell.css — розкладка DOM-шару над канвасом. Кольори лише через токени
   сайту: до Task 11 діють фолбеки після коми, у Task 11 значення приходять із theme.css. */
*,
*::before,
*::after {
  box-sizing: border-box;
}
/* Атрибут hidden мусить перемагати display: flex нижче, інакше
   screen.hidden = true / hud.hidden = true нічого не ховають. */
[hidden] {
  display: none !important;
}
html,
body,
#root {
  margin: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--background, #fff);
  color: var(--text-primary, #000);
  font-family: 'e-Ukraine', system-ui, sans-serif;
  touch-action: none; /* спека, ризик «iframe на iOS»: жодних жестів сторінки в грі */
}
.stage {
  position: relative;
  width: 100%;
  height: 100%;
}
.game-canvas {
  display: block;
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
  touch-action: none;
  background: var(--background, #fff);
}
.error-view {
  margin: 0;
  padding: 16px;
  white-space: pre-wrap;
  font: 13px/1.4 ui-monospace, monospace;
}

/* Екрани меню: шар на весь stage, колонка до 420px по центру */
.screen {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  padding: 24px max(24px, calc((100% - 420px) / 2));
  overflow-y: auto;
  touch-action: pan-y; /* довгі меню (рекорди) гортаються пальцем, зум жестами — ні */
  background: var(--background, #fff);
}
/* пауза й фініш — поверх замороженого кадру заїзду: гру видно крізь шар */
.screen[data-screen='pause'],
.screen[data-screen='finish'] {
  background: color-mix(in srgb, var(--background, #fff) 82%, transparent);
}
.screen[data-screen='splash'] {
  cursor: pointer;
}
.title,
.heading {
  margin: 0 0 12px;
  text-align: center;
  font-weight: 700;
}
.title {
  font-size: 32px;
}
.heading {
  font-size: 24px;
}
.btn,
.card,
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  min-height: 52px;
  padding: 0 20px;
  border: 1px solid var(--border-subtle, #d6dde4);
  border-radius: var(--radius-pill, 100px);
  background: var(--surface-card, #fff);
  color: var(--text-primary, #000);
  font: inherit;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}
.btn {
  justify-content: center;
}
.btn-primary {
  border-color: var(--btn-primary, #000);
  background: var(--btn-primary, #000);
  color: var(--btn-primary-fg, #fff);
}
.btn-ghost {
  border-color: transparent;
  background: transparent;
}
.card {
  min-height: 72px;
  border-radius: 20px;
}
.card-hint,
.row-hint {
  font-weight: 400;
  color: var(--text-secondary, #606060);
}
/* закрита ліга/трек: без opacity — підпис «Пройди ще …» мусить мати контраст ≥ 4.5:1
   (спека, чекліст 14); закритість видно з пунктирної рамки, прозорого фону й замка */
.card:disabled,
.row:disabled {
  border-style: dashed;
  background: transparent;
  cursor: default;
}
.lock {
  width: 1em;
  height: 1em;
  margin-right: 6px;
  vertical-align: -0.125em;
}
.btn:focus-visible,
.card:focus-visible,
.row:focus-visible,
.about-link:focus-visible {
  outline: 2px solid var(--accent, #0073e6);
  outline-offset: 2px;
}

/* Фініш, рекорди, про гру */
.finish-time {
  margin: 0;
  text-align: center;
  font-size: 32px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.finish-best,
.finish-note,
.confirm,
.about-text,
.about-version {
  margin: 0;
  text-align: center;
}
.finish-best,
.about-version {
  color: var(--text-secondary, #606060);
}
.badge {
  align-self: center;
  margin: 0;
  padding: 4px 12px;
  border-radius: var(--radius-pill, 100px);
  background: var(--btn-primary, #000);
  color: var(--btn-primary-fg, #fff);
  font-weight: 500;
}
.records {
  width: 100%;
  border-collapse: collapse;
}
.records th {
  padding: 12px 0 4px;
  text-align: left;
}
.records td {
  padding: 4px 0;
}
.records-time {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.about-link {
  align-self: center;
  color: var(--accent, #0073e6);
}

/* HUD заїзду: сам шар прозорий для дотиків (тап по канвасу = рестарт після падіння),
   кнопка паузи — ні */
.hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.hud-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px 8px 16px;
  background: color-mix(in srgb, var(--background, #fff) 70%, transparent);
}
.hud-name {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-weight: 500;
}
.hud-time {
  font-size: 18px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}
.btn-hud {
  width: auto;
  min-height: 44px;
  pointer-events: auto;
}
.hud-notice {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(90%, 420px);
  padding: 12px 16px;
  border-radius: 20px;
  background: color-mix(in srgb, var(--background, #fff) 85%, transparent);
  text-align: center;
  font-size: 22px;
  font-weight: 700;
}
```

`src/shell/GameShell.ts` повністю (тимчасова версія Task 6: заїзд першого дев-треку через `RaceSession` з DOM-HUD; меню ще нема, тож пауза й фініш — у консоль; у Task 7 файл стане стан-машиною екранів):

```ts
// src/shell/GameShell.ts — тимчасова версія Task 6: заїзд першого дев-треку через RaceSession
// з DOM-HUD; у Task 7 виросте в стан-машину екранів. Меню ще нема: пауза й фініш — у консоль.
import DEV_PACK_URL from '../assets/dev-pack.mrg?url'
import { createEngine } from './engine.ts'
import { decodeMrg } from './mrg.ts'
import { formatTime } from './RaceLoop.ts'
import { RaceSession } from './RaceSession.ts'
import { el } from './screens/dom.ts'

export class GameShell {
  async start(root: HTMLElement): Promise<void> {
    root.replaceChildren()
    const stage = el('div', 'stage')
    const canvas = el('canvas', 'game-canvas')
    stage.append(canvas)
    root.append(stage)

    const buffer = await (await fetch(DEV_PACK_URL)).arrayBuffer()
    // decodeMrg лише читає буфер: той самий буфер далі йде в LevelLoader; '_' двигун показує пробілом
    const name = decodeMrg(buffer).leagues[0][0].name.replaceAll('_', ' ')
    const engine = await createEngine(canvas, buffer)
    const session: RaceSession = new RaceSession(engine, {
      onPaused: () => console.log('pause'),
      onResumeRequest: () => session.resume(),
      onFinish: (_league, _track, timeMs) => console.log('finish', formatTime(timeMs)),
    })
    session.mount(stage, canvas)
    session.show(true)
    new ResizeObserver(() => {
      engine.resize()
      engine.render()
    }).observe(stage)
    session.start(0, 0, name)
  }
}
```

- [ ] **Step 4: Перевірка**

Run: `npx tsc -b && npm run lint && npm run build` → чисто.

Dev-сервер форку (порт 3100; сайт на 3000 не чіпати) — лише з вимкненою пісочницею і у фоні (для агента — `run_in_background`), після перевірки зупини його. `npm run dev`, `http://localhost:3100/`: заїзд «Lanka» стартує одразу; угорі смуга HUD — «Lanka» ліворуч, `0:00.00` і кнопка «Пауза» праворуч; годинник стоїть до стартового прапорця, далі росте; падіння (↑ і ← одразу) — по центру «Падіння. Ще раз через 3… Тап — одразу», відлік 3→2→1 і рестарт рівно через 3 с; клік по канвасу під час відліку рестартує одразу; «Пауза» або Esc пише в консоль `pause`, годинник і байк стоять, Esc продовжує без стрибка часу; прихована на 30 с вкладка ставить заїзд на паузу (у консолі `pause`), Esc продовжує. Фініш «Lanka» пише в консоль `finish 0:xx.xx` і лишає кадр на екрані (ще раз — перезавантаження сторінки). «Лише газ» доводить «Lanka» до фінішу, коли ↑ затиснуто з першої миті заїзду; пізніше натиснутий газ може зламати байк на другому горбі (x≈460) — це фізика треку, а не дефект оболонки: горб проходь із відпущеним газом або з нахилом ←/→.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(shell): сесія заїзду — DOM-HUD, RaceSession, рядки й стилі DOM-шару

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---


### Task 7: DOM-екрани заїзду й меню, стан-машина гри

**Files:**

- Create: `src/shell/screens/MainScreen.ts`, `src/shell/screens/LeaguesScreen.ts`, `src/shell/screens/TracksScreen.ts`, `src/shell/screens/PauseScreen.ts`, `src/shell/screens/FinishScreen.ts`, `src/shell/screens/SplashScreen.ts`, `src/shell/screens/menus.ts`
- Modify: `src/shell/GameShell.ts` (повністю — стан-машина замість тимчасової версії Task 6)

**Interfaces:**

- Consumes (Task 5): `Progress`, `bestKey`, `emptyProgress`, `isTrackUnlocked`, `loadProgress`, `recordFinish`, `saveProgress` (сигнатури — в Interfaces Task 5).
- Consumes (Task 6): `strings`, `el`, `button`, `Screen`, `lockIcon` (`screens/dom.ts`); `RaceSession` (`constructor(engine, events)`, `league`, `track`, `mount`, `show`, `start`, `resume`, `restart`, `stop`) і `RaceSessionEvents`; класи `.screen`, `.title`, `.heading`, `.btn*`, `.card*`, `.row*`, `.lock`, `.finish-*`, `.badge` уже в `shell.css`.
- Consumes (Task 4): `createEngine`, `formatTime`.
- Consumes (Task 1): `decodeMrg`, `src/assets/dev-pack.mrg`.
- Produces:
  - `type TrackCounts = [number, number, number]`, `finishedIn(p: Progress, league: number, total: number): number` (`LeaguesScreen.ts`); `interface FinishResult { timeMs: number; prevBestMs: number | undefined; isBest: boolean; canNext: boolean; leagueUnlocked: boolean }` (`FinishScreen.ts`)
  - класи екранів, які збирає `menus.ts` (Task 8 переписує його повністю): `SplashScreen(done: () => void)`; `MainScreen(a: MainActions)` з `interface MainActions { play(): void; exit(): void }` (Task 8 додає `records(): void` і `about(): void`); `LeaguesScreen(getProgress: () => Progress, counts: () => TrackCounts, a: LeaguesActions)` з `interface LeaguesActions { open(league: number): void; back(): void }`; `TracksScreen(getProgress: () => Progress, names: () => string[][], a: TracksActions)` з `interface TracksActions { start(league: number, track: number): void; back(): void }`; `PauseScreen(a: PauseActions)` з `interface PauseActions { resume(): void; restart(): void; tracks(): void; exit(): void }`; `FinishScreen(a: FinishActions)` з `interface FinishActions { next(): void; restart(): void; tracks(): void }`
  - `type MenuId = 'splash' | 'main' | 'leagues' | 'tracks' | 'pause' | 'finish'` (Task 8 додає `'records' | 'about'`), `interface MenuActions { progress(): Progress; trackNames(): string[][]; trackCounts(): TrackCounts; go(id: MenuId): void; openTracks(league: number): void; startTrack(league: number, track: number): void; startNext(): void; retry(): void; resume(): void; restart(): void; toTracks(): void; exit(): void }` (Task 8 додає `resetProgress(): void`), `interface Menus { screens: Record<MenuId, Screen>; tracks: TracksScreen; finish: FinishScreen }`, `createMenus(a: MenuActions): Menus` (`screens/menus.ts`)
  - поля, які пишуть версії `GameShell` у Task 10–11: `TracksScreen.league: number`, `FinishScreen.result: FinishResult`
  - `type ScreenId = MenuId | 'race'` експортує `src/shell/GameShell.ts`; `GameShell` тримає назви треків `names: string[][]` (тут — з `.mrg`, у Task 10 — з індексу `dril.json`), константу `NS = 'dril-moto'` і виклик `createMenus({ … })` з рядком `      toTracks: () => this.toTracks(),`, після якого Task 8 вставляє дію скидання прогресу.

- [ ] **Step 1: Головне меню, ліги, треки**

`src/shell/screens/MainScreen.ts` (версія Task 7: «Грати» і «Вийти»; «Рекорди» і «Про гру» додає Task 8):

```ts
import { strings } from '../strings.uk.ts'
import { Screen, button, el } from './dom.ts'

export interface MainActions {
  play(): void
  exit(): void
}

export class MainScreen extends Screen {
  private readonly a: MainActions

  constructor(a: MainActions) {
    super('main')
    this.a = a
  }

  render(): void {
    this.root.append(
      el('h1', 'title', strings.title),
      button(strings.main.play, 'btn btn-primary', () => this.a.play()),
      button(strings.main.exit, 'btn btn-ghost', () => this.a.exit()),
    )
  }
}
```

`src/shell/screens/LeaguesScreen.ts`:

```ts
import { strings } from '../strings.uk.ts'
import type { Progress } from '../Progress.ts'
import { Screen, button, el, lockIcon } from './dom.ts'

export type TrackCounts = [number, number, number]

export interface LeaguesActions {
  open(league: number): void
  back(): void
}

/** Скільки треків ліги має рекорд (ключі поза поточною кількістю треків не рахуються). */
export const finishedIn = (p: Progress, league: number, total: number): number =>
  Object.keys(p.best).filter((key) => {
    const [l, t] = key.split('-').map(Number)
    return l === league && t < total
  }).length

export class LeaguesScreen extends Screen {
  private readonly getProgress: () => Progress
  private readonly counts: () => TrackCounts
  private readonly a: LeaguesActions

  constructor(getProgress: () => Progress, counts: () => TrackCounts, a: LeaguesActions) {
    super('leagues')
    this.getProgress = getProgress
    this.counts = counts
    this.a = a
  }

  render(): void {
    const p = this.getProgress()
    const counts = this.counts()
    this.root.append(el('h2', 'heading', strings.leagues.heading))
    strings.leagues.names.forEach((name, league) => {
      const total = counts[league]
      const unlocked = total > 0 && p.unlockedTracks[league] > 0
      const card = button(name, unlocked ? 'card' : 'card card-locked', () => this.a.open(league))
      const done = strings.leagues.progress(finishedIn(p, league, total), total)
      const hint = el('span', 'card-hint', unlocked ? done : `${done} · ${this.lockedHint(p, counts, league)}`)
      if (!unlocked) hint.prepend(lockIcon())
      card.append(hint)
      card.disabled = !unlocked
      this.root.append(card)
    })
    this.root.append(button(strings.leagues.back, 'btn btn-ghost', () => this.a.back()))
  }

  /** Підпис закритої ліги: скільки треків лишилось у попередній. Для ліги 0 чи порожньої — «Закрито». */
  private lockedHint(p: Progress, counts: TrackCounts, league: number): string {
    if (league === 0 || counts[league] === 0) return strings.tracks.locked
    const prev = league - 1
    const left = Math.max(0, counts[prev] - finishedIn(p, prev, counts[prev]))
    return strings.leagues.locked(left, strings.leagues.names[prev])
  }
}
```

`src/shell/screens/TracksScreen.ts`:

```ts
import { strings } from '../strings.uk.ts'
import { bestKey, isTrackUnlocked, type Progress } from '../Progress.ts'
import { formatTime } from '../RaceLoop.ts'
import { Screen, button, el, lockIcon } from './dom.ts'

export interface TracksActions {
  start(league: number, track: number): void
  back(): void
}

export class TracksScreen extends Screen {
  league = 0
  private readonly getProgress: () => Progress
  private readonly names: () => string[][]
  private readonly a: TracksActions

  constructor(getProgress: () => Progress, names: () => string[][], a: TracksActions) {
    super('tracks')
    this.getProgress = getProgress
    this.names = names
    this.a = a
  }

  render(): void {
    const p = this.getProgress()
    const league = this.league
    this.root.append(el('h2', 'heading', strings.tracks.heading(strings.leagues.names[league])))
    const names = this.names()[league] ?? []
    names.forEach((name, track) => {
      const unlocked = isTrackUnlocked(p, league, track)
      const row = button(`${track + 1}. ${name}`, unlocked ? 'row' : 'row row-locked', () => this.a.start(league, track))
      const best = p.best[bestKey(league, track)]
      const text = unlocked ? (best === undefined ? strings.tracks.noBest : formatTime(best)) : strings.tracks.locked
      const hint = el('span', 'row-hint', text)
      if (!unlocked) hint.prepend(lockIcon())
      row.append(hint)
      row.disabled = !unlocked
      this.root.append(row)
    })
    this.root.append(button(strings.tracks.back, 'btn btn-ghost', () => this.a.back()))
  }
}
```

- [ ] **Step 2: Пауза, фініш, сплеш і збирання меню**

`src/shell/screens/PauseScreen.ts`:

```ts
// src/shell/screens/PauseScreen.ts — пауза поверх замороженого кадру заїзду.
import { strings } from '../strings.uk.ts'
import { Screen, button, el } from './dom.ts'

export interface PauseActions {
  resume(): void
  restart(): void
  tracks(): void
  exit(): void
}

export class PauseScreen extends Screen {
  private readonly a: PauseActions

  constructor(a: PauseActions) {
    super('pause')
    this.a = a
  }

  render(): void {
    this.root.append(
      el('h2', 'heading', strings.pause.heading),
      button(strings.pause.resume, 'btn btn-primary', () => this.a.resume()),
      button(strings.pause.restart, 'btn', () => this.a.restart()),
      button(strings.pause.tracks, 'btn', () => this.a.tracks()),
      button(strings.pause.exit, 'btn btn-ghost', () => this.a.exit()),
    )
  }
}
```

`src/shell/screens/FinishScreen.ts`:

```ts
// src/shell/screens/FinishScreen.ts — результат заїзду поверх останнього кадру.
// GameShell записує result перед go('finish'); «Далі» є лише коли відкрито наступний трек.
import { strings } from '../strings.uk.ts'
import { formatTime } from '../RaceLoop.ts'
import { Screen, button, el } from './dom.ts'

export interface FinishResult {
  timeMs: number
  /** Рекорд до цього заїзду; undefined — трек пройдено вперше. */
  prevBestMs: number | undefined
  isBest: boolean
  canNext: boolean
  leagueUnlocked: boolean
}

export interface FinishActions {
  next(): void
  restart(): void
  tracks(): void
}

export class FinishScreen extends Screen {
  result: FinishResult = { timeMs: 0, prevBestMs: undefined, isBest: false, canNext: false, leagueUnlocked: false }
  private readonly a: FinishActions

  constructor(a: FinishActions) {
    super('finish')
    this.a = a
  }

  render(): void {
    const r = this.result
    this.root.append(
      el('h2', 'heading', strings.finish.heading),
      el('p', 'finish-time', `${strings.finish.time}: ${formatTime(r.timeMs)}`),
    )
    if (r.prevBestMs !== undefined) {
      this.root.append(el('p', 'finish-best', `${strings.finish.prevBest}: ${formatTime(r.prevBestMs)}`))
    }
    if (r.isBest) this.root.append(el('p', 'badge', strings.finish.newBest))
    if (r.leagueUnlocked) this.root.append(el('p', 'finish-note', strings.finish.leagueUnlocked))
    if (r.canNext) this.root.append(button(strings.finish.next, 'btn btn-primary', () => this.a.next()))
    this.root.append(
      button(strings.finish.restart, r.canNext ? 'btn' : 'btn btn-primary', () => this.a.restart()),
      button(strings.finish.tracks, 'btn btn-ghost', () => this.a.tracks()),
    )
  }
}
```

`src/shell/screens/SplashScreen.ts`:

```ts
// src/shell/screens/SplashScreen.ts — наш лого-кадр 800 мс перед головним меню;
// тап пропускає (spec, «Потік екранів», п. 1). Лого поки текстове — до файлу від дизайнера.
import { strings } from '../strings.uk.ts'
import { Screen, el } from './dom.ts'

const SPLASH_MS = 800

export class SplashScreen extends Screen {
  private readonly done: () => void
  private timer = 0

  constructor(done: () => void) {
    super('splash')
    this.done = done
    this.root.addEventListener('pointerdown', () => this.finish())
  }

  render(): void {
    this.root.append(el('h1', 'title', strings.title))
    window.clearTimeout(this.timer)
    this.timer = window.setTimeout(() => this.finish(), SPLASH_MS)
  }

  hide(): void {
    window.clearTimeout(this.timer)
    super.hide()
  }

  /** Таймер і тап можуть спрацювати обидва — перехід лише один раз. */
  private finish(): void {
    if (this.root.hidden) return
    this.done()
  }
}
```

`src/shell/screens/menus.ts` (версія Task 7; Task 8 переписує його повністю):

```ts
// src/shell/screens/menus.ts — збирає всі DOM-екрани меню в одну мапу для GameShell.
// Екрани не знають одне про одного: переходи й дії приходять через MenuActions.
// Версія Task 7: без «Рекордів» і «Про гру» — їх додає Task 8.
import type { Progress } from '../Progress.ts'
import type { Screen } from './dom.ts'
import { FinishScreen } from './FinishScreen.ts'
import { LeaguesScreen, type TrackCounts } from './LeaguesScreen.ts'
import { MainScreen } from './MainScreen.ts'
import { PauseScreen } from './PauseScreen.ts'
import { SplashScreen } from './SplashScreen.ts'
import { TracksScreen } from './TracksScreen.ts'

export type MenuId = 'splash' | 'main' | 'leagues' | 'tracks' | 'pause' | 'finish'

export interface MenuActions {
  progress(): Progress
  trackNames(): string[][]
  trackCounts(): TrackCounts
  go(id: MenuId): void
  openTracks(league: number): void
  startTrack(league: number, track: number): void
  /** «Далі» на фініші: наступний відкритий трек. */
  startNext(): void
  /** «Заново» на фініші: той самий трек. */
  retry(): void
  /** Пауза: «Продовжити», «Заново», «До треків». */
  resume(): void
  restart(): void
  toTracks(): void
  exit(): void
}

export interface Menus {
  screens: Record<MenuId, Screen>
  tracks: TracksScreen
  finish: FinishScreen
}

export const createMenus = (a: MenuActions): Menus => {
  const progress = () => a.progress()
  const names = () => a.trackNames()
  const tracks = new TracksScreen(progress, names, {
    start: (league, track) => a.startTrack(league, track),
    back: () => a.go('leagues'),
  })
  const finish = new FinishScreen({ next: () => a.startNext(), restart: () => a.retry(), tracks: () => a.toTracks() })
  const screens: Record<MenuId, Screen> = {
    splash: new SplashScreen(() => a.go('main')),
    main: new MainScreen({ play: () => a.go('leagues'), exit: () => a.exit() }),
    leagues: new LeaguesScreen(progress, () => a.trackCounts(), {
      open: (league) => a.openTracks(league),
      back: () => a.go('main'),
    }),
    tracks,
    pause: new PauseScreen({
      resume: () => a.resume(),
      restart: () => a.restart(),
      tracks: () => a.toTracks(),
      exit: () => a.exit(),
    }),
    finish,
  }
  return { screens, tracks, finish }
}
```

- [ ] **Step 3: `GameShell` як стан-машина**

`src/shell/GameShell.ts` повністю (версія Task 7; замінює тимчасову версію Task 6; дію скидання прогресу вставляє Task 8):

```ts
// src/shell/GameShell.ts — стан-машина екранів: вантажить пак, збирає двигун, веде
// прогрес і перемикає DOM-екрани (screens/menus.ts). Усе, що живе під час заїзду
// (цикл, HUD, ввід), — у RaceSession. Канвас лише для заїзду, меню — DOM.
import DEV_PACK_URL from '../assets/dev-pack.mrg?url'
import { createEngine } from './engine.ts'
import { decodeMrg } from './mrg.ts'
import { bestKey, emptyProgress, isTrackUnlocked, loadProgress, recordFinish, saveProgress, type Progress } from './Progress.ts'
import { RaceSession } from './RaceSession.ts'
import { el } from './screens/dom.ts'
import type { TrackCounts } from './screens/LeaguesScreen.ts'
import { createMenus, type MenuId, type Menus } from './screens/menus.ts'

export type ScreenId = MenuId | 'race'

// Префікс ключів localStorage; у Task 10 приходить з ?ns=
const NS = 'dril-moto'

export class GameShell {
  private session!: RaceSession
  private menus!: Menus
  private progress: Progress = emptyProgress()
  private names: string[][] = [[], [], []]
  private counts: TrackCounts = [0, 0, 0]
  private screen: ScreenId = 'splash'

  async start(root: HTMLElement): Promise<void> {
    root.replaceChildren()
    const stage = el('div', 'stage')
    const canvas = el('canvas', 'game-canvas')
    stage.append(canvas)
    root.append(stage)

    const buffer = await (await fetch(DEV_PACK_URL)).arrayBuffer()
    // decodeMrg лише читає буфер: той самий буфер далі йде в LevelLoader; '_' двигун показує пробілом
    this.names = decodeMrg(buffer).leagues.map((l) => l.map((t) => t.name.replaceAll('_', ' ')))
    this.counts = [this.names[0].length, this.names[1].length, this.names[2].length]
    this.progress = loadProgress(NS)
    const engine = await createEngine(canvas, buffer)
    this.session = new RaceSession(engine, {
      onPaused: () => this.go('pause'),
      onResumeRequest: () => this.resume(),
      onFinish: (league, track, timeMs) => this.finish(league, track, timeMs),
    })
    this.menus = createMenus({
      progress: () => this.progress,
      trackNames: () => this.names,
      trackCounts: () => this.counts,
      go: (id) => this.go(id),
      openTracks: (league) => this.openTracks(league),
      startTrack: (league, track) => this.startTrack(league, track),
      startNext: () => this.startNext(),
      retry: () => this.startTrack(this.session.league, this.session.track),
      resume: () => this.resume(),
      restart: () => this.restart(),
      toTracks: () => this.toTracks(),
      exit: () => this.exitGame(),
    })
    this.session.mount(stage, canvas)
    stage.append(...Object.values(this.menus.screens).map((s) => s.root))
    new ResizeObserver(() => {
      engine.resize()
      engine.render()
    }).observe(stage)
    this.go('splash')
  }

  private go(id: ScreenId): void {
    this.screen = id
    for (const [key, screen] of Object.entries(this.menus.screens)) if (key !== id) screen.hide()
    this.session.show(id === 'race')
    if (id !== 'race') this.menus.screens[id].show()
  }

  private openTracks(league: number): void {
    this.menus.tracks.league = league
    this.go('tracks')
  }

  private startTrack(league: number, track: number): void {
    this.session.start(league, track, this.names[league][track] ?? '')
    this.go('race')
  }

  private resume(): void {
    if (this.screen !== 'pause') return
    this.go('race')
    this.session.resume()
  }

  /** «Заново» з паузи: той самий трек з нуля, пауза знімається. */
  private restart(): void {
    this.session.restart()
    this.resume()
  }

  /** «До треків» з паузи або фінішу: цикл заїзду зупиняється. */
  private toTracks(): void {
    this.session.stop()
    this.openTracks(this.session.league)
  }

  /** «Вийти» з меню чи паузи. Task 10: сайт закриває гру через bridge.exit(). */
  private exitGame(): void {
    this.session.stop()
    this.go('main')
    console.log('exit')
  }

  private finish(league: number, track: number, timeMs: number): void {
    const prevBestMs: number | undefined = this.progress.best[bestKey(league, track)]
    const r = recordFinish(this.progress, league, track, timeMs, this.counts)
    this.progress = r.progress
    saveProgress(NS, this.progress)
    const canNext = this.nextTrack() !== null
    this.menus.finish.result = { timeMs, prevBestMs, isBest: r.isBest, canNext, leagueUnlocked: r.unlockedNextLeague }
    this.go('finish')
  }

  /** Наступний відкритий трек: далі в тій самій лізі, інакше перший трек наступної. */
  private nextTrack(): [number, number] | null {
    const { league, track } = this.session
    if (track + 1 < this.counts[league]) return isTrackUnlocked(this.progress, league, track + 1) ? [league, track + 1] : null
    const next = league + 1
    return next < 3 && this.counts[next] > 0 && isTrackUnlocked(this.progress, next, 0) ? [next, 0] : null
  }

  private startNext(): void {
    const next = this.nextTrack()
    if (next !== null) this.startTrack(next[0], next[1])
  }
}
```

- [ ] **Step 4: Перевірка**

Run: `npm run check && npx tsc -b && npm run lint && npm run build` → `ok: 5 checks` двічі, далі чисто.

Dev-сервер форку (порт 3100; сайт на 3000 не чіпати) — лише з вимкненою пісочницею і у фоні (для агента — `run_in_background`), після перевірки зупини його. `npm run dev`, `http://localhost:3100/`: сплеш «Дріл Мото» ≈0,8 с (тап пропускає) → головне меню — «Грати» і «Вийти» (решту додає Task 8), «Грати» у фокусі (Enter натискає) → ліги: відкрита лише «Легка» («0 з 3»); «Середня» — пунктирна рамка без прозорості, замок і «0 з 1 · Пройди ще 3 у лізі «Легка»», «Важка» — «0 з 1 · Пройди ще 1 у лізі «Середня»»; підписи закритих карток такі ж контрастні, як у відкритої → треки: відкритий лише 1-й, решта із замком і «Закрито» → заїзд: назва ліворуч, `0:00.00` і «Пауза» праворуч угорі; Esc → пауза, секундомір стоїть, фон гри видно; Esc → далі без стрибка часу; падіння (↑+←) → «Падіння. Ще раз через 3… Тап — одразу», 3→2→1 і рестарт; клік по канвасу під час відліку рестартує одразу; фініш → «Фініш», «Час: 0:xx.xx», «Новий рекорд», «Далі» у фокусі → 2-й трек; повторний фініш показує «Попередній рекорд»; після трьох треків «Легкої» — «Відкрито наступну лігу», «Далі» веде на 1-й трек «Середньої»; перезавантаження зберігає прогрес; «Вийти» пише `exit` у консоль.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(shell): DOM-екрани заїзду й меню українською і стан-машина гри

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---


### Task 8: Рекорди, скидання прогресу і «Про гру»

**Files:**

- Create: `src/shell/screens/RecordsScreen.ts`, `src/shell/screens/AboutScreen.ts`
- Modify: `src/shell/screens/MainScreen.ts` (повністю), `src/shell/screens/menus.ts` (повністю), `src/shell/GameShell.ts` (дві вставки)

**Interfaces:**

- Consumes (Task 7): `MenuId`, `MenuActions`, `Menus`, `createMenus`, `MainActions`, класи `SplashScreen`, `LeaguesScreen` (і `TrackCounts`), `TracksScreen`, `PauseScreen`, `FinishScreen` з конструкторами з Interfaces Task 7; у `GameShell.ts` — константа `NS`, рядок імпорту з `./Progress.ts` і виклик `createMenus({ … })` з рядком `      toTracks: () => this.toTracks(),`.
- Consumes (Task 6): `strings.main.records`, `strings.main.about`, `strings.records.*`, `strings.about.*`, `strings.leagues.names`, `strings.tracks.noBest`, `Screen`, `el`, `button`; класи `.records`, `.records-time`, `.confirm`, `.about-text`, `.about-link`, `.about-version`, `.btn*` уже в `shell.css`.
- Consumes (Task 5): `Progress`, `bestKey`, `emptyProgress`, `resetProgress(ns: string): void`.
- Consumes (Task 4): `formatTime`.
- Produces: фінальні `type MenuId = 'splash' | 'main' | 'leagues' | 'tracks' | 'pause' | 'finish' | 'records' | 'about'`, `interface MenuActions` з `resetProgress(): void` (решта членів — як у Task 7), `interface MainActions { play(): void; records(): void; about(): void; exit(): void }`; `RecordsScreen(getProgress: () => Progress, names: () => string[][], a: RecordsActions)` з `interface RecordsActions { reset(): void; back(): void }`; `AboutScreen(back: () => void)`, що показує `import.meta.env.VITE_APP_VERSION ?? 'dev'` (версію з `package.json` підставляє Task 13).

- [ ] **Step 1: Екрани «Рекорди» і «Про гру»**

`src/shell/screens/RecordsScreen.ts`:

```ts
// src/shell/screens/RecordsScreen.ts — найкращі часи по лігах і скидання прогресу
// з підтвердженням у тому ж екрані. У підтвердженні фокус на «Лишити»: випадковий
// Enter нічого не стирає.
import { strings } from '../strings.uk.ts'
import { bestKey, type Progress } from '../Progress.ts'
import { formatTime } from '../RaceLoop.ts'
import { Screen, button, el } from './dom.ts'

export interface RecordsActions {
  reset(): void
  back(): void
}

export class RecordsScreen extends Screen {
  private readonly getProgress: () => Progress
  private readonly names: () => string[][]
  private readonly a: RecordsActions
  private confirming = false

  constructor(getProgress: () => Progress, names: () => string[][], a: RecordsActions) {
    super('records')
    this.getProgress = getProgress
    this.names = names
    this.a = a
  }

  render(): void {
    this.root.append(el('h2', 'heading', strings.records.heading), this.table())
    if (this.confirming) {
      this.root.append(
        el('p', 'confirm', strings.records.confirm),
        button(strings.records.no, 'btn btn-primary', () => this.confirm(false)),
        button(strings.records.yes, 'btn', () => {
          this.a.reset()
          this.confirm(false)
        }),
      )
    } else {
      this.root.append(button(strings.records.reset, 'btn', () => this.confirm(true)))
    }
    this.root.append(button(strings.records.back, 'btn btn-ghost', () => this.a.back()))
  }

  hide(): void {
    this.confirming = false
    super.hide()
  }

  private confirm(on: boolean): void {
    this.confirming = on
    this.show()
  }

  private table(): HTMLTableElement {
    const p = this.getProgress()
    const table = el('table', 'records')
    this.names().forEach((tracks, league) => {
      if (tracks.length === 0) return
      const head = el('tr')
      const th = el('th', '', strings.leagues.names[league])
      th.colSpan = 2
      head.append(th)
      table.append(head)
      tracks.forEach((name, track) => {
        const best = p.best[bestKey(league, track)]
        const row = el('tr')
        const time = best === undefined ? strings.tracks.noBest : formatTime(best)
        row.append(el('td', '', `${track + 1}. ${name}`), el('td', 'records-time', time))
        table.append(row)
      })
    })
    return table
  }
}
```

`src/shell/screens/AboutScreen.ts` (`import.meta.env.VITE_APP_VERSION` до Task 13 — `undefined`, показується «Версія dev»):

```ts
// src/shell/screens/AboutScreen.ts — кредити (spec, секція 6), версія бандлу, посилання на код.
import { strings } from '../strings.uk.ts'
import { Screen, button, el } from './dom.ts'

export class AboutScreen extends Screen {
  private readonly back: () => void

  constructor(back: () => void) {
    super('about')
    this.back = back
  }

  render(): void {
    this.root.append(el('h2', 'heading', strings.about.heading))
    for (const text of strings.about.text) this.root.append(el('p', 'about-text', text))
    const source = el('a', 'about-link', strings.about.source)
    source.href = strings.about.sourceUrl
    source.target = '_blank'
    source.rel = 'noopener noreferrer'
    this.root.append(
      source,
      el('p', 'about-text', strings.about.disclaimer),
      el('p', 'about-version', strings.about.version(import.meta.env.VITE_APP_VERSION ?? 'dev')),
      button(strings.about.back, 'btn btn-ghost', () => this.back()),
    )
  }
}
```

Run: `npx tsc -b` → чисто (екрани ще ні до чого не підключені, але `tsc` їх уже перевіряє).

- [ ] **Step 2: Головне меню й збирання меню повністю**

`src/shell/screens/MainScreen.ts` повністю (фінальна версія: «Грати», «Рекорди», «Про гру», «Вийти»):

```ts
import { strings } from '../strings.uk.ts'
import { Screen, button, el } from './dom.ts'

export interface MainActions {
  play(): void
  records(): void
  about(): void
  exit(): void
}

export class MainScreen extends Screen {
  private readonly a: MainActions

  constructor(a: MainActions) {
    super('main')
    this.a = a
  }

  render(): void {
    this.root.append(
      el('h1', 'title', strings.title),
      button(strings.main.play, 'btn btn-primary', () => this.a.play()),
      button(strings.main.records, 'btn', () => this.a.records()),
      button(strings.main.about, 'btn', () => this.a.about()),
      button(strings.main.exit, 'btn btn-ghost', () => this.a.exit()),
    )
  }
}
```

`src/shell/screens/menus.ts` повністю (фінальна версія: з «Рекордами», скиданням прогресу і «Про гру»):

```ts
// src/shell/screens/menus.ts — збирає всі DOM-екрани меню в одну мапу для GameShell.
// Екрани не знають одне про одного: переходи й дії приходять через MenuActions.
import type { Progress } from '../Progress.ts'
import { AboutScreen } from './AboutScreen.ts'
import type { Screen } from './dom.ts'
import { FinishScreen } from './FinishScreen.ts'
import { LeaguesScreen, type TrackCounts } from './LeaguesScreen.ts'
import { MainScreen } from './MainScreen.ts'
import { PauseScreen } from './PauseScreen.ts'
import { RecordsScreen } from './RecordsScreen.ts'
import { SplashScreen } from './SplashScreen.ts'
import { TracksScreen } from './TracksScreen.ts'

export type MenuId = 'splash' | 'main' | 'leagues' | 'tracks' | 'pause' | 'finish' | 'records' | 'about'

export interface MenuActions {
  progress(): Progress
  trackNames(): string[][]
  trackCounts(): TrackCounts
  go(id: MenuId): void
  openTracks(league: number): void
  startTrack(league: number, track: number): void
  /** «Далі» на фініші: наступний відкритий трек. */
  startNext(): void
  /** «Заново» на фініші: той самий трек. */
  retry(): void
  /** Пауза: «Продовжити», «Заново», «До треків». */
  resume(): void
  restart(): void
  toTracks(): void
  resetProgress(): void
  exit(): void
}

export interface Menus {
  screens: Record<MenuId, Screen>
  tracks: TracksScreen
  finish: FinishScreen
}

export const createMenus = (a: MenuActions): Menus => {
  const progress = () => a.progress()
  const names = () => a.trackNames()
  const tracks = new TracksScreen(progress, names, {
    start: (league, track) => a.startTrack(league, track),
    back: () => a.go('leagues'),
  })
  const finish = new FinishScreen({ next: () => a.startNext(), restart: () => a.retry(), tracks: () => a.toTracks() })
  const screens: Record<MenuId, Screen> = {
    splash: new SplashScreen(() => a.go('main')),
    main: new MainScreen({
      play: () => a.go('leagues'),
      records: () => a.go('records'),
      about: () => a.go('about'),
      exit: () => a.exit(),
    }),
    leagues: new LeaguesScreen(progress, () => a.trackCounts(), {
      open: (league) => a.openTracks(league),
      back: () => a.go('main'),
    }),
    tracks,
    pause: new PauseScreen({
      resume: () => a.resume(),
      restart: () => a.restart(),
      tracks: () => a.toTracks(),
      exit: () => a.exit(),
    }),
    finish,
    records: new RecordsScreen(progress, names, { reset: () => a.resetProgress(), back: () => a.go('main') }),
    about: new AboutScreen(() => a.go('main')),
  }
  return { screens, tracks, finish }
}
```

Run: `npx tsc -b`
Expected: помилка в `src/shell/GameShell.ts` — у виклику `createMenus` бракує `resetProgress` (`Property 'resetProgress' is missing …`); її вставляє Step 3.

- [ ] **Step 3: Скидання прогресу в `GameShell`**

У `src/shell/GameShell.ts` (версія Task 7) дві вставки. (1) Рядок імпорту

```ts
import { bestKey, emptyProgress, isTrackUnlocked, loadProgress, recordFinish, saveProgress, type Progress } from './Progress.ts'
```

заміни на

```ts
import { bestKey, emptyProgress, isTrackUnlocked, loadProgress, recordFinish, resetProgress, saveProgress, type Progress } from './Progress.ts'
```

(2) У виклику `createMenus` після рядка `      toTracks: () => this.toTracks(),` встав:

```ts
      resetProgress: () => {
        resetProgress(NS)
        this.progress = emptyProgress()
      },
```

Run: `npx tsc -b && npm run lint` → чисто.

- [ ] **Step 4: Перевірка**

Run: `npm run check && npx tsc -b && npm run lint && npm run build` → `ok: 5 checks` двічі, далі чисто.

Dev-сервер форку (порт 3100; сайт на 3000 не чіпати) — лише з вимкненою пісочницею і у фоні (для агента — `run_in_background`), після перевірки зупини його. `npm run dev`, `http://localhost:3100/`: головне меню — «Грати», «Рекорди», «Про гру», «Вийти»; «Рекорди» — таблиця ліг і треків (після фінішу «Lanka» — її час, решта «—»); «Скинути прогрес» → підтвердження з фокусом на «Лишити» (Enter нічого не стирає) → «Скинути» повертає до одного відкритого треку (у «Лігах» знову відкрита лише «Легка», у ній — лише 1-й трек); «Про гру» — кредити дослівно зі спеки, посилання «Наш код: github.com/ZhekaGrem/drill-moto», «Версія dev»; «Назад» з обох екранів веде в головне меню.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(shell): рекорди зі скиданням прогресу і «Про гру»

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---


### Task 9: Тач-керування, підказка клавіш, вібрація на падінні

**Files:**

- Create: `src/shell/TouchControls.ts`
- Modify: `src/shell/RaceSession.ts` (повністю), `src/shell/shell.css` (дописати в кінець). `src/shell/GameShell.ts` не змінюється: HUD і тач-шар монтує `RaceSession.mount()`, який `GameShell` уже викликає з Task 7.

**Interfaces:**

- Consumes: `Engine` (`engine.canvas.keyPressed/keyReleased/resetInputState/handleUpdatedInput`), `RaceLoop` (`start/restart/pause/resume/stop`, геттери `running/paused/crashed`) і `RaceEvents` (`onTick/onCrash/onCrashCountdown/onFinish/onRestart`), `bindKeyboard`/`KeyboardTarget` (Task 4); `RaceHud` (`root`, `setTrack/setTime/showCrash/clearNotice`), `el` із `screens/dom.ts`, `strings.controls` (підписи `back`/`forward`/`brake`/`gas`, aria `backAria`/`forwardAria`/`brakeAria`/`gasAria`, `keys`), `RaceSessionEvents`, `RaceSession` (Task 6); виклики `RaceSession` з `GameShell` — `mount/show/start/pause/resume/restart/stop/racing/league/track` (Task 7).
- Produces: `class TouchControls { readonly root: HTMLDivElement; constructor(press: (code: number) => void, release: (code: number) => void); show(): void; hide(): void /* відпускає всі пальці */; releaseAll(): void }`. Публічний API `RaceSession` не змінюється.

- [ ] **Step 1: `TouchControls.ts`**

`src/shell/TouchControls.ts`:

```ts
// src/shell/TouchControls.ts — чотири зони внизу екрана → коди дій двигуна.
// pointer capture на кожній кнопці: палець може зʼїхати, не відпускаючи дії;
// мультитач — кожен pointerId живе окремо. Показує RaceSession лише за (pointer: coarse).
import { strings } from './strings.uk.ts'
import { el } from './screens/dom.ts'

const LEAN_BACK = 2
const LEAN_FORWARD = 5
const GAS = 1
const BRAKE = 6

export class TouchControls {
  readonly root = el('div', 'touch')
  private readonly active = new Map<number, number>() // pointerId → code
  private readonly press: (code: number) => void
  private readonly release: (code: number) => void

  constructor(press: (code: number) => void, release: (code: number) => void) {
    this.press = press
    this.release = release
    const c = strings.controls
    const left = el('div', 'touch-group')
    const right = el('div', 'touch-group')
    left.append(this.zone(c.back, c.backAria, 'touch-btn', LEAN_BACK), this.zone(c.forward, c.forwardAria, 'touch-btn', LEAN_FORWARD))
    right.append(this.zone(c.brake, c.brakeAria, 'touch-btn', BRAKE), this.zone(c.gas, c.gasAria, 'touch-btn touch-gas', GAS))
    this.root.append(left, right)
    this.root.hidden = true
    this.root.addEventListener('contextmenu', (e) => e.preventDefault())
  }

  private isHeld(code: number): boolean {
    for (const held of this.active.values()) if (held === code) return true
    return false
  }

  private zone(label: string, ariaLabel: string, className: string, code: number): HTMLButtonElement {
    const b = el('button', className, label)
    b.type = 'button'
    b.setAttribute('aria-label', ariaLabel)
    b.addEventListener('pointerdown', (e) => {
      e.preventDefault()
      b.setPointerCapture(e.pointerId)
      this.active.set(e.pointerId, code)
      b.classList.add('is-down')
      this.press(code)
    })
    const up = (e: PointerEvent) => {
      if (this.active.get(e.pointerId) !== code) return
      this.active.delete(e.pointerId)
      if (this.isHeld(code)) return // другий палець ще тримає ту саму кнопку
      b.classList.remove('is-down')
      this.release(code)
    }
    b.addEventListener('pointerup', up)
    b.addEventListener('pointercancel', up)
    b.addEventListener('lostpointercapture', up)
    return b
  }

  show(): void {
    this.root.hidden = false
  }

  hide(): void {
    this.releaseAll()
    this.root.hidden = true
  }

  releaseAll(): void {
    for (const code of new Set(this.active.values())) this.release(code)
    this.active.clear()
    this.root.querySelectorAll('.is-down').forEach((n) => n.classList.remove('is-down'))
  }
}
```

Корінь створюється прихованим; `RaceSession` показує його лише на екрані заїзду і лише за `(pointer: coarse)`. Поки другий палець тримає ту саму кнопку, відпускання першого дію не відпускає.

- [ ] **Step 2: Підключення в `RaceSession`, стилі**

`src/shell/RaceSession.ts` повністю (Task 9: тач-кнопки за `(pointer: coarse)`, підказка клавіш на десктопі, `touch.releaseAll()` у паузі й на blur, вібрація на падінні зі спеки, секція 5):

```ts
// src/shell/RaceSession.ts — усе, що живе під час заїзду: цикл RaceLoop, DOM-HUD,
// тач-кнопки, клавіатура, тап-рестарт після падіння і пауза при прихованій вкладці.
// Екранами меню не керує: про паузу й фініш повідомляє GameShell через RaceSessionEvents.
import type { Engine } from './engine.ts'
import { bindKeyboard } from './keyboard.ts'
import { RaceLoop } from './RaceLoop.ts'
import { strings } from './strings.uk.ts'
import { TouchControls } from './TouchControls.ts'
import { el } from './screens/dom.ts'
import { RaceHud } from './screens/RaceHud.ts'

export interface RaceSessionEvents {
  /** Заїзд став на паузу (кнопка HUD, Escape, прихована вкладка) — показати екран паузи. */
  onPaused(): void
  /** Escape на екрані паузи — продовжити. */
  onResumeRequest(): void
  onFinish(league: number, track: number, timeMs: number): void
}

export class RaceSession {
  league = 0
  track = 0
  private readonly engine: Engine
  private readonly events: RaceSessionEvents
  private readonly hud: RaceHud
  private readonly touch: TouchControls
  private readonly race: RaceLoop
  // тач-кнопки лише на сенсорних екранах; на десктопі — рядок клавіш у HUD
  private readonly coarse = window.matchMedia('(pointer: coarse)').matches
  private visible = false

  constructor(engine: Engine, events: RaceSessionEvents) {
    this.engine = engine
    this.events = events
    this.hud = new RaceHud(() => this.pause())
    this.touch = new TouchControls(
      (code) => engine.canvas.keyPressed(code),
      (code) => engine.canvas.keyReleased(code),
    )
    this.race = new RaceLoop(engine, {
      onTick: (ms) => this.hud.setTime(ms),
      // спека, секція 5: коротка вібрація на падінні там, де вона є (iOS Safari — ні)
      onCrash: () => {
        if (typeof navigator.vibrate === 'function') navigator.vibrate(40)
      },
      onCrashCountdown: (seconds) => this.hud.showCrash(seconds),
      onFinish: (ms) => this.events.onFinish(this.league, this.track, ms),
      onRestart: () => {
        this.hud.clearNotice()
        this.hud.setTime(0)
      },
    })
  }

  /** Їде зараз: екран заїзду показаний, цикл іде, не пауза. */
  get racing(): boolean {
    return this.visible && this.race.running && !this.race.paused
  }

  /** HUD і тач-шар — у stage над канвасом; клавіатура, тап по канвасу, пауза при прихованій вкладці. */
  mount(stage: HTMLElement, canvas: HTMLCanvasElement): void {
    if (!this.coarse) this.hud.root.append(el('div', 'hud-keys', strings.controls.keys))
    stage.append(this.hud.root, this.touch.root)
    bindKeyboard({
      isRacing: () => this.racing,
      isPaused: () => this.race.paused,
      press: (code) => this.engine.canvas.keyPressed(code),
      release: (code) => this.engine.canvas.keyReleased(code),
      releaseAll: () => this.releaseAll(),
      pause: () => this.pause(),
      resume: () => this.events.onResumeRequest(),
    })
    // .hud прозорий для дотиків (крім кнопки паузи), тож тап по екрану доходить до канвасу
    canvas.addEventListener('pointerdown', () => {
      if (this.racing && this.race.crashed) this.race.restart()
    })
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.pause()
    })
  }

  /** HUD і тач-кнопки видно лише на екрані заїзду; touch.hide() відпускає всі пальці. */
  show(visible: boolean): void {
    this.visible = visible
    this.hud.root.hidden = !visible
    if (visible && this.coarse) this.touch.show()
    else this.touch.hide()
  }

  start(league: number, track: number, name: string): void {
    this.league = league
    this.track = track
    this.hud.clearNotice()
    this.hud.setTrack(name)
    this.hud.setTime(0)
    this.race.start(league, track)
  }

  pause(): void {
    if (!this.racing) return
    this.race.pause()
    this.touch.releaseAll()
    this.events.onPaused()
  }

  resume(): void {
    this.race.resume()
  }

  /** Той самий трек з нуля; пауза лишається, доки GameShell не викличе resume(). */
  restart(): void {
    this.race.restart()
  }

  stop(): void {
    this.race.stop()
    this.hud.clearNotice()
  }

  /** Вікно втратило фокус: keyup туди не прийде, тож відпускаємо все й доносимо нуль до фізики. */
  private releaseAll(): void {
    this.touch.releaseAll()
    this.engine.canvas.resetInputState()
    this.engine.canvas.handleUpdatedInput()
  }
}
```

У кінець `src/shell/shell.css` додай (через порожній рядок):

```css
/* Task 9: тач-керування. Нижні 30% екрана (мінімум 120px): ліворуч нахил назад/вперед,
   праворуч гальмо і газ (газ удвічі ширший); кожна ціль ≥ 56×56px, між кнопками 8px.
   На 320px усе влазить рівно: 8 + 56 + 8 + 56 + 8 + 56 + 8 + 112 + 8 = 320. */
.touch {
  position: absolute;
  inset: auto 0 0 0;
  height: max(30%, 120px);
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 8px max(8px, env(safe-area-inset-bottom));
  pointer-events: none;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}
/* ширини в частках: «назад», «вперед», «гальмо» — по 1, «ГАЗ» — 2; на 360px кожна ≈ 63px.
   min-width: auto — група не стискається вужче за свої кнопки з min-width */
.touch-group {
  display: flex;
  flex: 2 1 0;
  gap: 8px;
  min-width: auto;
  pointer-events: auto;
}
.touch-group:last-child {
  flex-grow: 3;
}
.touch-btn {
  flex: 1 1 0;
  min-width: 56px;
  min-height: 56px;
  padding: 0 4px;
  border: 0;
  border-radius: var(--radius-pill, 100px);
  /* напівпрозора капсула поверх канвасу; підпис — колір фону (контраст ≥ 4.5:1 в обох
     темах). Перший рядок — непрозорий фолбек для браузерів без color-mix(). */
  background: var(--text-secondary, #606060);
  background: color-mix(in srgb, var(--text-primary, #000) 55%, transparent);
  color: var(--background, #fff);
  font: inherit;
  font-size: clamp(12px, 3.6vw, 16px); /* «гальмо» влазить у кнопку й на 320px */
  font-weight: 500;
  line-height: 1.2;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
}
.touch-gas {
  flex-grow: 2;
  min-width: 112px;
  background: var(--gradient-brand, #4b8bfa);
  color: var(--btn-primary-hover-fg, #000);
}
/* натиснута кнопка темнішає без затримки (спека): :active і клас від pointerdown.
   filter, а не фон: у темній темі фон капсули — світлий --text-primary, і більша
   його частка кнопку б освітлювала */
.touch-btn:active,
.touch-btn.is-down {
  filter: brightness(0.7);
}
/* десктоп: підказка клавіш під канвасом замість тач-кнопок */
.hud-keys {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 14px;
  border-radius: var(--radius-pill, 100px);
  background: color-mix(in srgb, var(--background, #fff) 80%, transparent);
  color: var(--text-secondary, #606060);
  font-size: 14px;
  white-space: nowrap;
}
```

Run: `npx tsc -b && npm run lint && npm run build` → чисто.

- [ ] **Step 3: Перевірка на телефоні**

Dev-сервер форку (порт 3100; сайт на 3000 не чіпати) — лише з вимкненою пісочницею і у фоні (для агента — `run_in_background`), після перевірки зупини його.

Run: `npm run dev -- --host`, відкрий з телефона `http://<ip-Mac>:3100/`.
Очікування: кнопки «◀ назад», «вперед ▶», «гальмо», «ГАЗ» внизу, газ удвічі ширший, між кнопками 8px, на 360px підписи не вилазять за капсули; в емуляції пристрою DevTools (тач, ширина 320px) кожна кнопка не вужча за 56px (газ — 112px), нічого не вилазить за край; газ + «назад» одночасно робить вілі; відпускання «назад» лишає газ; палець зʼїхав з газу — газ тримається до відпускання; натиснута кнопка темнішає одразу, а після відпускання повертається до звичайного вигляду; після паузи всі кнопки відпущені; довгий тап не відкриває контекстне меню; сторінка не зумиться подвійним тапом; у меню щипок не зумить, «Рекорди» гортаються пальцем; падіння — коротка вібрація (Android Chrome; iOS Safari не вібрує); кнопка «Пауза» у HUD натискається; і тоді, коли інший палець тримає ГАЗ чи нахил (пауза відпускає всі кнопки); тап по треку під час відліку падіння рестартує. На десктопі кнопок нема, внизу рядок «← → нахил · ↑ газ · ↓ гальмо · Esc пауза»; перемкнись в інше вікно з затиснутою ↑ — після повернення байк не їде сам.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(shell): тач-керування з pointer capture і мультитачем, підказка клавіш, вібрація на падінні

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---


### Task 10: Конфіг з URL, міст до сайту, пак і назви, FPS

**Files:**

- Create: `src/shell/config.ts`, `src/shell/bridge.ts`, `src/shell/pack.ts`, `src/shell/FpsMeter.ts`
- Modify: `src/shell/RaceSession.ts` (повністю), `src/shell/GameShell.ts` (повністю — версія з конфігом і мостом), `src/shell/shell.css` (дописати `.hud-fps`)

**Interfaces:**

- Consumes (Task 1): `encodeMrg`, `decodeMrg`, `MrgPack` (`src/shell/mrg.ts`), `src/assets/dev-pack.mrg`.
- Consumes (Task 3): `parsePackJson(json: unknown): MrgPack` (`src/shell/trackJson.ts`).
- Consumes (Task 4): `createEngine`/`Engine` (поле `canvas: GameCanvas`), `RaceLoop`/`RaceEvents`, `bindKeyboard`/`KeyboardTarget`.
- Consumes (Task 5): `Progress`, `emptyProgress`, `loadProgress`, `saveProgress`, `resetProgress`, `recordFinish`, `isTrackUnlocked`, `bestKey`.
- Consumes (Task 6): `strings.race.fps`, `strings.controls.keys`, `el` і `Screen.show()`/`hide()` (`screens/dom.ts`), `RaceHud`, `RaceSessionEvents`.
- Consumes (Task 7–8): `TrackCounts` (`screens/LeaguesScreen.ts`), `createMenus`/`MenuId`/`Menus` і `MenuActions` з `resetProgress` (`screens/menus.ts`, версія Task 8), `TracksScreen.league`, `FinishScreen.result: FinishResult`.
- Consumes (Task 9): `TouchControls` (`show()`, `hide()`, `releaseAll()`).
- Produces: `readConfig(search?: string): Config` де `interface Config { tracksUrl: string; ns: string; lang: 'uk'; theme: 'light' | 'dark'; debug: boolean; jsonUrl: string | null }`; `bridge.ready(version)`, `bridge.exit()`, `bridge.finished(league, track, timeMs, best)`.
- Produces: `loadPack(cfg: Config): Promise<LoadedPack>` з `interface LoadedPack { buffer: ArrayBuffer; names: string[][] }`; `class FpsMeter { readonly root: HTMLDivElement; tick(now: number): void; reset(): void }`; конструктор `RaceSession(engine, events, debug: boolean)` (третій параметр — FPS у HUD); `GameShell.ts`, до якого Task 11 додає шрифти й сплеш-заглушку, а Task 12 — палітру.

- [ ] **Step 1: `config.ts`, `bridge.ts`, пак і назви, FPS**

`src/shell/config.ts`:

```ts
// src/shell/config.ts — усе, що сайт передає грі, іде query-параметрами iframe.
export interface Config {
  tracksUrl: string
  ns: string
  lang: 'uk'
  theme: 'light' | 'dark'
  debug: boolean
  jsonUrl: string | null
}

export const readConfig = (search = window.location.search): Config => {
  const q = new URLSearchParams(search)
  return {
    tracksUrl: q.get('tracks') ?? './tracks/dril.mrg',
    ns: q.get('ns') ?? 'dril-moto',
    lang: 'uk',
    theme: q.get('theme') === 'dark' ? 'dark' : 'light',
    debug: q.has('debug'),
    jsonUrl: q.has('debug') ? q.get('json') : null,
  }
}
```

`src/shell/bridge.ts`:

```ts
// src/shell/bridge.ts — повідомлення сайту. Той самий origin: iframe /moto/index.html
// живе на домені сайту, тож targetOrigin = window.location.origin.
type MotoMessage =
  | { source: 'dril-moto'; type: 'ready'; version: string }
  | { source: 'dril-moto'; type: 'exit' }
  | { source: 'dril-moto'; type: 'finished'; league: number; track: number; timeMs: number; best: boolean }

const post = (msg: MotoMessage) => {
  if (window.parent !== window) window.parent.postMessage(msg, window.location.origin)
}

export const bridge = {
  ready: (version: string) => post({ source: 'dril-moto', type: 'ready', version }),
  exit: () => post({ source: 'dril-moto', type: 'exit' }),
  finished: (league: number, track: number, timeMs: number, best: boolean) => post({ source: 'dril-moto', type: 'finished', league, track, timeMs, best }),
}
```

`src/shell/pack.ts` (Vite з `appType: 'spa'` на відсутній файл віддає `index.html` зі статусом 200, тож `fetchOk` вважає помилкою і не-2xx, і `text/html`; у JSON-режимі в `.mrg` ідуть ASCII-заглушки, бо `encodeMrg` відкидає кирилицю, а українські назви — одразу в списки; `.mrg` і індекс назв вантажаться паралельно, щоб не додавати ще одну хвилю запитів до першого кадру меню):

```ts
// src/shell/pack.ts — звідки брати пак треків і назви для списків.
//  - ?debug&json=<url>: JSON-трек або пак (формат tracks/dev/*.json) без збірки;
//  - інакше ?tracks=<url> (сайт: /moto/tracks/dril.mrg) і поруч індекс назв — той самий
//    шлях з .json замість .mrg, [{ league, index, name, slug }]; без індексу — назви з .mrg;
//  - у `npm run dev` без пака сайту — дев-пак із src/assets (у прод-бандл не потрапляє).
import type { Config } from './config.ts'
import { decodeMrg, encodeMrg, type MrgPack } from './mrg.ts'
import { parsePackJson } from './trackJson.ts'

export interface LoadedPack {
  buffer: ArrayBuffer
  names: string[][]
}

interface IndexEntry {
  league: number
  index: number
  name: string
  slug: string
}

/** LevelLoader читає назву в .mrg як ASCII до 39 байт. */
const MRG_NAME = /^[\x20-\x7e]{1,39}$/

/** Помилка і для не-2xx, і для HTML: vite dev/preview на відсутній файл віддають index.html зі статусом 200. */
const fetchOk = async (url: string): Promise<Response> => {
  const res = await fetch(url)
  if (!res.ok || (res.headers.get('content-type') ?? '').includes('text/html')) {
    throw new Error(`${url}: файл не знайдено (HTTP ${res.status})`)
  }
  return res
}

const fromJson = async (url: string): Promise<LoadedPack> => {
  const pack = parsePackJson(await (await fetchOk(url)).json())
  // у .mrg ідуть ASCII-заглушки, українські назви JSON — одразу в списки
  const leagues = pack.leagues.map((l) => l.map((t, i) => (MRG_NAME.test(t.name) ? t : { ...t, name: `track ${i + 1}` })))
  return { buffer: encodeMrg({ leagues } as MrgPack), names: pack.leagues.map((l) => l.map((t) => t.name)) }
}

const readMrg = async (url: string): Promise<ArrayBuffer> => {
  try {
    return await (await fetchOk(url)).arrayBuffer()
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(`${url} недоступний — граю дев-пак із src/assets`, error)
      const { default: devPackUrl } = await import('../assets/dev-pack.mrg?url')
      return await (await fetchOk(devPackUrl)).arrayBuffer()
    }
    throw error
  }
}

const indexUrlOf = (mrgUrl: string): string | null => {
  const url = new URL(mrgUrl, window.location.href)
  if (!url.pathname.endsWith('.mrg')) return null
  url.pathname = url.pathname.replace(/\.mrg$/, '.json')
  return url.href
}

/** Індекс назв поруч із паком; null — нема (404, не JSON, мережа): індекс необовʼязковий. */
const readIndex = async (mrgUrl: string): Promise<IndexEntry[] | null> => {
  const indexUrl = indexUrlOf(mrgUrl)
  if (indexUrl === null) return null
  try {
    return (await (await fetchOk(indexUrl)).json()) as IndexEntry[]
  } catch {
    return null
  }
}

/** Українські назви з індексу поверх ASCII-назв із .mrg; без індексу лишаються назви .mrg. */
const withIndexNames = (index: IndexEntry[] | null, names: string[][]): string[][] => {
  if (index === null) return names
  const out = names.map((l) => [...l])
  for (const e of index) {
    if (typeof e.name === 'string' && out[e.league]?.[e.index] !== undefined) out[e.league][e.index] = e.name
  }
  return out
}

export const loadPack = async (cfg: Config): Promise<LoadedPack> => {
  if (cfg.jsonUrl) return fromJson(cfg.jsonUrl)
  // пак і індекс назв — паралельно: кожна послідовна хвиля запитів на 3G ≈ RTT (бюджет спеки 1,5 с)
  const [buffer, index] = await Promise.all([readMrg(cfg.tracksUrl), readIndex(cfg.tracksUrl)])
  // '_' у назві .mrg двигун показує пробілом — так само в списках
  const names = decodeMrg(buffer).leagues.map((l) => l.map((t) => t.name.replaceAll('_', ' ')))
  return { buffer, names: withIndexNames(index, names) }
}
```

`src/shell/FpsMeter.ts`:

```ts
// src/shell/FpsMeter.ts — лічильник кадрів для ?debug: раз на секунду пише «NN fps» у HUD.
import { strings } from './strings.uk.ts'
import { el } from './screens/dom.ts'

export class FpsMeter {
  readonly root = el('div', 'hud-fps')
  private frames = 0
  private since = -1

  /** Кличеться на кожному кадрі заїзду (RaceLoop.onTick). */
  tick(now: number): void {
    if (this.since < 0) this.since = now
    this.frames += 1
    const elapsed = now - this.since
    if (elapsed < 1000) return
    this.root.textContent = strings.race.fps(Math.round((this.frames * 1000) / elapsed))
    this.frames = 0
    this.since = now
  }

  /** Після паузи чи старту відлік з нуля: час без кадрів не рахується. */
  reset(): void {
    this.frames = 0
    this.since = -1
  }
}
```

`src/shell/RaceSession.ts` повністю (фінальна версія: Task 9 + FPS у `?debug`):

```ts
// src/shell/RaceSession.ts — усе, що живе під час заїзду: цикл RaceLoop, DOM-HUD,
// тач-кнопки, клавіатура, тап-рестарт після падіння, пауза при прихованій вкладці і
// FPS у ?debug. Екранами меню не керує: про паузу й фініш повідомляє GameShell через
// RaceSessionEvents.
import type { Engine } from './engine.ts'
import { FpsMeter } from './FpsMeter.ts'
import { bindKeyboard } from './keyboard.ts'
import { RaceLoop } from './RaceLoop.ts'
import { strings } from './strings.uk.ts'
import { TouchControls } from './TouchControls.ts'
import { el } from './screens/dom.ts'
import { RaceHud } from './screens/RaceHud.ts'

export interface RaceSessionEvents {
  /** Заїзд став на паузу (кнопка HUD, Escape, прихована вкладка) — показати екран паузи. */
  onPaused(): void
  /** Escape на екрані паузи — продовжити. */
  onResumeRequest(): void
  onFinish(league: number, track: number, timeMs: number): void
}

export class RaceSession {
  league = 0
  track = 0
  private readonly engine: Engine
  private readonly events: RaceSessionEvents
  private readonly hud: RaceHud
  private readonly touch: TouchControls
  private readonly race: RaceLoop
  private readonly fps: FpsMeter | null
  // тач-кнопки лише на сенсорних екранах; на десктопі — рядок клавіш у HUD
  private readonly coarse = window.matchMedia('(pointer: coarse)').matches
  private visible = false

  constructor(engine: Engine, events: RaceSessionEvents, debug: boolean) {
    this.engine = engine
    this.events = events
    this.hud = new RaceHud(() => this.pause())
    this.fps = debug ? new FpsMeter() : null
    this.touch = new TouchControls(
      (code) => engine.canvas.keyPressed(code),
      (code) => engine.canvas.keyReleased(code),
    )
    this.race = new RaceLoop(engine, {
      onTick: (ms) => {
        this.hud.setTime(ms)
        this.fps?.tick(performance.now())
      },
      // спека, секція 5: коротка вібрація на падінні там, де вона є (iOS Safari — ні)
      onCrash: () => {
        if (typeof navigator.vibrate === 'function') navigator.vibrate(40)
      },
      onCrashCountdown: (seconds) => this.hud.showCrash(seconds),
      onFinish: (ms) => this.events.onFinish(this.league, this.track, ms),
      onRestart: () => {
        this.hud.clearNotice()
        this.hud.setTime(0)
      },
    })
  }

  /** Їде зараз: екран заїзду показаний, цикл іде, не пауза. */
  get racing(): boolean {
    return this.visible && this.race.running && !this.race.paused
  }

  /** HUD і тач-шар — у stage над канвасом; клавіатура, тап по канвасу, пауза при прихованій вкладці. */
  mount(stage: HTMLElement, canvas: HTMLCanvasElement): void {
    if (!this.coarse) this.hud.root.append(el('div', 'hud-keys', strings.controls.keys))
    if (this.fps !== null) this.hud.root.append(this.fps.root)
    stage.append(this.hud.root, this.touch.root)
    bindKeyboard({
      isRacing: () => this.racing,
      isPaused: () => this.race.paused,
      press: (code) => this.engine.canvas.keyPressed(code),
      release: (code) => this.engine.canvas.keyReleased(code),
      releaseAll: () => this.releaseAll(),
      pause: () => this.pause(),
      resume: () => this.events.onResumeRequest(),
    })
    // .hud прозорий для дотиків (крім кнопки паузи), тож тап по екрану доходить до канвасу
    canvas.addEventListener('pointerdown', () => {
      if (this.racing && this.race.crashed) this.race.restart()
    })
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.pause()
    })
  }

  /** HUD і тач-кнопки видно лише на екрані заїзду; touch.hide() відпускає всі пальці. */
  show(visible: boolean): void {
    this.visible = visible
    this.hud.root.hidden = !visible
    if (visible && this.coarse) this.touch.show()
    else this.touch.hide()
  }

  start(league: number, track: number, name: string): void {
    this.league = league
    this.track = track
    this.hud.clearNotice()
    this.hud.setTrack(name)
    this.hud.setTime(0)
    this.fps?.reset()
    this.race.start(league, track)
  }

  pause(): void {
    if (!this.racing) return
    this.race.pause()
    this.touch.releaseAll()
    this.events.onPaused()
  }

  resume(): void {
    this.fps?.reset()
    this.race.resume()
  }

  /** Той самий трек з нуля; пауза лишається, доки GameShell не викличе resume(). */
  restart(): void {
    this.race.restart()
  }

  stop(): void {
    this.race.stop()
    this.hud.clearNotice()
  }

  /** Вікно втратило фокус: keyup туди не прийде, тож відпускаємо все й доносимо нуль до фізики. */
  private releaseAll(): void {
    this.touch.releaseAll()
    this.engine.canvas.resetInputState()
    this.engine.canvas.handleUpdatedInput()
  }
}
```

`src/shell/GameShell.ts` повністю (версія Task 10; шрифти й сплеш-заглушку додає Task 11, палітру — Task 12):

```ts
// src/shell/GameShell.ts — стан-машина екранів: читає конфіг з URL, вантажить пак,
// збирає двигун, веде прогрес, перемикає DOM-екрани (screens/menus.ts) і говорить із
// сайтом (bridge.ts). Усе, що живе під час заїзду (цикл, HUD, ввід), — у RaceSession.
import { bridge } from './bridge.ts'
import { readConfig, type Config } from './config.ts'
import { createEngine } from './engine.ts'
import { loadPack } from './pack.ts'
import { bestKey, emptyProgress, isTrackUnlocked, loadProgress, recordFinish, resetProgress, saveProgress, type Progress } from './Progress.ts'
import { RaceSession } from './RaceSession.ts'
import { el } from './screens/dom.ts'
import type { TrackCounts } from './screens/LeaguesScreen.ts'
import { createMenus, type MenuId, type Menus } from './screens/menus.ts'

export type ScreenId = MenuId | 'race'

const VERSION: string = import.meta.env.VITE_APP_VERSION ?? 'dev'

export class GameShell {
  private cfg!: Config
  private ns = ''
  private session!: RaceSession
  private menus!: Menus
  private progress: Progress = emptyProgress()
  private names: string[][] = [[], [], []]
  private counts: TrackCounts = [0, 0, 0]
  private screen: ScreenId = 'splash'

  async start(root: HTMLElement): Promise<void> {
    this.cfg = readConfig()
    // пробні треки з ?debug&json= пишуть прогрес окремо й не чіпають справжній
    this.ns = this.cfg.jsonUrl ? `${this.cfg.ns}:json` : this.cfg.ns
    // iframe не бачить data-theme сайту: тема приходить параметром (spec, секція 1)
    document.documentElement.dataset.theme = this.cfg.theme
    root.replaceChildren()
    const stage = el('div', 'stage')
    const canvas = el('canvas', 'game-canvas')
    stage.append(canvas)
    root.append(stage)

    const pack = await loadPack(this.cfg)
    this.names = pack.names
    this.counts = [pack.names[0].length, pack.names[1].length, pack.names[2].length]
    this.progress = loadProgress(this.ns)
    const engine = await createEngine(canvas, pack.buffer)
    this.session = new RaceSession(
      engine,
      {
        onPaused: () => this.go('pause'),
        onResumeRequest: () => this.resume(),
        onFinish: (league, track, timeMs) => this.finish(league, track, timeMs),
      },
      this.cfg.debug,
    )
    this.menus = createMenus({
      progress: () => this.progress,
      trackNames: () => this.names,
      trackCounts: () => this.counts,
      go: (id) => this.go(id),
      openTracks: (league) => this.openTracks(league),
      startTrack: (league, track) => this.startTrack(league, track),
      startNext: () => this.startNext(),
      retry: () => this.startTrack(this.session.league, this.session.track),
      resume: () => this.resume(),
      restart: () => this.restart(),
      toTracks: () => this.toTracks(),
      resetProgress: () => {
        resetProgress(this.ns)
        this.progress = emptyProgress()
      },
      exit: () => this.exitGame(),
    })
    this.session.mount(stage, canvas)
    stage.append(...Object.values(this.menus.screens).map((s) => s.root))
    new ResizeObserver(() => {
      engine.resize()
      engine.render()
    }).observe(stage)
    // ?debug&json= одразу запускає заїзд (spec, «Авторинг»); інакше сплеш → меню
    if (this.cfg.jsonUrl) this.startTrack(0, 0)
    else this.go('splash')
    // після першого кадру з грою сайт знімає скелетон
    requestAnimationFrame(() => bridge.ready(VERSION))
  }

  private go(id: ScreenId): void {
    this.screen = id
    for (const [key, screen] of Object.entries(this.menus.screens)) if (key !== id) screen.hide()
    this.session.show(id === 'race')
    if (id !== 'race') this.menus.screens[id].show()
  }

  private openTracks(league: number): void {
    this.menus.tracks.league = league
    this.go('tracks')
  }

  private startTrack(league: number, track: number): void {
    this.session.start(league, track, this.names[league][track] ?? '')
    this.go('race')
  }

  private resume(): void {
    if (this.screen !== 'pause') return
    this.go('race')
    this.session.resume()
  }

  /** «Заново» з паузи: той самий трек з нуля, пауза знімається. */
  private restart(): void {
    this.session.restart()
    this.resume()
  }

  /** «До треків» з паузи або фінішу: цикл заїзду зупиняється. */
  private toTracks(): void {
    this.session.stop()
    this.openTracks(this.session.league)
  }

  /** «Вийти» з меню чи паузи: сайт закриває гру; без сайту лишається головне меню. */
  private exitGame(): void {
    this.session.stop()
    this.go('main')
    bridge.exit()
  }

  private finish(league: number, track: number, timeMs: number): void {
    const prevBestMs: number | undefined = this.progress.best[bestKey(league, track)]
    const r = recordFinish(this.progress, league, track, timeMs, this.counts)
    this.progress = r.progress
    saveProgress(this.ns, this.progress)
    bridge.finished(league, track, timeMs, r.isBest)
    const canNext = this.nextTrack() !== null
    this.menus.finish.result = { timeMs, prevBestMs, isBest: r.isBest, canNext, leagueUnlocked: r.unlockedNextLeague }
    this.go('finish')
  }

  /** Наступний відкритий трек: далі в тій самій лізі, інакше перший трек наступної. */
  private nextTrack(): [number, number] | null {
    const { league, track } = this.session
    if (track + 1 < this.counts[league]) return isTrackUnlocked(this.progress, league, track + 1) ? [league, track + 1] : null
    const next = league + 1
    return next < 3 && this.counts[next] > 0 && isTrackUnlocked(this.progress, next, 0) ? [next, 0] : null
  }

  private startNext(): void {
    const next = this.nextTrack()
    if (next !== null) this.startTrack(next[0], next[1])
  }
}
```

У кінець `src/shell/shell.css` додай (через порожній рядок):

```css
/* Task 10: лічильник кадрів у ?debug */
.hud-fps {
  position: absolute;
  top: 68px;
  left: 16px;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--text-secondary, #606060);
}
```

Run: `npx tsc -b && npm run lint` → чисто.

- [ ] **Step 2: Перевірка**

Run: `npx tsc -b && npm run lint && npm run build` → чисто.

Dev-сервер форку (порт 3100; сайт на 3000 не чіпати) — лише з вимкненою пісочницею і у фоні (для агента — `run_in_background`), після перевірки зупини його. `npm run dev`:

- `http://localhost:3100/` — у консолі `./tracks/dril.mrg недоступний — граю дев-пак із src/assets`, далі сплеш і меню, як у Task 7–8.
- `http://localhost:3100/?debug` — під смугою HUD заїзду `NN fps`.
- `http://localhost:3100/?debug&json=/tracks/dev/02-hirka.json` — заїзд «Hirka» стартує одразу, без меню; після фінішу в `localStorage` зʼявляється `dril-moto:json:progress:v1`, а `dril-moto:progress:v1` не змінюється.
- `http://localhost:3100/?theme=dark` — на `<html>` стоїть `data-theme="dark"` (токени теми дає Task 11, палітру канвасу — Task 12).

Міст до сайту перевіряється на збірці в `iframe`. Пак і дев-треки кладуться лише в `dist/` для локальної перевірки (`dist/` у `.gitignore`):

```bash
mkdir -p dist/tracks && cp src/assets/dev-pack.mrg dist/tracks/dril.mrg && cp -r tracks/dev dist/tracks/dev
cat > dist/bridge-test.html <<'EOF'
<!doctype html>
<meta charset="utf-8" />
<title>bridge test</title>
<iframe src="./index.html?debug" style="width: 400px; height: 740px; border: 0"></iframe>
<script>
  addEventListener('message', (e) => console.log('from game:', e.origin, JSON.stringify(e.data)))
</script>
EOF
```

Run (з вимкненою пісочницею, у фоні — для агента `run_in_background`): `npx vite preview`, відкрий `http://localhost:4173/bridge-test.html`.
Expected: у консолі сторінки `from game: http://localhost:4173 {"source":"dril-moto","type":"ready","version":"dev"}` (версію з `package.json` підставить Task 13), після фінішу — `finished`, після «Вийти» — `exit`. Зупини `vite preview` і прибери тестові файли: `rm -rf dist/tracks dist/bridge-test.html`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(shell): конфіг з URL, міст postMessage, пак і індекс назв, FPS у ?debug

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---


### Task 11: Тема й шрифти сайту в DOM-шарі, сплеш-заглушка першого кадру

**Files:**

- Create: `public/fonts/e-ukraine/e-Ukraine-{Light,Regular,Medium,Bold}.woff2` (лише ці чотири з `../drill_shop/public/fonts/e-ukraine/`; `e-UkraineHead-*` грі не потрібні), `src/shell/theme.css`
- Modify: `NOTICE.md` (кредит шрифту), `src/main.ts` (повністю), `index.html` (повністю — тема й сплеш-заглушка до першого кадру, preload e-Ukraine Bold), `src/shell/GameShell.ts` (повністю)

**Interfaces:**

- Consumes: усе, що імпортує `GameShell.ts` із Task 10 — `bridge`, `readConfig`/`Config`, `loadPack`, `RaceSession(engine, events, debug)` (Task 10); `Progress`, `bestKey`, `emptyProgress`, `isTrackUnlocked`, `loadProgress`, `recordFinish`, `resetProgress`, `saveProgress` (Task 5); `createMenus`/`Menus`/`MenuId`, `TrackCounts` (Task 7–8); `el` (Task 6); `createEngine` (Task 4).
- Consumes: `strings.title` (Task 6) — сплеш-заглушка повторює його текст; класи `.screen` і `.title` та кольори `var(--токен, #hex)` у `shell.css` (Task 6, 9, 10); файли шрифтів `../drill_shop/public/fonts/e-ukraine/e-Ukraine-{Light,Regular,Medium,Bold}.woff2`. npm-скрипт `check` не змінюється.
- Produces: `src/shell/theme.css` — `:root` і `[data-theme='dark']` з `--background`, `--surface-card`, `--text-primary`, `--text-secondary`, `--text-tertiary`, `--border-subtle`, `--accent`, `--btn-primary`, `--btn-primary-fg`, `--btn-primary-hover-fg`, `--radius-pill`, `--gradient-brand`; канвасні `--background`, `--text-primary`, `--text-secondary`, `--accent` — у форматі `#rrggbb` (їх читає Task 12); `@font-face 'e-Ukraine'` ваг 300/400/500/700 (700 — `font-display: block`).
- Produces: `index.html` зі сплешем-заглушкою `<section class="screen" data-screen="boot">` у `#root` і `<link rel="preload">` на `e-Ukraine-Bold.woff2`; `NOTICE.md`, що закінчується абзацом про шрифт e-Ukraine (перелік змін дописує Task 13); `GameShell.ts` з `bootPainted()` і очікуванням ваг 700 і 500, у якому є рядки `import { loadPack } from './pack.ts'` і `    const engine = await createEngine(canvas, pack.buffer)` (після них Task 12 вставляє палітру).

- [ ] **Step 1: Шрифти e-Ukraine і кредит у `NOTICE.md`**

Шрифти — лише чотири файли e-Ukraine, і кредит у `NOTICE.md` (CC BY 4.0 вимагає зазначити джерело й ліцензію там, де шрифт поширюється):

```bash
mkdir -p public/fonts/e-ukraine
for w in Light Regular Medium Bold; do cp ../drill_shop/public/fonts/e-ukraine/e-Ukraine-$w.woff2 public/fonts/e-ukraine/; done
ls public/fonts/e-ukraine | wc -l | tr -d ' '
cat >> NOTICE.md <<'EOF'

Шрифт e-Ukraine (`public/fonts/e-ukraine/`, файли без змін) — офіційний шрифт із
https://thedigital.gov.ua/fonts, ліцензія CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/).
EOF
grep -c '^Шрифт e-Ukraine' NOTICE.md
```

Expected: `4`; `1` — наприкінці `NOTICE.md` абзац про шрифт e-Ukraine.

- [ ] **Step 2: Токени теми, `main.ts`, тема й сплеш-заглушка до першого кадру**

`src/shell/theme.css`:

```css
/* src/shell/theme.css — токени сайту для гри + шрифт e-Ukraine.
   Скопійовано з drill_shop/src/app/globals.css: :root (рядки 235–561) — рядки 237
   (--background), 253 (--gradient-brand), 257 (--surface-card), 262 (--accent),
   279/280/283 (--text-primary/-secondary/-tertiary), 297/299 (--btn-primary/-fg),
   340 (--btn-primary-hover-fg), 436 (--border-subtle), 470 (--radius-pill);
   [data-theme='dark'] (рядки 1217–1310) — рядки 1218, 1220, 1234, 1243–1245, 1250, 1252,
   1282, 1299. --gradient-brand, --radius-pill і --btn-primary-hover-fg сайт у темній темі
   не перевизначає. Оновлювати руками при зміні палітри сайту. Токени, які читає канвас
   (src/shell/palette.ts: --background, --text-primary, --text-secondary, --accent),
   лишаються у форматі #rrggbb. */
:root {
  --background: #ffffff;
  --surface-card: #ffffff;
  --text-primary: #000000;
  --text-secondary: #606060;
  --text-tertiary: #6e6e6e;
  --border-subtle: #d6dde4;
  --accent: #0073e6;
  --btn-primary: #000000;
  --btn-primary-fg: #ffffff;
  --btn-primary-hover-fg: #000000;
  --radius-pill: 100px;
  --gradient-brand: linear-gradient(35.8deg, #c3aab2 -4.77%, #99eecc 46.72%, #80c0c8 90.23%, #4b8bfa 134.46%);
}

[data-theme='dark'] {
  color-scheme: dark;
  --background: #101413;
  --surface-card: #242b29;
  --text-primary: #f2f4f3;
  --text-secondary: #a7b0ac;
  --text-tertiary: #97a09b;
  --border-subtle: #2c3431;
  --accent: #58a6ff;
  --btn-primary: #f2f4f3;
  --btn-primary-fg: #101413;
}

/* Шрифти лежать у public/fonts/e-ukraine/. Шлях абсолютний: Vite з base './' переписує
   його відносно зібраного CSS (../fonts/… з dist/assets/); './fonts/…' тут лишився б
   нерозвʼязаним і вказував би на dist/assets/fonts/ (404). */
@font-face {
  font-family: 'e-Ukraine';
  src: url('/fonts/e-ukraine/e-Ukraine-Light.woff2') format('woff2');
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'e-Ukraine';
  src: url('/fonts/e-ukraine/e-Ukraine-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'e-Ukraine';
  src: url('/fonts/e-ukraine/e-Ukraine-Medium.woff2') format('woff2');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'e-Ukraine';
  src: url('/fonts/e-ukraine/e-Ukraine-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  /* block: заголовок сплешу-заглушки з index.html невидимий, доки Bold (preload) не прийде, —
     перший кадр одразу в e-Ukraine, без підміни шрифту (спека, «Локалізація») */
  font-display: block;
}
```

`src/main.ts` повністю (`theme.css` раніше за `shell.css`, бо `shell.css` читає його токени):

```ts
import './shell/theme.css'
import './shell/shell.css'
import { GameShell } from './shell/GameShell.ts'

const root = document.getElementById('root')
if (!(root instanceof HTMLDivElement)) throw new Error('Missing #root container')
new GameShell().start(root).catch((error: unknown) => {
  const pre = document.createElement('pre')
  pre.className = 'error-view'
  pre.textContent = error instanceof Error ? (error.stack ?? error.message) : String(error)
  root.replaceChildren(pre)
})
```

`index.html` повністю: рядок у `<head>` ставить `data-theme` ще до модуля гри. Без нього документ до виконання JS малюється на світлих токенах, і `?theme=dark` показує білий перший кадр (а на повільній мережі — білу сторінку до приходу JS). `GameShell` і далі ставить `data-theme` сам — те саме значення з `readConfig`. Сплеш-заглушка в `#root` — перший кадр документа гри: без неї LCP — справжній сплеш, який чекає JS, пак, шрифти й двигун (≈ 1,8 с у мобільному профілі Lighthouse), а заглушка з preload e-Ukraine Bold дає ≈ 1,35 с (бюджет спеки ≤ 1,5 с, секція 2). Заголовок сплешу-заглушки — той самий, що в `SplashScreen` (`strings.title`), тож текст дублюється лише тут; коли дизайнер віддасть лого-кадр, його `<img>` стає і тут, і в `SplashScreen`. Vite переписує `/fonts/…` у `./fonts/…` (base './'):

```html
<!doctype html>
<html lang="uk">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="description" content="Дріл Мото — мототріал у браузері" />
    <title>Дріл Мото</title>
    <!-- тема до першого кадру: інакше до виконання модуля темна тема блимає білим -->
    <script>document.documentElement.dataset.theme = new URLSearchParams(location.search).get('theme') === 'dark' ? 'dark' : 'light'</script>
    <!-- Bold — шрифт заголовка сплешу-заглушки нижче: preload тягне його паралельно з JS і CSS -->
    <link rel="preload" href="/fonts/e-ukraine/e-Ukraine-Bold.woff2" as="font" type="font/woff2" crossorigin />
  </head>
  <body>
    <!-- сплеш-заглушка: перший кадр і LCP документа гри (бюджет спеки ≤ 1,5 с); GameShell прибирає її над справжнім сплешем -->
    <div id="root"><section class="screen" data-screen="boot"><h1 class="title">Дріл Мото</h1></section></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 3: `GameShell` — сплеш-заглушка й шрифти до першого кадру**

`src/shell/GameShell.ts` повністю (версія Task 11: до версії Task 10 додано сплеш-заглушку з `index.html` (чекаємо її показу — `bootPainted`), очікування ваг e-Ukraine 700 і 500 до першого кадру меню і догрузку ваги 400 після нього; палітру канвасу додає Task 12):

```ts
// src/shell/GameShell.ts — стан-машина екранів: читає конфіг з URL, вантажить пак,
// збирає двигун, веде прогрес, перемикає DOM-екрани (screens/menus.ts) і говорить із
// сайтом (bridge.ts). Усе, що живе під час заїзду (цикл, HUD, ввід), — у RaceSession.
import { bridge } from './bridge.ts'
import { readConfig, type Config } from './config.ts'
import { createEngine } from './engine.ts'
import { loadPack } from './pack.ts'
import { bestKey, emptyProgress, isTrackUnlocked, loadProgress, recordFinish, resetProgress, saveProgress, type Progress } from './Progress.ts'
import { RaceSession } from './RaceSession.ts'
import { el } from './screens/dom.ts'
import type { TrackCounts } from './screens/LeaguesScreen.ts'
import { createMenus, type MenuId, type Menus } from './screens/menus.ts'

export type ScreenId = MenuId | 'race'

const VERSION: string = import.meta.env.VITE_APP_VERSION ?? 'dev'

/**
 * Чекає, поки браузер покаже сплеш-заглушку з index.html (її заголовок — LCP документа гри,
 * бюджет спеки ≤ 1,5 с), і лише тоді гра береться за пак, шрифти й двигун. Прибрати заглушку
 * раніше, ніж браузер її показав, не можна: тоді LCP стане справжній сплеш, що чекає пак і двигун.
 * Без LCP API (Safari) — перший кадр (paint); не довше BOOT_WAIT_MS.
 */
const BOOT_WAIT_MS = 500
const bootPainted = (): Promise<void> =>
  new Promise((resolve) => {
    const type = PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint') ? 'largest-contentful-paint' : 'paint'
    const observer = new PerformanceObserver(() => {
      observer.disconnect()
      resolve()
    })
    observer.observe({ type, buffered: true })
    window.setTimeout(() => {
      observer.disconnect()
      resolve()
    }, BOOT_WAIT_MS)
  })

export class GameShell {
  private cfg!: Config
  private ns = ''
  private session!: RaceSession
  private menus!: Menus
  private progress: Progress = emptyProgress()
  private names: string[][] = [[], [], []]
  private counts: TrackCounts = [0, 0, 0]
  private screen: ScreenId = 'splash'

  async start(root: HTMLElement): Promise<void> {
    this.cfg = readConfig()
    // пробні треки з ?debug&json= пишуть прогрес окремо й не чіпають справжній
    this.ns = this.cfg.jsonUrl ? `${this.cfg.ns}:json` : this.cfg.ns
    // iframe не бачить data-theme сайту: тема приходить параметром (spec, секція 1)
    document.documentElement.dataset.theme = this.cfg.theme
    // сплеш-заглушка з index.html лишається на екрані, доки не готовий справжній сплеш
    const boot = root.querySelector('[data-screen="boot"]')
    await bootPainted()
    const stage = el('div', 'stage')
    stage.hidden = true // до справжнього сплешу видно лише заглушку
    const canvas = el('canvas', 'game-canvas')
    stage.append(canvas)
    root.append(stage)

    // e-Ukraine дочекуємось до першого кадру меню (spec, «Локалізація»): 700 — заголовок сплешу
    // й меню (.title, .heading) і підпис падіння, 500 — кнопки меню й HUD. CSS Font Loading вантажить
    // лише названу вагу, тож чекаємо обидві; без шрифту — системний
    const fonts = Promise.all([
      document.fonts.load('700 32px e-Ukraine'),
      document.fonts.load('500 16px e-Ukraine'),
    ]).catch(() => [])
    const [pack] = await Promise.all([loadPack(this.cfg), fonts])
    this.names = pack.names
    this.counts = [pack.names[0].length, pack.names[1].length, pack.names[2].length]
    this.progress = loadProgress(this.ns)
    const engine = await createEngine(canvas, pack.buffer)
    this.session = new RaceSession(
      engine,
      {
        onPaused: () => this.go('pause'),
        onResumeRequest: () => this.resume(),
        onFinish: (league, track, timeMs) => this.finish(league, track, timeMs),
      },
      this.cfg.debug,
    )
    this.menus = createMenus({
      progress: () => this.progress,
      trackNames: () => this.names,
      trackCounts: () => this.counts,
      go: (id) => this.go(id),
      openTracks: (league) => this.openTracks(league),
      startTrack: (league, track) => this.startTrack(league, track),
      startNext: () => this.startNext(),
      retry: () => this.startTrack(this.session.league, this.session.track),
      resume: () => this.resume(),
      restart: () => this.restart(),
      toTracks: () => this.toTracks(),
      resetProgress: () => {
        resetProgress(this.ns)
        this.progress = emptyProgress()
      },
      exit: () => this.exitGame(),
    })
    this.session.mount(stage, canvas)
    stage.append(...Object.values(this.menus.screens).map((s) => s.root))
    new ResizeObserver(() => {
      engine.resize()
      engine.render()
    }).observe(stage)
    stage.hidden = false
    // ?debug&json= одразу запускає заїзд (spec, «Авторинг»); інакше сплеш → меню
    if (this.cfg.jsonUrl) this.startTrack(0, 0)
    else this.go('splash')
    // після першого кадру з грою сайт знімає скелетон. Тоді ж — Regular (400: підказки карток,
    // «Про гру», фініш, рядок клавіш): до «Ліг» він уже тут, а першому кадру канал на 3G не заважає.
    // Light (300) оболонка не вживає — браузер його не запитує.
    requestAnimationFrame(() => {
      bridge.ready(VERSION)
      boot?.remove() // справжній сплеш уже над нею: stage пізніше в DOM
      document.fonts.load('400 16px e-Ukraine').catch(() => [])
    })
  }

  private go(id: ScreenId): void {
    this.screen = id
    for (const [key, screen] of Object.entries(this.menus.screens)) if (key !== id) screen.hide()
    this.session.show(id === 'race')
    if (id !== 'race') this.menus.screens[id].show()
  }

  private openTracks(league: number): void {
    this.menus.tracks.league = league
    this.go('tracks')
  }

  private startTrack(league: number, track: number): void {
    this.session.start(league, track, this.names[league][track] ?? '')
    this.go('race')
  }

  private resume(): void {
    if (this.screen !== 'pause') return
    this.go('race')
    this.session.resume()
  }

  /** «Заново» з паузи: той самий трек з нуля, пауза знімається. */
  private restart(): void {
    this.session.restart()
    this.resume()
  }

  /** «До треків» з паузи або фінішу: цикл заїзду зупиняється. */
  private toTracks(): void {
    this.session.stop()
    this.openTracks(this.session.league)
  }

  /** «Вийти» з меню чи паузи: сайт закриває гру; без сайту лишається головне меню. */
  private exitGame(): void {
    this.session.stop()
    this.go('main')
    bridge.exit()
  }

  private finish(league: number, track: number, timeMs: number): void {
    const prevBestMs: number | undefined = this.progress.best[bestKey(league, track)]
    const r = recordFinish(this.progress, league, track, timeMs, this.counts)
    this.progress = r.progress
    saveProgress(this.ns, this.progress)
    bridge.finished(league, track, timeMs, r.isBest)
    const canNext = this.nextTrack() !== null
    this.menus.finish.result = { timeMs, prevBestMs, isBest: r.isBest, canNext, leagueUnlocked: r.unlockedNextLeague }
    this.go('finish')
  }

  /** Наступний відкритий трек: далі в тій самій лізі, інакше перший трек наступної. */
  private nextTrack(): [number, number] | null {
    const { league, track } = this.session
    if (track + 1 < this.counts[league]) return isTrackUnlocked(this.progress, league, track + 1) ? [league, track + 1] : null
    const next = league + 1
    return next < 3 && this.counts[next] > 0 && isTrackUnlocked(this.progress, next, 0) ? [next, 0] : null
  }

  private startNext(): void {
    const next = this.nextTrack()
    if (next !== null) this.startTrack(next[0], next[1])
  }
}
```

`src/shell/shell.css` у цьому кроці не змінюється: з Task 6 кожен колір і радіус іде через `var(--токен, фолбек)`, тепер значення приходять із `theme.css`, а `font-family: 'e-Ukraine', system-ui, sans-serif` стоїть на `html, body, #root` з Task 6.

Run: `npx tsc -b && npm run lint` → чисто.

- [ ] **Step 4: Перевірка**

```bash
npx tsc -b && npm run lint && npm run build
grep -nE '#[0-9a-fA-F]{3,6}' src/shell/shell.css | grep -vE 'var\(--[a-z-]+, #[0-9a-fA-F]{3,6}\)'; echo "exit=$?"
grep -o 'url([^)]*woff2)' dist/assets/*.css
ls dist/fonts/e-ukraine | wc -l | tr -d ' '
grep -o 'data-screen="boot"\|rel="preload" href="[^"]*"' dist/index.html
# пак і дев-треки лише в dist/ для локальної перевірки (dist у .gitignore)
mkdir -p dist/tracks && cp src/assets/dev-pack.mrg dist/tracks/dril.mrg && cp -r tracks/dev dist/tracks/dev
```

Expected: `tsc`, лінт і збірка чисті; `exit=1` (hex у `shell.css` лишились тільки фолбеками токенів); чотири рядки `url(../fonts/e-ukraine/e-Ukraine-….woff2)`; `4` файли шрифтів; `rel="preload" href="./fonts/e-ukraine/e-Ukraine-Bold.woff2"` і `data-screen="boot"` (Vite з `base: './'` переписав `/fonts/…` у `./fonts/…`).

Run (з вимкненою пісочницею, у фоні — для агента `run_in_background`): `npx vite preview` → `http://localhost:4173/`; після перевірок зупини.

У браузері:

- `http://localhost:4173/index.html?theme=dark&ns=test&debug` — DOM-шар у темній темі без білого спалаху до першого кадру (`data-theme` ставить рядок у `<head>`, першим кадром стоїть сплеш-заглушка): сплеш, меню, HUD, тач-капсули (DevTools → емуляція сенсорного пристрою, перезавантаження) світлі з темним підписом, натиснута капсула темнішає, а не світлішає; FPS у HUD; шрифт e-Ukraine (DevTools → Computed → Rendered Fonts); Network: `e-Ukraine-Bold.woff2` (200) запитаний з `<link rel="preload">` одночасно з JS і CSS, і сплеш-заглушка одразу в e-Ukraine Bold, без підміни шрифту; `e-Ukraine-Medium.woff2`, `tracks/dril.mrg` і `tracks/dril.json` — після неї, до справжнього сплешу; `e-Ukraine-Regular.woff2` — одразу після справжнього сплешу, `e-Ukraine-Light.woff2` не запитується зовсім; `tracks/dril.mrg` і `tracks/dril.json` запитуються одночасно, а не один після одного; до Task 13 (`appType: 'mpa'`) `tracks/dril.json` відповідає `200 text/html` (SPA-фолбек `vite preview`) — гра відкидає HTML і бере ASCII-назви з `.mrg`. Канвас заїзду ще в кольорах порту (білий фон, зелена лінія треку) — палітру дає Task 12. Те саме без `theme` — світла тема.
- `http://localhost:4173/index.html?debug&json=./tracks/dev/02-hirka.json` — заїзд «Hirka» стартує одразу, без меню; сплеш-заглушка зникає, щойно показано заїзд.
- `http://localhost:4173/index.html?tracks=./tracks/nema.mrg` — замість гри текст помилки `./tracks/nema.mrg: файл не знайдено …`, сплешу-заглушки нема.

```bash
# бюджет першого кадру (спека, секція 2): LCP документа гри в мобільному профілі Lighthouse ≤ 1,5 с.
# З вимкненою пісочницею (headless Chrome, кеш npx у ~/.npm), поки працює `npx vite preview` з dist/tracks/dril.mrg
for i in 1 2 3; do
  npx -y lighthouse@12 "http://localhost:4173/index.html?ns=lh-check" --only-categories=performance --output=json \
    --output-path="$TMPDIR/game-lh-$i.json" --chrome-flags="--headless=new" --quiet
  node -e 'const a = require(process.argv[1]).audits; console.log("LCP гри:", Math.round(a["largest-contentful-paint"].numericValue), "мс, CLS", a["cumulative-layout-shift"].numericValue)' "$TMPDIR/game-lh-$i.json"
done
```

Expected: три рядки ≈ `LCP гри: 1353 мс, CLS 0` (відтворено: 1355, 1354, 1353; без сплешу-заглушки — 1803–1808). Медіана понад 1500 — зупинись: перевір, що в `dist/index.html` є `data-screen="boot"` і preload Bold, а `GameShell` чекає `bootPainted()`.

Після перевірок зупини `vite preview` і прибери тестовий пак: `rm -rf dist/tracks`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(shell): тема й шрифти сайту в DOM-шарі, сплеш-заглушка першого кадру

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---


### Task 12: Палітра канвасу й рендер у devicePixelRatio

**Files:**

- Create: `src/shell/palette.ts`, `scripts/check-palette.mjs`
- Modify: `src/GameCanvas.ts` (хук `colorMap` у `setColor`/`clearScreenWithWhite`, DPR у `resize`/`beginFrame`), `src/shell/GameShell.ts` (два рядки), `package.json` (скрипт `check`)

**Interfaces:**

- Consumes (Task 11): токени `--background`, `--text-primary`, `--text-secondary`, `--accent` у форматі `#rrggbb` на `<html data-theme>` (`src/shell/theme.css`); у `GameShell.ts` рядки `import { loadPack } from './pack.ts'` і `    const engine = await createEngine(canvas, pack.buffer)`.
- Consumes (Task 4): `Engine.canvas: GameCanvas` (`createEngine`).
- Consumes (upstream `src/GameCanvas.ts`): `setColor`, `clearScreenWithWhite`, `resize`, `beginFrame`, поля `graphics`, `ctx`, `canvas`, `activeKeys`, `isDrawingTime`, `width`, `height`, `height2`, `micro`, `cameraOffsetX/Y`, `loadingScreenMode`, метод `processTimers()`; статик `Micro.isInGameMenu`.
- Consumes: npm-скрипт `check` = `node scripts/check-mrg.mjs && node scripts/check-progress.mjs` (Task 5).
- Produces: `hexToRgb(hex: string): Rgb`, `mapColor(p: Palette, r: number, g: number, b: number): Rgb`, `readPalette(root: HTMLElement): Palette`, `applyPalette(canvas: GameCanvas, root: HTMLElement): void`, `type Rgb = readonly [number, number, number]`, `interface Palette { paper: Rgb; ink: Rgb; track: Rgb; depth: Rgb; accent: Rgb }`; у двигуні `export type ColorMap` і поле `GameCanvas#colorMap: ColorMap | null`.
- Produces: npm-скрипт `check` = `node scripts/check-mrg.mjs && node scripts/check-progress.mjs && node scripts/check-palette.mjs`; фінальний `GameShell.ts`.

- [ ] **Step 1: Перевірка палітри — спершу червона**

`scripts/check-palette.mjs`:

```js
// scripts/check-palette.mjs — ролі кольорів порту → токени сайту, обидві теми.
//   node scripts/check-palette.mjs
import assert from 'node:assert/strict'
import { hexToRgb, mapColor } from '../src/shell/palette.ts'

const palette = (paper, ink, depth, accent) => ({
  paper: hexToRgb(paper),
  ink: hexToRgb(ink),
  track: hexToRgb(ink),
  depth: hexToRgb(depth),
  accent: hexToRgb(accent),
})
// значення з src/shell/theme.css (:root і [data-theme='dark'])
const light = palette('#ffffff', '#000000', '#606060', '#0073e6')
const dark = palette('#101413', '#f2f4f3', '#a7b0ac', '#58a6ff')

assert.deepEqual(mapColor(light, 255, 255, 255), [255, 255, 255], 'світла: фон лишається білим')
assert.deepEqual(mapColor(light, 128, 128, 128), [128, 128, 128], 'світла: сірі без змін')
assert.deepEqual(mapColor(light, 0, 255, 0), [0, 0, 0], 'світла: трек чорний')
assert.deepEqual(mapColor(dark, 255, 255, 255), [16, 20, 19], 'темна: фон = --background')
assert.deepEqual(mapColor(dark, 0, 0, 0), [242, 244, 243], 'темна: спиці й древка = --text-primary')
assert.deepEqual(mapColor(dark, 0, 255, 0), [242, 244, 243], 'темна: трек = --text-primary')
assert.deepEqual(mapColor(dark, 0, 170, 0), [167, 176, 172], 'темна: перспектива = --text-secondary')
assert.deepEqual(mapColor(dark, 170, 0, 0), [88, 166, 255], 'темна: червоне = --accent')
assert.deepEqual(mapColor(dark, 212, 212, 212), [54, 58, 57], 'темна: найсвітліша тінь майже фон')
assert.throws(() => hexToRgb('rgb(0 0 0)'))
console.log('ok: palette')
```

Run: `node scripts/check-palette.mjs`
Expected: `ERR_MODULE_NOT_FOUND` на `src/shell/palette.ts` — модуля ще нема.

- [ ] **Step 2: Хук `colorMap` у двигуні й ролі кольорів**

**Палітра канвасу.** Двигун задає кольори сталими rgb-трійками. Під час заїзду їх рівно такі: (255,255,255) фон і заливка смуги прогресу; (0,255,0) передня лінія треку (`LevelLoader`, `GameLevel`); (0,170,0) лінії перспективи; (0,0,0) спиці, древка прапорців, рамка смуги прогресу; сірі 0…212 — тіні; (128,128,128) вилка; (170,0,0) дуга над переднім колесом; (255,0,0) маточини ліг 1–2. Шини, прапорці й байк — спрайти, палітра їх не чіпає. `GameLevel.ts`/`LevelLoader.ts` за спекою не чіпаються, тож перефарбування — один хук у `GameCanvas`, а ролі — чистий модуль оболонки. `clearScreenWithWhite` кликав `graphics.setColor` напряму, повз `setColor`, тому він теж іде через хук.

`src/GameCanvas.ts`, три правки. (1) Після імпортів, перед `type GameCanvasAssetCaches = {`:

```ts
/** Перефарбовування кольорів порту; оболонка ставить токени сайту (src/shell/palette.ts). */
export type ColorMap = (red: number, green: number, blue: number) => readonly [number, number, number]
```

(2) У полях класу одразу після `isDrawingTime = true`:

```ts
  colorMap: ColorMap | null = null
```

(3) `clearScreenWithWhite` і `setColor` замінити повністю й додати під ними `applyColor`:

```ts
  clearScreenWithWhite(): void {
    this.applyColor(255, 255, 255)
    this.graphics.fillRect(0, 0, this.width, this.height2)
  }

  setColor(red: number, green: number, blue: number): void {
    if (Micro.isInGameMenu) {
      red += 128
      green += 128
      blue += 128
      if (red > 240) {
        red = 240
      }
      if (green > 240) {
        green = 240
      }
      if (blue > 240) {
        blue = 240
      }
    }

    this.applyColor(red, green, blue)
  }

  private applyColor(red: number, green: number, blue: number): void {
    if (this.colorMap === null) {
      this.graphics.setColor(red, green, blue)
      return
    }
    const [r, g, b] = this.colorMap(red, green, blue)
    this.graphics.setColor(r, g, b)
  }
```

`src/shell/palette.ts`:

```ts
// src/shell/palette.ts — перефарбовування кольорів порту в токени сайту.
// Двигун задає кольори сталими rgb-трійками (GameCanvas, GamePhysics, GameLevel,
// LevelLoader); тут кожна трійка отримує роль, а роль — токен із theme.css.
// hexToRgb і mapColor чисті (їх ганяє scripts/check-palette.mjs); readPalette і
// applyPalette читають DOM.
import type { GameCanvas } from '../GameCanvas.ts'

export type Rgb = readonly [number, number, number]

export interface Palette {
  paper: Rgb // --background: фон заїзду (255,255,255), заливка смуги прогресу
  ink: Rgb // --text-primary: (0,0,0) спиці, древка прапорців, рамка смуги прогресу
  track: Rgb // --text-primary: (0,255,0) передня лінія треку
  depth: Rgb // --text-secondary: (0,170,0) лінії перспективи (задня кромка й поперечки)
  accent: Rgb // --accent: (170,0,0) дуга над переднім колесом, (255,0,0) маточини ліг 1–2
}

export const hexToRgb = (hex: string): Rgb => {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim())
  if (m === null) throw new Error(`Токен палітри має бути #rrggbb, отримано «${hex}»`)
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
}

const mix = (from: Rgb, to: Rgb, t: number): Rgb => [
  Math.round(from[0] + (to[0] - from[0]) * t),
  Math.round(from[1] + (to[1] - from[1]) * t),
  Math.round(from[2] + (to[2] - from[2]) * t),
]

export const mapColor = (p: Palette, r: number, g: number, b: number): Rgb => {
  if (r === 0 && g === 255 && b === 0) return p.track
  if (r === 0 && g === 170 && b === 0) return p.depth
  // Сірі порту: 0 чорне, 255 біле, 128 вилка, 0…212 тіні (GameLevel.renderShadow) —
  // та сама частка шляху від ink до paper, тож тінь і вдень, і вночі тане у фон.
  if (r === g && g === b) return mix(p.ink, p.paper, r / 255)
  return p.accent
}

/** Читає токени з <html>, на якому вже стоїть data-theme. */
export const readPalette = (root: HTMLElement): Palette => {
  const css = getComputedStyle(root)
  const token = (name: string): Rgb => hexToRgb(css.getPropertyValue(name))
  const text = token('--text-primary')
  return { paper: token('--background'), ink: text, track: text, depth: token('--text-secondary'), accent: token('--accent') }
}

/** Ставить палітру теми на канвас двигуна; якщо токени не #rrggbb — лишаються кольори порту. */
export const applyPalette = (canvas: GameCanvas, root: HTMLElement): void => {
  try {
    const palette = readPalette(root)
    canvas.colorMap = (r, g, b) => mapColor(palette, r, g, b)
  } catch (error) {
    console.warn('Палітра теми недоступна, канвас лишається в кольорах порту', error)
  }
}
```

```bash
node scripts/check-palette.mjs
npm pkg set scripts.check="node scripts/check-mrg.mjs && node scripts/check-progress.mjs && node scripts/check-palette.mjs"
```

Expected: `ok: palette`.

- [ ] **Step 3: Палітра в `GameShell`**

У `src/shell/GameShell.ts` (версія Task 11) два рядки. (1) Після рядка `import { loadPack } from './pack.ts'` встав:

```ts
import { applyPalette } from './palette.ts'
```

(2) Після рядка `    const engine = await createEngine(canvas, pack.buffer)` встав:

```ts
    applyPalette(engine.canvas, document.documentElement) // після data-theme: токени вже теми
```

`data-theme` на `<html>` на цей момент уже стоїть (рядок у `<head>` `index.html` і `readConfig` на початку `start`), тож `readPalette` читає токени потрібної теми.

Контраст ролей: світла — трек #000 на #fff 21:1, перспектива #606060 6.29:1, акцент #0073e6 4.57:1, вилка #808080 3.95:1; темна — трек #f2f4f3 на #101413 16.8:1, перспектива #a7b0ac 8.35:1, акцент #58a6ff 7.35:1, вилка #818483 4.92:1.

Run: `npx tsc -b && npm run lint` → чисто.

- [ ] **Step 4: DPR у `GameCanvas.resize` і `beginFrame`**

`beginFrame()` на кожному кадрі робить `setTransform(1, 0, 0, 1, 0, 0)` і `clearRect` по сирих `canvas.width/height`, тож масштаб, поставлений лише в `resize`, зник би з першого ж кадру. Запис `canvas.width` скидає весь стан контексту, зокрема `imageSmoothingEnabled`. Тому `resize` запамʼятовує `dpr`, а `beginFrame` чистить буфер в одиничній трансформації й одразу ставить `dpr` і вимикає згладжування. Решта двигуна (`setClip`, `fillRect`, `drawLine`, `drawImage`, `setViewPosition`, `setMinimalScreenWH`) лишається в CSS-пікселях: `Graphics.withClip` робить `save/restore`, що зберігає трансформацію.

У `src/GameCanvas.ts` нове приватне поле одразу після `private readonly activeKeys = new Array<boolean>(10).fill(false)`:

```ts
  private dpr = 1
```

`resize` повністю:

```ts
  resize(width: number, height: number): void {
    // Буфер у фізичних пікселях (до 2×), уся логіка двигуна — у CSS-пікселях.
    // Запис canvas.width скидає стан контексту (трансформацію, imageSmoothingEnabled),
    // тому масштаб і вимкнене згладжування заново ставить beginFrame на кожному кадрі.
    this.dpr = Math.min(2, window.devicePixelRatio || 1)
    this.canvas.width = Math.floor(width * this.dpr)
    this.canvas.height = Math.floor(height * this.dpr)
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`
    this.width = width
    this.height = height
    this.height2 = height
    // кліп Graphics живе між кадрами; без цього перший кадр після збільшення обрізаний старим розміром
    this.graphics.setClip(0, 0, width, height)
  }
```

`beginFrame` повністю:

```ts
  beginFrame(): void {
    void this.micro
    void this.cameraOffsetX
    void this.cameraOffsetY
    void this.loadingScreenMode
    // clearRect — в одиничній трансформації по сирому буферу, далі все малюється в CSS-пікселях
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    this.ctx.imageSmoothingEnabled = false
    this.processTimers()
  }
```

Run: `npx tsc -b && npm run lint` → чисто.

- [ ] **Step 5: Перевірка**

```bash
npm run check && npx tsc -b && npm run lint && npm run build
grep -rnE '\.(scheduleGameTimerTask|menuToGame|gameToMenu|openPauseMenu)\(|isDrawingTime = true' src/shell; echo "exit=$?"
# пак і дев-треки лише в dist/ для локальної перевірки (dist у .gitignore)
mkdir -p dist/tracks && cp src/assets/dev-pack.mrg dist/tracks/dril.mrg && cp -r tracks/dev dist/tracks/dev
```

Expected: `npm run check` → `ok: 5 checks`, `ok: 5 checks`, `ok: palette`; `tsc`, лінт і збірка чисті; `exit=1` (оболонка не вмикає текст на канвасі).

Run (з вимкненою пісочницею, у фоні — для агента `run_in_background`): `npx vite preview` → `http://localhost:4173/`; після перевірок зупини.

У браузері:

- `http://localhost:4173/index.html?theme=dark&ns=test&debug` — канвас заїзду в темній темі: фон #101413, передня лінія треку світла (#f2f4f3), лінії перспективи сірі (#a7b0ac), спиці й древка прапорців світлі, смуга прогресу внизу — світла рамка; тіні тануть у фон; байк, шини й прапорці видно. Те саме без `theme` — світла тема: чорний трек на білому.
- Під час заїзду, падіння й фінішу на канвасі немає жодного тексту (ні часу, ні «Crashed», «Finished», «Wheelie!», ні назви треку) — лише DOM-HUD.
- На Retina в консолі `const c = document.querySelector('.game-canvas'); [c.width, c.clientWidth]` → перше число вдвічі більше; лінія треку завтовшки 2 фізичні пікселі, спрайти з різкими квадратними пікселями, не розмиті; поворот телефона дає повний кадр без обрізаного правого краю.

Після перевірок зупини `vite preview` і прибери тестовий пак: `rm -rf dist/tracks`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(engine): палітра канвасу через GameCanvas.colorMap і рендер у devicePixelRatio

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---


### Task 13: Версія, реліз і документація

**Files:**

- Create: `src/vite-env.d.ts`, `public/LICENSE.txt` (копія `LICENSE.md`), `public/NOTICE.txt` (копія `NOTICE.md`), `.github/workflows/release.yml`
- Modify: `vite.config.ts` (повністю), `NOTICE.md` (перелік змін відносно upstream), `CHANGELOG.md` (повністю), `README.md` (повністю)

**Interfaces:**

- Consumes: `import.meta.env.VITE_APP_VERSION ?? 'dev'` в `AboutScreen.ts` (Task 8) і `GameShell.ts` (Task 12), `bridge.ready(version)` (Task 10).
- Consumes: npm-скрипти `check` (Task 12), `dev-pack`, `sprites:placeholder` (Task 1), `sprites:template` (Task 2), `sim` (Task 3); `NOTICE.md` з абзацом про шрифт (Task 11); `index.html` зі сплешем-заглушкою і preload e-Ukraine Bold (Task 11); `.nvmrc` upstream.
- Produces: `dist/` рівно з `LICENSE.txt NOTICE.txt assets fonts index.html`, версія `0.1.0` у бандлі, `.github/workflows/release.yml` (тег `vX.Y.Z` → перевірки, збірка, GitHub Release з `dist.zip`, у корені якого вміст `dist/`), тег `v0.1.0`.
- Produces: рядок README `npm run check      # check-mrg, check-progress, check-palette`, який Task 14 змінює через `sed`; розділ `## 0.1.0` у `CHANGELOG.md`, який Task 14 повторює дослівно; розділ README «Реліз» з `npm version X.Y.Z --no-git-tag-version`.

- [ ] **Step 1: Перелік змін відносно upstream у `NOTICE.md`**

Одразу за кредитом шрифту (Task 11) — перелік змін відносно upstream (спека, секція 6: `NOTICE.md` «з походженням (upstream, коміт, автори, перелік змін)»); `NOTICE.txt` їде в бандлі без `CHANGELOG.md`, тож перелік мусить бути в самому `NOTICE`:

```bash
cat >> NOTICE.md <<'EOF'

Перелік змін відносно upstream (подробиці й дати — CHANGELOG.md та історія git):

- видалено файли Codebrew `src/assets/levels.mrg`, `logo.png`, `splash.png`, `preview.gif`; спрайти
  `src/assets/{helmet,engine,fender,bluearm,bluebody,blueleg,sprites,raster}.png` замінено нашими;
- видалено шаблонні файли `src/assets/react.svg`, `public/vite.svg` і маркер GitHub Pages `public/.nojekyll`;
- `src/GameCanvas.ts`: без лого й сплешу Codebrew, хук палітри `colorMap`, рендер у devicePixelRatio;
- `src/app.ts`: дев-пак `src/assets/dev-pack.mrg` замість `levels.mrg`;
- `src/main.ts`: вхід через оболонку `src/shell/` (DOM-меню українською, тач-керування, прогрес,
  міст до сайту) замість `app.ts` і канвасних меню `MenuManager.ts`;
- `index.html`, `vite.config.ts`, `package.json`, `package-lock.json`, `eslint.config.js`, `README.md`:
  наша назва, збірка й лінт;
- нові файли: `src/shell/*`, `src/vite-env.d.ts`, `src/assets/dev-pack.mrg`, `scripts/*`, `tracks/dev/*`,
  `docs/*`, `public/*`, `.github/workflows/release.yml`, `CHANGELOG.md`, `NOTICE.md`; повний перелік — CHANGELOG.md.
EOF
grep -c '^Шрифт e-Ukraine\|^Перелік змін відносно upstream' NOTICE.md
```

Expected: `2` — наприкінці `NOTICE.md` абзац про шрифт e-Ukraine і «Перелік змін відносно upstream». `public/NOTICE.txt` з цього файлу робить Step 3, тож `cmp` у `release.yml` проходить.

- [ ] **Step 2: Версія з `package.json` і `appType: 'mpa'`**

`vite.config.ts` повністю:

```ts
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'

// Версія бандла для «Про гру» і bridge.ready(): з package.json, тож однакова і для
// `npm run build`, і для `npx vite build` (npm_package_version там не заданий).
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string }

export default defineConfig({
  // base './' — бандл живе під /moto/ на сайті, усі шляхи відносні
  base: './',
  // 'mpa': відсутній файл (./tracks/dril.mrg у форку) віддає 404, а не index.html
  // з кодом 200 — інакше fetch пака «успішний», а LevelLoader парсить HTML
  appType: 'mpa',
  server: { port: 3100 },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
  },
})
```

`src/vite-env.d.ts`:

```ts
// src/vite-env.d.ts — тип версії, яку vite.config.ts підставляє через define.
interface ImportMetaEnv {
  readonly VITE_APP_VERSION?: string
}
```

- [ ] **Step 3: Копії ліцензії й NOTICE, `release.yml`**

Копії ліцензії й NOTICE для бандла (після абзацу про шрифт із Task 11 і переліку змін зі Step 1):

```bash
cp LICENSE.md public/LICENSE.txt && cp NOTICE.md public/NOTICE.txt
```

`.github/workflows/release.yml`:

```yaml
# .github/workflows/release.yml — тег vX.Y.Z → перевірки, збірка, GitHub Release з dist.zip.
# У dist.zip файли лежать у корені архіву (index.html, assets/, fonts/, LICENSE.txt, NOTICE.txt).
# На сайті його ставить scripts/sync-moto-bundle.mjs --tag vX.Y.Z (перевірки, public/moto/ без tracks/, VERSION).
name: release
on:
  push:
    tags: ['v*']
permissions:
  contents: write
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - name: Тег збігається з версією в package.json
        run: test "$GITHUB_REF_NAME" = "v$(node -p "require('./package.json').version")"
      - name: LICENSE.txt і NOTICE.txt у public/ — копії LICENSE.md і NOTICE.md
        run: cmp LICENSE.md public/LICENSE.txt && cmp NOTICE.md public/NOTICE.txt
      - run: npm run check
      - run: npm run lint
      - run: npm run build
      - name: У бандлі нема паків треків (ні файлом, ні вбудованим data:-URI), лого й сплешу
        run: |
          if find dist -name '*.mrg' -o -name 'logo*' -o -name 'splash*' | grep .; then exit 1; fi
          if grep -l 'data:application/octet-stream' dist/assets/*.js; then exit 1; fi
      - name: dist.zip (вміст dist/ у корені архіву)
        run: cd dist && zip -r ../dist.zip .
      - name: GitHub Release
        run: gh release create "$GITHUB_REF_NAME" dist.zip --title "Дріл Мото $GITHUB_REF_NAME" --notes "Зміни — CHANGELOG.md. На сайті: node scripts/sync-moto-bundle.mjs --tag $GITHUB_REF_NAME"
        env:
          GH_TOKEN: ${{ github.token }}
```

- [ ] **Step 4: `CHANGELOG.md` і `README.md`**

`CHANGELOG.md` повністю (розділ «Unreleased» з Task 1–3 стає релізом):

```markdown
# Changelog

## 0.1.0

- Форк від upstream (коміт — у NOTICE.md) без асетів Codebrew (levels.mrg, лого, сплеш,
  спрайти байка); плейсхолдери спрайтів тих самих розмірів; енкодер/декодер `.mrg`; дев-пак
  із JSON-треків.
- Оболонка `src/shell/`: двигун без канвасних меню, цикл заїзду з паузою й відліком після
  падіння, DOM-меню українською, сплеш, прогрес і відкриття треків і ліг, рекорди.
- Тач-керування з pointer capture і мультитачем, підказка клавіш на десктопі, вібрація на падінні.
- Параметри URL (`tracks`, `ns`, `lang`, `theme`, `debug`, `json`), індекс українських назв
  треків, міст `postMessage` до сайту (`ready`, `exit`, `finished`).
- Тема й шрифт сайту: токени в `src/shell/theme.css`, палітра канвасу через `GameCanvas.colorMap`,
  e-Ukraine; рендер у devicePixelRatio (до 2).
- Шаблони спрайтів і `docs/sprites.md`; безголовий прогін треків `scripts/sim-track.mjs` (водії ai,
  «лише газ», бот і планувальник); реліз через GitHub Actions з `dist.zip`.
```

`README.md` повністю:

````markdown
# Дріл Мото

Мототріал у браузері: байк на полігональному треку, газ, гальмо, нахил назад і вперед,
секундомір, три ліги. Гра живе на сайті shchilnui Drill за адресою `/moto` (iframe), але
збирається й працює і сама по собі.

Це форк відкритого веб-порту [yurkagon/gravity-defied-web](https://github.com/yurkagon/gravity-defied-web)
під GPL-2.0. З порту взята лише механіка (фізика, трек, рендер канвасу); треки, спрайти, назва,
меню й оболонка — наші. Походження, закріплений коміт upstream і права — у [NOTICE.md](NOTICE.md),
зміни — у [CHANGELOG.md](CHANGELOG.md). Гра не повʼязана з Codebrew Software.

## Запуск

Потрібен Node 24 (`.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:3100/
```

У `npm run dev` без пака сайту гра бере дев-пак `src/assets/dev-pack.mrg` (треки з `tracks/dev/`).

## Збірка й перевірки

```bash
npm run check      # check-mrg, check-progress, check-palette
npm run lint
npm run build      # tsc -b && vite build → dist/
npm run preview    # перегляд dist/
```

`dist/` самодостатня й має лише відносні шляхи (`base: './'`), тож працює з будь-якої теки,
зокрема з `/moto/` на сайті. Сам пак треків (`tracks/dril.mrg`) у `dist/` не входить — його
кладе сайт.

## Параметри URL

| Параметр | За замовчуванням    | Що робить                                                                     |
| -------- | ------------------- | ----------------------------------------------------------------------------- |
| `tracks` | `./tracks/dril.mrg` | URL пака треків; поруч шукається індекс назв (той самий шлях з `.json`)       |
| `ns`     | `dril-moto`         | префікс ключа `localStorage` з прогресом: `${ns}:progress:v1`                 |
| `lang`   | `uk`                | мова рядків; поки лише `uk`                                                   |
| `theme`  | `light`             | `light` або `dark` — токени й палітра канвасу з `src/shell/theme.css`         |
| `debug`  | —                   | FPS у HUD і `json=<url>`: JSON-трек або пак без збірки, заїзд стартує одразу  |

Індекс назв — масив `[{ league, index, name, slug }]`; без нього списки показують ASCII-назви з
`.mrg`.

## Повідомлення сайту

Гра шле `window.parent.postMessage(msg, window.location.origin)` лише з iframe:

- `{ source: 'dril-moto', type: 'ready', version }` — показано перший екран гри (сплеш, а з `?debug&json=` — заїзд); пак, спрайти й шрифт e-Ukraine ваг 700 і 500 (ними намальовано сплеш і меню) уже завантажені;
- `{ source: 'dril-moto', type: 'exit' }` — «Вийти» в меню чи паузі;
- `{ source: 'dril-moto', type: 'finished', league, track, timeMs, best }` — після фінішу.

## Треки

Трек — JSON в одиницях треку, як `tracks/dev/01-lanka.json`: `name`, `start`, `finish`,
`points`. y росте вгору; старт на 15–30 одиниць вище землі, під обома колесами рівно; фініш —
лише x (y = 0); x точок строго зростає. Усі правила перевіряє `src/shell/trackJson.ts`.

```bash
npm run dev-pack                                    # tracks/dev/*.json → src/assets/dev-pack.mrg
node scripts/sim-track.mjs tracks/dev/02-hirka.json # прохідність на фізиці двигуна, без браузера
```

`sim-track` проганяє кожен трек водіями `ai` (демо-автопілот порту), «лише газ» і `bot`; для треку,
якого не пройшов жоден із них, сам запускає планувальник (≈1 хв на трек; `--no-plan` вимикає).
`--driver ai,gas,bot,plan` — усі чотири водії на кожному треку. Трек, який не проходить і
планувальник, заважкий.

Швидко подивитись трек без збірки: `npm run dev` і
`http://localhost:3100/?debug&json=/tracks/dev/02-hirka.json` (dev-сервер віддає файли з кореня
проєкту; JSON-пак `{ "leagues": [[…], […], […]] }` теж підходить). Заїзд стартує одразу, прогрес
такого заїзду пишеться окремо (`${ns}:json:progress:v1`) і не чіпає справжній.

## Спрайти

Розміри, сітки кадрів і кут кожного кадру — у [docs/sprites.md](docs/sprites.md), шаблони —
`docs/sprite-templates/*@8x.png`. Готові файли кладуться в `src/assets/` у розмірі 1×.

```bash
npm run sprites:template     # docs/sprites.md і шаблони
npm run sprites:placeholder  # тимчасові спрайти тих самих розмірів
```

## Реліз

1. `npm version X.Y.Z --no-git-tag-version` (версія в `package.json` і `package-lock.json`), дописати `CHANGELOG.md`.
2. Якщо змінились `LICENSE.md` чи `NOTICE.md` — `cp LICENSE.md public/LICENSE.txt && cp NOTICE.md public/NOTICE.txt`.
3. `git tag vX.Y.Z && git push origin vX.Y.Z` — GitHub Actions (`.github/workflows/release.yml`)
   перевіряє, збирає й публікує GitHub Release з `dist.zip` (вміст `dist/` у корені архіву).
4. На сайті: `node scripts/sync-moto-bundle.mjs --tag vX.Y.Z` — перевіряє архів, кладе його в
   `public/moto/` без `tracks/` і пише `VERSION`. Руками архів у `public/moto/` не розпаковувати.

## Ліцензія

GPL-2.0 — [LICENSE.md](LICENSE.md). Шрифт e-Ukraine (`public/fonts/e-ukraine/`) — CC BY 4.0,
https://thedigital.gov.ua/fonts.
````

- [ ] **Step 5: Перевірка**

Run:

```bash
npx tsc -b && npm run lint && npm run build
ls -A dist
grep -c '0\.1\.0' dist/assets/*.js
find dist -name '*.mrg' | wc -l | tr -d ' '
grep -c 'data:application/octet-stream' dist/assets/*.js
```

Expected: збірка чиста; `ls -A dist` → `LICENSE.txt NOTICE.txt assets fonts index.html` (без `.nojekyll` і жодного іншого дот-файлу); перший `grep` → `1` (версія з `package.json` підставлена); `find` → `0`; останній `grep` → `0` (дев-пак у прод-бандл не потрапляє: він менший за 4 КБ, і Vite вбудував би його в JS як `data:application/octet-stream`, тож `find` сам цього не доводить).

Повна перевірка бандла й тестовий пак для браузера:

```bash
npm run check && npm run lint && npx tsc -b && npm run build
grep -o 'url([^)]*woff2)' dist/assets/*.css
ls dist/fonts/e-ukraine | wc -l | tr -d ' '
grep -rnE '\.(scheduleGameTimerTask|menuToGame|gameToMenu|openPauseMenu)\(|isDrawingTime = true' src/shell; echo "exit=$?"
gzip -c dist/assets/*.js dist/assets/*.css | wc -c
du -ck dist/fonts/e-ukraine/*.woff2 | tail -1
# пак і дев-треки лише в dist/ для локальної перевірки (dist у .gitignore; реліз CI збирає начисто)
mkdir -p dist/tracks && cp src/assets/dev-pack.mrg dist/tracks/dril.mrg && cp -r tracks/dev dist/tracks/dev
cat > dist/bridge-test.html <<'EOF'
<!doctype html>
<meta charset="utf-8" />
<title>bridge test</title>
<iframe src="./index.html?debug" style="width: 400px; height: 740px; border: 0"></iframe>
<script>
  addEventListener('message', (e) => console.log('from game:', e.origin, JSON.stringify(e.data)))
</script>
EOF
```

Expected: `npm run check` → `ok: 5 checks`, `ok: 5 checks`, `ok: palette`; лінт і збірка чисті; чотири рядки `url(../fonts/e-ukraine/e-Ukraine-….woff2)` і `4` файли шрифтів; `exit=1` (оболонка не вмикає текст на канвасі); gzip JS+CSS ≈ 30 КБ плюс ≈ 160 КБ шрифтів — разом ≤ 300 КБ.

Run (з вимкненою пісочницею, у фоні — для агента `run_in_background`): `npx vite preview` → `http://localhost:4173/`; після перевірок зупини.

У браузері:

- `http://localhost:4173/index.html?theme=dark&ns=test&debug` — темна тема: фон канвасу #101413 без білого спалаху до першого кадру; передня лінія треку світла (#f2f4f3), лінії перспективи сірі (#a7b0ac), спиці й древка прапорців світлі, смуга прогресу внизу — світла рамка; тіні тануть у фон; байк, шини й прапорці видно; тач-капсули (DevTools → емуляція сенсорного пристрою, перезавантаження) світлі з темним підписом, натиснута капсула темнішає, а не світлішає; FPS у HUD; шрифт e-Ukraine (DevTools → Computed → Rendered Fonts); Network: `e-Ukraine-Bold.woff2` (200) запитаний з `<link rel="preload">` одночасно з JS і CSS, і сплеш-заглушка одразу в e-Ukraine Bold, без підміни шрифту; `e-Ukraine-Medium.woff2`, `tracks/dril.mrg` і `tracks/dril.json` — після неї, до справжнього сплешу; `e-Ukraine-Regular.woff2` — одразу після справжнього сплешу, `e-Ukraine-Light.woff2` не запитується зовсім; єдиний 404 — `tracks/dril.json` (індекс назв необовʼязковий, у `dist/tracks/` його не кладемо; без нього списки беруть ASCII-назви з `.mrg`); `tracks/dril.mrg` і `tracks/dril.json` запитуються одночасно, а не один після одного. Те саме без `theme` — світла тема: чорний трек на білому.
- Під час заїзду, падіння й фінішу на канвасі немає жодного тексту (ні часу, ні «Crashed», «Finished», «Wheelie!», ні назви треку) — лише DOM-HUD.
- На Retina в консолі `const c = document.querySelector('.game-canvas'); [c.width, c.clientWidth]` → перше число вдвічі більше; лінія треку завтовшки 2 фізичні пікселі, спрайти з різкими квадратними пікселями, не розмиті; поворот телефона дає повний кадр без обрізаного правого краю.
- `http://localhost:4173/index.html?debug&json=./tracks/dev/02-hirka.json` — заїзд «Hirka» з JSON стартує одразу, без меню; сплеш-заглушка зникає, щойно показано заїзд.
- `http://localhost:4173/bridge-test.html` — у консолі сторінки `from game: http://localhost:4173 {"source":"dril-moto","type":"ready","version":"0.1.0"}`, після фінішу `finished`, після «Вийти» `exit`.

```bash
# бюджет першого кадру (спека, секція 2): LCP документа гри в мобільному профілі Lighthouse ≤ 1,5 с.
# З вимкненою пісочницею (headless Chrome, кеш npx у ~/.npm), поки працює `npx vite preview` з dist/tracks/dril.mrg
for i in 1 2 3; do
  npx -y lighthouse@12 "http://localhost:4173/index.html?ns=lh-check" --only-categories=performance --output=json \
    --output-path="$TMPDIR/game-lh-$i.json" --chrome-flags="--headless=new" --quiet
  node -e 'const a = require(process.argv[1]).audits; console.log("LCP гри:", Math.round(a["largest-contentful-paint"].numericValue), "мс, CLS", a["cumulative-layout-shift"].numericValue)' "$TMPDIR/game-lh-$i.json"
done
```

Expected: три рядки ≈ `LCP гри: 1353 мс, CLS 0` (відтворено: 1355, 1354, 1353; без сплешу-заглушки — 1803–1808). Медіана понад 1500 — зупинись: перевір, що в `dist/index.html` є `data-screen="boot"` і preload Bold, а `GameShell` чекає `bootPainted()`.

Після перевірок зупини `vite preview` і прибери тестові файли з `dist/` (інакше `sync-moto-bundle.mjs --from ../drill-moto/dist` без перезбірки занесе `bridge-test.html` на сайт):

```bash
rm -rf dist/tracks dist/bridge-test.html
ls -A dist
```

Expected: `LICENSE.txt NOTICE.txt assets fonts index.html`.

- [ ] **Step 6: Commit і тег**

```bash
git add -A
git commit -m "chore(release): версія 0.1.0 з package.json, LICENSE і NOTICE у бандлі, release.yml, CHANGELOG і README

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
git tag v0.1.0
```

Пуш і створення публічного репозиторію — власник: створи на github.com порожній публічний репозиторій `ZhekaGrem/drill-moto` (без README/LICENSE), потім `git remote add origin https://github.com/ZhekaGrem/drill-moto.git && git push -u origin main && git push origin v0.1.0` (або, якщо встановлено `gh`, — `gh repo create ZhekaGrem/drill-moto --public --source . --push && git push origin v0.1.0`). Пушиться гілка `main` і тег; довідковий клон `../gd-upstream` не є remote форку і не пушиться.

---

### Task 14 (умовна): `Number` замість `BigInt` у гарячому шляху

Виконується лише тоді, коли план B, задача 6, крок 3 або 4 показав < 58 fps (ризик спеки «Продуктивність на старих телефонах», секція 6); інакше задача пропускається. `GamePhysics.ts`, `LevelLoader.ts`, `MathF16.ts` і решта спекового списку не чіпаються: 172 виклики `multiplyF16`/`divideF16` у `GamePhysics.ts` (133 рядки) прискорюються зміною самого `src/cpp.ts`, якого в спековому списку незмінних файлів нема. Для int32-аргументів новий `cpp.ts` рахує в `Number`, і кожен проміжний добуток і частка вкладаються в 53 біти. Решта аргументів (поза int32, дробові, ділення на нуль) іде BigInt-шляхом upstream без змін, тож результат біт у біт той самий, разом із `RangeError` на нулі.

**Files:**

- Create: `scripts/check-cpp.mjs`
- Modify: `src/cpp.ts` (повністю), `src/GameCanvas.ts` (імпорт і шість рядків з `BigInt`), `package.json` (скрипт `check`, `version`), `package-lock.json` (`version`), `NOTICE.md` (рядок у перелік змін), `public/NOTICE.txt` (копія `NOTICE.md`), `README.md` (коментар до `npm run check`), `CHANGELOG.md` (повністю)

**Interfaces:**

- Consumes:
  - з upstream `src/cpp.ts`: `toInt`, `truncDiv`, `multiplyF16`, `divideF16`, `abs`, `roundfToInt`, `INT_MAX`, `INT_MIN`;
  - `node scripts/sim-track.mjs` і його еталонний вивід на дев-паку (Task 3, Step 5);
  - стан `src/GameCanvas.ts` після Task 1 і Task 12: імпорт `toInt` і шість рядків із `BigInt` (пʼять місць зі Step 3) такі, як в upstream;
  - npm-скрипт `check` = `node scripts/check-mrg.mjs && node scripts/check-progress.mjs && node scripts/check-palette.mjs` (Task 12);
  - `NOTICE.md`, що закінчується списком «Перелік змін відносно upstream» (Task 13, Step 1), і `public/NOTICE.txt`, побайтово рівний йому, бо `release.yml` робить `cmp NOTICE.md public/NOTICE.txt` (Task 13, Step 3);
  - рядок README `npm run check      # check-mrg, check-progress, check-palette` (Task 13, Step 4);
  - розділ `## 0.1.0` у `CHANGELOG.md`, який Step 5 повторює дослівно (Task 13, Step 4);
  - `define` для `import.meta.env.VITE_APP_VERSION` з `package.json` у `vite.config.ts` (Task 13, Step 2) — на ньому тримається перевірка версії `0.1.1` у бандлі.
- Produces: той самий API `src/cpp.ts` з тими самими результатами; `scripts/check-cpp.mjs`; реліз `v0.1.1`.

- [ ] **Step 1: Перевірка — спершу червона**

`scripts/check-cpp.mjs`:

```js
// scripts/check-cpp.mjs — src/cpp.ts: int32-аргументи йдуть швидким шляхом без BigInt,
// а результат біт у біт той самий, що в BigInt-версії upstream (вона нижче — еталон).
//   node scripts/check-cpp.mjs
import assert from 'node:assert/strict'
import { divideF16, multiplyF16, toInt, truncDiv } from '../src/cpp.ts'

// Еталон — src/cpp.ts upstream 889a091 дослівно
const big = (v) => (typeof v === 'bigint' ? v : BigInt(Math.trunc(v)))
const ref = {
  toInt: (v) => Number(BigInt.asIntN(32, big(v))),
  truncDiv: (a, b) => ref.toInt(big(a) / big(b)),
  multiplyF16: (a, b) => ref.toInt((big(a) * big(b)) >> 16n),
  divideF16: (a, b) => ref.toInt(((big(a) << 32n) / big(b)) >> 16n),
}
const fast = { toInt, truncDiv, multiplyF16, divideF16 }
const BINARY = ['multiplyF16', 'divideF16', 'truncDiv']

let n = 0
const check = (name, fn) => {
  fn()
  n += 1
  console.log('ok -', name)
}

// Детермінований генератор: int32 будь-якої розрядності, обидва знаки
let seed = 12345
const next = () => (seed = (Math.imul(seed, 1103515245) + 12345) >>> 0)
const randomInt32 = () => {
  const magnitude = (next() * 4294967296 + next()) % 2 ** (next() % 32)
  return (next() & 1 ? -magnitude : magnitude) | 0
}
const outcome = (fn) => {
  try {
    return fn()
  } catch (error) {
    return error.constructor.name
  }
}
const same = (name, a, b) => {
  const expected = outcome(() => ref[name](a, b))
  const actual = outcome(() => fast[name](a, b))
  assert.ok(expected === actual, `${name}(${a}, ${b}): BigInt ${expected}, src/cpp.ts ${actual}`)
}

check('int32-аргументи не торкаються BigInt', () => {
  const RealBigInt = globalThis.BigInt
  globalThis.BigInt = () => {
    throw new Error('BigInt у швидкому шляху')
  }
  try {
    for (const [a, b] of [[3, 5], [-2147483648, -1], [2147483647, 65536], [-7, 3]]) {
      multiplyF16(a, b)
      divideF16(a, b)
      truncDiv(a, b)
      toInt(a * 4096)
    }
  } finally {
    globalThis.BigInt = RealBigInt
  }
})

const EDGE = [0, 1, 2, 3, 7, 32767, 32768, 46341, 65535, 65536, 65537, 205887, 655360, 11796480, 1073741824, 2147418112, 2147483646, 2147483647]
check('крайові значення: результат як у BigInt', () => {
  for (const a of EDGE) {
    for (const b of EDGE) {
      for (const [x, y] of [[a, b], [-a, b], [a, -b], [-a, -b], [-2147483648, b], [a, -2147483648]]) {
        for (const name of BINARY) same(name, x, y)
      }
    }
  }
})

check('1 000 000 випадкових пар int32: результат як у BigInt', () => {
  for (let i = 0; i < 1_000_000; i++) {
    const a = randomInt32()
    const b = randomInt32()
    for (const name of BINARY) same(name, a, b)
  }
})

check('поза int32, дробові й ділення на нуль — як у BigInt (разом із RangeError)', () => {
  for (const [a, b] of [[2 ** 40, 3], [3.7, -2.2], [-(2 ** 33), 65536], [1e15, 7], [5, 0], [0, 0], [2 ** 31, 2]]) {
    for (const name of BINARY) same(name, a, b)
  }
  for (const v of [0, -0, 1.9, -1.9, 2 ** 31, -(2 ** 31) - 1, 2 ** 40 + 5, -(2 ** 52), 1e300, 12345678901234n, -5n]) {
    assert.equal(toInt(v), ref.toInt(v), String(v))
  }
  assert.throws(() => toInt(Number.NaN), RangeError)
})

console.log(`ok: ${n} checks`)
```

Run: `node scripts/check-cpp.mjs`
Expected: `Error: BigInt у швидкому шляху` (upstream `cpp.ts` кличе `BigInt` на кожному виклику), exit 1.

- [ ] **Step 2: `src/cpp.ts` повністю**

```ts
// src/cpp.ts — цілочисельна арифметика J2ME (int32, fixed-point 16.16).
// Швидкий шлях — Number: для int32-аргументів кожен проміжний добуток і частка
// вкладаються в 53 біти, тож результат біт у біт той самий, що дає BigInt-версія
// upstream. Решта аргументів (поза int32, дробові, ділення на нуль) іде
// BigInt-шляхом upstream без змін — разом із його RangeError на нулі.
function toBigInt(value: bigint | number): bigint {
  if (typeof value === 'bigint') {
    return value
  }

  return BigInt(Math.trunc(value))
}

export const INT_MAX = 2147483647
export const INT_MIN = -2147483648

const isInt32 = (value: number): boolean => (value | 0) === value

export function toInt(value: bigint | number): number {
  // x | 0 (ToInt32) відкидає дробову частину і бере x mod 2^32 — рівно
  // BigInt.asIntN(32, BigInt(Math.trunc(x))) для будь-якого скінченного x
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value | 0
  }

  return Number(BigInt.asIntN(32, toBigInt(value)))
}

export function abs(value: number): number {
  return value < 0 ? -value : value
}

export function truncDiv(a: number, b: number): number {
  if (isInt32(a) && isInt32(b) && b !== 0) {
    // |a| < 2^31: неціла частка a/b стоїть від цілого далі за 1/|b|, а похибка
    // ділення в double менша, тож Math.trunc дає точну цілу частку
    return Math.trunc(a / b) | 0
  }

  return toInt(toBigInt(a) / toBigInt(b))
}

export function multiplyF16(a: number, b: number): number {
  if (isInt32(a) && isInt32(b)) {
    // a·b = a·bHigh·2^16 + a·bLow, обидва доданки < 2^47:
    // floor(a·b / 2^16) = a·bHigh + floor(a·bLow / 2^16) — без втрати точності
    const bLow = b & 0xffff
    const bHigh = b >> 16
    return (a * bHigh + Math.floor((a * bLow) / 65536)) | 0
  }

  return toInt((toBigInt(a) * toBigInt(b)) >> 16n)
}

export function divideF16(a: number, b: number): number {
  if (isInt32(a) && isInt32(b) && b !== 0) {
    // trunc(a·2^32 / b) у два кроки по 16 біт: high = trunc(a·2^16 / b), остача
    // rest (|rest| < |b|) дає low = trunc(rest·2^16 / b), |low| < 2^16; усі
    // ділені < 2^47, тож кожен trunc точний. (high·2^16 + low) >> 16 = high + floor(low / 2^16)
    const numerator = a * 65536
    const high = Math.trunc(numerator / b)
    const low = Math.trunc(((numerator - high * b) * 65536) / b)
    return (high + (low < 0 ? -1 : 0)) | 0
  }

  return toInt(((toBigInt(a) << 32n) / toBigInt(b)) >> 16n)
}

export function roundfToInt(value: number): number {
  const rounded = Math.round(Math.abs(value))
  return value < 0 ? -rounded : rounded
}
```

Run: `node scripts/check-cpp.mjs`
Expected: `ok - …` ×4 і `ok: 4 checks` (≈8 с), exit 0.

- [ ] **Step 3: `src/GameCanvas.ts` — BigInt-вирази через `multiplyF16`/`divideF16`**

Кожен старий рядок трапляється у файлі рівно раз (правки Task 1 і Task 12 їх не зачіпають). Після замін у `GameCanvas.ts` нема ні `BigInt`, ні `toInt`.

(1) Імпорт

```ts
import { toInt } from './cpp.ts'
```

на

```ts
import { divideF16, multiplyF16 } from './cpp.ts'
```

(2) У `renderBodyPart` рядки

```ts
    const x = this.addDx((toInt((BigInt(x2F16) * BigInt(tF16)) >> 16n) + toInt((BigInt(x1F16) * BigInt(65536 - tF16)) >> 16n)) >> 16)
    const y = this.addDy((toInt((BigInt(y2F16) * BigInt(tF16)) >> 16n) + toInt((BigInt(y1F16) * BigInt(65536 - tF16)) >> 16n)) >> 16)
```

на

```ts
    const x = this.addDx((multiplyF16(x2F16, tF16) + multiplyF16(x1F16, 65536 - tF16)) >> 16)
    const y = this.addDy((multiplyF16(y2F16, tF16) + multiplyF16(y1F16, 65536 - tF16)) >> 16)
```

(3) У `drawWheelArc`

```ts
    let angle = -toInt(((BigInt(toInt((BigInt(var4) * 11796480n) >> 16n)) << 32n) / 205887n) >> 16n)
```

на

```ts
    let angle = -divideF16(multiplyF16(var4, 11796480), 205887)
```

(4) У `calcSpriteNo`

```ts
    const var6 = toInt((BigInt(toInt((BigInt(angleF16) << 32n) / BigInt(var3) >> 16n)) * BigInt(var4 << 16)) >> 16n)
```

на

```ts
    const var6 = multiplyF16(divideF16(angleF16, var3), var4 << 16)
```

(5) У `drawProgressBar`

```ts
    this.graphics.fillRect(2, h - 3, toInt((BigInt((this.width - 4) << 16) * BigInt(var1)) >> 16n) >> 16, 1)
```

на

```ts
    this.graphics.fillRect(2, h - 3, multiplyF16((this.width - 4) << 16, var1) >> 16, 1)
```

(6) У `drawGame` (екран завантаження)

```ts
      const var3 = toInt(((BigInt(Micro.gameLoadingStateStage << 16) << 32n) / 655360n) >> 16n)
```

на

```ts
      const var3 = divideF16(Micro.gameLoadingStateStage << 16, 655360)
```

- [ ] **Step 4: Перевірка**

```bash
node scripts/check-cpp.mjs
npm pkg set scripts.check="node scripts/check-mrg.mjs && node scripts/check-progress.mjs && node scripts/check-palette.mjs && node scripts/check-cpp.mjs"
grep -c 'BigInt\|toInt' src/GameCanvas.ts
node scripts/sim-track.mjs
npx tsc -b && npm run lint && npm run check && npm run build
```

Expected: `ok - …` ×4 і `ok: 4 checks`; `0`; `sim-track` друкує рівно ті самі рядки, що в Task 3, Step 5, з exit 0:

```
L0 T0 Lanka        ai: finish 14.15s | gas: finish 12.07s | bot: finish 10.86s
L0 T1 Hirka        ai: finish 19.14s | gas: finish 13.19s | bot: finish 13.17s
L0 T2 Yama         ai: finish 18.66s | gas: finish 14.17s | bot: finish 14.17s
L1 T0 Lanka        ai: finish 8.51s | gas: finish 7.31s | bot: finish 7.40s
L2 T0 Lanka        ai: finish 7.69s | gas: crash(5) 3.3s x=246 y=44 | bot: finish 6.59s
5/5 треків фінішують хоча б одним водієм
```

Інший рядок означає, що функції розійшлися з BigInt, і тоді `check-cpp` теж червоний. `tsc` і `eslint` чисті; `npm run check` → `ok: 5 checks`, `ok: 5 checks`, `ok: palette`, `ok: 4 checks`; `vite build` чистий.

- [ ] **Step 5: Версія, NOTICE, README, CHANGELOG**

```bash
npm version 0.1.1 --no-git-tag-version   # версія і в package.json, і в package-lock.json
cat >> NOTICE.md <<'EOF'
- з 0.1.1: `src/cpp.ts` рахує int32-арифметику в `Number` замість `BigInt` (ті самі результати),
  `src/GameCanvas.ts` без `BigInt`.
EOF
cp NOTICE.md public/NOTICE.txt
sed -i '' 's/# check-mrg, check-progress, check-palette$/# check-mrg, check-progress, check-palette, check-cpp/' README.md
grep -c 'check-cpp' README.md
cmp NOTICE.md public/NOTICE.txt && echo "NOTICE.txt = NOTICE.md"
node -p "const l = require('./package-lock.json'); [require('./package.json').version, l.version, l.packages[''].version].join(' ')"
```

Expected: `v0.1.1` (друкує `npm version`; без коміту й тегу — їх робить Step 6); `1`; `NOTICE.txt = NOTICE.md` (інакше `cmp` у `release.yml` зупинить реліз); `0.1.1 0.1.1 0.1.1` — версія однакова в `package.json` і в обох місцях `package-lock.json`.

`CHANGELOG.md` повністю:

```markdown
# Changelog

## 0.1.1

- `src/cpp.ts`: `multiplyF16`, `divideF16`, `truncDiv`, `toInt` рахують int32-аргументи в `Number`
  замість `BigInt` (результати біт у біт ті самі, перевірка — `scripts/check-cpp.mjs`);
  `src/GameCanvas.ts` без `BigInt` — бюджет 60 fps на старих телефонах.

## 0.1.0

- Форк від upstream (коміт — у NOTICE.md) без асетів Codebrew (levels.mrg, лого, сплеш,
  спрайти байка); плейсхолдери спрайтів тих самих розмірів; енкодер/декодер `.mrg`; дев-пак
  із JSON-треків.
- Оболонка `src/shell/`: двигун без канвасних меню, цикл заїзду з паузою й відліком після
  падіння, DOM-меню українською, сплеш, прогрес і відкриття треків і ліг, рекорди.
- Тач-керування з pointer capture і мультитачем, підказка клавіш на десктопі, вібрація на падінні.
- Параметри URL (`tracks`, `ns`, `lang`, `theme`, `debug`, `json`), індекс українських назв
  треків, міст `postMessage` до сайту (`ready`, `exit`, `finished`).
- Тема й шрифт сайту: токени в `src/shell/theme.css`, палітра канвасу через `GameCanvas.colorMap`,
  e-Ukraine; рендер у devicePixelRatio (до 2).
- Шаблони спрайтів і `docs/sprites.md`; безголовий прогін треків `scripts/sim-track.mjs` (водії ai,
  «лише газ», бот і планувальник); реліз через GitHub Actions з `dist.zip`.
```

Run: `npm run build && grep -c '0\.1\.1' dist/assets/*.js` → `1`.

- [ ] **Step 6: Commit і тег**

```bash
git add -A
git commit -m "perf(engine): Number замість BigInt у cpp.ts і GameCanvas — ті самі результати біт у біт

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
git tag v0.1.1
```

Пушить власник: `git push origin main && git push origin v0.1.1`. CI публікує реліз `v0.1.1`; на сайті — план B, задача 6, крок 5 з `TAG=v0.1.1`, потім кроки 3–4 заново.

---


## Самоперевірка плану

- **Покриття спеки.** Секція 1 (форк від знімка upstream, файли, контракт URL/`postMessage`, `dist/` з відносними шляхами, реліз `dist.zip`) — Task 1, 10, 13. Секція 2: потік екранів (сплеш, меню, ліги з кількістю треків і замком закритих, треки із замком, заїзд із HUD і секундоміром `м:сс.сс`, пауза, фініш, рекорди, «Про гру») — Task 4, 6, 7, 8; тач-розкладка з цілями ≥ 56×56px і проміжками 8px до ширини 320px, натиснута кнопка темнішає в обох темах — Task 9 (темна тема — перевірка Task 11); керування (стрілки, Escape, Enter/пробіл через фокус DOM-кнопок, тач-кнопки з pointer capture і мультитачем, «Пауза» другим пальцем, поки перший тримає газ, підказка клавіш) — Task 4, 6, 7, 9; ліги, відкриття, рекорди — Task 5, 7, 8; рендер (DPR, крок фізики без «наздоганяння», пауза при прихованій вкладці) — Task 4, 6, 12; локалізація й шрифт — Task 6, 11 (ваги e-Ukraine 700 і 500 — до першого кадру меню, 400 — одразу після нього). Бюджети: 300 КБ gzip — Task 13, Step 5; перший кадр гри (LCP документа гри ≤ 1,5 с) і 60 fps міряє план B (задача 6, кроки 1 і 6 для LCP, кроки 3–4 для fps), а план A для першого кадру показує сплеш-заглушку з `index.html` (preload Bold, `font-display: block`, `bootPainted`) до пака й двигуна і міряє LCP на `vite preview` (Task 11, Step 4; Task 13, Step 5), вантажить пак і індекс назв паралельно (Task 10) і ставить тему до першого кадру (Task 11); нижче 58 fps — умовна Task 14. Секція 4 (формат `.mrg` і калібрування на оригінальному паку — Task 1; JSON-трек із правилами двигуна — Task 3; безголовий симулятор на фізиці двигуна з водіями «демо-AI», «лише газ», бот і планувальником як ворота прохідності — Task 3; `?debug&json=` — Task 10). Секція 5 (спрайти тих самих розмірів — Task 1; шаблон для дизайнера — окрема задача одразу після форку, Task 2, з тулубом у Дріл-мерчі й приміткою, що вилку малює код; палітра з токенів в обох темах — Task 12; e-Ukraine — Task 11; вібрація — Task 9). Контраст меню ≥ 4.5:1 (чекліст 14) — закриті картки без `opacity` (`shell.css`, Task 6). Секція 6 (ліцензія; `NOTICE.md` з upstream, комітом і авторами — Task 1, кредит шрифту — Task 11, перелік змін — Task 13; `LICENSE.txt`/`NOTICE.txt` у бандлі — Task 13; кредити «Про гру» дослівно зі спеки — Task 6, 8; жодного файлу Codebrew навіть в історії git — Task 1; ризик «iframe на iOS» — `touch-action: none` у документі гри, Task 6; ризик BigInt — умовна Task 14). Чекліст ручної перевірки спеки для гри — кроки перевірки Task 1–13; наскрізний прогін на сайті — план B. Єдине свідоме відхилення від тексту спеки (текстовий сплеш; його заголовок ще й у сплеші-заглушці `index.html`) записане в Global Constraints.
- **Плейсхолдери.** Кожен крок із кодом містить повний код файлу або точну правку «що → на що» (для файлів двигуна); кожен запуск має команду й очікуваний вивід. Кроків, що описують код словами без самого коду, немає; умовна Task 14 (заміна BigInt) теж записана повним кодом. Файли, які кілька задач переписують повністю (`GameShell.ts` у Task 4, 6, 7, 10, 11; `RaceSession.ts` у Task 6, 9, 10; `check-mrg.mjs` і `build-dev-pack.mjs` у Task 1 і 3; `MainScreen.ts` і `menus.ts` у Task 7 і 8; `shell.css` у Task 4 і 6, далі дописується в Task 9 і 10), кожна задача дає цілком, без «як у Task N»; дві короткі правки `GameShell.ts` у Task 8 і 12 записані точно («рядок … заміни на …», «після рядка … встав …»). Кожна з 14 задач має Files, Interfaces, крок перевірки й коміт.
- **Перевірено на коді.** Усі блоки коду цього плану зібрано в копії upstream `889a091` (знімок без `.git`, TypeScript 5.9, Vite 7, Node 24.2) після кожної задачі: `npx tsc -b`, `npm run lint`, `npm run build` чисті; `check-mrg` (5, з оригінальним паком 6 перевірок), `check-progress` (5), `check-palette` зелені; `sim-track` дає рядки зі Step 5 Task 3; безголовий прогін оболонки в jsdom проходить сплеш → меню → ліги → треки → заїзд → пауза → фініш → «Далі» → падіння з відліком → пауза під час відліку → авторестарт → тап-рестарт → прихована вкладка → рекорди → скидання → «Про гру» → «Вийти», а також тач (газ + нахил, відпускання, пауза, blur), режими `?tracks=…&theme=dark&ns=test&debug`, `?debug&json=` і прод-збірку без пака. Правки другого проходу (замок і контраст закритих карток, тач-CSS з мінімумами, паралельний індекс назв у `pack.ts`, кирилиця в `sim-track`, без `public/vite.svg`) прогнано на копії стану після Task 5: `tsc -b`, `lint`, `build` чисті; `ls dist` → `LICENSE.txt NOTICE.txt assets fonts index.html`; `data:application/octet-stream` у JS — `0` (а з імпортом `dev-pack.mrg?url` у `main.ts` — `1` при `find … *.mrg` = `0`, тож перевірка потрібна); `sim-track` на `02-hirka.json` і на тому самому треку з назвою «Гірка» — 3/3, exit 0; hex у `shell.css` лишились тільки фолбеками токенів. Правки третього проходу: `scripts/check-cpp.mjs` на upstream `cpp.ts` падає з `Error: BigInt у швидкому шляху` (exit 1), на новому `cpp.ts` дає `ok: 4 checks` за ≈7,5 с (Node 24.2); пʼять BigInt-виразів `GameCanvas.ts` і їхні заміни через `multiplyF16`/`divideF16` збігаються на 300 000 випадкових входів; новий `cpp.ts`, `mrg.ts` і `trackJson.ts` проходять `tsc` 5.8 з `strict`, `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, `verbatimModuleSyntax`; `parseTrackJson` приймає трек `valid` з `check-mrg` без змін, повертає назву без крайових пробілів і відкидає назву з самих пробілів; prettier сайту на цьому файлі з маркерами `prettier-ignore` не змінює жодного рядка. Четвертий прохід: новий `formatTime` під Node 24.2 дає `0` → `0:00.00`, `7980` → `0:07.98`, `12070` → `0:12.07`, `65300` → `1:05.30`, `599990` → `9:59.99`, `600000` → `10:00.00`, а в копії форку з ним `tsc -b` і `lint` чисті; `sim-track.mjs` із планувальником (код Task 3 побайтово) на дев-паку за замовчуванням друкує рівно рядки Task 3, Step 5 (планувальник не вмикається, 0,4 с), `tracks/dev/02-hirka.json` — 3/3, `--driver plan` — 5/5 за ≈3 хв 46 с CPU; на паку сайту з плану B (sha256 `a9984aea…`) без `--driver` — 9/9, exit 0 (планувальник сам на 7 треках, ≈7 хв 12 с), з `--driver ai,gas,bot` — 2/9 за 0,5 с без планувальника, з `--driver ai,gas,bot,plan` — `plan: finish` у кожному з девʼяти рядків, 9/9, exit 0 (≈8 хв 24 с CPU); калібрування `--driver ai,gas` на оригіналі — `Intro … gas: finish 8.21s` і `3/30`, exit 1; проміжні стани після розрізу задач зібрано в копії форку: стан після Task 6 (тимчасовий `GameShell` через `RaceSession`) — `tsc -b`, `eslint`, `vite build` чисті, у headless Chrome HUD показує назву треку й кнопку «Пауза», Esc зупиняє й продовжує годинник без стрибка; стан після Task 10 — те саме, `bridge-test.html` у `vite preview` отримує `ready` з версією `dev`; рядок теми в `<head>` `index.html` робить перший кадр `?theme=dark` темним (без нього перший кадр білий); приклад JSON секції 4 спеки `parseTrackJson` приймає, `sim-track` на ньому — 3/3. Пʼятий прохід (блоки коду витягнуто з цього файлу в копію форку): стан після Task 1 без `trackJson.ts` — `check-mrg` `ok: 4 checks` (з оригінальним паком — 5), дев-пак 550 байт побайтово той самий, що з `parseTrackJson`; Task 3, Step 1 падає з `ERR_MODULE_NOT_FOUND`, після Step 2 — 5/6 перевірок, дев-пак без змін; стани після Task 7 (меню без «Рекордів» і «Про гру»), Task 8, Task 10, Task 11 і Task 12 — `tsc -b`, `eslint` і `vite build` чисті, а Task 8, Step 2 дає рівно очікувану помилку `Property 'resetProgress' is missing`; `GameShell` після вставок Task 8 збігається з колишньою повною версією (крім номерів задач у коментарях), після вставок Task 12 — з варіантом, на якому зроблено заміри LCP (різниця лише в коментарях); у `dist/index.html` Task 11 — `rel="preload" href="./fonts/e-ukraine/e-Ukraine-Bold.woff2"` і `data-screen="boot"`; `npm version 0.1.1 --no-git-tag-version` на брудному дереві git без мережі ставить `0.1.1` у `package.json` і в обидва місця `package-lock.json`, без коміту й тегу. Заміри LCP (Lighthouse 12, мобільний профіль): зі сплешем-заглушкою 1353–1355 мс і CLS 0 на `vite preview`, без неї 1803–1808 мс.
- **Узгодженість імен.** `encodeMrg/decodeMrg/START_SCALE/MrgPack/MrgTrack`, `parseTrackJson/parsePackJson`, `STEP_DEG/SHEETS/frameDirection/SPRITES/SPRITES_PNG/RASTER_PNG`, `createEngine → Engine`, `RaceLoop.start/restart/pause/resume/stop/running/paused/crashed`, `RaceEvents.onTick/onCrash/onCrashCountdown/onFinish/onRestart`, `formatTime` (`м:сс.сс` скрізь), `bindKeyboard/KeyboardTarget`, CLI `sim-track.mjs` (`--driver ai,gas,bot,plan`, `--seconds`, `--no-plan`), `Progress/emptyProgress/recordFinish/isTrackUnlocked/bestKey/loadProgress/saveProgress/resetProgress`, `strings`, `Screen/el/button/lockIcon`, `RaceHud.setTrack/setTime/showCrash/clearNotice`, `TrackCounts/finishedIn`, `FinishResult`, `createMenus/MenuActions/Menus/MenuId`, `MainActions` (Task 7: `play/exit`, з Task 8 ще `records/about`), `ScreenId = MenuId | 'race'`, `RaceSession.mount/show/start/pause/resume/restart/stop/racing/league/track` (конструктор `(engine, events)` у Task 6–9, `(engine, events, debug)` з Task 10), `RaceSessionEvents.onPaused/onResumeRequest/onFinish`, `TouchControls.show/hide/releaseAll`, `readConfig/Config`, `bridge.ready/exit/finished`, `loadPack/LoadedPack` (усередині `readIndex`/`withIndexNames`), `FpsMeter.tick/reset`, `bootPainted`/`BOOT_WAIT_MS` (`GameShell.ts`, Task 11), `hexToRgb/mapColor/readPalette/applyPalette/Palette/Rgb`, `GameCanvas#colorMap/ColorMap`, `strings.about.text/source/sourceUrl/disclaimer`, `toInt/truncDiv/multiplyF16/divideF16` (`src/cpp.ts`, Task 14) — однакові в усіх задачах.

## Зміни після перевірки

- Історія форку: замість клону з гілкою поверх історії upstream — знімок `git archive` у свіжий `git init`, довідковий клон `../gd-upstream`, перевірка, що жоден обʼєкт git форку не є блобом Codebrew; оновлення upstream — патчем руками.
- Вісь y треку виправлено на «вгору» в Global Constraints, `trackJson.ts`, `check-mrg.mjs` і тексті кроків; дев-треки Lanka/Hirka/Yama переписані (старт на 18 над рівною землею, стінки, запас після фінішу) і проходять фізику двигуна.
- `trackJson.ts` отримав правила геометрії двигуна (висота старту 15–30, колеса не в землі, ≥ 40 до старту, ≥ 150 після фінішу, дві точки між старт- і фініш-прапорцем, межі ±32767); `encodeMrg` відкидає не-ASCII назви; `check-mrg` перевіряє правила і байт-у-байт round-trip оригінального пака, правильно ріже `Buffer`.
- Додано `scripts/sim-track.mjs` — безголовий прогін треків на фізиці двигуна з очікуваним виводом і калібруванням на оригіналі.
- Правка лого/сплешу в `GameCanvas.ts` записана точно (тип кешу, `create`, конструктор); уточнено, що `tsc` не бачить відсутніх `?url`.
- Плейсхолдери спрайтів: спільна розкладка `sprite-layout.mjs` з правильним змістом `sprites.png` (шини, шарнір, прапори; лого-місця прозорі) і `raster.png`, кадри з променем за правилом кута, прозорий фон, кольори з контрастом в обох темах.
- `engine.ts`: `requestRepaint(0)` (без нього канвас лишався білим), `setInputMode(0)`, фолбек розміру на вікно; прибрано зайві `setMenuManager(null)`/`setUiOverlayEnabled`.
- `RaceLoop.ts` переписано: без parameter properties, відліки в кроках гри (пауза й прихована вкладка їх зупиняють), рестарт рівно через 3 с з `onCrashCountdown`, `releaseInput` доносить нуль до фізики, `onTick` не перетирає фініш, геттери `running/paused/crashed`, `formatTime` (формат виправлено в четвертому проході на спековий `м:сс.сс`).
- Файли меню upstream більше не видаляються (їх типи потрібні `TimerOrMotoPartOrMenuElem.ts`); Global Constraints перелічують усі правки двигуна точно.
- Додано `keyboard.ts` (Escape-пауза, blur відпускає клавіші) і `eslint.config.js`, з яким `npm run lint` чистий; тимчасовий HUD Task 2 показує падіння й фініш; критерії перевірки Task 2 уточнено.
- Task 3 повністю в коді: `strings.uk.ts` з «Попередній рекорд», посиланням і тач-підписами; `dom.ts` з фокусом; `RaceHud` без власного таймера; екрани без parameter properties; Pause/Finish/Records/About/Splash і `menus.ts`; `RaceSession` і `GameShell` як стан-машина; повний `shell.css` на токенах із фолбеками й правилом `[hidden]`; `loadProgress` відкидає зіпсований запис; `resetProgress` без мертвого `${ns}:rms:`; скрипт `check` проганяє обидві перевірки.
- Task 4: `TouchControls` без parameter properties, з aria-підписами, мультитачем на одній кнопці і прихованим стартом; підключення через `RaceSession` (відпускання на паузі й blur, вібрація на падінні); валідний CSS із пропорціями 1:1:1:2 і токенами.
- Task 5 повністю в коді: `pack.ts` (індекс назв, дев-фолбек, JSON з ASCII-заглушками, захист від HTML зі статусом 200), `FpsMeter`, фінальні `RaceSession`/`GameShell`; `theme.css` з точними токенами сайту й абсолютними шляхами шрифтів; лише чотири woff2 і кредит CC BY у `NOTICE.md`; палітра через хук `GameCanvas.colorMap` з ролями кольорів двигуна і `check-palette`; DPR у `resize` і `beginFrame`; шаблон спрайтів із правильними кутами кадрів; `vite.config.ts` з `appType: 'mpa'` і версією з `package.json`; `release.yml`, `CHANGELOG.md`, `README.md`; перевірка preview з паком у `dist/`, `bridge-test.html`, бюджетом, темною темою, Retina і відсутністю тексту на канвасі.
- Атрибуцію комітів замінено на `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`; додано примітки про пісочницю агента, про `keywords`/`cross-env` у `package.json` і перелік свідомих відхилень від спеки.

### Другий прохід перевірки

- Закриті ліги й треки без `opacity: 0.5` (контраст підпису ≥ 4.5:1 в обох темах): пунктирна рамка, прозорий фон і SVG-замок `lockIcon` з `dom.ts`; закрита ліга показує й «N з M» — кількість треків і пройдені; очікування Task 3 Step 8 оновлено.
- Тач-CSS Task 4: проміжки й поля 8px, `min-width: 56px` на кнопках (газ — 112px) і `min-width: auto` на групах — цілі ≥ 56×56px аж до ширини 320px; перевірка на 320px додана в Step 3.
- Шаблон спрайтів і `docs/sprites.md` перенесено з Task 5 у Task 1 (Step 4a), як вимагає спека; Files, Interfaces, коміти й назва Task 5 оновлені.
- `NOTICE.md` називає автора gravity-defied-web (Yurii Khvyshchuk) і C++-порт-джерело.
- Global Constraints: окремий пункт про робочу теку команд (корінь форку, `cd` на початку кожної команди агента); виняток для заміни BigInt у `cpp.ts`/`GameCanvas.ts` за ризиком продуктивності зі спеки; мережа й кеш npm для пісочниці.
- Task 1 Step 1 закріплює upstream на `889a0914da5fd40405190907e493fc6be72c38a2`, оновлення upstream порівнюються з `origin/main`; `npm install`/`npm uninstall` з `--cache "$TMPDIR/npm-cache"`.
- `public/vite.svg` видаляється разом із файлами Codebrew; очікуваний `ls dist` без нього.
- `pack.ts`: `.mrg` і індекс назв вантажаться паралельно (`readIndex` + синхронний `withIndexNames`).
- `sim-track.mjs` приймає JSON-трек із кириличною назвою (ASCII-заглушка, як у `pack.ts`).
- Перевірка «дев-пак не в бандлі» ловить і вбудований `data:application/octet-stream` — у Task 5 Step 4 і в CI `release.yml`.
- Реліз і README: нотатки релізу й README ведуть на `sync-moto-bundle.mjs --tag` замість ручного розпакування; `ready` описано як перший екран гри (сплеш або заїзд з `?debug&json=`).
- Dev-сервер і `vite preview` — з вимкненою пісочницею й у фоні, з примітками в кожній ручній перевірці; у Network очікується один 404 — необовʼязковий `tracks/dril.json`.
- Пуш форку без `gh` (його на машині нема): порожній репозиторій на github.com, `git remote add` і `git push`; `gh` — лише як альтернатива.

### Третій прохід перевірки

- Тіло плану обгорнуте `<!-- prettier-ignore-start -->` / `<!-- prettier-ignore-end -->` і в Global Constraints пояснено чому: pre-commit хук сайту (`prettier --write .`) інакше переписав би блоки коду й точні заміни в `GameCanvas.ts`/`app.ts`.
- Шрифт: `GameShell` до першого кадру меню чекає ваги e-Ukraine 700 (заголовки сплешу й меню) і 500 (кнопки, HUD), а 400 догружає одразу після першого кадру; README (`ready`), Step 5 Task 5 (Network) і Global Constraints (відхилення 8) узгоджені з цим.
- Додано умовну Task 6: `Number` замість `BigInt` у `src/cpp.ts` і шести рядках `GameCanvas.ts` з перевіркою `check-cpp.mjs` проти BigInt-еталона upstream, тим самим виводом `sim-track`, рядком у `NOTICE.md`, `CHANGELOG` 0.1.1 і тегом `v0.1.1`; Global Constraints посилаються на неї замість «окремої задачі».
- «Про гру»: текст кредитів дослівно зі спеки (секція 6), посилання «Наш код» між другим і третім реченням (`strings.about.disclaimer`).
- `NOTICE.md` отримав перелік змін відносно upstream (спека, секція 6), бо `NOTICE.txt` їде в бандлі без `CHANGELOG.md`.
- `public/.nojekyll` (маркер GitHub Pages видаленого скрипта `deploy`) видаляється разом із `vite.svg`; перевірки — `ls -A public` і `ls -A dist`.
- `parseTrackJson` обрізає пробіли в назві й рахує довжину в кодових точках, як `validateTrack` сайту (план B).
- Global Constraints: бюджет 60 fps зі спеки дописано до бюджетів; відхилення (7) — полотнища прапорців є спрайтами, токен фарбує лише древка.
- Interfaces Task 4 і Task 5 перелічують конкретні API попередніх задач замість «усе з Task 1–4».
- Порожній крок «Шаблон спрайтів» у Task 5 прибрано, кроки 5–7 Task 5 стали 4–6.

### Четвертий прохід перевірки

Номери задач у пунктах вище — старі (до розрізу); нижче — нові.

- Задачі розрізано й перенумеровано: стара Task 1 → Task 1 (форк, кодек `.mrg`, дев-пак), Task 2 (шаблони спрайтів), Task 3 (`sim-track`); стара 2 → Task 4; стара 3 → Task 5 (прогрес), Task 6 (рядки, DOM-HUD, `RaceSession`, `shell.css`, тимчасовий `GameShell`), Task 7 (екрани меню й стан-машина); стара 4 → Task 8; стара 5 → Task 9 (конфіг, міст, пак, FPS), Task 10 (тема, шрифти, палітра, DPR), Task 11 (версія, реліз, документація); стара 6 → умовна Task 12. Кожна нова задача має свої Files, Interfaces (з конкретними сигнатурами попередніх задач), перевірку й коміт; посилання в Global Constraints, коментарях коду, текстах кроків і самоперевірці оновлено.
- Секундомір — за спекою `м:сс.сс` (`formatTime`: `1:05.30`; соті точні, бо ігровий час іде кроками по 10–20 мс): Global Constraints, Interfaces Task 4, код `RaceLoop.ts`, перевірені значення й усі очікувані рядки часу в перевірках Task 4, 6, 7.
- `sim-track.mjs` отримав водія `plan` — планувальник зі спеки (секція 4, «Авторинг»): без `--driver` сам запускається для треку, який не пройшли `ai`, `gas` і `bot` (`--no-plan` вимикає), тож спекова команда без прапорців і є воротами; з `--driver` працюють рівно названі водії (`--driver ai,gas,bot,plan` — як у воротах плану B, `--driver ai,gas,bot` — лише автопілоти, менше секунди); прапорець без значення більше не плутається з файлом пака; очікуваний вивід планувальника на дев-паку; `CHANGELOG` 0.1.0 і README про нього згадують.
- Перевірка Task 4: «Lanka» лише газом фінішує, коли ↑ натиснуто разом зі стартом; пізній газ може зламати байк на другому горбі — записано, що це фізика треку, а не дефект оболонки; те саме застереження в перевірці Task 6.
- Global Constraints: зі «свідомих відхилень» лишилося одне (текстовий сплеш), решта тепер текст виправленої спеки, включно з правилами двигуна в `parseTrackJson` і вагами шрифту; бюджет першого кадру — LCP документа гри в мобільному профілі Lighthouse (міряє план B).
- Тач-кнопки: натиснута капсула темнішає через `filter: brightness(0.7)` і в темній темі (раніше вона там світлішала); очікування в Task 8 і в перевірці темної теми Task 10–11.
- `touch-action: none` на документі гри (ризик спеки «iframe на iOS») і `pan-y` на екранах меню: щипок не зумить, «Рекорди» гортаються пальцем; очікування в Task 8.
- `index.html` (Task 10) ставить `data-theme` до першого кадру — темна тема без білого спалаху до виконання модуля.
- Тестові `dist/tracks` і `dist/bridge-test.html` прибираються після перевірок Task 9, 10, 11, щоб синхронізація сайту без перезбірки не занесла їх у `public/moto/`.
- Interfaces умовної Task 12 перелічують усе, на що спираються її кроки: еталонний вивід `sim-track`, стан `GameCanvas.ts`, рядок README для `sed`, `NOTICE.txt` = `NOTICE.md` для `cmp`, розділ `## 0.1.0` у `CHANGELOG.md`, `define` версії у `vite.config.ts`.

### Пʼятий прохід перевірки

Номери задач у пунктах вище — до цього проходу; нижче — нові.

- Задачі перенумеровано: стара Task 7 → Task 7 (сплеш, меню «Грати»/«Вийти», ліги, треки, пауза, фініш, стан-машина) і Task 8 («Рекорди» зі скиданням прогресу і «Про гру»: повні `MainScreen.ts`/`menus.ts`, дві вставки в `GameShell.ts`); стара 8 → Task 9; стара 9 → Task 10; стара 10 → Task 11 (токени, шрифти, сплеш-заглушка) і Task 12 (палітра канвасу зі спершу червоним `check-palette`, DPR); стара 11 → Task 13; умовна 12 → умовна Task 14. Кожна нова задача має свої Files, Interfaces, перевірку й коміт; посилання в Global Constraints, тексті кроків, коментарях коду й самоперевірці оновлено.
- Правила JSON-треку (`trackJson.ts`) перенесено з Task 1 у Task 3 (кроки 1–3: червона перевірка в `check-mrg`, модуль, дев-пак через `parseTrackJson` без зміни байтів); у Task 1 `check-mrg` без правил (4/5 перевірок), дев-пак на `JSON.parse`, а перед першим комітом — `diff -rq` відносно `../gd-upstream` для рев'юера.
- Бюджет першого кадру (LCP документа гри ≤ 1,5 с) тепер досягає сам план A: сплеш-заглушка в `index.html` з preload e-Ukraine Bold, `font-display: block` для ваги 700 і `bootPainted()` у `GameShell` перед паком і двигуном (≈ 1,35 с замість ≈ 1,8 с); Lighthouse у Task 11, Step 4 і Task 13, Step 5; очікування Network оновлено; заголовок у заглушці записано в Global Constraints як рядок поза `strings.uk.ts`.
- Global Constraints і самоперевірка: план B міряє LCP у задачі 6, кроках 1 (прогноз до пушу) і 6 (прод), fps — у кроках 3–4; Interfaces Task 3 — еталонний вивід `sim-track` потрібен плану B у задачі 3, кроках 7 і 9.
- «Пауза» в HUD реагує й на `pointerup` другого пальця: браузер не шле `click` від не-primary pointer, поки перший палець тримає газ; перевірка додана в Task 9, Step 3.
- Task 1, Step 8: примітка про гонку upstream `MenuManager.fillCanvasWithImage` (вкладка зависає на першому кадрі меню, поки `raster.png` не декодовано) — це не дефект форку, а після Task 4 `MenuManager` недосяжний.
- Умовна Task 14 і розділ README «Реліз» піднімають версію через `npm version X.Y.Z --no-git-tag-version`: версія однакова в `package.json` і `package-lock.json`, Step 5 це перевіряє.
- `wc -l` у перевірках Task 11 і 13 — з `| tr -d ' '`: на macOS число друкується з пробілами попереду.
- Бриф дизайнера (`sprite-layout.mjs`, `docs/sprites.md`): тулуб — одяг вершника в Дріл-мерчі; вилку, як і спиці, дугу, маточини й древка, малює код, тож в `engine.png` її не малювати.

<!-- prettier-ignore-end -->
