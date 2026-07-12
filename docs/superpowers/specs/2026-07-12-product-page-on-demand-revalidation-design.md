# On-demand revalidation сторінок товару

- **Дата:** 2026-07-12
- **Статус:** Draft (очікує review користувача)
- **Скоуп:** frontend (`F:\Progect\2025\shop_bogdan\frontend`) + backend (`F:\Progect\2025\shop_bogdan\backend`)

## Проблема

Сторінки товару віддаються статично через ISR (`export const revalidate`: деталь товару 24 год, каталог/категорія 6 год). Після правки товару в адмінці зміни не видно до протухання ISR-вікна (до 24 год). Треба, щоб зміни з'являлись практично одразу.

## Рішення (огляд)

On-demand revalidation через webhook «бекенд → фронтенд»:

```
Адмін зберігає товар (Create/Update/Delete use-case, бекенд)
   └─(після коміту в БД)─► POST ${FRONTEND_URL}/api/revalidate
                            header: x-revalidate-secret
                            body:  { event, slug, oldSlug?, categorySlugs? }
        Next.js /api/revalidate:
           1) constant-time звірка секрета (нема/невірний → 401)
           2) revalidatePath(...) для потрібних маршрутів
           3) 200 { revalidated: true, paths: [...] }
```

Сторінки лишаються статичними (дешево по compute); свіжість забезпечує точкова інвалідація, а time-based ISR лишається як fallback на випадок втраченого webhook.

## Обмеження й припущення

- **Деплой:** Vercel. На Vercel **очікуємо** коректну platform-managed ISR-поведінку; окремий cache handler для цього дизайну **не планується**.
  - ⚠️ Застереження (офіційний Next.js self-hosting doc): дефолтний file-system ISR-кеш є **per-instance**; on-demand revalidation інвалідує лише той інстанс, що отримав виклик; для координації між кількома інстансами потрібен **shared custom cache handler**. Цей дизайн покладається на platform-managed ISR Vercel. Якщо деплой колись перейде на self-hosted multi-instance — shared cache handler (напр. на Redis, який у бекенді вже є) стане обов'язковим. Це формулюємо як очікування платформи, а не як гарантований контракт із піднятих офіційних джерел.
- **Обсяг тригерів:** тільки правки товару в адмінці (Create/Update/Delete use-case'и). Автоматичні зміни складу із замовлень (raw SQL в `inventory.service`) — **поза скоупом** (їх покриє time-based fallback).
- **`revalidateTag` не використовуємо:** продуктові дані тягнуться через axios (`apiClient`), не через нативний `fetch`, тож Next.js Data Cache їх не тегує. Використовуємо `revalidatePath`, який працює на рівні Full Route Cache незалежно від транспорту.
- **`.env.example` не змінюється.** `REVALIDATE_SECRET` задається напряму в env (див. «Конфігурація»).

## Компоненти

### A. Frontend: роут `src/app/api/revalidate/route.ts` (новий)

- **Runtime:** `export const runtime = 'nodejs'` — **обов'язково**. ISR / `revalidatePath` підтримуються лише в Node.js runtime App Router, не в Edge.
- **Метод:** `POST`.
- **Автентифікація:** header `x-revalidate-secret` порівнюється з `process.env.REVALIDATE_SECRET` **constant-time** (напр. `crypto.timingSafeEqual`). Нема секрета в env або mismatch → `401`, ревалідація не виконується.
- **Body (семантичне, не сирі шляхи):**
  ```ts
  { event: 'create' | 'update' | 'delete';
    slug: string;
    oldSlug?: string;
    categorySlugs?: string[]; }
  ```
  Валідувати вхід (є `slug`; `event` з допустимих). Причина семантичного контракту: структуру URL знає лише фронтенд — бекенд не має знати про `/catalog/[slug]` vs `/telegram/catalog/[slug]`. Зміниться роутинг — правимо тільки цей файл.
- **Маппінг у `revalidatePath`:**

  | Умова | Шляхи |
  |---|---|
  | завжди | `/catalog/${slug}`, `/telegram/catalog/${slug}` |
  | завжди | `/catalog`, `/telegram/catalog` |
  | `oldSlug` заданий і ≠ `slug` | `/catalog/${oldSlug}`, `/telegram/catalog/${oldSlug}` |
  | кожен `c` у `categorySlugs` | `/catalog/category/${c}` |

  Головну `/` **не чіпаємо** (лендинг без товарів; `PopularProductsSlider` ніде не змонтований). `/sitemap.xml` — поза скоупом.
- **Семантика свіжості (формулювати обережно):** `revalidatePath` **інвалідує** cache entry; регенерація відбувається на наступному запиті. Тобто наступний запит тригерить revalidation/regeneration і **має** отримати свіжий результат — це не жорстка SLA-обіцянка «вже віддає свіже».
- **Відповідь:** `200 { revalidated: true, paths: string[] }`; на неочікуваній помилці `500` (логи на боці бекенду через swallow).

### B. Backend: `src/shared/services/revalidation.service.ts` (новий)

- Синглтон, дзеркалить патерн `src/notifications/telegram/telegram.service.ts`:
  - нативний `fetch()`, `isConfigured()` guard (no-op якщо нема `REVALIDATE_SECRET`/`FRONTEND_URL`),
  - таймаут ~5с через `AbortController`,
  - **non-blocking:** усе в try/catch, лог на помилці, **ніколи не кидає** — падіння/повільність фронтенду не має ламати збереження товару.
- API: `revalidateProduct({ event, slug, oldSlug?, categorySlugs? }): Promise<void>` → `POST ${process.env.FRONTEND_URL}/api/revalidate` з header `x-revalidate-secret`.

### C. Backend: тригери у 3 use-case'ах

Прямий імпорт синглтона (як `telegramService`), без DI-змін (KISS). Виклик — **після** успішного запису, у місці, де в скоупі повернений `Product` (є `slug`):

- `create-product.use-case.ts` → `revalidateProduct({ event:'create', slug: product.slug, categorySlugs })`
- `update-product.use-case.ts` → `revalidateProduct({ event:'update', slug: product.slug, oldSlug: existingProduct.slug, categorySlugs })` (`existingProduct.slug` — старий slug до можливого перейменування)
- `delete-product.use-case.ts` → `revalidateProduct({ event:'delete', slug })`

`categorySlugs` передаємо, лише якщо вони легко доступні на поверненій сутності. Якщо ні — v1 без category-сторінок (їх покриє 6-год fallback), додамо згодом.

## Конфігурація (env)

- `REVALIDATE_SECRET` — довгий випадковий рядок, **однаковий** на обох боках. **`.env.example` НЕ чіпаємо.**
  - Frontend: server-only (**без** `NEXT_PUBLIC_`), задати в Vercel env та локально в `.env.local`.
  - Backend: задати в бекендному `.env`.
- `FRONTEND_URL` (backend) — уже існує (`brand.constants.ts`), вказує на корінь сторфронту. Нове не додаємо.

## Що навмисно НЕ робимо (YAGNI)

- Shared/custom cache handler (не потрібен на Vercel за припущенням дизайну).
- Рефакторинг axios → tagged `fetch` заради `revalidateTag`.
- Тригери на автоматичні зміни складу із замовлень.
- Ревалідація головної та `/sitemap.xml`.
- Зміни `.env.example`, rate-limiting на endpoint.

## Acceptance criteria / checklist

- [ ] `/api/revalidate` — `runtime = 'nodejs'`, серверний роут (не client, не edge).
- [ ] Exact-path: ревалідуємо реальні destination-шляхи. **Перевірено:** у `next.config.ts` немає `rewrites`/`redirects` → source == destination.
- [ ] Auth-middleware не гейтить endpoint. **Перевірено:** matcher у `src/middleware.ts:57` виключає `api` → `/api/revalidate` під Supabase-middleware не потрапляє.
- [ ] Секрет: без header / невірний → `401`; правильний → `200` з переліком шляхів.
- [ ] Бекенд-виклик non-blocking: збій ревалідації не впливає на відповідь адмінки (перевірити симуляцією недоступного фронтенду).
- [ ] Перейменування товару (зміна slug) інвалідує і новий, і старий шлях.

## Верифікація (тестового фреймворку у фронтенді нема → ручна + curl)

1. `curl -X POST $FRONTEND_URL/api/revalidate` без секрета / з невірним / з правильним → `401` / `401` / `200`.
2. E2E: змінити ціну товару в адмінці → перезавантажити сторінку товару → нова ціна з'являється практично одразу (наступний запит тригерить регенерацію).
3. Перевірити лог бекенду при недоступному фронтенді: помилка залогована, збереження товару успішне.

## Файли

**Frontend:** ➕ `src/app/api/revalidate/route.ts`
**Backend:** ➕ `src/shared/services/revalidation.service.ts`; ✏️ `create-product.use-case.ts`, `update-product.use-case.ts`, `delete-product.use-case.ts`
