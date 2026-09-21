# Повний магазин v3 поруч із v2

v3 збирається з `basePath: /v3`: сторінки, API Next, оптимізовані зображення, шрифти, 3D та Moto належать цьому префіксу. v2 залишається на корені домену. Це два окремі Next-деплої з одним бекендом. Вхід і гостьовий кошик на основному домені спільні; ключі дизайну й теми v3 ізольовані (`drill-v3-design`, `drill-v3-theme`).

## Публікація власником Vercel

1. У команді `zhekagrems-projects` створити окремий проєкт `drill-shop-v3` для `ZhekaGrem/drill_shop`, Production Branch — `v3`.
2. Перенести змінні середовища чинного магазину у Production нового проєкту. Не надсилати секрети в чат. Додати `NEXT_PUBLIC_STOREFRONT_BASE_PATH=/v3`.
3. Зібрати останній коміт гілки `v3`. Перевірена команда збірки: `npm run build -- --webpack`.
4. Перевірити в інкогніто `https://<фактичний-домен-проєкту>.vercel.app/v3`. Потрібна публічна production-адреса без Vercel Authentication. Не переносити на новий проєкт основний домен.
5. Надати публічний origin (без `/v3` наприкінці) для підключення до v2.

Наявні preview-адреси `drill-shop-git-v3-zhekagrems-projects.vercel.app` та `e-dril-git-v3-zhekagrems-projects.vercel.app` під час перевірки 2026-09-21 повертали HTTP 302 на Vercel SSO. Сам успішний GitHub/Vercel build не робить їх публічними.

## Підключення основного домену

Підготовлена гілка `v2-with-v3-route` на основі `v2` містить лише rewrite та пропуск middleware v2 для префікса `/v3`. Активація потребує `V3_STOREFRONT_ORIGIN=https://<публічний-origin-v3>` у Production того Vercel-проєкту, якому належить `ye-dril.com`. Змінна серверна, без `NEXT_PUBLIC_`.

Після перевірки публічного v3: застосувати цей коміт до `v2`, задати origin і виконати redeploy v2. Без змінної rewrite вимкнений. Основні `/`, `/catalog`, `/cart` та всі інші маршрути v2 зберігаються. `/v3/:path*` проксіюється зі збереженням префікса до v3. Для посилань між двома версіями потрібен звичайний `<a>`, щоб завантажити відповідний клієнт Next.

Перевірити кінцеві адреси на `https://www.ye-dril.com`: `/` — v2, `/v3` — editorial v3, `/v3/catalog`, товар, кошик, checkout, login, middleware admin, `/v3/moto` та внутрішні API. Під час очікування міграції всі відповіді v3 мають `X-Robots-Tag: noindex, follow`. Канонічні SEO-адреси залишаються адресами основного магазину.

## Перевірки

- `node scripts/check-v3-mount.mjs` — локальні та зовнішні URL, відсутність подвійного префікса, Moto, manifest і майбутній root mount.
- `node scripts/check-v3-appearance.mjs` — 80 поєднань тем/дизайнів, контраст, недоступне сховище, ігнорування налаштувань v2.
- `node scripts/check-v3-mount.mjs http://127.0.0.1:3004` — HTTP-перевірка production-збірки. Жодних замовлень, оплат або Telegram-повідомлень не створює.

Production-збірку для QA виконувати в окремій копії: одночасний build і dev в одній `.next` можуть пошкодити активний локальний сервер.

## Подальша міграція

Зібрати v3 з `NEXT_PUBLIC_STOREFRONT_BASE_PATH=""` і перевірити її перед переключенням основного домену. Порожній префікс також прибирає глобальний noindex. Після переключення додати постійні redirects зі старих `/v3/*` на відповідні кореневі URL. Для відкату маршруту `/v3` достатньо прибрати `V3_STOREFRONT_ORIGIN` і перевипустити v2; бекенд та замовлення не змінюються.

Джерела: [Next basePath](https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath), [Next multi-zones](https://nextjs.org/docs/app/guides/multi-zones), [Vercel Authentication](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication).
