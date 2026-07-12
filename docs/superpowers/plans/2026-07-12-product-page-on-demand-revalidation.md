# On-demand revalidation сторінок товару — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Після правки товару в адмінці публічні сторінки товару оновлюються практично одразу, без очікування ISR-вікна.

**Architecture:** Бекенд (Express/Prisma) після мутації товару робить fire-and-forget POST на новий Next.js-роут `/api/revalidate` із shared-секретом; роут викликає `revalidatePath(...)` для сторінок товару та каталогу. Сторінки лишаються статичними; time-based ISR лишається як fallback.

**Tech Stack:** Next.js 16 (App Router, Node.js runtime), `next/cache` `revalidatePath`, `node:crypto`; backend Node 24 native `fetch` + `AbortSignal.timeout`.

**Spec:** `docs/superpowers/specs/2026-07-12-product-page-on-demand-revalidation-design.md`

## Global Constraints

Ці вимоги неявно входять у КОЖНЕ завдання:

- **Деплой = Vercel:** очікуємо коректну platform-managed ISR-поведінку; окремий cache handler **не** додаємо. (Застереження: дефолтний FS-кеш per-instance — актуально лише для self-hosted multi-instance, не наш випадок.)
- **Скоуп тригерів:** тільки правки в адмінці — use-case'и `Create/Update/Delete`. Складські зміни із замовлень — поза скоупом.
- **`.env.example` НЕ змінювати** (ні у frontend, ні у backend).
- **Роут `/api/revalidate` — `export const runtime = 'nodejs'`** (ISR/`revalidatePath` підтримуються лише в Node runtime, не Edge). Не додавати `export const dynamic = 'force-dynamic'` (POST-роут і так динамічний; force-dynamic заборонений CLAUDE.md).
- **Exact-path (перевірено):** у `next.config.ts` немає `rewrites`/`redirects` → ревалідуємо літеральні шляхи. Matcher у `src/middleware.ts:57` виключає `api` → endpoint не гейтиться Supabase-middleware.
- **Бекенд-виклики ревалідації — non-blocking і НІКОЛИ не кидають:** fire-and-forget (`.catch(() => {})`), метод сервісу сам ковтає помилки. Падіння/повільність фронтенду не має впливати на збереження товару.
- **Секрет:** порівняння constant-time. `REVALIDATE_SECRET` **однаковий** на обох боках; задається у Vercel env (frontend) + backend `.env` + локально в `.env.local`/`.env`. **Не** в `.env.example`.
- **Тестового раннера немає в жодному репо → не додаємо (YAGNI).** Верифікація: `npm run lint` / `npm run build` (typecheck) + `curl` + ручний e2e.
- **Виконувати на окремій гілці, не на `main`.**

---

### Task 1: Frontend — роут `/api/revalidate`

**Files:**
- Create: `F:\Progect\2025\shop_bogdan\frontend\src\app\api\revalidate\route.ts`
- Env (локально, НЕ комітиться): `F:\Progect\2025\shop_bogdan\frontend\.env.local` — додати `REVALIDATE_SECRET`

**Interfaces:**
- Produces: HTTP endpoint `POST /api/revalidate`, header `x-revalidate-secret`, JSON body `{ event: 'create'|'update'|'delete', slug: string, oldSlug?: string }`. Відповіді: `200 { revalidated: true, event, paths: string[] }`, `400` (невалідний JSON/поля), `401` (нема/невірний секрет). Бекенд-сервіс із Task 2 споживає саме цей контракт.

- [ ] **Step 1: Додати секрет у `frontend/.env.local`**

Згенерувати випадковий секрет і додати рядок (значення збережи — знадобиться в Task 2/3 однакове):

```bash
# Git Bash / будь-який bash:
openssl rand -hex 32
# → скопіювати результат у frontend/.env.local:
# REVALIDATE_SECRET=<той-самий-рядок>
```

- [ ] **Step 2: Створити роут**

Файл `src/app/api/revalidate/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createHash, timingSafeEqual } from 'node:crypto';

// ISR / revalidatePath підтримуються лише в Node.js runtime (не Edge)
export const runtime = 'nodejs';

type RevalidateEvent = 'create' | 'update' | 'delete';

interface RevalidateBody {
  event: RevalidateEvent;
  slug: string;
  oldSlug?: string;
}

// Constant-time звірка секрета (хешуємо обидва боки → стійко до різниці довжин)
function isValidSecret(received: string | null): boolean {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected || !received) return false;
  const a = createHash('sha256').update(received).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  if (!isValidSecret(request.headers.get('x-revalidate-secret'))) {
    return NextResponse.json({ revalidated: false, message: 'Unauthorized' }, { status: 401 });
  }

  let body: RevalidateBody;
  try {
    body = (await request.json()) as RevalidateBody;
  } catch {
    return NextResponse.json({ revalidated: false, message: 'Invalid JSON' }, { status: 400 });
  }

  const { event, slug, oldSlug } = body;
  if (!slug || !['create', 'update', 'delete'].includes(event)) {
    return NextResponse.json(
      { revalidated: false, message: 'Missing or invalid "event"/"slug"' },
      { status: 400 }
    );
  }

  const paths = new Set<string>([
    `/catalog/${slug}`,
    `/telegram/catalog/${slug}`,
    '/catalog',
    '/telegram/catalog',
  ]);
  if (oldSlug && oldSlug !== slug) {
    paths.add(`/catalog/${oldSlug}`);
    paths.add(`/telegram/catalog/${oldSlug}`);
  }

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: true, event, paths: [...paths] });
}
```

- [ ] **Step 3: Lint + typecheck**

Run (у `F:\Progect\2025\shop_bogdan\frontend`):
```bash
npm run lint
```
Expected: без помилок по `src/app/api/revalidate/route.ts`.

- [ ] **Step 4: Підняти dev і перевірити 401/400/200 через curl**

Термінал А: `npm run dev` (у frontend).
Термінал Б (Windows PowerShell — використовуй `curl.exe`, не PS-аліас; або Git Bash — `curl`). Заміни `<SECRET>` на значення з `.env.local`, а `<REAL_SLUG>` — на slug реального товару:

```bash
# без секрета → 401
curl -i -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" -d '{"event":"update","slug":"x"}'

# невірний секрет → 401
curl -i -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" -H "x-revalidate-secret: wrong" -d '{"event":"update","slug":"x"}'

# без slug → 400
curl -i -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" -H "x-revalidate-secret: <SECRET>" -d '{"event":"update"}'

# валідно → 200 {"revalidated":true,...,"paths":[...]}
curl -i -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" -H "x-revalidate-secret: <SECRET>" \
  -d '{"event":"update","slug":"<REAL_SLUG>"}'
```
Expected: статуси `401`, `401`, `400`, `200` відповідно; останній повертає `paths` із `/catalog/<REAL_SLUG>` тощо.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/revalidate/route.ts
git commit -m "feat(revalidate): add /api/revalidate on-demand revalidation route"
```

---

### Task 2: Backend — `RevalidationService`

**Files:**
- Create: `F:\Progect\2025\shop_bogdan\backend\src\shared\services\revalidation.service.ts`
- Env (локально, НЕ комітиться): `F:\Progect\2025\shop_bogdan\backend\.env` — додати `REVALIDATE_SECRET` (те саме значення, що у frontend). `FRONTEND_URL` там уже є.

**Interfaces:**
- Consumes: HTTP endpoint `POST ${FRONTEND_URL}/api/revalidate` із Task 1.
- Produces: singleton `revalidationService` з методом
  `revalidateProduct(input: { event: 'create'|'update'|'delete'; slug: string; oldSlug?: string }): Promise<void>` —
  ніколи не кидає (внутрішній try/catch). Task 3 імпортує саме цей singleton.

- [ ] **Step 1: Додати секрет у `backend/.env`**

Додати рядок `REVALIDATE_SECRET=<той-самий-рядок-що-в-frontend>`. `.env.example` НЕ чіпати.

- [ ] **Step 2: Створити сервіс (дзеркалить `telegram.service.ts`)**

Файл `src/shared/services/revalidation.service.ts`:

```ts
// src/shared/services/revalidation.service.ts

type RevalidateEvent = 'create' | 'update' | 'delete';

interface RevalidateProductInput {
  event: RevalidateEvent;
  slug: string;
  oldSlug?: string;
}

export class RevalidationService {
  private readonly frontendUrl: string;
  private readonly secret: string;

  constructor() {
    // прибираємо можливий трейлінг-слеш, щоб URL завжди був коректний
    this.frontendUrl = (process.env.FRONTEND_URL || '').replace(/\/+$/, '');
    this.secret = process.env.REVALIDATE_SECRET || '';

    if (!this.isConfigured()) {
      console.warn(
        '[RevalidationService] FRONTEND_URL або REVALIDATE_SECRET не задані — ревалідація сторінок вимкнена'
      );
    }
  }

  async revalidateProduct(input: RevalidateProductInput): Promise<void> {
    if (!this.isConfigured()) return;

    try {
      const response = await fetch(`${this.frontendUrl}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-revalidate-secret': this.secret,
        },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`[RevalidationService] revalidate failed (${response.status}):`, text);
      }
    } catch (error) {
      console.error('[RevalidationService] revalidate request error:', error);
    }
  }

  private isConfigured(): boolean {
    return Boolean(this.frontendUrl && this.secret);
  }
}

export const revalidationService = new RevalidationService();
```

- [ ] **Step 3: Typecheck (build)**

Run (у `F:\Progect\2025\shop_bogdan\backend`):
```bash
npm run build
```
Expected: `Build completed`, без TS-помилок у `revalidation.service.ts`.

- [ ] **Step 4: Commit**

```bash
git add src/shared/services/revalidation.service.ts
git commit -m "feat(revalidate): add RevalidationService to notify frontend on product change"
```

---

### Task 3: Backend — тригери у 3 use-case'ах

**Files:**
- Modify: `F:\Progect\2025\shop_bogdan\backend\src\modules\products\application\use-cases\create-product.use-case.ts:146-147`
- Modify: `F:\Progect\2025\shop_bogdan\backend\src\modules\products\application\use-cases\update-product.use-case.ts:213`
- Modify: `F:\Progect\2025\shop_bogdan\backend\src\modules\products\application\use-cases\delete-product.use-case.ts:17,29`

**Interfaces:**
- Consumes: `revalidationService` із Task 2 (import shлях `../../../../shared/services/revalidation.service`).
- Виклики fire-and-forget (без `await`, з `.catch(() => {})`) — не додають латентності відповіді адмінки.

- [ ] **Step 1: `create-product.use-case.ts` — import + виклик**

Додати import після рядка 6 (після імпорту `CreateProductData`):
```ts
import { revalidationService } from '../../../../shared/services/revalidation.service';
```

Замінити фінальний блок (рядки 146-147):
```ts
    console.log('✅ Product creation completed:', product.name);
    return product;
```
на:
```ts
    console.log('✅ Product creation completed:', product.name);

    // Ревалідація публічних сторінок товару (fire-and-forget; ніколи не блокує/не кидає)
    revalidationService.revalidateProduct({ event: 'create', slug: product.slug }).catch(() => {});

    return product;
```

- [ ] **Step 2: `update-product.use-case.ts` — import + виклик**

Додати import після рядка 6 (після `import { Product } from '@prisma/client';`):
```ts
import { revalidationService } from '../../../../shared/services/revalidation.service';
```

Замінити фінал (рядок 213):
```ts
    return product;
```
на:
```ts
    // Ревалідація: новий slug + старий (якщо змінився при перейменуванні)
    revalidationService
      .revalidateProduct({ event: 'update', slug: product.slug, oldSlug: existingProduct.slug })
      .catch(() => {});

    return product;
```

- [ ] **Step 3: `delete-product.use-case.ts` — import + виклики**

Додати import після рядка 1:
```ts
import { revalidationService } from '../../../../shared/services/revalidation.service';
```

У методі `execute` замінити рядок 17:
```ts
    // Soft delete the product
    await this.productRepository.delete(productId);
```
на:
```ts
    // Soft delete the product
    await this.productRepository.delete(productId);

    // Ревалідація сторінок видаленого товару
    revalidationService.revalidateProduct({ event: 'delete', slug: product.slug }).catch(() => {});
```

У методі `hardDelete` замінити рядок 29:
```ts
    // For now, we'll use soft delete as it's safer
    await this.productRepository.delete(productId);
```
на:
```ts
    // For now, we'll use soft delete as it's safer
    await this.productRepository.delete(productId);

    revalidationService.revalidateProduct({ event: 'delete', slug: product.slug }).catch(() => {});
```
(`bulkDelete` покривається автоматично — він викликає `execute`.)

- [ ] **Step 4: Typecheck (build)**

Run (у backend):
```bash
npm run build
```
Expected: `Build completed`, без TS-помилок.

- [ ] **Step 5: E2E-перевірка (обидва сервери підняті + секрет заданий з обох боків)**

1. Backend `npm run dev`, frontend `npm run dev`.
2. У бекендному `.env` тимчасово вкажи `FRONTEND_URL=http://localhost:3000`.
3. В адмінці зміни **ціну** реального товару та збережи.
4. Відкрий/онови `http://localhost:3000/catalog/<slug>` → нова ціна видно практично одразу (наступний запит тригерить регенерацію).
5. Перевір лог бекенду: без `[RevalidationService] ... error` за успіху.
6. Негативний тест non-blocking: зупини frontend, зміни товар в адмінці → збереження **успішне**, у логах бекенду лише `revalidate request error`, запит не падає.

- [ ] **Step 6: Commit**

```bash
git add src/modules/products/application/use-cases/create-product.use-case.ts \
        src/modules/products/application/use-cases/update-product.use-case.ts \
        src/modules/products/application/use-cases/delete-product.use-case.ts
git commit -m "feat(revalidate): trigger frontend revalidation on product create/update/delete"
```

---

## Post-implementation (prod)

- Додати `REVALIDATE_SECRET` у **Vercel env** (frontend, той самий рядок) і в prod-`.env` бекенду. `FRONTEND_URL` бекенду має вказувати на прод-домен сторфронту.
- Швидка перевірка на проді: змінити товар → сторінка оновилась.

## Self-Review (проти spec)

- **Spec coverage:** Frontend-роут → Task 1; RevalidationService (патерн telegram) → Task 2; тригери Create/Update/Delete → Task 3; runtime nodejs, constant-time секрет, non-blocking, exact-path, no `.env.example`, Vercel-припущення → Global Constraints + відповідні кроки. Category-сторінки свідомо поза v1 (spec це допускає). ✅
- **Placeholder scan:** усі кроки містять реальний код/команди/очікування; плейсхолдерів нема. ✅
- **Type consistency:** контракт `{ event, slug, oldSlug? }` однаковий у Task 1 (route body), Task 2 (`RevalidateProductInput`) і Task 3 (виклики). `revalidationService.revalidateProduct(...)` — одна назва скрізь. Import-шлях `../../../../shared/services/revalidation.service` однаковий у 3 use-case'ах. ✅
