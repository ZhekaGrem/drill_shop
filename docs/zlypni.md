# «є. Злипні»: Футболярчики і Бобаночки

Окремий розділ на `/zlypni`, як «є. \*\*\*»: своя словомарка в хедері, свій пункт «Колекція», товари не потрапляють на головну й у загальний каталог. Дві колекції по 100 дизайнів, кожен у 3D:

| Колекція     | slug                    | Модель         | Ціна     | Розміри           |
| ------------ | ----------------------- | -------------- | -------- | ----------------- |
| Футболярчики | `zlypni-futboliarchyky` | `tshirt.glb`   | 1250 грн | S–XXL, по 100 шт. |
| Бобаночки    | `zlypni-bobanochky`     | `hoodie-3.glb` | 2500 грн | S–XXL, по 100 шт. |

Рішення власника (2026-11-16): назва «Злипні», свій розділ, футболки 1250 грн, худі 2500 грн, по 100 штук кожного розміру.

## Сторінка

`src/app/zlypni` → `widgets/ZlypniSection`: герої обох колекцій (`HomeHeroes`, 3D з перемикачем-компасом), під ними всі дизайни сіткою (`widgets/CollectionGrid`) — картки каталогу з розміром і «в кошик», картка веде на 3D-сторінку товару `/v2/a/<slug>`. Сітка показує 12 карток і далі «Показати ще» по 24. Дані — з того самого `GET /collections`, що й герої: `useCollections` кладе в кожен товар готову картку (`widgets/ProductV2/card-product.ts`).

Компас довгої колекції вантажить одразу лише мініатюри поруч з активною, решту — ліниво (`CompassSwitcher`, `EAGER_RADIUS`).

`src/shared/config/zlypni.ts` — словомарка, адреса, slug-и колекцій і `ZLYPNI_LIVE`. Поки `false`, хедер розділу не показує, а сторінка пише «скоро» і закрита від індексації.

## Розгортки

Дизайнери малюють на шаблонах з `../Злипні/шаблони розгорток` (`scripts/zlypni/make-templates.py`): контури деталей, маска, підписи й аркуш «що де на 3D». Деталі визначено за геометрією моделей і перевірено рендером: кожну пофарбовано своїм кольором, модель знято з чотирьох боків. Виворіт спини футболки, підкладку корпусу й рукавів худі не видно; пояс худі в шаблоні перевернутий.

Перший комплект — `../Злипні/uv-2026-11-16`: 100 футболок і 100 худі, PNG 4096² на тих самих моделях (SHA-256 збігаються з `public/3d/models`), назви й номери в `manifest.json`. Однакові назви сімейства отримують номер варіанта: «Липкий знак №1…№5».

## Конвеєр

```sh
# 1. Розгортки → public/3d/textures/zlypni/<колекція>/NNN.webp (4096² q90) і scripts/zlypni/catalog.json
/opt/homebrew/bin/python3.14 scripts/zlypni/import-uv.py "../Злипні/uv-2026-11-16"
# 2. Кожен товар на моделі спереду й ззаду (пропускає вже свіжі кадри)
/Applications/Blender.app/Contents/MacOS/Blender --disable-autoexec -b -P scripts/zlypni/render-posters.py -- "$PWD"
# 3. Фото для карток і render3d, контактні аркуші для перевірки
node scripts/zlypni/publish-images.cjs
/opt/homebrew/bin/python3.14 scripts/zlypni/contact-sheet.py   # 3d/artists/zlypni/*-превʼю.jpg
# 4. База (прод): товари темні, далі фото в Cloudinary
node scripts/zlypni/create-collection.cjs --phase=create --apply --confirm=zlypni
node scripts/zlypni/create-collection.cjs --phase=images --dir=3d/artists/zlypni/catalog-images --apply --confirm=zlypni
# 5. Після деплою фронта з текстурами й ZLYPNI_LIVE = true — увімкнути
node scripts/zlypni/create-collection.cjs --phase=activate --probe=https://ye-dril.com --apply --confirm=zlypni
```

`import-uv.py` зупиняється на неквадратних, замалих і прозорих файлах і попереджає, коли багато малюнка поза деталями (чужа викрійка або свідома заливка всього аркуша — остаточно вирішують рендери). Без ціни в `catalog.json` `create-collection.cjs` не запускається. Ціна чи залишки змінюються так само, як у «Радіо Цибулі»: правка `catalog.json` → `--phase=create` (ціна й назви; залишки не чіпає) або `--phase=stock --qty=N`.
