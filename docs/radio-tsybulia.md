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
