# Худі №3 — обрана модель

З трьох кандидатів для сайту обрано худі №3 (`3d/нове худі  3/Hoodie.blend`):
один матеріал, один примітив, вихідний PSD-шаблон для принта. Оригінали худі №1
і №2 перенесені в `3d/unused/source/`, їхні вебверсії, постери й проміжні файли
видалені — за потреби відтворюються цими ж скриптами.

| Модель | GLB, байти |  МіБ | Трикутники до → після | Матеріали / примітиви |
| ------ | ---------: | ---: | --------------------: | --------------------: |
| Худі 3 |    1067904 | 1,02 |       1569280 → 59996 |                 1 / 1 |

Це характеристики файлу, не вимірювання FPS або GPU-пам’яті.

## Де худі №3 уже в продажу

«Культурний Фронт» (`buba`, колекція «Гонорове вар'ятство»):
`public/3d/models/hoodie-buba.glb` — геометрія худі №3 із запеченим принтом
`3d/боба.png`. Шлях моделі в базі не мінявся (`/3d/models/hoodie-buba.glb`), тож
заміна — це лише деплой; `public/` віддається з `max-age=0`. Попередня модель
лежить у `3d/unused/models/hoodie-buba-v1.glb`.

Нова модель відрізняється від `public/3d/models/lab/hoodie-3.glb` тільки картинкою
base-color (і зсувами в буфері); геометрія, normal і roughness — ті самі байти.

Картинки товару в Cloudinary (`render3d`, `turntable`, `turntable_poster`)
рендеряться окремо; готові файли під нове худі —
`3d/artists/varyatstvo/kulturnyi-front-hoodie-3/`, заливка —
`3d/pipeline/upload-render3d.mjs` і `upload-turntables.mjs` (пишуть у прод).

## Запекти новий принт

Розгортка — 2048×2048 під UV худі №3 (`3d/hoodie-comparison/hoodie-3-textures/`,
там `uv-wireframe.png`): верхній ряд — спина, другий — перед із кишенею, нижче —
рукави, праворуч — капюшон і дрібні деталі. Тло розгортки має бути залите
кольором тканини повністю — тоді швам не потрібен запас.

```sh
node scripts/3d/bake-hoodie-print.mjs TOOLS_DIR "3d/ПРИНТ.png" public/3d/models/НАЗВА.glb 3d/hoodie-comparison/НАЗВА-render.glb
```

Скрипт бере проміжний `3d/hoodie-comparison/hoodie-3-render.glb`, міняє base-color
на WebP без втрат і стискає Meshopt так само, як `optimize-hoodie.mjs`. Другий
файл (без Meshopt) — для рендерів у Blender. Нова модель у `public/3d/models/`
додається через `git add -f` (тека в `.gitignore`).

Постер і кадри turntable (Cycles, прозорий фон, кут у градусах):

```sh
Blender --disable-autoexec -b -P scripts/3d/render-hoodie.py -- 3d/hoodie-comparison/НАЗВА-render.glb OUT.png [КУТ]
```

Світло з `3d/pipeline/turntable.py` для цієї моделі не годиться: темна тканина
виходить сірою. Turntable «Культурного Фронту» — 48 кадрів `render-hoodie.py`,
обрізаних із 1000² до 800×1000 і зменшених до 480×600 (83 мс, q80).

## Лабораторія /v2/lab

`http://localhost:3000/v2/lab`, гілка `v2`, потрібні `DEV_MODE = true` і
`npm run dev`. Hero базової моделі №3 та окремі hero `#hoodie-3-design-1` і
`#hoodie-3-design-2` з `3d/дизайн 1.png` / `3d/дизайн 2.png`: той самий GLB,
змінюється тільки base-color через `mapUrl`. Компоненти — чинні `HeroVisual` /
`TshirtScene`, світло й камера як у магазині. Кнопки перемикають 3D/постер і
скидають обертання; поза видимою областю сцена демонтується.

Текстури дизайнів — WebP без втрат (500046 і 156008 байтів), піксельна тотожність
джерелам перевірена. Написи на нижній резинці перевернуті відповідно до наданої
текстури й UV; автоматичної корекції дизайну немає.

Оновлення дизайнів: `node scripts/3d/prepare-hoodie-designs.mjs TOOLS_DIR`, потім
`render-hoodie.py` для обох `hoodie-3-design-N-render.glb` → `hoodie-3-design-N.png`,
потім `node scripts/3d/prepare-hoodie-designs.mjs TOOLS_DIR publish`. Метадані та
хеші кешу — `src/app/v2/lab/hoodie-designs.json`.

## Як зібрана вебверсія

Інструменти: Blender 5.2; Node; glTF Transform 4.4.2 (`core`, `extensions`,
`functions`), `meshoptimizer`, `sharp`. `TOOLS_DIR` — каталог, де ці Node-пакети
встановлено; до залежностей магазину вони не додані.

1. `scripts/3d/inspect-hoodie.py` створює інвентар Blender-сцени.
2. Експорт у статичній позі — тільки об’єкт `Hoodie`, кадр 150; UV, матеріал і
   текстури збережені:

   ```sh
   Blender --disable-autoexec -b "3d/нове худі  3/Hoodie.blend" -P scripts/3d/export-hoodie.py -- 3d/hoodie-comparison/hoodie-3-export.glb 150 Hoodie
   ```

3. Оптимізація:

   ```sh
   node scripts/3d/optimize-hoodie.mjs TOOLS_DIR 3d/hoodie-comparison/hoodie-3-export.glb public/3d/models/lab/hoodie-3.glb 3d/hoodie-comparison/hoodie-3-report.json 3d/hoodie-comparison/hoodie-3-render.glb
   ```

4. Постер — `render-hoodie.py` із проміжного GLB без Meshopt (див. вище).
5. `node scripts/3d/publish-hoodie-lab.mjs` створює WebP-постер і метрики
   (`src/app/v2/lab/hoodie-metrics.json`). Хеші в URL оновлюють кеш моделі.

Оригінал не перезаписується. Вебверсія — статична поза без Blender-анімацій,
shape keys, камер і декорацій; обертання додає сайт. Масштаб і центр нормалізовані.
Геометрія стиснена Meshopt, кольорові текстури WebP до 2048², карти normal/roughness
до 1024². Постери — справжні рендери в Blender; їхнє освітлення відрізняється від
інтерактивної сцени.

Проміжні експорти й звіти лежать у локальному ігнорованому `3d/hoodie-comparison`.
Готові ресурси лаби — у `public/3d/models/lab` і `public/assets/img/lab`.
