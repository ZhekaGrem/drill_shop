# Радіо Цибуля

Колекція з двох чорних футболок на `tshirt.glb`: **«Щільний салют»** і **«Голос андеграунда»**. Спереду в обох логотип «Радіо Цибуля», ззаду — свій принт. Колір логотипа на грудях випадковий, тому 3D-модель по черзі показує всі п'ять варіантів (рожевий, жовтий, бірюзовий, фіолетовий, білий) з плавним переходом. Під сценою стоїть підпис «Колір грудей випадковий — на анімації показані можливі варіанти.»

Рішення власника (2026-11-02): ціна 1250 грн (спершу 1000, з 2026-11-02 по 2026-11-09 — 900); розміри S–XXL по 100 на кожну футболку (з 2026-11-09; спершу S/M/L із залишками 1/2/3); колекція перша на головній (`home-collections.ts`, `sortOrder` −2). Опис колекції — дослівно від власника, він же в `src/shared/config/radio-tsybulia.json`.

## Як це працює

- `radio-tsybulia.json` — єдине джерело: колекція, ціна, залишки, підпис, атласи товарів і вирізки грудей.
- `texture3dUrl` кожного товару — повний атлас 4096² з першим кольором грудей.
- `useChestCycle` (у `TshirtScene`) вантажить п'ять вирізок прямокутника грудей (~635×429) і в шейдері підміняє ними цей прямокутник атласу, перетікаючи кольори на годиннику `print-cycle.ts` (той самий, що в хустинки). П'ять повних атласів на футболку коштували б ~450 МБ відеопам'яті; вирізки — кілька МБ, і вони спільні для обох футболок.
- Картка товару в перемикачі й обкладинка колекції — рендер **спини**: перед у футболок однаковий.

## Відтворення

Вихідні файли — тека `../радіо цибуля ` поруч із репозиторієм (`груди 1–5.png`, `спина 1–2.png`). Потрібні Pillow (`/opt/homebrew/bin/python3.14`), Blender 5.2 і `3d/artists/prokliatyi/new-merch/tshirt-mesh.json` (`node scripts/new-merch/export-mesh.cjs`).

```sh
/opt/homebrew/bin/python3.14 scripts/radio-tsybulia/build-textures.py
/Applications/Blender.app/Contents/MacOS/Blender --disable-autoexec -b -P scripts/radio-tsybulia/render-posters.py -- "$PWD"
node scripts/radio-tsybulia/publish-images.cjs
node scripts/radio-tsybulia/verify.cjs
```

Принти вирізаються з чорного (або прозорого) паперу як «фарба над тканиною» (8,8,8) і кладуться в ті самі зони, що й у інших футболок (`scripts/new-merch/uv_layout.py`): груди — масштаб 0.6, спина — 0.8. Генератор перевіряє, що фарба не виходить за UV-маску.

### Оберт для картки каталогу (turntable)

Як у решти товарів: 48 кадрів, 480×600, 83 мс, кадр 0 — постер. Колір грудей тут теж змінюється: сцена тримає кожен колір 3,5 с, але на картці це було б п'ять обертів і ~4 МБ, тому кольори йдуть по 4 кадри у вікні ±10 кадрів навколо фронту, коли груди видно (фіолетовий, білий, **рожевий на кадрі 0**, жовтий, бірюзовий). Розклад — у `turntable-worklist.cjs`, рендер — `3d/pipeline/batch-turntables.py` з текстурою на кожен кадр (`frameTextures`).

```sh
node scripts/radio-tsybulia/turntable-worklist.cjs
/Applications/Blender.app/Contents/MacOS/Blender --disable-autoexec -b -P 3d/pipeline/batch-turntables.py -- 3d/artists/radio-tsybulia/turntable-worklist.json public/3d/models 3d/artists/radio-tsybulia/turntable-frames 48 960 1200
/opt/homebrew/bin/python3.14 3d/pipeline/encode-batch.py 3d/artists/radio-tsybulia/turntable-frames 3d/artists/radio-tsybulia/turntables
# прод (Cloudinary + рядки turntable/turntable_poster): копія скрипта мусить лежати в бекенді, щоб знайти його пакети
cp 3d/pipeline/upload-turntables.mjs ../drill-shop-backend/scripts/.tmp-upload-turntables.mjs
(cd ../drill-shop-backend && node scripts/.tmp-upload-turntables.mjs ../drill_shop/3d/artists/radio-tsybulia/turntables && rm scripts/.tmp-upload-turntables.mjs)
```

## База

`scripts/radio-tsybulia/create-collection.cjs` на спільному рушії `scripts/lib/seed-collections.cjs` (залишки по розмірах — `stockBySize`). Записи потребують `--apply --confirm=radio-tsybulia`:

```sh
node scripts/radio-tsybulia/create-collection.cjs --phase=check
node scripts/radio-tsybulia/create-collection.cjs --phase=create --apply --confirm=radio-tsybulia
node scripts/radio-tsybulia/create-collection.cjs --phase=images --dir=3d/artists/radio-tsybulia/catalog-images --apply --confirm=radio-tsybulia
# після деплою фронта з текстурами:
node scripts/radio-tsybulia/create-collection.cjs --phase=activate --probe=https://ye-dril.com --apply --confirm=radio-tsybulia
REVALIDATE_SECRET=… node scripts/radio-tsybulia/create-collection.cjs --phase=revalidate --apply --confirm=radio-tsybulia
```
