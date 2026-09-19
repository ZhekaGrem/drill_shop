# «Дріл Мото», план B: інтеграція гри в сайт — план імплементації

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Сторінка `/moto` на сайті показує гру «Дріл Мото» на весь екран без хедера й футера: зібраний бандл форку лежить у `public/moto/`, девʼять наших треків збираються з JSON у пак `dril.mrg`, а сайт говорить із грою лише query-параметрами iframe і `postMessage`.

**Architecture:** Два незалежні конвеєри даних і одна сторінка. Конвеєр треків: `content/moto/tracks/<ліга>/<nn>-<slug>.json` → `scripts/build-moto-tracks.mjs` (власний кодек `.mrg` сайту на чистому `.mjs`, валідація, round-trip) → `public/moto/tracks/dril.mrg` + індекс назв `dril.json`. Конвеєр бандлу: `scripts/sync-moto-bundle.mjs` бере `dist/` форку (локально або з GitHub Release), перевіряє його (сліди Codebrew, відносні шляхи, бюджет 300 КБ gzip) і кладе в `public/moto/`, не чіпаючи `tracks/`. Сторінка `src/app/moto/page.tsx` — статична серверна обгортка з метаданими; клієнтський `MotoScreen` монтує iframe після гідрації, тримає скелетон до `ready`, таймаут 8 с, вихід і події GA.

**Tech Stack:** Next.js 16.3 App Router, React 19, Mantine 8 (лише наші `Button`/`SiteLoader`), SCSS-модулі на токенах `globals.css`, `@next/third-parties` 16.0.7 (`sendGAEvent`), Node 24 для скриптів (`.mjs` без залежностей: `node:fs`, `node:zlib`, `node:crypto`), системні `curl` і `unzip`.

**Spec:** `docs/superpowers/specs/2026-09-18-drill-moto-game-design.md` (секції 1, 3, 4, 6; план A — `docs/superpowers/plans/2026-09-18-drill-moto-fork.md`).

## Global Constraints

- Гілка `v2`. Виконавець лише комітить; пушить власник. `v2` — це прод на Vercel: пуш = реліз.
- `src/shared/config/dev-mode.ts` — локальний перемикач власника: не змінювати, не стейджити, не відкочувати. `git add` лише з явними шляхами задачі, ніколи `git add -A` / `git add .`; перед кожним комітом `git status --short` — у staged лише файли задачі.
- Dev-сервер власника (`next dev`, порт 3000, з `drill_shop`) працює весь час: не зупиняти й не перезапускати. **Жоден крок цього плану не запускає `npm run build` у `drill_shop`** (закон QA: build і dev пишуть в один `.next`); прод-перевірки — на `https://www.ye-dril.com` після пушу власника.
- Пісочниця цього середовища: команди до `localhost:3000` (curl, headless Chrome) виконуються з вимкненою пісочницею. `--tag`-режим синхронізації й перевірка релізу ходять на `github.com` і редиректом на `objects.githubusercontent.com` / `release-assets.githubusercontent.com`; прод-перевірки задачі 6 — на `www.ye-dril.com` (`curl` можна й у пісочниці з `allowed_domains`); Lighthouse (задача 6, кроки 1 і 6) запускає headless Chrome і через `npx -y` пише в кеш `~/.npm` (у пісочниці на запис відкритий лише `~/.npm/_logs`), тож усі цикли Lighthouse — лише з вимкненою пісочницею. У пісочниці задано `HTTPS_PROXY`, тож `curl -I` на https-адресу першим рядком друкує відповідь проксі `HTTP/1.1 200 Connection Established`; код відповіді бери з `curl -s -o /dev/null -w '%{http_code}'`.
- Pre-commit хук запускає `prettier --write .`, але НЕ стейджить результат: перед `git add` завжди `npx prettier --write <файли задачі, які prettier уміє парсити>` (`.prettierignore`, PNG і бандл у `public/moto/` не передавати).
- Усі команди плану — з кореня `drill_shop` (`/Users/bohdanlevkovych/Desktop/development/DRILL 2.0/drill_shop`); форк — сусідня тека `../drill-moto`. У середовищі агента cwd скидається між викликами на `/Users/bohdanlevkovych/Desktop/development/DRILL 2.0` (це не git-репозиторій), тож кожну команду починай з `cd "/Users/bohdanlevkovych/Desktop/development/DRILL 2.0/drill_shop" && …`. Без цього, наприклад, `mkdir -p public/assets/og` і скриншот `$PWD/public/assets/og/moto.png` (задача 4, крок 10) мовчки ляжуть у `DRILL 2.0/public/…`, а `git add` впаде з `not a git repository`.
- Хук `.husky/pre-commit` (`npm run format` = `prettier --write .`) переписує весь робочий каталог, зокрема неттрековані `docs/superpowers/plans/*.md` і `src/shared/config/dev-mode.ts`. Перед кожним комітом: `npx prettier --check src/shared/config/dev-mode.ts` має бути чистим; якщо ні — зупинись і спитай власника. Зміни хука в неттрекованих планах не стейджити. Незакомічена спека власника (` M docs/superpowers/specs/2026-09-18-drill-moto-game-design.md`) не відформатована prettier-ом: перший коміт плану перевирівняє її таблиці в робочому дереві (лише пробіли). Не стейджити й не відкочувати — це документ власника.
- Правка `next.config.ts` (задача 5, крок 3; задача 6, крок 3) змушує Next самому перезапустити dev-сервер — це дозволено; руками сервер не зупиняти й не перезапускати.
- Кожен коміт закінчується рядком `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`. Префікс коміту англійський, підмет український.
- FSD `app → widgets → features → shared`; стилі — один метод на елемент, кольори й відступи лише з токенів `globals.css`, жодного hex; компонент ≤ 150 рядків, функція ≤ 50, до 2 рівнів `if`. Текст інтерфейсу сторінки (заголовок iframe, екран помилки, кнопки) — через `content.moto` у `src/shared/config/content.ts`; метадані (`title`, `description`, OG/Twitter) — константами в `src/app/moto/page.tsx`, як у решти сторінок (`src/app/about/page.tsx`).
- Скрипти сайту — чистий `.mjs`, який НЕ імпортує `.ts` (у `package.json` сайту нема `"type": "module"`, Node сипле попередження на `.ts`-імпорт). Нових npm-залежностей і тестових раннерів не додавати; перевірки — `node scripts/check-*.mjs`.
- Контракт сайт → гра (спека, секція 1): `/moto/index.html?tracks=/moto/tracks/dril.mrg&ns=dril-moto&theme=<light|dark>`; `lang` за замовчуванням `uk`; `debug` і `json` сайт не передає. Індекс назв гра шукає за тим самим шляхом із `.json`: `/moto/tracks/dril.json`.
- Контракт гра → сайт: `window.parent.postMessage(msg, window.location.origin)`, `msg` — `{ source: 'dril-moto'; type: 'ready'; version: string } | { source: 'dril-moto'; type: 'exit' } | { source: 'dril-moto'; type: 'finished'; league: number; track: number; timeMs: number; best: boolean }`. Сайт приймає лише `event.origin === window.location.origin`, `event.source` = вікно нашого iframe і `data.source === 'dril-moto'`.
- GA: `moto_open` при монтуванні сторінки; `moto_finish` з параметрами `league`, `track`, `time_ms`, `best` на кожне `finished`. Лише через `sendGAEvent` з `@next/third-parties/google` (сайт уже вантажить GA компонентом `GoogleAnalytics` у `src/app/layout.tsx`).
- Сторінка: title «Дріл Мото — гра» (шаблон кореня додає « | Є.Дріл»), `robots` index/follow, canonical `https://www.ye-dril.com/moto`, OG-картинка з обкладинки гри; контейнер `100dvh`, `overflow: hidden`, `touch-action: none`; скелетон у стилі `SiteLoader` до `ready`; через 8 с без `ready` — «Не вдалося завантажити гру» і «Спробувати ще раз» (перемонтовує iframe).
- Вихід (спека, секція 3): `exit` → `router.back()`, лише якщо попередній запис історії вкладки — сторінка сайту (`navigation.canGoBack`: Navigation API бачить лише записи того самого origin; без Navigation API — `window.history.length > 1` і `document.referrer` з нашого origin), інакше `router.push('/')`. `window.history.length` сам по собі рахує й записи чужих сайтів.
- Треки (спека, секція 4): вісь Y дивиться вгору; координати цілі в межах ±32767; x строго зростає; старт на 16–20 одиниць вище землі під `start.x` (правило сайту; двигуна — 15–30); обидва колеса на старті (`start.x ± 14`, на 8 одиниць нижче `start.y`) щонайменше за 7 одиниць від ламаної, інакше `GamePhysics` зациклюється і вкладка гри зависає (правило двигуна, `trackJson.ts` плану A); щонайменше 150 одиниць ламаної до `start.x` (правило сайту; двигуна — 40) і після `finish.x` (правило двигуна); прапорець старту (друга точка правіше `start.x`) раніше за прапорець фінішу (перша точка правіше `finish.x`); `finish.y = 0`; рівно три ліги, у кожній 3–10 треків; назва до 20 символів (кирилиця — лише в JSON та індексі), у `.mrg` — ASCII-slug з імені файлу; перед комітом кожен трек фінішує в `sim-track.mjs` форку хоча б одним водієм.
- Бюджети (спека, секція 2 і чекліст 13): бандл ≤ 300 КБ gzip разом зі шрифтами; перший кадр гри (сплеш) — LCP документа гри ≤ 1,5 с у мобільному профілі Lighthouse за замовчуванням; 60 fps на iPhone 11 / середньому Android 2021 року; Lighthouse Performance сторінки `/moto` на мобільному ≥ 80.
- Жоден файл Codebrew (`levels.mrg`, оригінальні спрайти, лого, сплеш, `preview.gif` upstream — запис оригінальної гри) не потрапляє ні в сайт, ні в форк; «Gravity Defied» не вживається в метаданих сторінки й сирого документа гри (`public/moto/index.html`).
- Свідомі відхилення від тексту спеки (деталі — у «Самоперевірці»): на екрані помилки є «Вийти», бо без хедера іншого виходу нема; `<title>` отримує суфікс кореневого шаблону « | Є.Дріл» (`src/app/seo.ts`: `template: '%s | Є.Дріл'`), як усі сторінки сайту. Решта, що стояла тут раніше (≥ 150 одиниць до старту й після фінішу, правило коліс на старті, `prebuild`, скан історії git форку за HEAD і тегами, `preview.gif` серед файлів Codebrew — 12 відбитків, LCP документа гри в мобільному профілі Lighthouse як бюджет першого кадру), тепер записана в самій виправленій спеці (секції 2, 4, 6) і відхиленням не є.

## Передумови й контракт із планом A

Задача 1 від форку не залежить. Задача 3, кроки 1–6 (JSON треків, збірка пака, `prebuild`), теж, але кроки 7–8 (приймання заїздом) грають у бандл із `public/moto/`, а крок 9 (ворота прохідності) запускає `sim-track.mjs` форку, тож задача 3 виконується лише після задачі 2. Задачі 2–6 вимагають, щоб план A був виконаний повністю (Task 1–13; умовна Task 14 — лише за результатом задачі 6, кроків 3–4) і щоб у `../drill-moto` працював `npm run build`. План B спирається на такі властивості форку `../drill-moto` (якщо чогось нема, це дефект плану A, а не привід змінювати скрипти сайту):

1. `npm run build` у форку дає самодостатню теку `dist/` з `index.html`, що посилається на `./assets/…` (у `vite.config.ts` форку `base: './'`), і з `LICENSE.txt` та `NOTICE.txt` у корені `dist/` (план A, Task 13, Step 3 кладе їх у `public/` форку).
2. Реліз — GitHub Release `vX.Y.Z` у репозиторії `ZhekaGrem/drill-moto` з файлом `dist.zip`, зібраним у CI форку як `cd dist && zip -r ../dist.zip .` (план A, Task 13, Step 3, `.github/workflows/release.yml`): вміст `dist/` лежить у корені архіву (`index.html`, `assets/`, `fonts/`, `LICENSE.txt`, `NOTICE.txt`). `resolveBundleRoot` приймає і такий архів, і архів із текою `dist/` усередині.
3. Гра читає параметри `tracks`, `ns`, `theme`, `debug`, `json` (план A, `readConfig`) і `postMessage`-контракт вище; `ready` надсилається на першому кадрі анімації після того, як `GameShell` показав свій перший екран: сплеш «Дріл Мото» (над сплешем-заглушкою з `index.html`, яку він тоді ж прибирає — передумова 10), а в `?debug&json=` — одразу заїзд. Пак, спрайти й шрифт e-Ukraine на цей момент уже завантажені, двигун зібраний (план A, `GameShell.start`: `requestAnimationFrame(() => bridge.ready(VERSION))`).
4. Індекс назв `dril.json` — масив `[{ "league": 0, "index": 0, "name": "Перший дріл", "slug": "pershyi-dril" }, …]`, `league`/`index` з нуля, у порядку паку. Гра бере назву треку `(league, index)` з нього, а за його відсутності — ASCII-назву з `.mrg`.
5. Прогрес гри лежить у `localStorage["${ns}:progress:v1"]` як `{ best: Record<"L-T", number>, unlockedTracks: [n0, n1, n2] }` (план A, `Progress.ts`); заїзди з `?debug&json=` гра пише окремо, у `localStorage["${ns}:json:progress:v1"]` (план A, `GameShell.start`: ``this.ns = cfg.jsonUrl ? `${cfg.ns}:json` : cfg.ns``). Задача 3 використовує обидва ключі, щоб відкрити всі треки в тестових `ns`: `moto-play:json:progress:v1` (крок 7) і `moto-pack:progress:v1` (крок 8).
6. `?debug&json=<url>` читає JSON одного треку (`{ name, start, finish, points }`) і будує з нього пак, де цей трек є в кожній із трьох ліг.
7. `dist/` форку разом зі шрифтами важить ≤ 300 КБ gzip так, як рахує `gzipTotal` (усі файли, крім `*.map` і `*.txt`). Шрифти в бандлі — лише чотири файли e-Ukraine з сайту (спека, секція 2, «Локалізація»: «ті самі файли, що на сайті»; до першого кадру меню — ваги 700 і 500, решта після): `e-Ukraine-Light.woff2`, `e-Ukraine-Regular.woff2`, `e-Ukraine-Medium.woff2`, `e-Ukraine-Bold.woff2` (≈148 КБ gzip). Уся тека `public/fonts/e-ukraine/` сайту з трьома `e-UkraineHead-*` важить ≈269 КБ gzip, і з нею задача 2, крок 6 відхилить бандл за бюджетом.
8. Історія, яку форк публікує (HEAD — гілка `main` — і тег релізу), не містить жодного блоба Codebrew з upstream: план A починає її зі знімка `git archive` без історії й без remote upstream (Task 1, Step 1) і перевіряє перший коміт (Task 1, Step 9); оригінальні асети лежать лише в довідковому клоні `../gd-upstream`, який не пушиться. Задача 6, крок 1 сканує `git rev-list --objects HEAD --tags` форку ще раз.
9. У форку є безголовий прогін треків на справжній фізиці двигуна `scripts/sim-track.mjs` (план A, Task 3, Step 4; еталонний вивід — Task 3, Step 5). `node ../drill-moto/scripts/sim-track.mjs <пак.mrg> --driver ai,gas,bot,plan` друкує для кожного треку рядок з результатом чотирьох водіїв: `ai` (демо-ІІ порту), `gas` (лише газ), `bot` (газ і нахил проти тангажу) і `plan` (планувальник: кожні 100 мс перебирає на копії фізики натискання на 2,4 с уперед і бере найкраще; 25–85 с CPU на трек). Для падіння чи застрягання в рядку є місце (`x=… y=…`). Водій, що до ліміту 90 с так і не фінішував, дає `timeout 90s`. Останній рядок — `N/M треків фінішують хоча б одним водієм`; код виходу 1, якщо якийсь трек не фінішує жоден водій. `--driver ai,gas,bot` — лише автопілоти, без планувальника, менше секунди. Задача 3, крок 9 — ворота спеки (секція 4, «Авторинг») перед комітом треків: `9/9`, exit 0.
10. Перший кадр гри вкладається в бюджет спеки (секція 2, «Бюджети»): на dev-сервері `npx -y lighthouse@12 "http://localhost:3000/moto/index.html?ns=lh-check" --only-categories=performance` тричі дає медіану LCP ≤ 1500 мс (після задачі 3, коли в `public/moto/tracks` уже є пак; вимір — задача 6, крок 1). Для цього `index.html` бандла містить сплеш-заглушку `<section class="screen" data-screen="boot">` із заголовком «Дріл Мото» і `<link rel="preload">` для `e-Ukraine-Bold.woff2`: браузер малює заголовок до пака, індексу назв, ваги 500 і двигуна, а `GameShell` прибирає заглушку над справжнім сплешем (план A, Task 11, кроки 2–3). Відтворено на бандлі з заглушкою: 1352–1355 мс. Бандл без неї дає 1803–1814 мс: там LCP — `<h1 class="title">` сплешу, 75 % часу — render delay, бо `GameShell.start` малює перший екран лише після `document.fonts.load` ваг 700 і 500 разом із паком; `<link rel="preload">` шрифтів і пака без заглушки це погіршує до ≈ 1880 мс. Поки бандл плану A не проходить цей пункт (у його `index.html` нема `data-screen="boot"`), реліз за цим планом неможливий: виконуй задачі 1–5 і крок 1 задачі 6 як перевірку, а кроки 2–6 — лише після нового релізу форку, що проходить цей пункт.

## Факти про трек (звірено з оригінальним паком порту)

Звіряли з оригінальним `levels.mrg` з upstream `gravity-defied-web` (коміт `889a0914da5fd40405190907e493fc6be72c38a2`), лише читанням поза репозиторієм:

- **Вісь Y дивиться вгору**: `GameCanvas.addDy(y)` повертає `-y + dy`, тож більший `y` у треку — вище на екрані. Перша редакція спеки й чернетка плану A казали «`y` росте вниз»; секцію 4 спеки виправлено, цей план іде за двигуном. Дев-треки плану A (`Lanka`, `Hirka`, `Yama`) на сайт не потрапляють — пак сайту збирається лише з `content/moto/tracks`.
- Старт в оригіналах на 14,8–30 одиниць вище землі під `start.x`, у 26 із 30 треків — 14,8–20,5 (Intro: старт `(-49, 24)`, земля 8,7; Shorty `(-196, -46)`, земля −64; Indoor `(-111, -30)`, земля −47; Liberty `(-277, -221)`, земля −241,2; винятки — Downhill 21,2, Dantes_Peak 24,3, Trial_again 29, Tip_top 30). Правило сайту 16–20 бере типовий діапазон. `finish.y = 0` в усіх 30 треках — двигун бере лише `finish.x`.
- Колеса на старті стоять у `start.x ± 14` на висоті `start.y`; з перспективою двигун міряє їх на 8 одиниць нижче, внутрішній радіус колеса 5,8. Колесо ближче за 7 одиниць до ламаної — вічний цикл у `GamePhysics.solvePhysicsStep`, вкладка гри зависає (план A, `trackJson.ts`, перевірено `sim-track.mjs`). Трек `start [0, 18]` з уступом `(0,0) → (14,14)` проходить правило «16–20 над землею», але зависає, тож валідатор сайту перевіряє ще й колеса.
- Двигун мовчки викидає точку, чий `x` не більший за попередній (`GameLevel.addPoint`). Прапорець старту — точка після першої, що правіша за `start.x`; прапорець фінішу — перша точка, правіша за `finish.x` (`LevelLoader.prepareLevelGeometry`); секундомір іде, коли переднє колесо (`bikeParts[1]`, `GamePhysics.isTrackStarted`) проїхало прапорець старту; фініш — коли будь-яке колесо правіше за прапорець фінішу (`hasPassedFinishLine`).
- До старту в оригіналах 203–399 одиниць ламаної, після фінішу 191–431: камера дивиться вперед, а після фінішу ще секунду триває «коло пошани».
- Назву треку двигун читає максимум 39 байт до `0x00` і міняє `_` на пробіл.
- Байк: колісна база ≈ 28 одиниць, радіус колеса ≈ 7, вершник ≈ 12 над осями. Оригінальні треки: 35–100 точок, розмах x 1100–2100.
- Формат `.mrg` (F2): big endian; заголовок по лігах `int32` кількість, далі на трек `int32` абсолютний зсув + назва + `0x00`; трек: маркер `0x33` (для `0x32` пропускаються 20 байт), start x/y і finish x/y як `int32` = одиниця × 8192, `int16` кількість точок, перша точка `int32` x, y, далі `int8 dx, int8 dy`, де `dx = -1` — escape з абсолютними `int32 x, y`. Кодек задачі 1 перекодовує оригінальний пак байт у байт.

---

## Структура файлів

| Файл                                                       | Дія         | Відповідальність                                                              |
| ---------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------- |
| `scripts/lib/moto-mrg.mjs`                                 | новий       | `encodeMrg`, `decodeMrg`, `START_SCALE` — кодек `.mrg`                        |
| `scripts/lib/moto-tracks.mjs`                              | новий       | правила треку, збір `content/moto/tracks` у пак + індекс, round-trip          |
| `scripts/check-moto-tracks.mjs`                            | новий       | перевірки кодека й правил (`node scripts/check-moto-tracks.mjs`)              |
| `scripts/build-moto-tracks.mjs`                            | новий       | CLI збірки пака; `--check` — у `prebuild`                                     |
| `scripts/lib/moto-bundle.mjs`                              | новий       | корінь бандлу, сліди Codebrew, відносні шляхи, gzip-бюджет                    |
| `scripts/check-moto-bundle.mjs`                            | новий       | перевірки `moto-bundle.mjs` на фікстурах                                      |
| `scripts/sync-moto-bundle.mjs`                             | новий       | `--from <dist>` / `--tag vX.Y.Z` → `public/moto/` + `VERSION`                 |
| `content/moto/tracks/{1-lehka,2-serednia,3-vazhka}/*.json` | новий       | девʼять авторських треків                                                     |
| `public/moto/**`                                           | генерується | бандл гри (sync) і `tracks/dril.mrg`, `tracks/dril.json` (build) — комітиться |
| `public/assets/og/moto.png`                                | новий       | OG-обкладинка 1200×630 (знімок меню гри)                                      |
| `src/app/moto/moto-bridge.ts`                              | новий       | контракт із грою: адреса iframe, розбір повідомлень, тема                     |
| `src/app/moto/MotoScreen.tsx`                              | новий       | iframe, скелетон, таймаут/повтор, вихід, GA                                   |
| `src/app/moto/moto.module.scss`                            | новий       | повноекранний шар, скелетон, екран помилки — лише токени                      |
| `src/app/moto/page.tsx`                                    | новий       | статична сторінка, метадані                                                   |
| `src/shared/config/content.ts`                             | зміна       | блок `moto`                                                                   |
| `src/app/LayoutWrapper.tsx`                                | зміна       | `/moto` без хедера, футера й обгортки                                         |
| `src/middleware.ts`                                        | зміна       | matcher пропускає `moto/`                                                     |
| `next.config.ts`                                           | зміна       | кеш назавжди для `/moto/assets/*`, `noindex` для `/moto/index.html`           |
| `src/app/sitemap.ts`                                       | зміна       | `/moto` у статичних сторінках                                                 |
| `.prettierignore`, `eslint.config.mjs`, `package.json`     | зміна       | ігнор бандлу; `prebuild` з перевіркою треків                                  |

**Де живе `MotoScreen` і чому не в `features/`.** Екран потрібен рівно одному маршруту, не має API, стору чи бізнес-логіки, яку хтось перевикористає; кнопка-мотоцикл у хедері (окреме рішення) веде на URL `/moto`, а не імпортує компонент. У кодовій базі сторінкові компоненти вже лежать поруч зі сторінкою (`src/app/about/About.tsx`, `src/app/Home.tsx`), і спека фіксує саме `src/app/moto/MotoScreen.tsx`. Якщо гра колись відкриватиметься ще й модалкою з іншого місця — тоді це стане фічею `src/features/moto` з тим самим `moto-bridge.ts`.

**Next 16 і `public/moto/` поруч зі сторінкою `/moto`.** Конфлікту нема: `/moto` віддає сторінка App Router, а `/moto/index.html`, `/moto/assets/*`, `/moto/tracks/*` — файли з `public/`. Перевірка `conflicting-public-file-page` у `next/dist/build/index.js` шукає лише файл із тим самим шляхом і лише для `pages/`; `public/moto` — тека. `middleware.ts` у Next 16 перейменовано на `proxy.ts` (стара назва працює з попередженням) — перейменування поза цим планом. Заголовки з `next.config.ts` застосовуються і до файлів `public/` (перевірено на dev-сервері: `/robots.txt` отримує `X-Content-Type-Options`), а `Cache-Control` для `public/` можна перевизначити (незмінним Next вважає лише власні хешовані ассети).

---

### Task 1: Кодек `.mrg` і правила треків

**Files:**

- Create: `scripts/check-moto-tracks.mjs`
- Create: `scripts/lib/moto-mrg.mjs`
- Create: `scripts/lib/moto-tracks.mjs`

**Interfaces:**

- Produces:
  - `scripts/lib/moto-mrg.mjs`: `START_SCALE = 8192`, `LEAGUE_COUNT = 3`, `encodeMrg(pack): Buffer`, `decodeMrg(buf: Buffer): pack`, де `pack = { leagues: [Track[], Track[], Track[]] }`, `Track = { name: string /* ASCII */, start: [x, y], finish: [x, y], points: [x, y][] }`.
  - `scripts/lib/moto-tracks.mjs`: `LEAGUE_DIRS = ['1-lehka', '2-serednia', '3-vazhka']`, `TRACKS_MIN = 3`, `TRACKS_MAX = 10`, `NAME_MAX = 20`, `SLUG_MAX = 32`, `START_LIFT_MIN = 16`, `START_LIFT_MAX = 20`, `FLAG_MARGIN = 150`, `COORD_MAX = 32767`, `WHEEL_DX = 14`, `WHEEL_DROP = 8`, `WHEEL_GAP_MIN = 7`; `groundAt(points, x): number`; `validateTrack(json): { start, finish, points }` (кидає `Error`); `collectTracks(root): { pack, index: { league, index, name, slug }[], errors: string[] }`; `verifyRoundTrip(pack, mrg): string | null`.

- [ ] **Step 1: Перевірки — спершу вони**

Створи `scripts/check-moto-tracks.mjs`:

```js
// scripts/check-moto-tracks.mjs
// Перевірки кодека .mrg і правил треків (scripts/lib/moto-mrg.mjs,
// scripts/lib/moto-tracks.mjs). Тестового раннера в проєкті нема:
//   node scripts/check-moto-tracks.mjs
// Калібрування з оригінальним паком порту (лежить лише в довідковому клоні
// upstream ../gd-upstream з плану A, поза обома репозиторіями):
//   GD_ORIGINAL_MRG=../gd-upstream/src/assets/levels.mrg node scripts/check-moto-tracks.mjs
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { START_SCALE, decodeMrg, encodeMrg } from './lib/moto-mrg.mjs';
import { collectTracks, groundAt, validateTrack, verifyRoundTrip } from './lib/moto-tracks.mjs';

let n = 0;
const check = (name, fn) => {
  fn();
  n += 1;
  console.log('ok -', name);
};

// Ламана рядком: '0,0 10,5' → [[0, 0], [10, 5]] — щоб фікстури читались в один рядок
const line = (text) => text.split(' ').map((pair) => pair.split(',').map(Number));

// Валідний трек: земля y = 0 під стартом, старт на 18 вище, по 200 одиниць до старту й після фінішу
const track = (over = {}) => ({
  name: 'Тест',
  start: [0, 18],
  finish: [400, 0],
  points: line('-200,0 -100,0 50,0 150,10 250,0 350,0 450,0 600,0'),
  ...over,
});

check('groundAt інтерполює між точками', () => {
  assert.equal(groundAt(line('0,0 10,10'), 5), 5);
  assert.equal(groundAt(line('0,4 10,4 20,-6'), 15), -1);
  assert.ok(Number.isNaN(groundAt(line('0,0 10,0'), 11)));
});

check('validateTrack приймає валідний трек і повертає копії', () => {
  const src = track();
  const out = validateTrack(src);
  assert.deepEqual(out, { start: src.start, finish: src.finish, points: src.points });
  assert.notEqual(out.points, src.points);
});

check('validateTrack ловить порушення правил', () => {
  const bad = [
    [{ points: line('-200,0 -100,0 -100,5 600,0') }, /строго зростати/],
    [{ start: [0, 10] }, /вгору/],
    [{ start: [0, 25] }, /вгору/],
    [{ start: [0, -18] }, /вгору/],
    [{ finish: [400, 5] }, /finish\.y/],
    [{ start: [-100, 18] }, /до старту/],
    [{ finish: [500, 0] }, /після фінішу/],
    [{ start: [420, 18], finish: [400, 0] }, /менший за finish/],
    [{ name: '' }, /name/],
    [{ name: 'Дуже-дуже довга назва треку' }, /name/],
    [{ start: [0.5, 18] }, /start\/finish/],
    [{ points: line('-200,0 40000,0') }, /points/],
    [{ finsh: [400, 0] }, /зайві поля: finsh/],
    [{ points: line('-200,0 -100,0 0,0 14,14 100,14 250,0 350,0 450,0 600,0') }, /вʼязне/],
  ];
  for (const [over, pattern] of bad) {
    assert.throws(() => validateTrack(track(over)), pattern, JSON.stringify(over));
  }
});

check('validateTrack вимагає точки між прапорцями старту й фінішу', () => {
  const sparse = { points: line('-200,0 -100,0 300,0 600,0'), start: [0, 18], finish: [250, 0] };
  assert.throws(() => validateTrack(track(sparse)), /прапорців/);
});

const packOf = (...leagues) => ({
  leagues: leagues.map((league) => league.map((t, i) => ({ name: `t${i}`, ...validateTrack(t) }))),
});

check('кодек: round-trip зберігає ліги, назви, старт, фініш і точки', () => {
  // дельти 160, 320 і 150 не влазять у int8, відʼємні координати — теж випадок
  const wide = track({
    points: line('-200,-300 -100,-300 60,20 200,20 210,170 350,170 450,0 600,0'),
    start: [0, -82],
  });
  const pack = packOf([track(), wide], [track()], [wide, track(), track()]);
  const mrg = encodeMrg(pack);
  assert.deepEqual(decodeMrg(mrg), pack);
  assert.equal(verifyRoundTrip(pack, mrg), null);
});

check('кодек: заголовок, маркер 0x33 і старт × 8192 там, де їх читає двигун', () => {
  const mrg = encodeMrg(packOf([track()], [], []));
  assert.equal(mrg.readInt32BE(0), 1);
  const offset = mrg.readInt32BE(4);
  assert.equal(mrg.toString('latin1', 8, 10), 't0');
  assert.equal(mrg[10], 0);
  assert.equal(mrg.readInt32BE(11), 0, 'ліга 2 порожня');
  assert.equal(mrg.readInt32BE(15), 0, 'ліга 3 порожня');
  assert.equal(offset, 19);
  assert.equal(mrg[offset], 0x33);
  assert.equal(mrg.readInt32BE(offset + 1), 0 * START_SCALE);
  assert.equal(mrg.readInt32BE(offset + 5), 18 * START_SCALE);
  assert.equal(mrg.readInt32BE(offset + 9), 400 * START_SCALE);
  assert.equal(mrg.readInt16BE(offset + 17), 8);
  assert.equal(START_SCALE, 8192);
});

check('кодек: дельта за межами байта йде escape-записом (9 байт замість 2)', () => {
  const near = packOf([track()], [], []);
  const far = packOf([track({ points: line('-200,0 -100,0 50,0 150,200 250,0 350,0 450,0 600,0') })], [], []);
  // у far дві дельти dy = ±200 не влазять у int8: +7 байт на кожну
  assert.equal(encodeMrg(far).length - encodeMrg(near).length, 14);
  assert.deepEqual(decodeMrg(encodeMrg(far)), far);
});

check('verifyRoundTrip помічає розбіжність', () => {
  const pack = packOf([track()], [], []);
  const other = packOf([track({ name: 'Інший', start: [0, 19] })], [], []);
  assert.match(verifyRoundTrip(other, encodeMrg(pack)), /round-trip/);
});

const withTree = (files, fn) => {
  const root = mkdtempSync(join(tmpdir(), 'moto-tracks-'));
  try {
    for (const [path, body] of Object.entries(files)) {
      mkdirSync(join(root, path, '..'), { recursive: true });
      writeFileSync(join(root, path), typeof body === 'string' ? body : JSON.stringify(body));
    }
    fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};

// 1-lehka/01-1a.json … 3-vazhka/03-3c.json — усі з однаковим валідним треком
const threeByThree = () => {
  const files = {};
  for (const dir of ['1-lehka', '2-serednia', '3-vazhka']) {
    ['a', 'b', 'c'].forEach((letter, i) => {
      files[`${dir}/0${i + 1}-${dir[0]}${letter}.json`] = track();
    });
  }
  return files;
};

check('collectTracks: 3 × 3 треки → пак і індекс у порядку файлів', () => {
  withTree(threeByThree(), (root) => {
    const { pack, index, errors } = collectTracks(root);
    assert.deepEqual(errors, []);
    assert.deepEqual(
      pack.leagues.map((l) => l.length),
      [3, 3, 3]
    );
    assert.equal(pack.leagues[1][2].name, '2c');
    assert.deepEqual(index[0], { league: 0, index: 0, name: 'Тест', slug: '1a' });
    assert.deepEqual(index[8], { league: 2, index: 2, name: 'Тест', slug: '3c' });
  });
});

check('collectTracks: кількість треків, імена файлів, нумерація, зайві теки, дублікати slug', () => {
  const cases = [
    [{ remove: ['1-lehka/03-1c.json'] }, /1-lehka: треків 2/],
    [{ add: { '1-lehka/4-1d.json': track() } }, /імʼя файлу/],
    [{ add: { '2-serednia/05-2e.json': track() } }, /номер 05/],
    [{ add: { '4-extra/01-x.json': track() } }, /зайве в теці треків: 4-extra/],
    [{ remove: ['3-vazhka/01-3a.json'], add: { '3-vazhka/01-1a.json': track() } }, /slug «1a» уже є/],
    [{ add: { '1-lehka/02-1b.json': '{ зламаний json' } }, /1-lehka\/02-1b\.json/],
  ];
  for (const [{ remove = [], add = {} }, pattern] of cases) {
    const files = threeByThree();
    for (const path of remove) delete files[path];
    Object.assign(files, add);
    withTree(files, (root) => {
      const { errors } = collectTracks(root);
      assert.ok(
        errors.some((e) => pattern.test(e)),
        `${pattern} серед: ${errors.join(' | ')}`
      );
    });
  }
});

const original = process.env.GD_ORIGINAL_MRG;
if (original && existsSync(original)) {
  check('калібрування: оригінальний пак читається і перекодовується байт у байт', () => {
    const bytes = readFileSync(original);
    const pack = decodeMrg(bytes);
    const intro = pack.leagues[0][0];
    assert.equal(intro.name, 'Intro');
    assert.equal(intro.points.length, 45);
    assert.deepEqual(intro.points[0], [-380, 136]);
    assert.deepEqual(intro.start, [-49, 24]);
    assert.deepEqual(intro.finish, [433, 0]);
    assert.ok(encodeMrg(pack).equals(bytes));
  });
} else {
  console.log('skip - калібрування (GD_ORIGINAL_MRG не задано)');
}

console.log(`ok: ${n} checks`);
```

- [ ] **Step 2: Переконатись, що перевірки падають**

Run: `node scripts/check-moto-tracks.mjs`
Expected: `Error [ERR_MODULE_NOT_FOUND]: Cannot find module '…/scripts/lib/moto-mrg.mjs'`, код виходу 1.

- [ ] **Step 3: Кодек `.mrg`**

Створи `scripts/lib/moto-mrg.mjs`:

```js
// scripts/lib/moto-mrg.mjs
// Кодек пака треків .mrg — формату, який читає двигун гри «Дріл Мото»
// (GameLevel.load і LevelLoader у форку drill-moto). Свій для сайту: скрипти
// сайту — чистий .mjs без імпорту .ts (у package.json сайту нема
// "type": "module", і Node сипле попередження на кожен .ts-імпорт).
//
// Big endian. Заголовок: для кожної з 3 ліг int32 кількість треків, далі для
// кожного треку int32 абсолютний зсув його даних від початку файлу і назва
// ASCII з 0x00 у кінці. Дані треку: маркер 0x33 (0x32 — старий варіант із 20
// зайвими байтами, лише читаємо), start x, start y, finish x, finish y як
// int32 = одиниця × 8192, int16 кількість точок, перша точка абсолютно
// (int32 x, int32 y), далі для кожної наступної int8 dx, int8 dy; dx = -1 —
// escape, за ним абсолютні int32 x, int32 y.

export const START_SCALE = 8192;
export const LEAGUE_COUNT = 3;
const TRACK_MARKER = 0x33;
const LEGACY_MARKER = 0x32;
const LEGACY_EXTRA_BYTES = 20;
const ESCAPE = -1;

const fitsInt8 = (v) => v >= -128 && v <= 127;

const encodeTrack = (track) => {
  const head = Buffer.alloc(27);
  head.writeUInt8(TRACK_MARKER, 0);
  head.writeInt32BE(track.start[0] * START_SCALE, 1);
  head.writeInt32BE(track.start[1] * START_SCALE, 5);
  head.writeInt32BE(track.finish[0] * START_SCALE, 9);
  head.writeInt32BE(track.finish[1] * START_SCALE, 13);
  head.writeInt16BE(track.points.length, 17);
  head.writeInt32BE(track.points[0][0], 19);
  head.writeInt32BE(track.points[0][1], 23);
  const parts = [head];
  for (let i = 1; i < track.points.length; i++) {
    const [x, y] = track.points[i];
    const dx = x - track.points[i - 1][0];
    const dy = y - track.points[i - 1][1];
    if (dx !== ESCAPE && fitsInt8(dx) && fitsInt8(dy)) {
      const delta = Buffer.alloc(2);
      delta.writeInt8(dx, 0);
      delta.writeInt8(dy, 1);
      parts.push(delta);
    } else {
      const absolute = Buffer.alloc(9);
      absolute.writeInt8(ESCAPE, 0);
      absolute.writeInt32BE(x, 1);
      absolute.writeInt32BE(y, 5);
      parts.push(absolute);
    }
  }
  return Buffer.concat(parts);
};

/** { leagues: [[{ name, start, finish, points }], [...], [...]] } → Buffer .mrg */
export const encodeMrg = (pack) => {
  const bodies = pack.leagues.map((league) => league.map(encodeTrack));
  let headerSize = 0;
  for (const league of pack.leagues) {
    headerSize += 4;
    for (const track of league) headerSize += 4 + Buffer.byteLength(track.name, 'latin1') + 1;
  }
  const header = Buffer.alloc(headerSize);
  let h = 0;
  let offset = headerSize;
  pack.leagues.forEach((league, l) => {
    h = header.writeInt32BE(league.length, h);
    league.forEach((track, i) => {
      h = header.writeInt32BE(offset, h);
      h += header.write(track.name, h, 'latin1');
      h = header.writeUInt8(0, h);
      offset += bodies[l][i].length;
    });
  });
  return Buffer.concat([header, ...bodies.flat()]);
};

const decodeTrack = (buf, offset) => {
  let q = offset;
  const marker = buf.readUInt8(q);
  q += 1;
  if (marker === LEGACY_MARKER) {
    q += LEGACY_EXTRA_BYTES;
  } else if (marker !== TRACK_MARKER) {
    throw new Error(`зсув ${offset}: невідомий маркер треку 0x${marker.toString(16)}`);
  }
  const start = [buf.readInt32BE(q) / START_SCALE, buf.readInt32BE(q + 4) / START_SCALE];
  const finish = [buf.readInt32BE(q + 8) / START_SCALE, buf.readInt32BE(q + 12) / START_SCALE];
  const count = buf.readInt16BE(q + 16);
  q += 18;
  let x = buf.readInt32BE(q);
  let y = buf.readInt32BE(q + 4);
  q += 8;
  const points = [[x, y]];
  for (let i = 1; i < count; i++) {
    const dx = buf.readInt8(q);
    q += 1;
    if (dx === ESCAPE) {
      x = buf.readInt32BE(q);
      y = buf.readInt32BE(q + 4);
      q += 8;
    } else {
      x += dx;
      y += buf.readInt8(q);
      q += 1;
    }
    points.push([x, y]);
  }
  return { start, finish, points };
};

/** Buffer .mrg → { leagues: [[{ name, start, finish, points }], [...], [...]] } */
export const decodeMrg = (buf) => {
  let p = 0;
  const entries = [];
  for (let l = 0; l < LEAGUE_COUNT; l++) {
    const count = buf.readInt32BE(p);
    p += 4;
    const league = [];
    for (let i = 0; i < count; i++) {
      const offset = buf.readInt32BE(p);
      const end = buf.indexOf(0, p + 4);
      league.push({ name: buf.toString('latin1', p + 4, end), offset });
      p = end + 1;
    }
    entries.push(league);
  }
  return {
    leagues: entries.map((league) => league.map((e) => ({ name: e.name, ...decodeTrack(buf, e.offset) }))),
  };
};
```

- [ ] **Step 4: Правила треків і збір паку**

Створи `scripts/lib/moto-tracks.mjs`:

```js
// scripts/lib/moto-tracks.mjs
// Авторські треки сайту: content/moto/tracks/<ліга>/<nn>-<slug>.json → пак для
// кодека moto-mrg.mjs і індекс назв. Правила звірені з оригінальними треками
// порту (план B, «Факти про трек»):
//  • вісь Y дивиться ВГОРУ: більший y — вище на екрані (GameCanvas.addDy = -y + dy);
//  • координати цілі, x строго зростає — точку з x ≤ попереднього двигун мовчки викидає;
//  • старт на 16–20 одиниць вище землі під start.x — байк падає на колеса (в оригіналі 14,8–30, типово 15–20);
//  • обидва колеса на старті (start.x ± 14, на 8 нижче start.y) щонайменше за 7 від ламаної — ближче GamePhysics зациклюється (trackJson.ts форку);
//  • finish.y = 0, як в усіх оригінальних треках (двигун бере лише finish.x);
//  • до старту й після фінішу щонайменше 150 одиниць ламаної (в оригіналі 190–430);
//  • прапорець старту стоїть раніше за прапорець фінішу (правило LevelLoader);
//  • рівно три ліги, у кожній 3–10 треків.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { decodeMrg } from './moto-mrg.mjs';

export const LEAGUE_DIRS = ['1-lehka', '2-serednia', '3-vazhka'];
export const TRACKS_MIN = 3;
export const TRACKS_MAX = 10;
export const NAME_MAX = 20;
export const SLUG_MAX = 32;
export const START_LIFT_MIN = 16;
export const START_LIFT_MAX = 20;
export const FLAG_MARGIN = 150;
export const COORD_MAX = 32767;
export const WHEEL_DX = 14;
export const WHEEL_DROP = 8;
export const WHEEL_GAP_MIN = 7;
const FILE_RE = /^(\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.json$/;
const TRACK_KEYS = ['name', 'start', 'finish', 'points'];

const isCoord = (v) => Number.isInteger(v) && Math.abs(v) <= COORD_MAX;
const isPair = (v) => Array.isArray(v) && v.length === 2 && isCoord(v[0]) && isCoord(v[1]);

/** Висота землі під x — лінійна інтерполяція між сусідніми точками ламаної. */
export const groundAt = (points, x) => {
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    if (x >= x0 && x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
  }
  return NaN;
};

// Найкоротша відстань від точки (x, y) до ламаної — як distanceToGround у trackJson.ts форку
const distanceToGround = (points, x, y) => {
  let best = Infinity;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const dx = points[i][0] - x0;
    const dy = points[i][1] - y0;
    const t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy)));
    best = Math.min(best, Math.hypot(x - x0 - t * dx, y - y0 - t * dy));
  }
  return best;
};

// Прапорці так, як їх ставить LevelLoader.prepareLevelGeometry
const flagPoints = (points, start, finish) => ({
  start: points.findIndex((p) => p[0] > start[0]) + 1,
  finish: points.findIndex((p) => p[0] > finish[0]),
});

const checkShape = ({ name, start, finish, points }) => {
  if (typeof name !== 'string' || name.trim() === '' || [...name.trim()].length > NAME_MAX) {
    throw new Error(`name: непорожній рядок до ${NAME_MAX} символів`);
  }
  if (!isPair(start) || !isPair(finish)) throw new Error(`start/finish: пара цілих у межах ±${COORD_MAX}`);
  if (!Array.isArray(points) || points.length < 2 || points.length > COORD_MAX || !points.every(isPair)) {
    throw new Error(`points: щонайменше дві пари цілих у межах ±${COORD_MAX}`);
  }
};

const checkGeometry = ({ start, finish, points }) => {
  for (let i = 1; i < points.length; i++) {
    const [prev, cur] = [points[i - 1][0], points[i][0]];
    if (cur <= prev) throw new Error(`points[${i}]: x має строго зростати (${prev} → ${cur})`);
  }
  if (start[0] >= finish[0]) throw new Error('start.x має бути менший за finish.x');
  if (start[0] - points[0][0] < FLAG_MARGIN) {
    throw new Error(`до старту менше ${FLAG_MARGIN} одиниць ламаної`);
  }
  if (points.at(-1)[0] - finish[0] < FLAG_MARGIN) {
    throw new Error(`після фінішу менше ${FLAG_MARGIN} одиниць ламаної`);
  }
  if (finish[1] !== 0) throw new Error('finish.y має бути 0');
  const lift = start[1] - groundAt(points, start[0]);
  if (lift < START_LIFT_MIN || lift > START_LIFT_MAX) {
    throw new Error(
      `старт на ${lift.toFixed(1)} над землею, треба ${START_LIFT_MIN}–${START_LIFT_MAX} (вісь Y дивиться вгору)`
    );
  }
  for (const dx of [-WHEEL_DX, WHEEL_DX]) {
    if (distanceToGround(points, start[0] + dx, start[1] - WHEEL_DROP) < WHEEL_GAP_MIN) {
      throw new Error(`колесо в x=${start[0] + dx} на старті вʼязне в землі — двигун зациклюється`);
    }
  }
  const flags = flagPoints(points, start, finish);
  if (flags.start >= flags.finish) throw new Error('між стартом і фінішем замало точок для прапорців');
};

/** JSON треку → { start, finish, points } (копії); кидає Error з першим порушенням. */
export const validateTrack = (json) => {
  if (!json || typeof json !== 'object' || Array.isArray(json)) throw new Error('очікується обʼєкт треку');
  const extra = Object.keys(json).filter((key) => !TRACK_KEYS.includes(key));
  if (extra.length) throw new Error(`зайві поля: ${extra.join(', ')}`);
  checkShape(json);
  checkGeometry(json);
  return {
    start: [...json.start],
    finish: [...json.finish],
    points: json.points.map((p) => [...p]),
  };
};

const listDir = (dir) => readdirSync(dir).filter((entry) => !entry.startsWith('.'));

const collectLeague = (root, league, slugs, errors) => {
  const dir = LEAGUE_DIRS[league];
  const tracks = [];
  const index = [];
  let files;
  try {
    files = listDir(join(root, dir)).sort();
  } catch {
    errors.push(`${dir}: теки ліги нема`);
    return { tracks, index };
  }
  if (files.length < TRACKS_MIN || files.length > TRACKS_MAX) {
    errors.push(`${dir}: треків ${files.length}, треба ${TRACKS_MIN}–${TRACKS_MAX}`);
  }
  files.forEach((file, position) => {
    const where = `${dir}/${file}`;
    try {
      const slug = slugFromFile(file, position, slugs);
      const json = JSON.parse(readFileSync(join(root, dir, file), 'utf8'));
      tracks.push({ name: slug, ...validateTrack(json) });
      index.push({ league, index: tracks.length - 1, name: json.name.trim(), slug });
    } catch (error) {
      errors.push(`${where}: ${error.message}`);
    }
  });
  return { tracks, index };
};

// <nn>-<slug>.json: nn — порядковий номер у лізі з 01 без пропусків, slug —
// ASCII-назва треку в .mrg (двигун читає до 39 байт), унікальна в паку
const slugFromFile = (file, position, slugs) => {
  const match = FILE_RE.exec(file);
  if (!match) throw new Error('імʼя файлу має бути <nn>-<slug>.json (slug: a-z, 0-9, дефіс)');
  const expected = String(position + 1).padStart(2, '0');
  if (match[1] !== expected) throw new Error(`номер ${match[1]}, а за порядком має бути ${expected}`);
  const slug = match[2];
  if (slug.length > SLUG_MAX) throw new Error(`slug довший за ${SLUG_MAX} символи`);
  if (slugs.has(slug)) throw new Error(`slug «${slug}» уже є в паку`);
  slugs.add(slug);
  return slug;
};

/** content/moto/tracks → { pack, index, errors }; порядок у лізі — за іменем файлу. */
export const collectTracks = (root) => {
  const errors = [];
  const slugs = new Set();
  let entries = [];
  try {
    entries = listDir(root);
  } catch {
    return { pack: { leagues: [[], [], []] }, index: [], errors: [`${root}: теки треків нема`] };
  }
  const extra = entries.filter((entry) => !LEAGUE_DIRS.includes(entry));
  if (extra.length) errors.push(`зайве в теці треків: ${extra.join(', ')} (ліги: ${LEAGUE_DIRS.join(', ')})`);
  const leagues = LEAGUE_DIRS.map((_, league) => collectLeague(root, league, slugs, errors));
  return {
    pack: { leagues: leagues.map((l) => l.tracks) },
    index: leagues.flatMap((l) => l.index),
    errors,
  };
};

/** null, якщо зібраний .mrg читається назад у той самий пак; інакше — текст помилки. */
export const verifyRoundTrip = (pack, mrg) =>
  isDeepStrictEqual(decodeMrg(mrg), pack) ? null : 'round-trip: .mrg, прочитаний назад, не збігається з JSON';
```

- [ ] **Step 5: Перевірки зелені (і калібрування, якщо довідковий клон upstream уже є)**

Run: `node scripts/check-moto-tracks.mjs`
Expected: десять рядків `ok - …`, `skip - калібрування (GD_ORIGINAL_MRG не задано)`, останній `ok: 10 checks`, код 0.

Оригінальний пак лежить лише в довідковому клоні upstream `../gd-upstream`, який створює план A (Task 1, Step 1); у форку `../drill-moto` його нема ні в дереві, ні в історії, і remote `upstream` форк не має. Якщо `../gd-upstream` уже є, один раз прожени калібрування — файл читається з клону на місці, у репозиторій сайту нічого не копіюється:

```bash
GD_ORIGINAL_MRG=../gd-upstream/src/assets/levels.mrg node scripts/check-moto-tracks.mjs
```

Expected: одинадцятий рядок `ok - калібрування: оригінальний пак читається і перекодовується байт у байт`, `ok: 11 checks`. Якщо `../gd-upstream` ще нема — крок пропускається: калібрування вже зроблене під час написання плану (кодек перекодував оригінальні 5123 байти без жодної розбіжності).

- [ ] **Step 6: Лінт нових скриптів**

Run: `npx eslint scripts/lib/moto-mrg.mjs scripts/lib/moto-tracks.mjs scripts/check-moto-tracks.mjs`
Expected: без виводу, код 0.

- [ ] **Step 7: Commit**

```bash
npx prettier --write scripts/lib/moto-mrg.mjs scripts/lib/moto-tracks.mjs scripts/check-moto-tracks.mjs
node scripts/check-moto-tracks.mjs
npx prettier --check src/shared/config/dev-mode.ts || { echo 'dev-mode.ts не відформатований — зупинись і спитай власника'; exit 1; }
git add scripts/lib/moto-mrg.mjs scripts/lib/moto-tracks.mjs scripts/check-moto-tracks.mjs
git status --short
git commit -m "feat(moto): кодек .mrg і правила треків із перевірками

Правила треку звірені з оригінальним паком порту: вісь Y вгору, старт на
16–20 над землею, колеса на старті не ближче 7 до землі, finish.y = 0,
x строго зростає, 3 ліги по 3–10 треків.
Перевірки: node scripts/check-moto-tracks.mjs

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

Expected: `prettier --check` для `dev-mode.ts` друкує `All matched files use Prettier code style!` (хук `prettier --write .` цей файл не перепише); у `git status --short` перед комітом staged лише три файли задачі; `src/shared/config/dev-mode.ts` лишається ` M` (не staged). Та сама перевірка `dev-mode.ts` стоїть у кожному коміті плану.

---

### Task 2: Бандл гри в `public/moto/` — перевірка і синхронізація

**Files:**

- Create: `scripts/check-moto-bundle.mjs`
- Create: `scripts/lib/moto-bundle.mjs`
- Create: `scripts/sync-moto-bundle.mjs`
- Modify: `eslint.config.mjs:13-15` (блок `ignores`)
- Modify: `.prettierignore` (кінець файлу, після рядка `model/`)
- Create (генерує скрипт): `public/moto/**` (без `tracks/`), `public/moto/VERSION`

**Interfaces:**

- Consumes (з плану A; передумови 1–3, 6–7):
  - `dist/` форку `../drill-moto` після `npm run build` або `dist.zip` релізу `vX.Y.Z` (план A, Task 13, Step 3: `public/LICENSE.txt`, `public/NOTICE.txt`, `.github/workflows/release.yml` — `cd dist && zip -r ../dist.zip .`): вміст `dist/` у корені архіву, `index.html` посилається на відносні `./assets/…`, `LICENSE.txt` і `NOTICE.txt` лежать у корені.
  - У бандлі лише чотири ваги e-Ukraine (`e-Ukraine-Light`, `-Regular`, `-Medium`, `-Bold`), і весь він важить ≤ 300 КБ gzip так, як рахує `gzipTotal` (усі файли, крім `*.map` і `*.txt`).
  - Режим гри `?debug&ns=<ns>&json=<url>`: читає JSON одного треку (`data:`-URI теж підходить), одразу стартує заїзд і не запитує ні `./tracks/dril.mrg`, ні `dril.json` (план A, `loadPack` → `fromJson`) — тому в кроці 7 без треків сайту нема жодного 404.
- Produces:
  - `scripts/lib/moto-bundle.mjs`: `CODEBREW_SHA256: Map<sha256hex, fileName>` (12 відбитків: 11 файлів src/assets і preview.gif), `BUNDLE_BUDGET_GZIP = 307200`, `REQUIRED_FILES = ['index.html', 'LICENSE.txt', 'NOTICE.txt']`, `resolveBundleRoot(dir): string | null`, `listFiles(dir): string[]`, `findCodebrewTraces(dir, files, forbidden?): string[]`, `checkRelativeBase(indexHtml): string | null`, `checkUpstreamName(indexHtml): string | null`, `gzipTotal(dir, files): number`.
  - CLI `node scripts/sync-moto-bundle.mjs --from <тека> | --tag vX.Y.Z` → `public/moto/` (усе, крім `tracks/`, замінюється) і `public/moto/VERSION` (тег або `local+<git describe форку>`).
  - `.prettierignore`: рядок `public/moto/` — бандл і пак повз prettier (на нього спирається задача 3).

- [ ] **Step 1: Перевірки — спершу вони**

Створи `scripts/check-moto-bundle.mjs`:

```js
// scripts/check-moto-bundle.mjs
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
// тож перевірка отримує власну мапу хешів
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
```

Run: `node scripts/check-moto-bundle.mjs`
Expected: `ERR_MODULE_NOT_FOUND` на `scripts/lib/moto-bundle.mjs`, код 1.

- [ ] **Step 2: Модуль перевірок бандлу**

Створи `scripts/lib/moto-bundle.mjs`. Хеші нижче порахувані `shasum -a 256` з `src/assets/*` і `preview.gif` upstream під час написання плану (план A вважає `preview.gif` — запис гри з оригінальними спрайтами й треками — файлом Codebrew); самих файлів у сайті немає й не буде. Спрайти оригіналу менші за 4 КБ — Vite вбудовує такі у JS як `data:`-URI, тому перевірка декодує й хешує і їх.

```js
// scripts/lib/moto-bundle.mjs
// Перевірки зібраного бандлу гри (dist форку drill-moto) до того, як він
// ляже в public/moto/: де корінь бандлу, чи нема в ньому слідів Codebrew,
// чи шляхи відносні (бандл живе під /moto/), скільки він важить стисненим.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

// SHA-256 оригінальних асетів Codebrew з upstream gravity-defied-web
// (коміт 889a0914da5fd40405190907e493fc6be72c38a2: src/assets і preview.gif — запис
// гри з оригінальними спрайтами й треками). Лише відбитки: самих файлів у
// репозиторії сайту нема й не буде.
export const CODEBREW_SHA256 = new Map([
  ['1250a577720868a9b795f89cb9826374b3aaac08e7901fbbe91404387c1d9cb6', 'bluearm.png'],
  ['c63d471c53af5a7a32a7bdcbb051306344dc987ec072dd7bf8041133825b60ff', 'bluebody.png'],
  ['0a21cb9f85fd101ddba5c3e3a5476e5a161e04af49efa0bbf867e5705764fc08', 'blueleg.png'],
  ['7665d79bc4143adf89c332d35567c55954c7241a7973cba77439692b70935cdf', 'engine.png'],
  ['f227cf0a52ec24313aa03d3080a55b72f67accff9d3b0fedbe0b63988412051f', 'fender.png'],
  ['44164ed4419a60881e0da8ef44d78fb97026f47885b3834ef1502c5694c82033', 'helmet.png'],
  ['d8eb402f0bcfc4c09610104c300bd72a8c3b685d372d9328d0734807cae8e0cd', 'levels.mrg'],
  ['2f90907e721f69b8a513c03ee2f743822ea58603c3bff05a6d4c69fb0db567de', 'logo.png'],
  ['9bc88e36c19a26be0bccbab9429b7e5b8be97528a01d4a07a46085fc32525f1c', 'raster.png'],
  ['6d0aa2de1c13b7b8bda7d7ed78fb21149fecbbca69cf3c89a6c022a1d2c9fcb5', 'splash.png'],
  ['8308600334460e64d204693aaa45033060115f1d863dda1b648217bad73200cf', 'sprites.png'],
  ['5759c1f241aef74e6f818f3148951d66a6a528b33db9b3780da83f7fe8d12942', 'preview.gif'],
]);

/** Бюджет спеки: бандл разом зі шрифтами ≤ 300 КБ стисненим. */
export const BUNDLE_BUDGET_GZIP = 300 * 1024;
/** Файли, без яких бандл не приймається: сторінка гри і текст GPL + походження. */
export const REQUIRED_FILES = ['index.html', 'LICENSE.txt', 'NOTICE.txt'];

// Код бандла, у якому шукаємо рядок levels.mrg і data:-URI. *.txt — ні: NOTICE.txt
// законно розповідає, що оригінальний levels.mrg із форку видалено
const CODE_FILE_RE = /\.(?:html|js|mjs|css|json|svg)$/;
const DATA_URI_RE = /data:[\w.+-]+\/[\w.+-]+;base64,([A-Za-z0-9+/=]+)/g;
const PACK_NAME_RE = /(?:^|\/)levels(?:[-.][\w-]*)?\.mrg$/i;
const NOT_COUNTED_RE = /\.(?:map|txt)$/;

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

// Зібраний бандл: є index.html і нема package.json. Корінь репозиторію форку
// теж має index.html (вхідна точка Vite), тож без другої умови скрипт узяв би
// сирці разом із node_modules
const isBuiltBundle = (dir) => existsSync(join(dir, 'index.html')) && !existsSync(join(dir, 'package.json'));

/** Корінь бандлу: сама тека (архів релізу — вміст dist/ у корені) або її dist/ (корінь форку чи архів із текою dist/). */
export const resolveBundleRoot = (dir) => {
  if (isBuiltBundle(dir)) return dir;
  if (isBuiltBundle(join(dir, 'dist'))) return join(dir, 'dist');
  return null;
};

/** Усі файли теки рекурсивно, шляхи через «/», відсортовано; dot-файли пропускаються. */
export const listFiles = (dir, prefix = '') =>
  readdirSync(join(dir, prefix), { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith('.'))
    .flatMap((entry) => {
      const path = prefix ? `${prefix}/${entry.name}` : entry.name;
      return entry.isDirectory() ? listFiles(dir, path) : [path];
    })
    .sort();

/** Сліди Codebrew: файл або вбудований data:-URI з відомим хешем, пак levels*.mrg, рядок levels.mrg. */
export const findCodebrewTraces = (dir, files, forbidden = CODEBREW_SHA256) => {
  const problems = [];
  for (const file of files) {
    const buf = readFileSync(join(dir, file));
    const known = forbidden.get(sha256(buf));
    if (known) problems.push(`${file}: це оригінальний ${known}`);
    if (PACK_NAME_RE.test(file)) problems.push(`${file}: імʼя оригінального пака треків`);
    if (!CODE_FILE_RE.test(file)) continue;
    const text = buf.toString('utf8');
    if (text.includes('levels.mrg')) problems.push(`${file}: згадка levels.mrg`);
    for (const [, base64] of text.matchAll(DATA_URI_RE)) {
      const inlined = forbidden.get(sha256(Buffer.from(base64, 'base64')));
      if (inlined) problems.push(`${file}: вбудований data:-URI — оригінальний ${inlined}`);
    }
  }
  return problems;
};

/** Проблема, якщо index.html посилається на абсолютні /assets/ (бандл зібрано без base: './'). */
export const checkRelativeBase = (indexHtml) =>
  /(?:src|href)="\/(?!\/)/.test(indexHtml)
    ? "index.html має абсолютні шляхи — у vite.config форку потрібен base: './'"
    : null;

/** Проблема, якщо index.html бандла досі несе назву upstream (title, description, keywords). */
export const checkUpstreamName = (indexHtml) =>
  /gravity[\s-]?defied/i.test(indexHtml)
    ? 'index.html згадує «Gravity Defied» — у метаданих гри лише «Дріл Мото» (спека, секція 6)'
    : null;

/** Сума gzip-розмірів файлів, які вантажить гра (без *.map і *.txt). */
export const gzipTotal = (dir, files) =>
  files
    .filter((file) => !NOT_COUNTED_RE.test(file))
    .reduce((sum, file) => sum + gzipSync(readFileSync(join(dir, file)), { level: 9 }).length, 0);
```

Run: `node scripts/check-moto-bundle.mjs`
Expected: вісім рядків `ok - …`, останній `ok: 8 checks`, код 0.

- [ ] **Step 3: CLI синхронізації**

Спека (секція 1) описує синхронізацію як «тег → завантажити `dist.zip` → розпакувати → записати `VERSION`», без інструмента. `gh` на цій машині не встановлено, а репозиторій форку публічний, тож реліз тягне звичайний `curl -fsSL` (він іде через проксі з `HTTPS_PROXY`) і розпаковує `unzip`. Створи `scripts/sync-moto-bundle.mjs`:

```js
// scripts/sync-moto-bundle.mjs
// Кладе зібраний бандл гри (dist форку drill-moto) у public/moto/.
//   node scripts/sync-moto-bundle.mjs --from ../drill-moto/dist   — локальна збірка форку
//   node scripts/sync-moto-bundle.mjs --tag v0.1.0                — реліз з GitHub (dist.zip)
// Спершу перевіряє джерело (index.html, LICENSE.txt, NOTICE.txt, відносні шляхи,
// жодного сліду Codebrew і назви upstream, ≤ 300 КБ gzip) і лише тоді замінює public/moto/,
// не чіпаючи public/moto/tracks/ — треки сайту збирає build-moto-tracks.mjs.
// Пише public/moto/VERSION: тег релізу або мітку локальної збірки.
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BUNDLE_BUDGET_GZIP,
  REQUIRED_FILES,
  checkRelativeBase,
  checkUpstreamName,
  findCodebrewTraces,
  gzipTotal,
  listFiles,
  resolveBundleRoot,
} from './lib/moto-bundle.mjs';

const REPO = 'ZhekaGrem/drill-moto';
const TAG_RE = /^v\d+\.\d+\.\d+$/;
const SITE_ROOT = fileURLToPath(new URL('..', import.meta.url));
const TARGET = join(SITE_ROOT, 'public/moto');
const KEEP = 'tracks'; // public/moto/tracks — треки сайту, бандл їх не приносить

// Помилка з рядками для людини; ловиться внизу, щоб finally прибрав тимчасову теку
const fail = (lines) => {
  throw Object.assign(new Error('sync-moto-bundle'), { lines: [lines].flat() });
};

const argValue = (flag) => {
  const i = process.argv.indexOf(flag);
  return i === -1 ? null : (process.argv[i + 1] ?? '');
};

// Мітка локальної збірки: git describe форку (тег, коміти після нього, хеш, -dirty)
const localLabel = (from) => {
  const git = spawnSync('git', ['-C', from, 'describe', '--tags', '--always', '--dirty'], {
    encoding: 'utf8',
  });
  return `local+${git.status === 0 ? git.stdout.trim() : 'nogit'}`;
};

// Реліз: репозиторій публічний, тож досить curl (gh на цій машині нема; curl
// іде через системний проксі, якщо він є). -f: HTTP 404 → ненульовий код
const downloadRelease = (tag, workDir) => {
  const url = `https://github.com/${REPO}/releases/download/${tag}/dist.zip`;
  const zipPath = join(workDir, 'dist.zip');
  const curl = spawnSync('curl', ['-fsSL', '-o', zipPath, url], { stdio: 'inherit' });
  if (curl.status !== 0) fail(`не вдалося завантажити ${url} (curl, код ${curl.status})`);
  const unzip = spawnSync('unzip', ['-q', zipPath, '-d', join(workDir, 'unzipped')], { stdio: 'inherit' });
  if (unzip.status !== 0) fail('unzip не зміг розпакувати dist.zip');
  return join(workDir, 'unzipped');
};

const verifySource = (root) => {
  const files = listFiles(root).filter((file) => !file.startsWith(`${KEEP}/`));
  const missing = REQUIRED_FILES.filter((file) => !files.includes(file));
  if (missing.length) fail(`у бандлі нема: ${missing.join(', ')}`);
  const problems = findCodebrewTraces(root, files);
  const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
  for (const problem of [checkRelativeBase(indexHtml), checkUpstreamName(indexHtml)]) {
    if (problem) problems.push(problem);
  }
  if (problems.length) fail(problems);
  const gzip = gzipTotal(root, files);
  const kb = (gzip / 1024).toFixed(1);
  if (gzip > BUNDLE_BUDGET_GZIP) {
    fail(`бандл ${kb} КБ gzip — понад бюджет спеки ${BUNDLE_BUDGET_GZIP / 1024} КБ`);
  }
  return { files, kb };
};

const replaceTarget = (root, files, label) => {
  mkdirSync(TARGET, { recursive: true });
  for (const entry of readdirSync(TARGET)) {
    if (entry !== KEEP) rmSync(join(TARGET, entry), { recursive: true, force: true });
  }
  for (const file of files) {
    mkdirSync(dirname(join(TARGET, file)), { recursive: true });
    copyFileSync(join(root, file), join(TARGET, file));
  }
  writeFileSync(join(TARGET, 'VERSION'), `${label}\n`);
};

const from = argValue('--from');
const tag = argValue('--tag');
const workDir = mkdtempSync(join(tmpdir(), 'moto-bundle-'));
try {
  if ((from === null) === (tag === null)) fail('вкажи рівно одне: --from <тека dist> або --tag vX.Y.Z');
  if (tag !== null && !TAG_RE.test(tag)) fail(`тег «${tag}» не схожий на vX.Y.Z`);
  const source = from !== null ? resolve(from) : downloadRelease(tag, workDir);
  const root = resolveBundleRoot(source);
  if (!root) fail(`${source}: нема зібраного бандлу (index.html без package.json) ні тут, ні в dist/`);
  const { files, kb } = verifySource(root);
  const label = from !== null ? localLabel(source) : tag;
  replaceTarget(root, files, label);
  console.log(`ok - public/moto/: ${files.length} файлів, ${kb} КБ gzip, VERSION ${label}`);
  if (listFiles(root).some((file) => file.startsWith(`${KEEP}/`))) {
    console.log(`note - теку ${KEEP}/ з бандлу пропущено: треки сайту — node scripts/build-moto-tracks.mjs`);
  }
  if (!existsSync(join(TARGET, KEEP, 'dril.mrg'))) {
    console.log('note - public/moto/tracks/dril.mrg ще нема: node scripts/build-moto-tracks.mjs');
  }
} catch (error) {
  if (!error.lines) throw error;
  for (const line of error.lines) console.error('✗', line);
  process.exitCode = 1;
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
```

- [ ] **Step 4: Відмови без побічних ефектів**

Run: `node scripts/sync-moto-bundle.mjs; echo "exit=$?"`
Expected: `✗ вкажи рівно одне: --from <тека dist> або --tag vX.Y.Z`, `exit=1`.

Run: `node scripts/sync-moto-bundle.mjs --tag 1.0; echo "exit=$?"`
Expected: `✗ тег «1.0» не схожий на vX.Y.Z`, `exit=1`.

Run: `node scripts/sync-moto-bundle.mjs --from src; echo "exit=$?"; ls public/moto 2>&1`
Expected: `✗ /Users/…/drill_shop/src: нема зібраного бандлу …`, `exit=1`, `ls: public/moto: No such file or directory` — невдалий прогін нічого не створив.

- [ ] **Step 5: Бандл повз лінтер і prettier**

У `eslint.config.mjs` блок

<!-- prettier-ignore -->
```js
  {
    ignores: ['.next/**', 'node_modules/**'],
  },
```

заміни на

<!-- prettier-ignore -->
```js
  {
    // public/moto/** — зібраний бандл гри «Дріл Мото» (мініфікований Vite-код форку drill-moto)
    ignores: ['.next/**', 'node_modules/**', 'public/moto/**'],
  },
```

Pre-commit хук форматує весь репозиторій. Мініфікований бандл гри prettier переписав би в робочому дереві після кожного коміту, а `dril.json` після форматування перестав би збігатися з тим, що порівнює `--check`. Додай у кінець `.prettierignore` (після рядка `model/`):

```
# Бандл гри «Дріл Мото» (зібраний Vite-ом у форку drill-moto) і пак треків,
# який генерує scripts/build-moto-tracks.mjs: форматувати нічого, а мініфікований
# JS хук переписував би в робочому дереві після кожного коміту
public/moto/
```

Run: `npx prettier --file-info public/moto/tracks/dril.json && npx prettier --file-info content/moto/tracks/1-lehka/01-pershyi-dril.json`
Expected: `{ "ignored": true, "inferredParser": null }`, потім `{ "ignored": false, "inferredParser": "json" }` (файлів ще нема — prettier відповідає за шляхом).

- [ ] **Step 6: Справжня синхронізація**

Переконайся, що форк зібраний (план A, Task 13) і в ньому є тексти ліцензії:

```bash
ls ../drill-moto/package.json ../drill-moto/public/LICENSE.txt ../drill-moto/public/NOTICE.txt
(cd ../drill-moto && npm run build)
```

Expected: три шляхи без помилок; збірка форку чиста (це інший репозиторій — `.next` сайту вона не чіпає).

Перевір, чи вже опубліковано реліз (з мережею до github.com):

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://github.com/ZhekaGrem/drill-moto/releases/download/v0.1.0/dist.zip
```

(Не `curl -sI … | head -1`: у пісочниці задано `HTTPS_PROXY`, і першим рядком іде відповідь проксі `HTTP/1.1 200 Connection Established`.)

- `302` (реліз є): `node scripts/sync-moto-bundle.mjs --tag v0.1.0`.
- `404` (власник ще не запушив форк або реліз): `node scripts/sync-moto-bundle.mjs --from ../drill-moto/dist`. Мітка у `VERSION` буде `local+…`; перед пушем сайту власник пересинхронізує з тегом (задача 6, крок 5).

Expected: `ok - public/moto/: N файлів, X КБ gzip, VERSION …` з X ≤ 300, рядок `note - public/moto/tracks/dril.mrg ще нема…`. Якщо скрипт падає на бюджеті, на сліді Codebrew чи на абсолютних шляхах — зупинись: це дефект форку (план A), `public/moto/` при цьому не змінено.

Run: `cat public/moto/VERSION && ls public/moto && npx eslint public/moto/assets/*.js`
Expected: мітка з попереднього виводу; `LICENSE.txt NOTICE.txt VERSION assets index.html …`; ESLint на кожен файл пише `File ignored because of a matching ignore pattern` (попередження), помилок нема.

- [ ] **Step 7: Бандл працює з-під `/moto/`**

Команди до dev-сервера — з вимкненою пісочницею.

Run: `curl -s -o /dev/null -w '%{http_code} %{content_type}\n' http://localhost:3000/moto/index.html`
Expected: `200 text/html; charset=UTF-8`.

Треків сайту ще нема, тож для димової перевірки — дев-режим форку з одним рівним треком «Перевірка», переданим `data:`-URI. Відкрий у Chrome (реальне вікно на передньому плані: у фоновій вкладці `requestAnimationFrame` не йде і гра стоїть):

```
http://localhost:3000/moto/index.html?debug&ns=moto-dev&json=data%3Aapplication%2Fjson%3Bbase64%2CeyJuYW1lIjoi0J%2FQtdGA0LXQstGW0YDQutCwIiwic3RhcnQiOlswLDE4XSwiZmluaXNoIjpbMzAwLDBdLCJwb2ludHMiOltbLTIwMCwwXSxbLTEwMCwwXSxbMTAwLDBdLFsyMDAsMF0sWzQwMCwwXSxbNTAwLDBdXX0%3D
```

(всередині — `{"name":"Перевірка","start":[0,18],"finish":[300,0],"points":[[-200,0],[-100,0],[100,0],[200,0],[400,0],[500,0]]}`)

Expected: гра одразу стартує заїзд «Перевірка» байком «Легкої», байк падає на колеса, ↑ везе до фінішу. У DevTools → Network усі запити під `/moto/assets/` і `/moto/fonts/` мають 200 і жодного 404: у режимі `?debug&json=` гра не вантажить ні `/moto/tracks/dril.mrg`, ні індекс `dril.json` (план A, `loadPack` → `fromJson`), тож відсутність треків сайту до задачі 3 тут не заважає. У консолі нема помилок завантаження.

- [ ] **Step 8: Лінт нових скриптів**

Run: `npx eslint scripts/lib/moto-bundle.mjs scripts/check-moto-bundle.mjs scripts/sync-moto-bundle.mjs eslint.config.mjs`
Expected: без виводу, код 0.

- [ ] **Step 9: Commit**

```bash
npx prettier --write scripts/lib/moto-bundle.mjs scripts/check-moto-bundle.mjs scripts/sync-moto-bundle.mjs eslint.config.mjs
node scripts/check-moto-bundle.mjs
npx prettier --check src/shared/config/dev-mode.ts || { echo 'dev-mode.ts не відформатований — зупинись і спитай власника'; exit 1; }
git add scripts/lib/moto-bundle.mjs scripts/check-moto-bundle.mjs scripts/sync-moto-bundle.mjs eslint.config.mjs .prettierignore public/moto
git status --short
git commit -m "feat(moto): бандл гри в public/moto — синхронізація з перевіркою Codebrew, бюджету й шляхів

sync-moto-bundle.mjs бере dist форку (--from) або реліз (--tag), не чіпає
public/moto/tracks і пише VERSION. Перевірки: node scripts/check-moto-bundle.mjs

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

`.prettierignore` у prettier не передаємо: парсера для нього нема (код 2); у `git add` він є.

Expected: `prettier --check` для `dev-mode.ts` чистий; у `git status --short` перед комітом staged лише три скрипти, `eslint.config.mjs`, `.prettierignore` і `public/moto/…`; `src/shared/config/dev-mode.ts` лишається ` M`.

---

### Task 3: Девʼять треків трьох ліг і пак `dril.mrg`

**Files:**

- Create: `content/moto/tracks/1-lehka/01-pershyi-dril.json`, `02-horby.json`, `03-yar.json`
- Create: `content/moto/tracks/2-serednia/01-skhody.json`, `02-tramplin.json`, `03-khvyli.json`
- Create: `content/moto/tracks/3-vazhka/01-zubtsi.json`, `02-kruchi.json`, `03-stina.json`
- Create: `scripts/build-moto-tracks.mjs`
- Create (генерує скрипт): `public/moto/tracks/dril.mrg`, `public/moto/tracks/dril.json`
- Modify: `package.json` (блок `scripts`)

**Interfaces:**

- Consumes з цього плану: `collectTracks(root): { pack, index: { league, index, name, slug }[], errors: string[] }` і `verifyRoundTrip(pack, mrg): string | null` з `scripts/lib/moto-tracks.mjs`, `encodeMrg(pack): Buffer` з `scripts/lib/moto-mrg.mjs` (Task 1); `.prettierignore` з `public/moto/` і бандл гри в `public/moto/` (Task 2).
- Consumes з плану A (передумови 3–5, 9):
  - `?debug&ns=<ns>&json=<url>` будує пак з одного JSON-треку, покладеного в кожну з трьох ліг, і одразу стартує заїзд байком «Легкої»; із заїзду Esc → «До треків» → «До ліг» відкриває DOM-меню ліг.
  - Прогрес — `localStorage["${ns}:progress:v1"]`, а заїзди з `?debug&json=` пишуть у `localStorage["${ns}:json:progress:v1"]`; обидва — `{ best: Record<"L-T", number>, unlockedTracks: [n0, n1, n2] }`.
  - Індекс `dril.json` поруч із паком дає українські назви треків у меню (крок 8).
  - CLI `node ../drill-moto/scripts/sim-track.mjs <пак.mrg> [--driver ai,gas,bot,plan]` (план A, `scripts/sim-track.mjs`): рядок на трек `L<ліга> T<трек> <slug> <водій>: finish <с>s | …` або `crash(3|5) <с>s x=… y=…` / `stuck <с>s x=… y=…` / `fell <с>s x=… y=…` / `timeout 90s` (ліміт `--seconds`, без місця) (водіїв розділяє `|` з пробілами обабіч), останній рядок `N/M треків фінішують хоча б одним водієм`, код виходу 1, якщо якийсь трек не фінішує жоден водій.
- Produces:
  - CLI `node scripts/build-moto-tracks.mjs [--check]` пише `public/moto/tracks/dril.mrg` і `public/moto/tracks/dril.json` (`JSON.stringify(index, null, 2) + '\n'`); `--check` лише перевіряє, зокрема що `public/moto/tracks` актуальний.
  - Пак із 3 × 3 треків, що пройшов ворота `sim-track.mjs` (`9/9`, exit 0); індекс `[{ league, index, name, slug }]`; npm-скрипт `prebuild`.

Усі треки в масштабі оригіналу, вісь Y вгору. Спільна «рамка»: зліва пагорб-упор від `(-340, 110)` до рівної землі `y = 0` на `x = -110`, старт `(-60, 18)` (земля 0, байк на 18 вище), праворуч за фінішем — рівна ділянка, мʼякий підйом на 40–55 і плато (кінець ламаної щонайменше на 150 правіше фінішу). Складність росте від ліги до ліги й усередині ліги. Під час написання плану кожен трек прогнано незміненим двигуном порту без UI (Node, тими самими класами `LevelLoader`/`GamePhysics`, кроки по 20 мс) трьома «гравцями»: лише газ; вбудований демо-ІІ порту (`enableGenerateInputAI`); планувальник, що перебирає натискання на 2,4 с уперед і безпомилково реагує кожні 100 мс (верхня межа людини):

| Трек                | Байк ліги | Лише газ    | Демо-ІІ порту | Планувальник |
| ------------------- | --------- | ----------- | ------------- | ------------ |
| Легка / Перший дріл | 1         | фініш 9,3 с | фініш 13,0 с  | фініш 8,1 с  |
| Легка / Горби       | 1         | падіння     | фініш 22,3 с  | фініш 12,6 с |
| Легка / Яр          | 1         | падіння     | фініш 48,6 с  | фініш 14,6 с |
| Середня / Сходи     | 2         | падіння     | падіння       | фініш 11,6 с |
| Середня / Трамплін  | 2         | падіння     | падіння       | фініш 12,1 с |
| Середня / Хвилі     | 2         | падіння     | падіння       | фініш 14,1 с |
| Важка / Зубці       | 3         | падіння     | застряг       | фініш 9,2 с  |
| Важка / Кручі       | 3         | падіння     | падіння       | фініш 18,7 с |
| Важка / Стіна       | 3         | падіння     | застряг       | фініш 19,0 с |

Таблицю складено авторським прогоном без відсічки «застряг»; відтворюваний вивід `sim-track.mjs` форку (інші часи планувальника; демо-ІІ на «Кручах» — `stuck`) — у кроці 9.

Для порівняння, оригінали тими ж «гравцями»: Intro — газ 8,2 с / ІІ 12,2 с / план. 6,8 с; Shorty — падіння / 22,4 с / 8,4 с; Slope — падіння / застряг / 22,8 с; Floorboards (перший трек третьої ліги) — падіння / застряг / 17,1 с. Тобто «Легка» — рівня перших треків оригіналу, «Середня» і «Важка» не проходяться автопілотом, але проходяться точною грою. Ворота спеки (секція 4, «Авторинг»): перед комітом безголовий прогін форку `sim-track.mjs` на справжній фізиці мусить довести, що кожен трек фінішує хоча б одним водієм — `ai`, `gas`, `bot` або планувальником `plan` того самого типу, що в таблиці (передумова 9). Відтворюваний прогін із точним виводом — крок 9, і коміт у кроці 10 бере лише пак, що пройшов його (`9/9`, exit 0). Заїзди людини в кроках 7–8 — додаткове приймання складності.

- [ ] **Step 1: Треки «Легкої»**

Пари точок нижче записані по шість у рядку для читабельності (у самому плані їх від переформатування береже `<!-- prettier-ignore -->`); prettier у кроці 10 розкладе їх у файлах по одній на рядок — дані від цього не змінюються.

`content/moto/tracks/1-lehka/01-pershyi-dril.json` — три мʼякі хвилі, проходиться самим газом:

<!-- prettier-ignore -->
```json
{
  "name": "Перший дріл",
  "start": [-60, 18],
  "finish": [630, 0],
  "points": [
    [-340, 110], [-290, 104], [-250, 84], [-222, 58], [-196, 34], [-170, 16],
    [-140, 5], [-110, 0], [-60, 0], [-10, 0], [30, 0], [57, 5],
    [83, 16], [110, 22], [137, 17], [163, 5], [190, 0], [240, 0],
    [270, -4], [300, -13], [330, -18], [360, -14], [390, -4], [420, 0],
    [460, 0], [488, 6], [516, 14], [544, 14], [572, 6], [600, 0],
    [640, 0], [700, 0], [735, 7], [770, 25], [805, 43], [840, 50],
    [880, 50], [940, 50]
  ]
}
```

`content/moto/tracks/1-lehka/02-horby.json` — горби до 30, ямка, маленький трамплін:

<!-- prettier-ignore -->
```json
{
  "name": "Горби",
  "start": [-60, 18],
  "finish": [840, 0],
  "points": [
    [-340, 110], [-290, 104], [-250, 84], [-222, 58], [-196, 34], [-170, 16],
    [-140, 5], [-110, 0], [-60, 0], [-10, 0], [30, 0], [50, 6],
    [70, 16], [90, 16], [110, 6], [130, 0], [152, 9], [174, 24],
    [196, 24], [218, 9], [240, 0], [270, 0], [293, -10], [315, -20],
    [338, -10], [360, 0], [390, 0], [407, 5], [423, 16], [440, 22],
    [460, 22], [473, 17], [487, 6], [500, 0], [550, 0], [570, 7],
    [590, 22], [610, 30], [630, 23], [650, 7], [670, 0], [710, 0],
    [730, 7], [750, 18], [770, 18], [790, 7], [810, 0], [850, 0],
    [910, 0], [945, 7], [980, 25], [1015, 43], [1050, 50], [1090, 50],
    [1150, 50]
  ]
}
```

`content/moto/tracks/1-lehka/03-yar.json` — спуск у яр на −60, підйом, сходинка 10, стіл:

<!-- prettier-ignore -->
```json
{
  "name": "Яр",
  "start": [-60, 18],
  "finish": [863, 0],
  "points": [
    [-340, 110], [-290, 104], [-250, 84], [-222, 58], [-196, 34], [-170, 16],
    [-140, 5], [-110, 0], [-60, 0], [-10, 0], [30, 0], [54, -6],
    [78, -21], [102, -39], [126, -54], [150, -60], [190, -60], [208, -55],
    [226, -41], [244, -24], [262, -10], [280, -5], [300, -5], [303, 5],
    [353, 5], [373, 14], [393, 23], [413, 14], [433, 5], [463, 5],
    [483, 11], [503, 24], [523, 30], [583, 30], [606, 24], [630, 11],
    [653, 5], [693, 5], [716, -2], [740, -17], [763, -25], [786, -18],
    [810, -2], [833, 5], [873, 5], [933, 5], [968, 12], [1003, 30],
    [1038, 48], [1073, 55], [1113, 55], [1173, 55]
  ]
}
```

- [ ] **Step 2: Треки «Середньої»**

`content/moto/tracks/2-serednia/01-skhody.json` — чотири сходинки по 11 угору, чотири по 12 униз, горб, ще три по 10 угору:

<!-- prettier-ignore -->
```json
{
  "name": "Сходи",
  "start": [-60, 18],
  "finish": [914, 0],
  "points": [
    [-340, 110], [-290, 104], [-250, 84], [-222, 58], [-196, 34], [-170, 16],
    [-140, 5], [-110, 0], [-60, 0], [-10, 0], [30, 0], [34, 11],
    [70, 11], [74, 22], [110, 22], [114, 33], [150, 33], [154, 44],
    [190, 44], [220, 44], [225, 32], [260, 32], [265, 20], [300, 20],
    [305, 8], [340, 8], [345, -4], [380, -4], [410, -4], [430, 3],
    [450, 18], [470, 26], [490, 19], [510, 3], [530, -4], [560, -4],
    [564, 6], [598, 6], [602, 16], [636, 16], [640, 26], [674, 26],
    [694, 20], [714, 6], [734, -8], [754, -14], [794, -14], [817, -26],
    [839, -39], [862, -27], [884, -14], [924, -14], [984, -14], [1019, -7],
    [1054, 11], [1089, 29], [1124, 36], [1164, 36], [1224, 36]
  ]
}
```

`content/moto/tracks/2-serednia/02-tramplin.json` — трамплін із обривом, гора 90, дві вузькі щілини глибиною 35:

<!-- prettier-ignore -->
```json
{
  "name": "Трамплін",
  "start": [-60, 18],
  "finish": [812, 0],
  "points": [
    [-340, 110], [-290, 104], [-250, 84], [-222, 58], [-196, 34], [-170, 16],
    [-140, 5], [-110, 0], [-60, 0], [-10, 0], [40, 0], [58, 4],
    [76, 16], [94, 29], [112, 41], [130, 45], [142, 51], [146, 16],
    [166, -14], [189, -19], [213, -29], [236, -34], [296, -34], [318, -25],
    [340, -3], [362, 25], [384, 47], [406, 56], [436, 56], [456, 47],
    [476, 25], [496, -3], [516, -25], [536, -34], [566, -34], [569, -69],
    [581, -69], [584, -34], [624, -34], [627, -69], [639, -69], [642, -34],
    [682, -34], [702, -24], [722, -7], [742, -7], [762, -24], [782, -34],
    [822, -34], [882, -34], [917, -27], [952, -9], [987, 9], [1022, 16],
    [1062, 16], [1122, 16]
  ]
}
```

`content/moto/tracks/2-serednia/03-khvyli.json` — шість частих горбів, гора 120 і спуск, ще три горби:

<!-- prettier-ignore -->
```json
{
  "name": "Хвилі",
  "start": [-60, 18],
  "finish": [970, 0],
  "points": [
    [-340, 110], [-290, 104], [-250, 84], [-222, 58], [-196, 34], [-170, 16],
    [-140, 5], [-110, 0], [-60, 0], [-10, 0], [30, 0], [41, 8],
    [53, 16], [64, 8], [75, 0], [86, 8], [98, 16], [109, 8],
    [120, 0], [131, 8], [143, 16], [154, 8], [165, 0], [176, 8],
    [188, 16], [199, 8], [210, 0], [221, 8], [233, 16], [244, 8],
    [255, 0], [266, 8], [278, 16], [289, 8], [300, 0], [340, 0],
    [363, 6], [386, 23], [409, 47], [431, 73], [454, 97], [477, 114],
    [500, 120], [540, 120], [555, 127], [570, 134], [585, 127], [600, 120],
    [621, 114], [643, 97], [664, 73], [686, 47], [707, 23], [729, 6],
    [750, 0], [790, 0], [803, 10], [815, 20], [828, 10], [840, 0],
    [853, 10], [865, 20], [878, 10], [890, 0], [903, 10], [915, 20],
    [928, 10], [940, 0], [980, 0], [1040, 0], [1075, 7], [1110, 25],
    [1145, 43], [1180, 50], [1220, 50], [1280, 50]
  ]
}
```

- [ ] **Step 3: Треки «Важкої»**

`content/moto/tracks/3-vazhka/01-zubtsi.json` — чотири ями глибиною 50, три зубці по 24 на плато, три ями по 60:

<!-- prettier-ignore -->
```json
{
  "name": "Зубці",
  "start": [-60, 18],
  "finish": [872, 0],
  "points": [
    [-340, 110], [-290, 104], [-250, 84], [-222, 58], [-196, 34], [-170, 16],
    [-140, 5], [-110, 0], [-60, 0], [-10, 0], [80, 0], [88, -50],
    [102, -50], [110, 0], [146, 0], [154, -50], [168, -50], [176, 0],
    [212, 0], [220, -50], [234, -50], [242, 0], [278, 0], [286, -50],
    [300, -50], [308, 0], [344, 0], [359, 7], [374, 22], [389, 38],
    [404, 45], [424, 45], [430, 69], [446, 69], [452, 45], [480, 45],
    [486, 69], [502, 69], [508, 45], [536, 45], [542, 69], [558, 69],
    [564, 45], [592, 45], [607, 38], [622, 23], [637, 7], [652, 0],
    [682, 0], [688, -60], [706, -60], [712, 0], [742, 0], [748, -60],
    [766, -60], [772, 0], [802, 0], [808, -60], [826, -60], [832, 0],
    [862, 0], [882, 0], [942, 0], [977, 7], [1012, 25], [1047, 43],
    [1082, 50], [1122, 50], [1182, 50]
  ]
}
```

`content/moto/tracks/3-vazhka/02-kruchi.json` — крутий підйом на 150 одразу після старту, обрив 40, дві кручі з полицями:

<!-- prettier-ignore -->
```json
{
  "name": "Кручі",
  "start": [-60, 18],
  "finish": [791, 0],
  "points": [
    [-340, 110], [-290, 104], [-250, 84], [-222, 58], [-196, 34], [-170, 16],
    [-140, 5], [-110, 0], [-60, 0], [-10, 0], [30, 0], [43, 10],
    [57, 37], [70, 75], [83, 112], [97, 140], [110, 150], [150, 150],
    [164, 139], [178, 112], [192, 78], [206, 51], [220, 40], [240, 40],
    [243, 0], [283, 0], [295, 10], [307, 35], [319, 65], [331, 90],
    [343, 100], [363, 110], [383, 110], [401, 99], [419, 72], [437, 38],
    [455, 11], [473, 0], [513, 0], [528, 15], [543, 30], [558, 15],
    [573, 0], [603, 0], [618, 12], [633, 40], [648, 68], [663, 80],
    [667, 100], [697, 100], [701, 40], [721, 30], [741, 10], [761, 0],
    [801, 0], [861, 0], [896, 7], [931, 25], [966, 43], [1001, 50],
    [1041, 50], [1101, 50]
  ]
}
```

`content/moto/tracks/3-vazhka/03-stina.json` — стіна на 75 угору, спуск на −35, друга гора, обрив 45, третя стіна:

<!-- prettier-ignore -->
```json
{
  "name": "Стіна",
  "start": [-60, 18],
  "finish": [950, 0],
  "points": [
    [-340, 110], [-290, 104], [-250, 84], [-222, 58], [-196, 34], [-170, 16],
    [-140, 5], [-110, 0], [-60, 0], [-10, 0], [50, 0], [73, 6],
    [95, 20], [118, 34], [140, 40], [150, 65], [158, 95], [168, 115],
    [198, 115], [218, 105], [238, 78], [258, 40], [278, 3], [298, -25],
    [318, -35], [348, -35], [368, -20], [388, -5], [408, -20], [428, -35],
    [448, -24], [468, 3], [488, 37], [508, 64], [528, 75], [568, 75],
    [572, 30], [602, 30], [622, 24], [642, 10], [662, -4], [682, -10],
    [722, -10], [740, -1], [757, 20], [775, 41], [792, 50], [800, 90],
    [830, 90], [848, 80], [866, 55], [884, 25], [902, 0], [920, -10],
    [960, -10], [1020, -10], [1055, -3], [1090, 15], [1125, 33], [1160, 40],
    [1200, 40], [1260, 40]
  ]
}
```

- [ ] **Step 4: CLI збірки пака; треки валідні, пак ще не зібраний**

Створи `scripts/build-moto-tracks.mjs`:

```js
// scripts/build-moto-tracks.mjs
// content/moto/tracks/<ліга>/<nn>-<slug>.json → public/moto/tracks/dril.mrg
// (пак для гри) + public/moto/tracks/dril.json (індекс українських назв).
//   node scripts/build-moto-tracks.mjs          — перевірити й записати
//   node scripts/build-moto-tracks.mjs --check  — лише перевірити, зокрема що
//                                                 public/moto/tracks актуальний
// --check іде в prebuild: npm run build (і Vercel) падає на зламаному треку
// або на забутому перезборі пака — «падіння скрипта = червона збірка» (спека).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { encodeMrg } from './lib/moto-mrg.mjs';
import { collectTracks, verifyRoundTrip } from './lib/moto-tracks.mjs';

const SITE_ROOT = fileURLToPath(new URL('..', import.meta.url));
const CONTENT_DIR = join(SITE_ROOT, 'content/moto/tracks');
const OUT_DIR = join(SITE_ROOT, 'public/moto/tracks');
const MRG_PATH = join(OUT_DIR, 'dril.mrg');
const INDEX_PATH = join(OUT_DIR, 'dril.json');
const checkOnly = process.argv.includes('--check');

const fail = (lines) => {
  for (const line of lines) console.error('✗', line);
  process.exit(1);
};

const { pack, index, errors } = collectTracks(CONTENT_DIR);
if (errors.length) fail(errors);
const mrg = encodeMrg(pack);
const roundTrip = verifyRoundTrip(pack, mrg);
if (roundTrip) fail([roundTrip]);
const indexJson = `${JSON.stringify(index, null, 2)}\n`;

if (checkOnly) {
  const stale = [];
  if (!existsSync(MRG_PATH) || !readFileSync(MRG_PATH).equals(mrg)) stale.push('dril.mrg');
  if (!existsSync(INDEX_PATH) || readFileSync(INDEX_PATH, 'utf8') !== indexJson) stale.push('dril.json');
  if (stale.length) {
    fail(
      stale.map((file) => `public/moto/tracks/${file} застарів — запусти node scripts/build-moto-tracks.mjs`)
    );
  }
} else {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(MRG_PATH, mrg);
  writeFileSync(INDEX_PATH, indexJson);
}

pack.leagues.forEach((league, l) => {
  const names = index.filter((entry) => entry.league === l).map((entry) => entry.name);
  console.log(`ok - ліга ${l + 1}, треків ${league.length}: ${names.join(', ')}`);
});
console.log(`ok - ${checkOnly ? 'перевірено' : 'записано'}: dril.mrg ${mrg.length} Б, round-trip збігся`);
```

Run: `npx eslint scripts/build-moto-tracks.mjs`
Expected: без виводу, код 0.

Run: `node scripts/build-moto-tracks.mjs --check; echo "exit=$?"`
Expected: два рядки `✗ public/moto/tracks/dril.mrg застарів — …` і `✗ public/moto/tracks/dril.json застарів — …`, `exit=1`. Помилок валідації (`✗ 1-lehka/…: …`) бути не повинно; якщо є — у JSON одрук, звір із кроками 1–3.

- [ ] **Step 5: Зібрати пак**

Run: `node scripts/build-moto-tracks.mjs`
Expected:

```
ok - ліга 1, треків 3: Перший дріл, Горби, Яр
ok - ліга 2, треків 3: Сходи, Трамплін, Хвилі
ok - ліга 3, треків 3: Зубці, Кручі, Стіна
ok - записано: dril.mrg 1397 Б, round-trip збігся
```

Run: `shasum -a 256 public/moto/tracks/dril.mrg public/moto/tracks/dril.json && node scripts/build-moto-tracks.mjs --check`
Expected: `a9984aea474cee256c9eb06b42b7f880ff72634d3da7a5647923630e9f0bb0e4  public/moto/tracks/dril.mrg`, `547f905513c9b8d79e6f4a1654561f997151cf7a3618d5225f03795c99283df3  public/moto/tracks/dril.json` (ті самі байти, що прогнали через двигун під час написання плану), далі `ok - перевірено: dril.mrg 1397 Б, round-trip збігся`, код 0. Інший хеш = одрук у точках; виправ до збігу, перш ніж грати.

- [ ] **Step 6: Перевірка треків у збірці — `prebuild`**

У `package.json` у блоці `scripts` після рядка `"dev": "next dev",` додай:

<!-- prettier-ignore -->
```json
    "prebuild": "node scripts/build-moto-tracks.mjs --check",
```

npm виконує `prebuild` перед кожним `npm run build`, зокрема на Vercel, тож зламаний трек або забутий перезбір пака дають червону збірку (спека, секція 4). Якщо в налаштуваннях Vercel Build Command колись перевизначать на голий `next build`, ця перевірка там не спрацює — тоді її тримає лише локальний прогін.

Run: `npm run prebuild`
Expected: чотири рядки `ok - …` як у кроці 5 (з «перевірено»), код 0. `npm run build` не запускай — dev-сервер працює.

- [ ] **Step 7: Приймання — кожен трек заїздом у дев-режимі гри (`?debug&json=`)**

Грає людина (розробник і, бажано, хтось, хто грав в оригінал) у Chrome на передньому плані, клавіатурою: ↑ газ, ↓ гальмо, ← → нахил. Кожен трек — байком своєї ліги.

1. У консолі DevTools на будь-якій сторінці `http://localhost:3000` відкрий тестовому простору `moto-play` усі три ліги. Заїзди з `?debug&json=` гра читає й пише в окремий ключ `${ns}:json:progress:v1` (передумова 5; план A, `GameShell.start`), тож ключ — `moto-play:json:progress:v1`; без `:json` гра побачить порожній прогрес `[1, 0, 0]`, і «Середня» з «Важкою» лишаться закритими. Пак із одного JSON містить той самий трек у кожній лізі:

```js
localStorage.setItem('moto-play:json:progress:v1', JSON.stringify({ best: {}, unlockedTracks: [1, 1, 1] }));
```

2. Згенеруй адреси (у терміналі з кореня `drill_shop`):

```bash
node -e '
const { readFileSync, readdirSync } = require("node:fs");
["1-lehka", "2-serednia", "3-vazhka"].forEach((dir, l) => {
  for (const file of readdirSync(`content/moto/tracks/${dir}`).sort()) {
    const body = readFileSync(`content/moto/tracks/${dir}/${file}`).toString("base64");
    const url = "http://localhost:3000/moto/index.html?debug&ns=moto-play&json=" + encodeURIComponent(`data:application/json;base64,${body}`);
    console.log(`\n[ліга ${l + 1}] ${dir}/${file}\n${url}`);
  }
});'
```

3. Для кожної з девʼяти адрес: відкрий її. Гра одразу стартує заїзд байком «Легкої» (ліга 0). Для треків ліг 2 і 3 постав паузу (Esc) → «До треків» → «До ліг» → обери лігу треку («Середня» чи «Важка») → «1. <назва треку>».

Критерії приймання, для кожного треку:

- байк на старті падає на колеса без падіння (якщо він «провалюється» під землю — вісь Y переплутана; такого з цими JSON бути не може, бо старт перевіряє валідатор);
- прапорці старту й фінішу стоять на лінії треку, секундомір рушає після прапорця старту, фініш показує екран фінішу;
- «Легка»: фініш з 1–3 спроби; «Перший дріл» — самим ↑ без нахилів;
- «Середня»: фініш не більше ніж за 10 спроб;
- «Важка»: фініш не більше ніж за 20 спроб; жодного місця, де байк застрягає без виходу.

Якщо трек не проходиться: знайди перешкоду за x — `node --no-warnings ../drill-moto/scripts/sim-track.mjs public/moto/tracks/dril.mrg --driver ai,gas,bot` (лише автопілоти, менше секунди; повний прогін із планувальником — крок 9) друкує `x=` місця падіння чи застрягання кожного автопілота для кожного треку, а на око — там, де падає людина. Зменш у JSON висоту/глибину саме цієї ділянки приблизно на чверть або розтягни її по x, `node scripts/build-moto-tracks.mjs`, повтори заїзд. Хеші з кроку 5 після такої правки, звісно, інші — запиши, які точки змінено, у тіло коміту.

- [ ] **Step 8: Приймання — увесь пак як у грі**

У консолі на `http://localhost:3000`:

```js
localStorage.setItem('moto-pack:progress:v1', JSON.stringify({ best: {}, unlockedTracks: [3, 3, 3] }));
```

Відкрий `http://localhost:3000/moto/index.html?ns=moto-pack` (без `debug`: гра бере `./tracks/dril.mrg` і `./tracks/dril.json`).
Expected: ліги «Легка», «Середня», «Важка», у кожній по три треки з українськими назвами з кроку 5 у тому самому порядку; будь-який трек запускається байком своєї ліги й проходиться так само, як у кроці 7.

Прибери тестові простори:

```js
Object.keys(localStorage)
  .filter((key) => /^moto-(play|pack|dev):/.test(key))
  .forEach((key) => localStorage.removeItem(key));
```

- [ ] **Step 9: Ворота прохідності — безголовий прогін форку з планувальником**

Спека (секція 4, «Авторинг»): прохідність перед комітом перевіряє безголовий симулятор форку на справжній фізиці — кожен трек мусить фінішувати хоча б одним водієм (демо-ІІ порту, «лише газ» або планувальник). Водії `sim-track.mjs` (передумова 9): `ai` — демо-ІІ порту, `gas` — лише газ, `bot` — газ і нахил проти тангажу, `plan` — планувальник, що кожні 100 мс перебирає на копії фізики натискання на 2,4 с уперед (верхня межа вправного гравця). Автопілоти слабші за людину й здаються після 10 с без просування, тож на цьому паку вони фінішують лише на «Першому дрілі» й «Горбах», а демо-ІІ на «Яру» (у таблиці на початку задачі — фініш за 48,6 с) тут дає `stuck`; решту проходить `plan`. Прогін триває ≈ 6–9 хв CPU (планувальник — 25–85 с на трек); агенту — `run_in_background`, бо ліміт одного виклику — 10 хв. Пісочниця не заважає: скрипт не ходить у мережу, а відбиток пака пишеться в `$TMPDIR` (кроки 9 і 10 — в одному середовищі, тож `$TMPDIR` той самий). З кореня `drill_shop`:

```bash
rm -f "$TMPDIR/moto-sim-ok.sha"
node --no-warnings ../drill-moto/scripts/sim-track.mjs public/moto/tracks/dril.mrg --driver ai,gas,bot,plan \
  && shasum -a 256 public/moto/tracks/dril.mrg > "$TMPDIR/moto-sim-ok.sha"; echo "exit=$?"
```

Expected (фізика двигуна й планувальник детерміновані; перевірено на відтвореному форку: `scripts/sim-track.mjs` дослівно з плану A, двигун upstream `889a091`, пак `a9984aea…`):

```
L0 T0 pershyi-dril ai: finish 12.99s | gas: finish 9.24s | bot: finish 9.19s | plan: finish 8.29s
L0 T1 horby        ai: finish 22.24s | gas: crash(5) 6.4s x=278 y=22 | bot: finish 18.29s | plan: finish 12.99s
L0 T2 yar          ai: stuck 19.3s x=294 y=8 | gas: crash(5) 4.0s x=192 y=-44 | bot: crash(5) 14.0s x=502 y=41 | plan: finish 12.23s
L1 T0 skhody       ai: crash(3) 2.3s x=26 y=19 | gas: crash(5) 3.8s x=146 y=56 | bot: crash(5) 6.0s x=146 y=50 | plan: finish 11.25s
L1 T1 tramplin     ai: crash(5) 16.1s x=704 y=-7 | gas: crash(5) 5.3s x=305 y=-13 | bot: crash(3) 5.6s x=314 y=-11 | plan: finish 10.89s
L1 T2 khvyli       ai: crash(5) 5.4s x=125 y=21 | gas: crash(5) 8.0s x=319 y=16 | bot: crash(5) 2.8s x=150 y=42 | plan: finish 11.99s
L2 T0 zubtsi       ai: stuck 17.8s x=415 y=60 | gas: crash(5) 2.1s x=131 y=20 | bot: crash(5) 3.3s x=262 y=18 | plan: finish 8.11s
L2 T1 kruchi       ai: stuck 13.8s x=46 y=28 | gas: crash(5) 5.1s x=13 y=27 | bot: crash(3) 11.3s x=319 y=89 | plan: finish 15.57s
L2 T2 stina        ai: stuck 13.2s x=133 y=54 | gas: crash(5) 2.8s x=147 y=79 | bot: crash(3) 17.9s x=455 y=6 | plan: finish 20.69s
9/9 треків фінішують хоча б одним водієм
exit=0
```

Частини `ai`, `gas`, `bot` мусять збігтися байт у байт; інакше при тому самому хеші пака у форку інший двигун — питання до плану A, а не до треків. Планувальник плану A детермінований (фіксований seed), тож і стовпець `plan` на цьому паку дає рівно ці числа; інші соті означають, що код планувальника у форку змінився. Ворота від цього не залежать: `plan: finish` мусить бути в кожному рядку. Жодного `fell` (старт під землею). Ворота пройдено, коли є рядок `9/9 треків фінішують хоча б одним водієм` і `exit=0`; тоді відбиток саме цього пака лежить у `$TMPDIR/moto-sim-ok.sha`, і крок 10 комітить лише його. `exit=1` або рядок без жодного `finish` — зупинись: трек непрохідний за спекою. Виправ його JSON за кроком 7, збери пак (`node scripts/build-moto-tracks.mjs`), пройди цей трек заново за кроками 7–8 і повтори цей крок; не комітить.

- [ ] **Step 10: Commit**

```bash
npx prettier --write content/moto/tracks package.json scripts/build-moto-tracks.mjs
node scripts/build-moto-tracks.mjs --check
shasum -a 256 -c "$TMPDIR/moto-sim-ok.sha" || { echo 'цей пак не проходив ворота кроку 9 (спека, секція 4) — повтори крок 9'; exit 1; }
npx prettier --check src/shared/config/dev-mode.ts || { echo 'dev-mode.ts не відформатований — зупинись і спитай власника'; exit 1; }
git add content/moto/tracks public/moto/tracks package.json scripts/build-moto-tracks.mjs
git status --short
git commit -m "feat(moto): девʼять треків трьох ліг і пак dril.mrg

Легка: Перший дріл, Горби, Яр; Середня: Сходи, Трамплін, Хвилі; Важка:
Зубці, Кручі, Стіна. Вісь Y вгору, масштаб оригіналу. Пак і індекс назв
збирає scripts/build-moto-tracks.mjs; prebuild (--check) перевіряє, що пак
зібраний із поточних JSON. Кожен трек фінішує в безголовому прогоні
форку sim-track.mjs (9/9, планувальник plan).

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

Expected: `--check` після prettier зелений (prettier змінив лише розкладку JSON, не дані); `public/moto/tracks/dril.mrg: OK` — комітиться той самий пак, що пройшов ворота кроку 9; у `git status --short` staged лише девʼять JSON, `public/moto/tracks/dril.mrg`, `public/moto/tracks/dril.json`, `package.json` і `scripts/build-moto-tracks.mjs`.

---

### Task 4: Сторінка `/moto`

**Files:**

- Modify: `src/shared/config/content.ts` (перед рядком `// ===== КНОПКИ =====`, зараз рядок 335)
- Create: `src/app/moto/moto-bridge.ts`
- Create: `src/app/moto/moto.module.scss`
- Create: `src/app/moto/MotoScreen.tsx`
- Create: `src/app/moto/page.tsx`
- Modify: `src/app/LayoutWrapper.tsx:19-24`
- Create: `public/assets/og/moto.png`

**Interfaces:**

- Consumes: бандл і пак у `public/moto/` (Task 2–3); `SiteLoader({ fill?: boolean })` з `@/shared/components/SiteLoader/SiteLoader`; `Button` з `@/shared/components/Button/Button` (`variant: 'primary' | 'ghost'`); `sendGAEvent(...args: Object[])` з `@next/third-parties/google` (є в установленій 16.0.7; модуль ініціалізує `GoogleAnalytics` у `layout.tsx` раніше за будь-який ефект сторінки); `useRouter` з `next/navigation`.
- Produces: маршрут `/moto`; `content.moto = { frameTitle, loadError, retry, exit }`; з `moto-bridge.ts`: `type MotoTheme = 'light' | 'dark'`, `type MotoMessage`, `MOTO_TRACKS_URL = '/moto/tracks/dril.mrg'`, `MOTO_NS = 'dril-moto'`, `readSiteTheme(): MotoTheme`, `buildMotoSrc(theme: MotoTheme): string`, `parseMotoMessage(data: unknown): MotoMessage | null`; `MotoScreen()`.

- [ ] **Step 1: Копі**

У `src/shared/config/content.ts` перед рядком `  // ===== КНОПКИ =====` встав:

<!-- prettier-ignore -->
```ts
  // ===== ГРА «ДРІЛ МОТО» (/moto) =====
  moto: {
    frameTitle: 'Дріл Мото',
    loadError: 'Не вдалося завантажити гру',
    retry: 'Спробувати ще раз',
    exit: 'Вийти',
  },

```

- [ ] **Step 2: Контракт із грою**

Створи `src/app/moto/moto-bridge.ts`:

```ts
// src/app/moto/moto-bridge.ts
// Контракт сайту з грою «Дріл Мото» (спека 2026-09-18-drill-moto-game-design,
// секція 1). Сайт → гра — лише query-параметри iframe; гра → сайт —
// postMessage з source 'dril-moto'. Без імпортів і без React: чисті функції.

export type MotoTheme = 'light' | 'dark';

export type MotoMessage =
  | { source: 'dril-moto'; type: 'ready'; version: string }
  | { source: 'dril-moto'; type: 'exit' }
  | { source: 'dril-moto'; type: 'finished'; league: number; track: number; timeMs: number; best: boolean };

/** Пак треків сайту (scripts/build-moto-tracks.mjs) і простір ключів localStorage гри. */
export const MOTO_TRACKS_URL = '/moto/tracks/dril.mrg';
export const MOTO_NS = 'dril-moto';

/** Тема сайту з data-theme (ставить інлайн-скрипт layout.tsx до першого кадру); на сервері — light. */
export const readSiteTheme = (): MotoTheme =>
  typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';

export const buildMotoSrc = (theme: MotoTheme): string =>
  `/moto/index.html?tracks=${MOTO_TRACKS_URL}&ns=${MOTO_NS}&theme=${theme}`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isInt = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value);
const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

/** event.data → повідомлення гри або null, якщо це щось інше (розширення, чужі скрипти). */
export const parseMotoMessage = (data: unknown): MotoMessage | null => {
  if (!isRecord(data) || data.source !== 'dril-moto') return null;
  if (data.type === 'ready') {
    return {
      source: 'dril-moto',
      type: 'ready',
      version: typeof data.version === 'string' ? data.version : '',
    };
  }
  if (data.type === 'exit') return { source: 'dril-moto', type: 'exit' };
  if (data.type !== 'finished') return null;
  const { league, track, timeMs, best } = data;
  if (!isInt(league) || !isInt(track) || !isFiniteNumber(timeMs) || typeof best !== 'boolean') return null;
  return { source: 'dril-moto', type: 'finished', league, track, timeMs, best };
};
```

- [ ] **Step 3: Стилі**

Створи `src/app/moto/moto.module.scss`. SCSS тут виправданий (варіант B правил стилізації): фіксований шар, `dvh`, `touch-action`, `overscroll-behavior` пропсами Mantine не задаються; `Button` і `SiteLoader` мають власні стилі, класів ми на них не вішаємо.

```scss
// src/app/moto/moto.module.scss
// Екран гри: рівно динамічний вʼюпорт (100dvh — адресний рядок iOS не ріже
// низ), сторінка не скролиться і не зумиться жестами — усі жести належать грі.
.screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100dvh;
  // globals.css дає main { min-height: 100vh }; на iOS 100vh вищий за видиму
  // область, і низ гри (тач-кнопки) сховався б під адресний рядок
  min-height: 0;
  overflow: hidden;
  touch-action: none;
  overscroll-behavior: none;
  background: var(--background);
}

.frame {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  touch-action: none;
}

// Скелетон поверх iframe, поки гра не сказала ready. display: block, не grid:
// SiteLoader з fill сам розтягується на 100% (пастка з container-type описана
// в SiteLoader.module.scss)
.overlay {
  position: absolute;
  inset: 0;
  background: var(--background);
}

.failed {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-6);
  background: var(--background);
  text-align: center;
}

.failedText {
  margin: 0 0 var(--space-2);
  font-size: var(--text-lg);
  font-weight: var(--fw-medium);
  color: var(--text-primary);
}
```

- [ ] **Step 4: `MotoScreen`**

Створи `src/app/moto/MotoScreen.tsx`. Кнопка «Вийти» на екрані помилки — поза буквою спеки, але без хедера це єдиний вихід, крім кнопки «назад» браузера; веде тим самим `leaveGame`, що й `exit` із гри.

```tsx
// src/app/moto/MotoScreen.tsx
// Екран гри «Дріл Мото»: iframe з бандлом public/moto/ на весь вʼюпорт,
// скелетон до повідомлення ready, таймаут 8 с з повтором, вихід і події GA
// за повідомленнями гри (контракт — moto-bridge.ts; спека, секції 1 і 3).
//
// iframe зʼявляється лише після гідрації: тема йде в нього query-параметром
// (гра — окремий документ і data-theme сайту не бачить), а на сервері теми
// ще нема. «Після гідрації» — useSyncExternalStore із серверним знімком false,
// той самий прийом, що в useDesignChoice. Сама тема — одноразовий знімок у
// useState: DesignClock може перемкнути data-theme посеред заїзду, і нова
// адреса iframe перезавантажила б гру.
'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { sendGAEvent } from '@next/third-parties/google';
import { Button } from '@/shared/components/Button/Button';
import { SiteLoader } from '@/shared/components/SiteLoader/SiteLoader';
import { content } from '@/shared/config/content';
import { buildMotoSrc, parseMotoMessage, readSiteTheme } from './moto-bridge';
import styles from './moto.module.scss';

type Status = 'loading' | 'ready' | 'failed';
type AppRouter = ReturnType<typeof useRouter>;

const READY_TIMEOUT_MS = 8000;
const noopSubscribe = () => () => {};

// Спека (секція 3): назад, лише якщо попередній запис історії — сторінка сайту;
// /moto відкрили напряму чи прийшли з іншого сайту — на головну. Navigation API
// бачить лише записи нашого origin (history.length рахує й чужі); без нього —
// history.length і referrer документа з нашого origin
const canGoBackInSite = () => {
  const nav = (window as Window & { navigation?: { canGoBack: boolean } }).navigation;
  if (nav) return nav.canGoBack;
  return window.history.length > 1 && document.referrer.startsWith(`${window.location.origin}/`);
};

const leaveGame = (router: AppRouter) => {
  if (canGoBackInSite()) router.back();
  else router.push('/');
};

export function MotoScreen() {
  const router = useRouter();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const openSentRef = useRef(false);
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
  const [src] = useState(() => buildMotoSrc(readSiteTheme()));
  const [status, setStatus] = useState<Status>('loading');
  // Ключ iframe: «Спробувати ще раз» монтує новий елемент. Зміна src того ж
  // iframe додала б запис в історію, і «Вийти» повертало б у гру, а не назад
  const [attempt, setAttempt] = useState(0);

  // Ref, а не просто []: StrictMode у dev монтує ефекти двічі — подія одна
  useEffect(() => {
    if (openSentRef.current) return;
    openSentRef.current = true;
    sendGAEvent('event', 'moto_open');
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const frame = frameRef.current;
      if (event.origin !== window.location.origin || !frame || event.source !== frame.contentWindow) return;
      const message = parseMotoMessage(event.data);
      if (message?.type === 'ready') {
        setStatus('ready');
        // Фокус у гру: без нього стрілки на десктопі йдуть сторінці, а не грі
        frame.contentWindow?.focus();
      } else if (message?.type === 'exit') {
        leaveGame(router);
      } else if (message?.type === 'finished') {
        const { league, track, timeMs, best } = message;
        sendGAEvent('event', 'moto_finish', { league, track, time_ms: timeMs, best });
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [router]);

  useEffect(() => {
    if (!hydrated || status !== 'loading') return;
    const timer = window.setTimeout(() => setStatus('failed'), READY_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [hydrated, status, attempt]);

  const retry = () => {
    setStatus('loading');
    setAttempt((n) => n + 1);
  };

  return (
    <main className={styles.screen}>
      {hydrated && (
        <iframe
          key={attempt}
          ref={frameRef}
          className={styles.frame}
          src={src}
          title={content.moto.frameTitle}
          allow="fullscreen"
        />
      )}
      {status === 'loading' && (
        <div className={styles.overlay}>
          <SiteLoader fill />
        </div>
      )}
      {status === 'failed' && (
        <div className={styles.failed} role="alert">
          <p className={styles.failedText}>{content.moto.loadError}</p>
          <Button variant="primary" onClick={retry}>
            {content.moto.retry}
          </Button>
          <Button variant="ghost" onClick={() => leaveGame(router)}>
            {content.moto.exit}
          </Button>
        </div>
      )}
    </main>
  );
}
```

Чому немає гонки між `ready` і слухачем: слухач `message` вішає пасивний ефект того самого коміту, у якому iframe уперше зʼявляється в DOM (після гідрації — у наступному коміті; після клієнтської навігації — у першому ж). Гра надсилає `ready` лише після того, як завантажила документ, бандл, пак треків, спрайти й шрифт і зібрала двигун, — на першому кадрі після показу власного сплешу (план A, `GameShell.start`: `requestAnimationFrame(() => bridge.ready(VERSION))`), тобто значно пізніше, ніж React виконає пасивні ефекти.

- [ ] **Step 5: Сторінка з метаданими**

Створи `src/app/moto/page.tsx`. Ні `dynamic`, ні `revalidate`: даних нема, Next сам збирає сторінку статичною.

```tsx
// src/app/moto/page.tsx
// «Дріл Мото» — гра на весь екран (спека docs/superpowers/specs/2026-09-18-drill-moto-game-design.md,
// секція 3). Серверна і статична: ні запитів, ні динамічних API — Next
// збирає її в готовий HTML. Сама гра — статичний бандл public/moto/ в iframe
// (MotoScreen); код гри сайт не імпортує.
import type { Metadata } from 'next';
import { MotoScreen } from './MotoScreen';

const TITLE = 'Дріл Мото — гра';
const DESCRIPTION =
  'Дріл Мото — мототріал у браузері: газ, гальмо, нахил і секундомір. Три ліги треків, рекорди зберігаються на твоєму пристрої.';
const PAGE_URL = 'https://www.ye-dril.com/moto';
const OG_IMAGE = 'https://www.ye-dril.com/assets/og/moto.png';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  robots: { index: true, follow: true },
  // openGraph і twitter сторінки ЗАМІНЮЮТЬ кореневі цілком (не зливаються),
  // тому кожне поле тут повне — інакше шер показав би назву магазину
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: 'Є.Дріл',
    locale: 'uk_UA',
    type: 'website',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Дріл Мото — головне меню гри' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function MotoPage() {
  return <MotoScreen />;
}
```

- [ ] **Step 6: `/moto` без хедера й футера**

У `src/app/LayoutWrapper.tsx` рядки 19–24

<!-- prettier-ignore -->
```tsx
  // Telegram сторінки - БЕЗ Header і Footer (свій окремий layout)
  const isTelegramPage = pathname?.startsWith('/telegram');

  if (isTelegramPage) {
    return <>{children}</>;
  }
```

заміни на

<!-- prettier-ignore -->
```tsx
  // Telegram сторінки - БЕЗ Header і Footer (свій окремий layout).
  // Гра /moto — теж: iframe на весь вʼюпорт, вихід — кнопкою самої гри (спека
  // 2026-09-18-drill-moto-game-design, секція 3). Точний збіг, а не startsWith:
  // під /moto/* лежать статичні файли бандла, а не сторінки застосунку.
  const isBareRoute = pathname?.startsWith('/telegram') || pathname === '/moto';

  if (isBareRoute) {
    return <>{children}</>;
  }
```

Разом із хедером і футером для `/moto` зникають `ThemeClock` і `EmailVerificationBanner` — так само, як для `/telegram`; тема вже стоїть з інлайн-скрипта `layout.tsx`, а `MotoScreen` рендерить власний `<main>`.

- [ ] **Step 7: Типи, лінт, розміри**

Run: `npx tsc --noEmit`
Expected: без виводу, код 0.

Run: `npx eslint src/app/moto src/app/LayoutWrapper.tsx src/shared/config/content.ts`
Expected: без виводу, код 0.

Run: `wc -l src/app/moto/MotoScreen.tsx`
Expected: ≤ 150 (≈ 127).

- [ ] **Step 8: Серверний HTML**

З вимкненою пісочницею:

```bash
curl -s http://localhost:3000/moto > "$TMPDIR/moto.html"
grep -o '<title>[^<]*</title>' "$TMPDIR/moto.html"
grep -o '<link rel="canonical"[^>]*>' "$TMPDIR/moto.html"
grep -o '<meta name="robots"[^>]*>' "$TMPDIR/moto.html"
grep -o '<meta property="og:image"[^>]*>' "$TMPDIR/moto.html"
grep -c 'site-header' "$TMPDIR/moto.html"; grep -c '<iframe' "$TMPDIR/moto.html"
curl -s http://localhost:3000/about | grep -c 'site-header'
```

Expected: `<title>Дріл Мото — гра | Є.Дріл</title>`; `<link rel="canonical" href="https://www.ye-dril.com/moto"/>`; `<meta name="robots" content="index, follow"/>`; `<meta property="og:image" content="https://www.ye-dril.com/assets/og/moto.png"/>`; `0` (хедера нема); `0` (iframe не в SSR — зʼявляється після гідрації); для `/about` — число ≥ 1 (хедер на місці).

- [ ] **Step 9: Поведінка в браузері (десктоп Chrome, реальне вікно на передньому плані)**

1. Відкрий `http://localhost:3000/moto`.
   Expected: сплеш сайту (Splash із layout.tsx, ≈0,9 с після гідрації; скелетон MotoScreen під ним такий самий на вигляд і на швидкому зʼєднанні не проглядає), потім сплеш гри «Дріл Мото» або одразу меню гри на весь екран, без хедера, футера й прокрутки. У Elements: `main` → `iframe[src="/moto/index.html?tracks=/moto/tracks/dril.mrg&ns=dril-moto&theme=light"]` (або `theme=dark`, якщо зараз темна тема сайту).
2. Фокус на `ready`: щойно зник скелетон, нічого не клікаючи, виконай у консолі (контекст `top`) `document.activeElement?.tagName`.
   Expected: `'IFRAME'` — MotoScreen перевів фокус у гру на `ready`. (Керування стрілками після кліків у меню цього не перевіряє: клік сам фокусує iframe.)
3. Консоль (контекст `top`): `dataLayer.filter((a) => a[0] === 'event').map((a) => a[1])`.
   Expected: `['moto_open']` — рівно один раз, попри StrictMode.
4. Фільтр джерела й походження. У консолі контекст `top`: `postMessage({ source: 'dril-moto', type: 'exit' }, '*')` → нічого не відбувається (джерело — не iframe). Перемкни контекст консолі на iframe `index.html`: `parent.postMessage({ source: 'чужий', type: 'exit' }, location.origin)` → нічого; `parent.postMessage({ source: 'dril-moto', type: 'finished', league: 'a' }, location.origin)` → нічого; `parent.postMessage({ source: 'dril-moto', type: 'finished', league: 0, track: 1, timeMs: 23450, best: true }, location.origin)`, потім у `top`: `dataLayer.filter((a) => a[1] === 'moto_finish').map((a) => a[2])`.
   Expected: `[{ league: 0, track: 1, time_ms: 23450, best: true }]`.
5. Вихід з історією: відкрий `http://localhost:3000/about`, потім у тій самій вкладці набери в адресному рядку `/moto`; у меню гри «Вийти».
   Expected: повернення на `/about`.
6. Вихід без історії: нова вкладка, одразу `http://localhost:3000/moto` (`history.length` у консолі — `1`), у меню гри «Вийти».
   Expected: головна `/`.
7. Вихід після чужого сайту: нова вкладка → `http://127.0.0.1:3000/about` (для браузера це інший origin, ніж `localhost:3000`; попередження dev-сервера про чужий origin тут неважливі — потрібен лише запис історії) → у тій самій вкладці набери `http://localhost:3000/moto` (у консолі `history.length` більше за 1 — зазвичай `3`, а `navigation.canGoBack` — `false`) → у меню гри «Вийти».
   Expected: `http://localhost:3000/`, а не `127.0.0.1:3000/about`.
8. Таймаут і повтор: DevTools → Network → правий клік по запиту `index.html?tracks=…` → «Block request URL», перезавантаж сторінку.
   Expected: скелетон рівно ~8 с, потім «Не вдалося завантажити гру» з кнопками «Спробувати ще раз» і «Вийти». Запамʼятай `history.length`. Зніми блокування (Network request blocking → прибрати правило), натисни «Спробувати ще раз».
   Expected: знову скелетон, потім меню гри; `history.length` не змінився.
9. Тема: у консолі `localStorage.setItem('theme', 'dark')`, перезавантаж.
   Expected: `src` iframe закінчується на `theme=dark`, гра темна. Поверни як було: `localStorage.removeItem('theme')` і перезавантаж.

- [ ] **Step 10: OG-обкладинка**

Обкладинка — знімок головного меню гри 1200×630 (дизайнер може пізніше покласти свою картинку за тим самим шляхом). З вимкненою пісочницею:

```bash
mkdir -p public/assets/og
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=1 --window-size=1200,630 --virtual-time-budget=6000 \
  --screenshot="$PWD/public/assets/og/moto.png" \
  "http://localhost:3000/moto/index.html?ns=og-shot&theme=light"
sips -g pixelWidth -g pixelHeight public/assets/og/moto.png
```

Expected: `pixelWidth: 1200`, `pixelHeight: 630`. Відкрий PNG: на ньому меню гри з назвою «Дріл Мото» і кнопками «Грати», «Рекорди», «Про гру», «Вийти», не сплеш і не порожній кадр. Синя фокусна рамка на «Грати» — очікувана (екран меню фокусує першу кнопку, спека, «Керування»); дизайнерська картинка за тим самим шляхом її прибере. Якщо видно сплеш — повтори з `--virtual-time-budget=10000`; якщо кадр порожній — зроби знімок руками: DevTools → Toggle device toolbar → Responsive 1200×630 на тій самій адресі → меню ⋮ → «Capture screenshot» і збережи як `public/assets/og/moto.png`.

- [ ] **Step 11: Commit**

```bash
npx prettier --write src/app/moto src/app/LayoutWrapper.tsx src/shared/config/content.ts
npx prettier --check src/shared/config/dev-mode.ts || { echo 'dev-mode.ts не відформатований — зупинись і спитай власника'; exit 1; }
git add src/app/moto src/app/LayoutWrapper.tsx src/shared/config/content.ts public/assets/og/moto.png
git status --short
git commit -m "feat(moto): сторінка /moto — гра на весь екран без хедера, скелетон, таймаут, GA

iframe монтується після гідрації з темою сайту в query, приймає лише
повідомлення свого iframe з того самого origin; exit веде назад або на
головну; moto_open і moto_finish ідуть у GA через sendGAEvent.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Статика `/moto/` — middleware, заголовки, sitemap

**Files:**

- Modify: `src/middleware.ts:55-59` (`config`)
- Modify: `next.config.ts:72-83` (`headers()`)
- Modify: `src/app/sitemap.ts:46-51` (після блоку `/faq`)

**Interfaces:**

- Consumes: файли `public/moto/**` (Task 2–3), сторінка `/moto` (Task 4).
- Produces: matcher, який пропускає `moto/`; заголовки `Cache-Control: public, max-age=31536000, immutable` для `/moto/assets/:path*` і `X-Robots-Tag: noindex` для `/moto/index.html`; `/moto` у sitemap.

- [ ] **Step 1: Перевірка matcher — спершу червона**

Команда компілює matcher з файлу `src/middleware.ts` тим самим кодом Next, яким його компілює збірка (`getMiddlewareMatchers`), і звіряє з очікуваннями:

```bash
node -e '
const { getMiddlewareMatchers } = require("next/dist/build/analysis/get-page-static-info");
const source = eval(/matcher:\s*\[\s*(\x27[^\x27]+\x27)/.exec(require("fs").readFileSync("src/middleware.ts", "utf8"))[1]);
const re = new RegExp(getMiddlewareMatchers([source], {})[0].regexp);
const expected = {
  "/moto": true, "/catalog": true, "/motorcycle": true, "/api/x": false,
  "/moto/index.html": false, "/moto/assets/index-a1.js": false, "/moto/assets/index-a1.css": false,
  "/moto/tracks/dril.mrg": false, "/moto/tracks/dril.json": false,
  "/moto/fonts/e-ukraine/e-Ukraine-Regular.woff2": false, "/moto/VERSION": false,
};
let bad = 0;
for (const [path, runs] of Object.entries(expected)) {
  const got = re.test(path);
  if (got !== runs) bad += 1;
  console.log(got === runs ? "ok  " : "FAIL", got ? "middleware" : "повз      ", path);
}
process.exit(bad ? 1 : 0);'; echo "exit=$?"
```

Expected (до правки): `FAIL middleware` для `/moto/index.html`, `/moto/assets/index-a1.js`, `/moto/assets/index-a1.css`, `/moto/tracks/dril.mrg`, `/moto/tracks/dril.json`, `/moto/VERSION` — на кожен такий файл зараз ходить `supabase.auth.getUser()`; `exit=1`.

- [ ] **Step 2: Matcher**

У `src/middleware.ts` блок

<!-- prettier-ignore -->
```ts
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf)).*)',
  ],
};
```

заміни на

<!-- prettier-ignore -->
```ts
// moto/ — бандл гри «Дріл Мото» (public/moto/: html, js, css, mrg, json, woff2):
// статика, якій сесія Supabase не потрібна. Сама сторінка /moto (без слеша)
// лишається під middleware, як і решта сторінок сайту.
export const config = {
  matcher: [
    '/((?!api|moto/|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf)).*)',
  ],
};
```

Прожени команду з кроку 1 ще раз.
Expected: одинадцять рядків `ok  …` (`/moto`, `/catalog`, `/motorcycle` — `middleware`; решта — `повз`), `exit=0`.

- [ ] **Step 3: Заголовки для бандлу**

У `next.config.ts` у `headers()` кінець масиву

<!-- prettier-ignore -->
```ts
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
```

заміни на

<!-- prettier-ignore -->
```ts
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      // Бандл гри «Дріл Мото»: файли в assets/ Vite називає за хешем вмісту,
      // тож вони незмінні — кеш назавжди (решту public/ Next віддає з max-age=0)
      {
        source: '/moto/assets/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      // Сирий документ гри — лише вміст iframe; в індекс іде сторінка /moto
      {
        source: '/moto/index.html',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex' }],
      },
    ];
```

`robots.txt` не змінюється: `Allow: /` уже відкриває `/moto`, а закривати `/moto/` через `Disallow` не можна — тоді Google не зміг би відрендерити сторінку з iframe.

- [ ] **Step 4: Sitemap**

У `src/app/sitemap.ts` одразу після блоку

<!-- prettier-ignore -->
```ts
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
```

встав

<!-- prettier-ignore -->
```ts
    {
      url: `${baseUrl}/moto`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
```

Кнопки-мотоцикла в хедері ще нема (поза спекою), тож sitemap — поки що єдиний шлях, яким пошук дізнається про `/moto`.

- [ ] **Step 5: Типи, лінт**

Run: `npx tsc --noEmit`
Expected: без виводу, код 0.

Run: `npx eslint next.config.ts src/app/sitemap.ts`
Expected: без виводу, код 0. (`src/middleware.ts` лінтер і до правки лаяв за `any` і `let` — ці три старі помилки не наші, правка їх не додає.)

- [ ] **Step 6: Перевірка на dev-сервері**

Зміна `next.config.ts` перезапускає dev-сервер сам (це робить Next, ми його не зупиняємо); зачекай, поки `curl http://localhost:3000/` знову відповідає. З вимкненою пісочницею:

```bash
curl -sI http://localhost:3000/moto/index.html | grep -i -E '^HTTP|x-robots-tag'
curl -sI http://localhost:3000/moto | grep -i -E '^HTTP|x-robots-tag'
curl -s http://localhost:3000/sitemap.xml | grep -o '<loc>https://www.ye-dril.com/moto</loc>'
curl -sI "http://localhost:3000/moto/assets/$(ls public/moto/assets | grep -m1 '\.js$')" | grep -i cache-control
```

Expected: `HTTP/1.1 200 OK` і `X-Robots-Tag: noindex` для `/moto/index.html`; для `/moto` — `200` без `X-Robots-Tag`; у sitemap рівно один рядок `<loc>https://www.ye-dril.com/moto</loc>`; для JS бандла — `Cache-Control: public, max-age=31536000, immutable` (dev-сервер віддає заголовки з `next.config.ts` і для файлів `public/`; перевірено на `next dev` 16.3). На проді (задача 6) — ще раз.

Відкрий `http://localhost:3000/moto` у браузері — гра вантажиться, як у задачі 4 (middleware на статиці бандлу більше не ходить до Supabase, але нічого й не ламає).

- [ ] **Step 7: Commit**

```bash
npx prettier --write src/middleware.ts next.config.ts src/app/sitemap.ts
npx prettier --check src/shared/config/dev-mode.ts || { echo 'dev-mode.ts не відформатований — зупинись і спитай власника'; exit 1; }
git add src/middleware.ts next.config.ts src/app/sitemap.ts
git status --short
git commit -m "chore(moto): статика /moto повз middleware, кеш і noindex для бандлу, /moto у sitemap

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Наскрізна перевірка за чеклістом спеки

**Files:** жодного нового. Якщо перевірка знаходить дефект сайту — правка йде у файли відповідної задачі 1–5 окремим комітом `fix(moto): …` з тим самим рядком `Co-Authored-By`; дефект гри — у план A. Перед таким комітом: `npx prettier --write <змінені файли>` (крім `public/moto/**` і `.prettierignore`), `npx prettier --check src/shared/config/dev-mode.ts` (не чисто — зупинись і спитай власника), `git add` лише цих файлів, `git status --short` — у staged лише вони.

**Interfaces:**

- Consumes: `node scripts/check-moto-tracks.mjs` (задача 1), `node scripts/build-moto-tracks.mjs --check` (задача 3); з `scripts/lib/moto-bundle.mjs` — `CODEBREW_SHA256`, `findCodebrewTraces`, `checkUpstreamName`, `gzipTotal`, `listFiles`, CLI `node scripts/sync-moto-bundle.mjs --tag vX.Y.Z` (задача 2); пак `public/moto/tracks/dril.mrg` з треками «Перший дріл», «Горби», «Яр» у «Легкій» (задача 3); сторінка `/moto`, `content.moto`, GA-події `moto_open`/`moto_finish` (задача 4); заголовки `/moto/index.html` і `/moto/assets/*`, `/moto` у sitemap (задача 5); з плану A — сплеш-заглушка `data-screen="boot"` і `<link rel="preload">` для `e-Ukraine-Bold.woff2` в `index.html` бандла (Task 11; передумова 10), лічильник `NN fps` у `?debug`, прогрес `${ns}:progress:v1`, умовна Task 14 («`Number` замість `BigInt` у гарячому шляху») з релізом `v0.1.1`, якщо на телефоні < 58 fps; Lighthouse 12 через `npx -y` (кроки 1 і 6); реальні iPhone і Android-телефон.

Нумерація нижче — пункти 1–15 чекліста спеки (секція 6). Пункти 5–8 і 10 — логіка гри (план A); тут вони перевіряються через `/moto`, щоб переконатися, що сторінка, iframe і тач-шар сайту їм не заважають.

- [ ] **Step 1: Автоматичні перевірки (пункти 1, 2, 13-бюджет, 15 і прогноз бюджету першого кадру)**

```bash
(cd ../drill-moto && npm run build && npm run lint); echo "fork-exit=$?"
node scripts/check-moto-tracks.mjs
node scripts/check-moto-bundle.mjs
node scripts/build-moto-tracks.mjs --check
npx tsc --noEmit
cat public/moto/VERSION
git ls-files | grep -iE 'levels[^/]*\.mrg$'; echo "levels-files-exit=$?"
node --input-type=module -e '
import { readFileSync } from "node:fs";
import { checkUpstreamName, findCodebrewTraces, gzipTotal, listFiles } from "./scripts/lib/moto-bundle.mjs";
const files = listFiles("public/moto").filter((f) => !f.startsWith("tracks/") && f !== "VERSION");
const problems = findCodebrewTraces("public/moto", files);
const upstreamName = checkUpstreamName(readFileSync("public/moto/index.html", "utf8"));
if (upstreamName) problems.push(upstreamName);
console.log(problems.length ? problems : "ok - public/moto без слідів Codebrew і назви upstream");
console.log(`gzip бандла: ${(gzipTotal("public/moto", files) / 1024).toFixed(1)} КБ (бюджет 300)`);
process.exit(problems.length ? 1 : 0);'
node --input-type=module -e '
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CODEBREW_SHA256 } from "./scripts/lib/moto-bundle.mjs";
const sha = (path) => { try { return createHash("sha256").update(readFileSync(path)).digest("hex"); } catch { return ""; } };
let bad = 0;
for (const repo of process.argv.slice(1)) {
  const files = execFileSync("git", ["-C", repo, "ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
  const hits = files.filter((file) => CODEBREW_SHA256.has(sha(join(repo, file))));
  bad += hits.length;
  console.log(hits.length ? `FAIL ${repo}: ${hits.join(", ")}` : `ok - ${repo}: ${files.length} файлів у git, жодного файлу Codebrew`);
}
process.exit(bad ? 1 : 0);' . ../drill-moto
node --input-type=module -e '
import { execFileSync } from "node:child_process";
// git blob id (SHA-1, як дає git hash-object) тих самих 12 файлів Codebrew з upstream 889a0914
// (src/assets і preview.gif). Ловить їх у будь-якому коміті, досяжному з HEAD або тегу, тобто в усьому, що план A
// пушить у публічний репозиторій (HEAD і тег релізу), незалежно від шляху й імені файлу
const CODEBREW_BLOBS = new Map([
  ["c5479e288479ef8028d5efe2e1769348b28a6957", "bluearm.png"],
  ["1691233817ffe4f0de4c56c971b8cefc4f5ab00f", "bluebody.png"],
  ["c04b0115f3eb84926784871a4b9039ab62f98cbf", "blueleg.png"],
  ["bf7e1f5ea266a724e538fa7ddcce112ffd04c22a", "engine.png"],
  ["4d703a7dffbbcce6e3f68866e131302a82d2adf9", "fender.png"],
  ["a9133b117641a6b6d19b693f35a2e123e2aaceb9", "helmet.png"],
  ["e495c2a359c51ae3feb064f0f79e2f9a6ea7736e", "levels.mrg"],
  ["32052b6879f59e82f1e0be2b4af96f4e4e1d91e4", "logo.png"],
  ["dcd745d68e94f68babc98139fefa556c7b3d9d44", "raster.png"],
  ["ad1ca93a5b0251c32ad67e210fb7593803b78f8c", "splash.png"],
  ["b6d2377f9c2af559e736dd00e6144ba47be936c5", "sprites.png"],
  ["df6eb0bc045badf8a4a86e836cc6d03b8f09a1ef", "preview.gif"],
]);
let bad = 0;
for (const repo of process.argv.slice(1)) {
  const objects = execFileSync("git", ["-C", repo, "rev-list", "--objects", "HEAD", "--tags"], {
    encoding: "utf8",
    maxBuffer: 1 << 28,
  }).split("\n");
  const hits = [...new Set(objects.map((line) => CODEBREW_BLOBS.get(line.slice(0, 40))).filter(Boolean))];
  bad += hits.length;
  console.log(hits.length ? `FAIL ${repo}: в історії HEAD і тегів є ${hits.join(", ")}` : `ok - ${repo}: в історії HEAD і тегів жодного блоба Codebrew`);
}
process.exit(bad ? 1 : 0);' . ../drill-moto
```

Expected: `fork-exit=0` — збірка й ESLint форку без помилок (пункт 2 чекліста; це інший репозиторій, `.next` сайту не зачіпається); `ok: 10 checks`; `ok: 8 checks`; `ok - перевірено: …`; `tsc` без виводу; мітка бандла; `levels-files-exit=1` (жодного файлу-пака з іменем `levels…mrg`); `ok - public/moto без слідів Codebrew і назви upstream` і gzip ≤ 300; два рядки `ok - … файлів у git, жодного файлу Codebrew` — для сайту і для форку; ще два рядки `ok - … в історії HEAD і тегів жодного блоба Codebrew` — для сайту і для форку. Сканується те, що піде на GitHub: HEAD (у форку це гілка `main`, яку власник пушить) і теги. За планом A (Task 1, Step 1) історія форку починається зі знімка upstream без його історії, а оригінальні асети лежать лише в довідковому клоні `../gd-upstream`, який не є remote форку й не пушиться. Тож `FAIL ../drill-moto: в історії …` означає, що файл Codebrew потрапив у коміт форку; це дефект плану A, реліз зупиняється. Скан перевірено під час написання плану: на репозиторії сайту — `ok`, на клоні upstream — `FAIL` з усіма 12 файлами. Будь-який `FAIL` зупиняє реліз.

Прогноз бюджету першого кадру до пушу (спека, секція 2, «Бюджети»: перший кадр гри — LCP документа гри ≤ 1,5 с у мобільному профілі Lighthouse за замовчуванням). Після пушу `v2` одразу прод, тож міряємо ще до кроку 5, на dev-сервері. З вимкненою пісочницею, як у кроці 6 (headless Chrome і кеш `npx` у `~/.npm`):

```bash
for i in 1 2 3; do
  npx -y lighthouse@12 "http://localhost:3000/moto/index.html?ns=lh-check" --only-categories=performance --output=json \
    --output-path="$TMPDIR/moto-game-lh-dev-$i.json" --chrome-flags="--headless=new" --quiet
  node -e 'console.log("LCP гри (dev):", Math.round(require(process.argv[1]).audits["largest-contentful-paint"].numericValue), "мс")' "$TMPDIR/moto-game-lh-dev-$i.json"
done
```

Expected: три рядки `LCP гри (dev): N мс`, медіана ≤ 1500. Dev-сервер віддає `public/` з gzip, як прод, а `/moto/index.html` — статичний файл без дев-скриптів Next, тож це прогноз проду: під час перевірки плану на тому самому бандлі dev і `next start` розійшлися не більше ніж на 10 мс (без сплешу-заглушки dev — 1806–1814 мс, `next start` — 1804–1807 мс). Прод відрізняється хіба що HTTPS (рукостискання TLS), тож медіана на самій межі (1400–1500) — ризик, про який варто сказати власнику до пушу. Критичний ланцюжок документа гри (план A, Task 11): html → паралельно CSS ≈ 2 КБ, JS ≈ 29 КБ і e-Ukraine Bold ≈ 37 КБ (`<link rel="preload">`) → сплеш-заглушка з `index.html` (заголовок «Дріл Мото» — найбільший елемент); пак, індекс назв, Medium і двигун гра вантажить лише після того, як браузер її показав. Відтворено на бандлі з цією правкою: 1352–1355 мс (без неї — 1803–1808 мс). Медіана більша за 1500 — зупинись до кроку 5: бюджет спеки не виконано. Це дефект плану A: перевір, що в `public/moto/index.html` є `data-screen="boot"` і preload `e-Ukraine-Bold.woff2`. На бандлі без заглушки (1803–1814 мс) цей пункт зупиняє реліз — див. передумову 10.

- [ ] **Step 2: Десктоп (пункти 9, 10, 11, 12, 14)**

Chrome, реальне вікно, `http://localhost:3000/moto` у свіжому профілі гостя (прогрес `dril-moto` порожній):

1. Пункт 11: у заїзді стрілки керують, Escape ставить паузу й знімає її; під канвасом рядок-підказка клавіш, тач-кнопок нема.
2. Пункт 9: проїдь «Перший дріл» (досить тримати ↑) → відкривається «Горби»; проїдь «Горби» і «Яр» → відкривається «Середня». Повтори «Перший дріл» повільніше — рекорд не змінився; швидше — змінився. Перезавантаж сторінку — прогрес і рекорди на місці.
3. Пункт 10: «Рекорди» → «Скинути прогрес» → підтвердити → відкритий лише перший трек «Легкої».
4. Пункт 12: (а) відкрий `http://localhost:3000/about`, у тій самій вкладці набери в адресному рядку `/moto`, у меню гри «Вийти» → повернення на `/about`; (б) нова вкладка, одразу `http://localhost:3000/moto` (`history.length` у консолі — `1`), у меню гри «Вийти» → головна `/`; (в) нова вкладка → `http://127.0.0.1:3000/about` (інший origin) → у тій самій вкладці `http://localhost:3000/moto` → у меню гри «Вийти» → `http://localhost:3000/`, а не сторінка чужого origin.
5. Пункт 14: у темній і світлій темі сайту (перемкни `localStorage.setItem('theme', 'dark' | 'light')` і перезавантаж, потім `localStorage.removeItem('theme')`) — у Elements усередині iframe піпеткою DevTools контраст тексту меню і HUD ≥ 4.5:1 (DevTools показує «Contrast ratio» з позначкою AA).
6. Подія фінішу: після кожного фінішу `dataLayer.filter((a) => a[1] === 'moto_finish').at(-1)[2]` → `{ league, track, time_ms, best }` з реальними значеннями.

- [ ] **Step 3: iPhone Safari (пункти 3, 5, 6, 7, 8, 12 і бюджет 60 fps)**

Телефон у тій самій Wi-Fi. Спека (ризик «iframe на iOS») вимагає перевірки на реальному iPhone до злиття, а пуш `v2` — це вже прод, тож кроки 3 і 4 виконуються лише на dev-сервері по LAN і лише до кроку 5. Dev-сервер пускає LAN-адресу лише з `allowedDevOrigins` у `next.config.ts` (зараз `192.168.0.171`); перевір адресу Mac: `ipconfig getifaddr en0`. Якщо вона інша — тимчасово допиши її в `allowedDevOrigins` локально й НЕ комітить (Next перезапустить dev-сервер сам). Телефон відкриває `http://<LAN-адреса Mac>:3000/moto`. Після кроку 4 поверни рядок до `allowedDevOrigins: ['192.168.0.171'],` і перевір: `git diff --quiet next.config.ts && echo next-config-clean` → `next-config-clean` (інакше крок 5.3 покаже ` M next.config.ts`).

1. Пункт 3, портрет: хедера нема, гра на весь екран, низ із тач-кнопками не ховається під адресний рядок, свайп по екрану не скролить сторінку, подвійний тап по кнопках не зумить, довгий тап не відкриває контекстне меню.
2. Пункт 5: газ + «назад» одночасно — вілі; відпустив одну кнопку — друга тримається.
3. Пункт 6: палець зʼїжджає з «ГАЗ» — газ тримається до відпускання.
4. Пункт 7: падіння → «Падіння. Ще раз через 3…2…1» і рестарт; тап по екрану під час відліку — рестарт одразу.
5. Пункт 8: пауза зупиняє секундомір; посеред заїзду згорни Safari на 30 с і повернись — гра на паузі, час не стрибнув.
6. Пункт 12: відкрий `/about`, потім у тій самій вкладці набери `/moto`, «Вийти»: у Safari з Navigation API (iOS 26+) → `/about`; у старішому Safari → `/` (без Navigation API й без referrer сайт не знає, звідки прийшли; це очікувано). Відкрий `/moto` у новій вкладці → «Вийти» → головна. Запиши версію iOS.
7. Бюджет 60 fps (спека, секція 2, «Бюджети»; ризик «Продуктивність на старих телефонах»). На iPhone 11 (якщо його нема — на найстарішому доступному iPhone; запиши модель) відкрий у Safari гру напряму з лічильником кадрів: `<хост>/moto/index.html?debug&ns=fps-check`, де `<хост>` — `http://<LAN-адреса Mac>:3000`, як у всьому цьому кроці. «Грати» → «Легка» → «1. Перший дріл», тримай «ГАЗ» до фінішу й дивись на `NN fps` під HUD ліворуч (лічильник плану A оновлюється раз на секунду і є лише з `?debug`).
   Expected: від першого показання (≈1 с після старту) до фінішу ≥ 58 fps. Хоч раз нижче 58 — зупинись: це ризик спеки «Продуктивність на старих телефонах» (секція 6). Виконується умовна Task 14 плану A («`Number` замість `BigInt` у гарячому шляху»): швидкий шлях у `Number` для значень, що вкладаються в int32, у `src/cpp.ts` і `GameCanvas.ts`, BigInt — запасний, результат біт у біт той самий; реліз форку `v0.1.1`. Далі — крок 5, пункт 1 цієї задачі з `TAG=v0.1.1` (синхронізація, повтор кроку 1, коміт) і кроки 3–4 заново. До того реліз не приймається. Ключ `fps-check:progress:v1` на телефоні тестувальника нешкідливий.

- [ ] **Step 4: Android Chrome (пункти 4, 5, 6, 7 і бюджет 60 fps)**

Те саме, що крок 3, у портреті й в альбомі: в альбомі видно більше треку, тач-кнопки на місці, нічого не обрізано; поворот телефона посеред заїзду не перезавантажує гру.

Сьомий пункт переліку з кроку 3 (бюджет 60 fps, лічильник `?debug`) — на Android-телефоні середнього класу 2021 року (запиши модель), у Chrome.
Expected: від першого показання до фінішу «Першого дрілу» ≥ 58 fps; нижче — та сама зупинка, що в кроці 3.

- [ ] **Step 5: Ворота перед пушем (власник)**

1. `cat public/moto/VERSION` — тег релізу `vX.Y.Z`. Якщо там `local+…`, власник публікує реліз форку й називає тег; виконавець синхронізує з ним, повторює крок 1 і комітить:

```bash
TAG=v0.1.0   # тег, який назвав власник
node scripts/sync-moto-bundle.mjs --tag "$TAG"
cat public/moto/VERSION
npx prettier --check src/shared/config/dev-mode.ts || { echo 'dev-mode.ts не відформатований — зупинись і спитай власника'; exit 1; }
git add public/moto
git status --short
git commit -m "chore(moto): бандл гри з релізу $(cat public/moto/VERSION)

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

Expected: `VERSION` дорівнює `$TAG`; у `git status --short` staged лише `public/moto/…` (prettier тут не потрібен: `public/moto/` у `.prettierignore`); `src/shared/config/dev-mode.ts` лишається ` M`.

2. У бандлі справжні спрайти дизайнера, а не кольорові плейсхолдери плану A. Рішення за власником; без них на прод поїдуть блоки.
3. `git status --short` показує лише ` M src/shared/config/dev-mode.ts` і документи власника в `docs/superpowers/` (неттрековані плани `?? docs/superpowers/plans/…` і, якщо власник ще не закомітив спеку, ` M docs/superpowers/specs/2026-09-18-drill-moto-game-design.md`); жодного іншого ` M` чи `??`. `git log --oneline -6` показує коміти задач 1–5 (і коміт пересинхронізації, якщо він був).

Пушить власник; `v2` одразу стає продом.

- [ ] **Step 6: Прод (пункт 13, бюджет першого кадру і заголовки)**

Після деплою Vercel:

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://www.ye-dril.com/moto
curl -s https://www.ye-dril.com/moto | grep -o '<title>[^<]*</title>'
curl -s https://www.ye-dril.com/moto | grep -o '<link rel="canonical"[^>]*>'
curl -sI https://www.ye-dril.com/moto/index.html | grep -i x-robots-tag
curl -sI "https://www.ye-dril.com/moto/assets/$(ls public/moto/assets | grep -m1 '\.js$')" | grep -i cache-control
curl -s https://www.ye-dril.com/sitemap.xml | grep -c '<loc>https://www.ye-dril.com/moto</loc>'
```

Expected: `200`; `<title>Дріл Мото — гра | Є.Дріл</title>` — саме так: `<title>Дріл Мото</title>` означало б, що `/moto` віддає сирий `public/moto/index.html` замість сторінки App Router (код 200 цього не розрізняє), і тоді зупинись — реліз не прийнято; `<link rel="canonical" href="https://www.ye-dril.com/moto"/>`; `x-robots-tag: noindex`; `cache-control: public, max-age=31536000, immutable`; `1`. (Код відповіді — через `-w '%{http_code}'`, а не `curl -sI … | head -1`: у пісочниці першим рядком іде відповідь проксі `HTTP/1.1 200 Connection Established`.)

Lighthouse (мобільний профіль за замовчуванням), тричі, береться медіана — з вимкненою пісочницею (headless Chrome і кеш `npx` у `~/.npm`):

```bash
for i in 1 2 3; do
  npx -y lighthouse@12 https://www.ye-dril.com/moto --only-categories=performance --output=json \
    --output-path="$TMPDIR/moto-lh-$i.json" --chrome-flags="--headless=new" --quiet
  node -e 'console.log("Performance:", Math.round(require(process.argv[1]).categories.performance.score * 100))' "$TMPDIR/moto-lh-$i.json"
done
```

Expected: медіана ≥ 80. Якщо менше — у звіті Lighthouse «Minimize main-thread work» покаже, чий код важчий: чанки Next сторінки чи JS гри в iframe; це вхід для окремого рішення (відкладений монтаж iframe, легший бандл у плані A), а не правка навмання.

Підтвердження бюджету першого кадру на проді (спека, секція 2, «Бюджети»: перший кадр гри (сплеш) — LCP документа гри ≤ 1,5 с у мобільному профілі Lighthouse за замовчуванням; прогноз до пушу — крок 1); цей цикл Lighthouse теж з вимкненою пісочницею. Метрики сторінки `/moto` вмісту iframe не враховують, тож міряється сам документ гри. Мобільний профіль Lighthouse за замовчуванням емулює мережу RTT 150 мс і 1,6 Мбіт/с і вчетверо повільніший процесор. Перший кадр гри — сплеш-заглушка з `index.html` із заголовком «Дріл Мото» шрифтом e-Ukraine Bold (план A, Task 11). Браузер показує її ще до пака й двигуна, і це найбільший елемент документа, тож LCP документа гри і є першим кадром. Тричі, береться медіана:

```bash
for i in 1 2 3; do
  npx -y lighthouse@12 "https://www.ye-dril.com/moto/index.html?ns=lh-check" --only-categories=performance --output=json \
    --output-path="$TMPDIR/moto-game-lh-$i.json" --chrome-flags="--headless=new" --quiet
  node -e 'console.log("LCP гри:", Math.round(require(process.argv[1]).audits["largest-contentful-paint"].numericValue), "мс")' "$TMPDIR/moto-game-lh-$i.json"
done
```

Expected: три рядки `LCP гри: N мс`, медіана ≤ 1500. Більше — зупинись: бюджет спеки не виконано (прогноз кроку 1 мав зловити це до пушу), рішення за власником; спершу перевір, що в бандлі на проді є сплеш-заглушка `data-screen="boot"` і preload `e-Ukraine-Bold.woff2` (передумова 10).

Chrome на телефоні або DevTools з емуляцією: Network з фільтром `/moto/`, перезавантаження без кешу — сума стовпця Transferred ≤ 300 КБ (пункт 13).

Поділись посиланням `https://www.ye-dril.com/moto` у Telegram (собі в «Збережене»): прев'ю з назвою «Дріл Мото — гра | Є.Дріл», описом і обкладинкою меню.

---

## Самоперевірка плану (виконано при написанні)

- **Покриття спеки.** Секція 1 (сайтова половина: `public/moto/` з `VERSION`, `content/moto/tracks` → `dril.mrg`, скрипти синхронізації й збірки, сторінка, `LayoutWrapper`, контракт параметрів і повідомлень) — задачі 1–5. Секція 3 (статична сторінка з метаданими, canonical, OG; iframe `100dvh`/`overflow: hidden`/`touch-action: none`; скелетон `SiteLoader`; таймаут 8 с з повтором; вихід; стилі лише на токенах; `VERSION` не читається сторінкою) — задача 4. Вихід (`router.back()` лише в межах сайту за `navigation.canGoBack`, інакше `/`) — задача 4, крок 4, перевірка з чужим origin — задача 4, крок 9 і задача 6, крок 2. Секція 4 (формат JSON, `.mrg`, правила двигуна й внутрішні правила сайту, перевірки перед записом, `--check` як `prebuild`, round-trip, калібрування з оригіналом поза репо, авторинг через `?debug&json=`, мінімум три треки на лігу) — задачі 1 (кодек, правила, перевірки) і 3 (CLI збірки, треки, `prebuild`); `.prettierignore` для бандла й пака — задача 2, перед першим комітом `public/moto/`; прохідність перед комітом безголовим симулятором форку (кожен трек фінішує хоча б одним водієм) — задача 3, крок 9, і коміт у кроці 10 бере лише пак, що пройшов його. Секція 6 (жодного файлу Codebrew, зокрема `preview.gif`, ні в бандлі, ні в сайті, ні в історії форку за HEAD і тегами; `LICENSE.txt`/`NOTICE.txt` у бандлі, «Gravity Defied» не в метаданих, чекліст 1–15, бюджети, ризик «Продуктивність на старих телефонах» з умовною Task 14 плану A) — задачі 2 і 6. Бюджети секції 2: 300 КБ gzip — задачі 2 і 6 (крок 1 і 6); перший кадр гри (сплеш) — LCP документа гри ≤ 1,5 с у мобільному профілі Lighthouse — задача 6, крок 1 (прогноз на dev-сервері до пушу) і крок 6 (підтвердження на проді), а передумова 10 вимагає від плану A сплеш-заглушку в `index.html`, без якої бюджет не виконується (1803–1814 мс); 60 fps на iPhone 11 і Android 2021 — задача 6, кроки 3–4 (лічильник `?debug`); ці кроки йдуть лише на dev-сервері по LAN до воріт перед пушем (крок 5), бо ризик «iframe на iOS» у спеці вимагає перевірки на реальному iPhone до злиття, а пуш `v2` — уже прод. Усі чотири бюджети переписано в Global Constraints. GA-події — задача 4. Middleware, sitemap, `noindex` сирого документа — задача 5.
- **Свідомі відхилення від тексту спеки.** На екрані помилки є «Вийти», бо без хедера іншого виходу нема; `<title>` містить суфікс кореневого шаблону « | Є.Дріл», як усі сторінки сайту — див. Global Constraints. Усе, що раніше стояло тут (≥ 150 одиниць до старту — внутрішнє правило сайту — і після фінішу — правило двигуна; колеса на старті; `prebuild`; скан історії git форку за HEAD і тегами; LCP документа гри в мобільному профілі Lighthouse як бюджет першого кадру; `preview.gif` серед 12 відбитків Codebrew), тепер записане в самій виправленій спеці; ілюстративний JSON секції 4 спеки (180 одиниць до старту, 160 після фінішу, старт на 18) валідатор приймає.
- **Плейсхолдери.** Кожен крок із кодом містить повний код; треки — повні JSON; очікувані виводи й хеші наведені, зокрема повний вивід `sim-track.mjs --driver ai,gas,bot,plan` на паку сайту. Прохідність треків — ворота спеки: `sim-track.mjs` форку з планувальником, `9/9` і exit 0 (задача 3, крок 9), а коміт (крок 10) звіряє відбиток пака, що пройшов ворота; плюс заїзди людини (кроки 7–8) за записаними там критеріями. Планувальник плану A детермінований (фіксований seed), тож увесь вивід, включно зі стовпцем `plan`, відтворюється байт у байт; ворота — `finish` у кожному рядку, `9/9` і exit 0. Єдині умовні гілки — зупинки: трек, який не проходить ворота (задача 3, крок 9), прогноз LCP > 1500 до пушу (задача 6, крок 1; бандл без сплешу-заглушки — передумова 10) і < 58 fps на телефоні (задача 6, кроки 3–4, з умовною Task 14 плану A і поверненням у крок 5).
- **Залежності від плану A.** Задача 1 і кроки 1–6 задачі 3 від форку не залежать (калібрування в задачі 1, крок 5 — лише якщо вже є довідковий клон `../gd-upstream`); решта — після повного плану A. Передумови 1–10 перелічують, що форк мусить дати: самодостатній `dist/` з ліцензіями, реліз `dist.zip` із вмістом `dist/` у корені, контракт URL і `postMessage` із `ready` на першому кадрі сплешу, індекс назв, ключі прогресу (`${ns}:progress:v1` і окремий `${ns}:json:progress:v1`), `?debug&json=`, бюджет 300 КБ gzip лише з чотирма вагами e-Ukraine, публічну історію без блобів Codebrew, `scripts/sim-track.mjs` з водієм `plan` (`--driver ai,gas,bot,plan`; `--driver ai,gas,bot` — без планувальника; результат `timeout 90s` серед можливих), сплеш-заглушку `data-screen="boot"` із preload e-Ukraine Bold для бюджету першого кадру. Номери задач плану A — за його нумерацією після пʼятого проходу: Task 1–13 і умовна Task 14. Interfaces задач 2, 3 і 6 виписують ці властивості прямо, а номери передумов там лише для довідки.
- **Узгодженість імен.** `encodeMrg`/`decodeMrg`/`START_SCALE`/`LEAGUE_COUNT`; `LEAGUE_DIRS`, `WHEEL_DX`/`WHEEL_DROP`/`WHEEL_GAP_MIN`, `validateTrack`, `collectTracks`, `verifyRoundTrip`, `groundAt`; `CODEBREW_SHA256`, `BUNDLE_BUDGET_GZIP`, `REQUIRED_FILES`, `resolveBundleRoot`, `listFiles`, `findCodebrewTraces`, `checkRelativeBase`, `checkUpstreamName`, `gzipTotal`; `MotoTheme`, `MotoMessage`, `MOTO_TRACKS_URL`, `MOTO_NS`, `readSiteTheme`, `buildMotoSrc`, `parseMotoMessage`, `MotoScreen`; `content.moto.{frameTitle, loadError, retry, exit}` — однакові в усіх задачах. Код скриптів і сторінки перед записом плану прогнано: перевірки зелені (10 і 8, калібрування — 11), `tsc` проти типів сайту чистий, ESLint сайту чистий, prettier сайту не змінює жодного рядка, matcher звірено компілятором Next, пак із девʼяти треків прочитано двигуном порту. Після другого проходу перевірки код задачі 1 (з правилом коліс) і девʼять JSON знову витягнуто з плану й прогнано: 10 перевірок (з оригінальним паком — 11), 8 перевірок бандлу, хеші пака `a9984aea…` і індексу `547f9055…` ті самі, prettier і ESLint сайту чисті, `checkGeometry` — 27 рядків; `sim-track.mjs` форку на цьому паку дає рівно частини `ai`/`gas`/`bot` виводу задачі 3, кроку 9. Після третього проходу `moto-bundle.mjs` і `check-moto-bundle.mjs` з 12 відбитками знову витягнуто з плану й прогнано: 8 перевірок зелені, ESLint і prettier сайту чисті; обидва скани задачі 6, кроку 1 (файли в git і блоби в історії HEAD і тегів) на репозиторії сайту дають `ok`, на клоні upstream 889a0914 — `FAIL` з усіма 12 файлами, зокрема `preview.gif`. У четвертому проході `canGoBackInSite` і `leaveGame` із задачі 4, кроку 4 пройшли `tsc` 5.8 сайту (`strict`, `lib dom`) і prettier сайту без змін. Перевірки четвертого проходу на відтворених форку й сайті: `navigation.canGoBack` у headless Chrome (чужий origin → `/`, `/about` → `/moto` → назад на `/about`, нова вкладка → `/`); `sim-track.mjs` з планувальником на паку `a9984aea…` — `9/9`, exit 0; `Cache-Control` бандла вже на `next dev`; LCP документа гри на dev і на `next start` однаковий (≈ 1806 мс). Перевірки пʼятого проходу: `sim-track.mjs` плану A дослівно, з двигуном upstream `889a091`, на паку `a9984aea…` дає весь вивід задачі 3, кроку 9, включно зі стовпцем `plan`; LCP документа гри на бандлі плану A без сплешу-заглушки — 1804–1814 мс (dev і `next start`), зі сплешем-заглушкою — 1352–1355 мс; вихід у Chrome зі схованим `window.navigation` (як Safari до iOS 26): перехід на `/moto` посиланням з `/about` → назад на `/about`, набраний URL `/moto` після `/about` → `/`, нова вкладка → `/`; на швидкому зʼєднанні `ready` приходить за 0,35–0,52 с після навігації, ще під сплешем сайту. Після перенесення CLI збірки пака в задачу 3 і `.prettierignore` у задачу 2 задача 1 комітить три файли, Interfaces задач 2, 3 і 6 перелічують, звідки що береться, а номери кроків задачі 3 не змінились.

## Зміни після перевірки

- Залежності від плану A: задача 1 і кроки 1–6 задачі 3 незалежні, кроки 7–8 задачі 3 — лише після задачі 2; задачі 2–6 — після всього плану A (Task 1–13).
- Передумови доповнено пунктом 7 (бюджет 300 КБ gzip лише з чотирма вагами e-Ukraine, а не всією текою шрифтів сайту) і пунктом 8 (публічна історія форку без блобів Codebrew).
- Global Constraints: хости мережі й пастка `HTTPS_PROXY` для `curl -I`; тека запуску команд; хук переписує весь робочий каталог, тож `prettier --check` для `dev-mode.ts` перед комітом; Next сам перезапускає dev-сервер після правки `next.config.ts`; текст інтерфейсу — у `content.moto`, метадані — у `page.tsx`; рядок про свідомі відхилення від спеки.
- Факти про трек: підйом старту в оригіналах 14,8–30 (типово 14,8–20,5, названо винятки); секундомір рушає від переднього колеса (`bikeParts[1]`), фініш — будь-яким колесом; коментар у `moto-tracks.mjs` вирівняно.
- Задача 1, крок 9: `.prettierignore` більше не передається в `prettier --write` (нема парсера, код виходу 2), але лишається в `git add`.
- Задача 2: нова перевірка `checkUpstreamName` (назва «Gravity Defied» в `index.html` бандла) у модулі, перевірках (тепер 8) і в `sync-moto-bundle.mjs`; код прогнано на копії (8/8, prettier і ESLint сайту чисті, upstream `index.html` відхиляється з кодом 1).
- Задача 2: пояснення про `curl` більше не приписує спеці `gh release download`; «відхилення» прибрано із самоперевірки.
- Задача 2, крок 6: наявність релізу — `curl -s -o /dev/null -w '%{http_code}'` (відповіді `302`/`404`) замість `curl -sI | head -1`, який у пісочниці повертає рядок проксі.
- Задача 2, крок 7: запити `/moto/assets/` і `/moto/fonts/` — 200 (уточнено в другому проході: у `?debug&json=` індекс `dril.json` не запитується взагалі).
- Задача 3, крок 8: прохідність вирішують заїзди людини; `sim-track.mjs` плану A — довідковий прогін пака з записаним виводом (уточнено в другому проході).
- Задача 4: виправлено пояснення, чому нема гонки між `ready` і слухачем (клієнтська навігація, сплеш гри); перевірка фокусу на `ready` — через `document.activeElement` без кліків.
- Задача 6, крок 1: збірка й `npm run lint` форку (пункт 2 чекліста); у `public/moto` перевіряється ще й назва upstream; скан історії git сайту й форку (`rev-list --objects HEAD --tags`) за blob id 11 файлів Codebrew — перевірено: сайт `ok`, клон upstream `FAIL` з усіма 11 (у третьому проході додано `preview.gif`, стало 12).
- Задача 6, крок 3: після перевірки на iPhone `allowedDevOrigins` повертається до `192.168.0.171` з перевіркою `git diff --quiet`.
- Задача 6, крок 5: пересинхронізація з тегом — повна команда з `TAG`, `git status --short` перед комітом, повідомлення коміту бере тег із `VERSION`; зламану нумерацію пунктів 2–3 виправлено.
- Задача 6, крок 6: прод перевіряється кодом через `-w '%{http_code}'`, `<title>` і canonical сторінки App Router (сирий документ гри з `<title>Дріл Мото</title>` зупиняє реліз).
- Самоперевірку оновлено: відхилення від спеки, плейсхолдери, залежності від плану A, імена й кількість перевірок (10 і 8).

### Другий прохід перевірки

- Правило коліс на старті: `WHEEL_DX = 14`, `WHEEL_DROP = 8`, `WHEEL_GAP_MIN = 7`, `distanceToGround` і перевірка в `checkGeometry` (`moto-tracks.mjs`), фікстура `/вʼязне/` у `check-moto-tracks.mjs`, рядок у Global Constraints, Interfaces і «Фактах про трек»; кількість перевірок і хеші пака не змінились.
- Задача 1, крок 5: калібрування бере оригінальний пак із довідкового клону `../gd-upstream`, а не з неіснуючого remote `upstream` форку; коментар у `check-moto-tracks.mjs` вирівняно.
- Задача 3, крок 7: тестові ліги відкриваються ключем `moto-play:json:progress:v1` (режим `?debug&json=` пише прогрес окремо); кнопка екрана треків — «До ліг»; передумова 5 описує обидва ключі.
- Задача 3, крок 8 і передумова 9: `sim-track.mjs` форку — довідковий прогін пака сайту з повним детермінованим виводом (2/9, `exit=1`); ним же шукають `x` перешкоди в кроці 7; посилання «кроки 6–7» виправлено на «7–8».
- Передумова 2 і коментар `resolveBundleRoot`: `dist.zip` релізу містить вміст `dist/` у корені (`cd dist && zip -r ../dist.zip .`).
- Передумова 3, задача 4 (пояснення про гонку, крок 9): `ready` приходить на першому кадрі сплешу гри (у `?debug&json=` — заїзду), після пака, спрайтів і шрифту; висновок «гонки нема» не змінився.
- Передумова 8, Global Constraints, задача 6 (крок 1), самоперевірка: форк — не клон upstream, а історія від знімка `git archive` без remote; скан історії лишається як страховка.
- Задача 2, крок 7: у `?debug&json=` гра не запитує ні `dril.mrg`, ні `dril.json`, тож жодного 404; заїзд стартує одразу.
- Коміти всіх задач (і правила для `fix(moto)` у задачі 6): перед `git add` — `npx prettier --check src/shared/config/dev-mode.ts` із зупинкою, якщо файл не відформатований.
- Задача 6, кроки 3–4: бюджет 60 fps на iPhone 11 і Android 2021 через лічильник `?debug` (≥ 58 fps весь заїзд, інакше зупинка й заміна BigInt у плані A).
- Задача 6, крок 6: бюджет «перший кадр меню ≤ 1,5 с на 3G» — LCP документа гри в мобільному профілі Lighthouse, медіана трьох прогонів; тлумачення записано в Global Constraints.

### Третій прохід перевірки

- Global Constraints: кожна команда починається з `cd "…/drill_shop" && …`, бо cwd агента скидається на `DRILL 2.0` (не git-репозиторій); наведено, що без цього ламається (скриншот OG, `git add`).
- Global Constraints і задача 6, крок 6: обидва цикли Lighthouse — лише з вимкненою пісочницею (headless Chrome, кеш `npx` у `~/.npm`, де на запис відкритий лише `_logs`); `curl` на прод можна в пісочниці з `allowed_domains`.
- Global Constraints: рядок бюджетів містить усі чотири бюджети спеки (300 КБ gzip, перший кадр меню ≤ 1,5 с на 3G, 60 fps на iPhone 11 і Android 2021, Lighthouse ≥ 80).
- Codebrew: `preview.gif` upstream (запис оригінальної гри) рахується файлом Codebrew, як у плані A — 12 відбитків у `CODEBREW_SHA256` (задача 2, кроки 1–2, Interfaces) і 12 blob id у `CODEBREW_BLOBS` (задача 6, крок 1); рядок у Global Constraints і відхилення від переліку спеки записано; код прогнано: 8/8, ESLint і prettier чисті, upstream `FAIL` з усіма 12.
- Задача 2: новий крок 8 «Лінт нових скриптів» (`npx eslint` трьох скриптів і `eslint.config.mjs`), коміт став кроком 9.
- Задача 6, кроки 3–4: iPhone і Android перевіряються лише на dev-сервері по LAN до кроку 5 (спека вимагає перевірки на iPhone до злиття, пуш `v2` — уже прод); варіант «на проді після пушу» прибрано, `<хост>` у пункті 7 — лише LAN-адреса Mac.
- Задача 6, крок 2, пункт 4: процедура виходу (пункт 12) виписана повністю, без посилання на задачу 4.
- Задача 6, Interfaces: Consumes перелічує конкретні скрипти, функції `moto-bundle.mjs`, пак і назви треків, сторінку й GA-події, заголовки й sitemap, лічильник `?debug` і ключ прогресу плану A.
- Задача 6, крок 5, пункт 3: у `git status --short` допускаються документи власника в `docs/superpowers/` (неттрековані плани й незакомічена спека), і більше нічого.
- Самоперевірку оновлено: покриття бюджетів і порядок перевірок на телефонах, відхилення щодо `preview.gif`, результати прогону з 12 відбитками.

### Четвертий прохід перевірки

- Задача 3: прохідність треків — ворота спеки (секція 4, «Авторинг»), а не довідка. Новий крок 9 запускає `sim-track.mjs --driver ai,gas,bot,plan` з планувальником: очікується `9/9`, exit 0, а відбиток пака пишеться в `$TMPDIR/moto-sim-ok.sha`. Коміт став кроком 10 і звіряє цей відбиток (`shasum -c`). У кроці 7 швидкий прогін — `--driver ai,gas,bot`. Оновлено вступ задачі, передумову 9 і самоперевірку.
- Вихід: `canGoBackInSite` — `navigation.canGoBack` (лише записи нашого origin), без Navigation API — `history.length > 1` і `referrer` з нашого origin. Раніше `window.history.length > 1` виводив на чужий сайт. Змінено Global Constraints, задачу 4 (крок 4, `wc -l` ≈ 127, новий пункт 7 кроку 9 з чужим origin; «Таймаут» і «Тема» стали пунктами 8–9) і задачу 6, крок 2, пункт 4 (в).
- Задача 6, крок 1: прогноз бюджету першого кадру (LCP документа гри, три прогони Lighthouse на dev-сервері) до воріт перед пушем. Крок 6 лишився підтвердженням на проді й отримав назву «бюджет першого кадру»; рядок про пісочницю в Global Constraints охоплює кроки 1 і 6.
- Global Constraints, передумова 7, самоперевірка: з «відхилень» прибрано те, що вже записано у виправленій спеці (150/150, колеса, `prebuild`, історія git, `preview.gif`, LCP). Відхиленнями лишились «Вийти» на екрані помилки і суфікс « | Є.Дріл». Рядок треків містить правила 150/150 і порядок прапорців, рядок бюджетів — LCP у мобільному профілі Lighthouse. Шрифти посилаються на секцію 2 спеки, а не на секцію 5.
- Задача 5, крок 6: `Cache-Control` для `/moto/assets/*` перевіряється вже на dev-сервері; на проді — ще раз.
- Global Constraints: перший коміт перевирівнює таблиці незакоміченої спеки власника в робочому дереві. Її не стейджити й не відкочувати.
- Задача 4, крок 10: синя фокусна рамка на «Грати» в OG-знімку очікувана.
- Задача 6, крок 3, пункт 7: < 58 fps запускає умовну Task 14 плану A (`Number` для int32, BigInt — запасний, реліз `v0.1.1`). Далі — крок 5, пункт 1 з `TAG=v0.1.1` і кроки 3–4 заново.
- Interfaces задач 2 і 3 прямо виписують, що беруть із плану A: `dist/` і `dist.zip`, чотири ваги e-Ukraine і бюджет `gzipTotal`, `?debug&json=` без запитів пака, шлях меню «До треків» → «До ліг», ключі прогресу, індекс `dril.json`, формат виводу `sim-track.mjs`.

### Пʼятий прохід перевірки

- Номери задач плану A — за його нинішньою нумерацією (Task 1–13, умовна Task 14): передумови 1–2 (ліцензії й `release.yml` — Task 13, Step 3), 8 (перевірка першого коміту — Task 1, Step 9), 9 (`sim-track.mjs` — Task 3, Step 4, еталонний вивід — Step 5), 10 (сплеш-заглушка — Task 11), Interfaces і крок 6 задачі 2 (Task 13), Interfaces і крок 3 задачі 6, самоперевірка й попередні проходи (умовна Task 14 замість Task 6, «Task 1–13» замість «Task 1–5»).
- Бюджет першого кадру: нова передумова 10 — `index.html` бандла зі сплешем-заглушкою `data-screen="boot"` і preload e-Ukraine Bold (план A, Task 11); без неї 1803–1814 мс, з нею 1352–1355 мс; поки заглушки нема, виконуються лише задачі 1–5 і крок 1 задачі 6. Задача 6, крок 1 — новий критичний ланцюжок і перевірка `data-screen="boot"`; крок 6 — перший кадр як сплеш-заглушка; Interfaces задачі 6.
- Задача 3, крок 9: стовпець `plan` — справжній вивід детермінованого планувальника плану A на паку `a9984aea…`, пояснення про соті переписано; під таблицею на початку задачі — примітка, що її складено авторським прогоном.
- `sim-track.mjs` може дати `timeout 90s` (ліміт `--seconds`): передумова 9 і Interfaces задачі 3.
- Задачу 1 розвантажено без перенумерації задач: CLI `build-moto-tracks.mjs` переїхав у задачу 3, крок 4 (ESLint там же, файл у коміті кроку 10), `.prettierignore` — у задачу 2, крок 5 (у `git add` кроку 9); задача 1 — сім кроків і три файли; Interfaces задач 2, 3 і 6 оновлено.
- Задача 4, крок 9, пункт 1: очікувана послідовність на швидкому зʼєднанні — сплеш сайту ховає скелетон MotoScreen, далі сплеш гри або одразу меню.
- Задача 6, крок 3, пункт 6: вихід на iPhone — `/about`, потім набраний `/moto`: з Navigation API (iOS 26+) назад на `/about`, у старішому Safari — `/`; версія iOS записується.
- Задача 3, крок 1: пари точок prettier розкладає в кроці 10 (коміт), а не 9.
- Передумови 3 і 7: `ready` — після першого екрана `GameShell`, який прибирає сплеш-заглушку; ваги 700 і 500 — до першого кадру меню (спека, «Локалізація»).
- Самоперевірку оновлено: покриття (задачі 1, 2, 3 після перенесення, передумова 10), детермінований вивід `plan`, передумови 1–10 і нумерація плану A, результати перевірок пʼятого проходу.
