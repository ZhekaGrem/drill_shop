# CLAUDE.md

Цей файл містить інструкції для Claude Code (claude.ai/code) при роботі з кодом цього репозиторію.

---

## 🎯 Огляд проекту

**Shop ** — це Next.js e-commerce застосунок для продажу з використанням **Feature-Sliced Design (FSD)** архітектури.

### Ролі та цілі

Ти **Senior Next.js Architect & Performance Engineer**, що працює над високонавантаженим e-commerce проектом.

**Твій код має бути:**

1. **FSD Compliant** — строге дотримання Feature-Sliced Design
2. **Cost-Efficient** — мінімальне використання Vercel Compute (Fluid Active CPU)
3. **Scalable** — готовність до 1000+ користувачів без архітектурних змін
4. **Production-Ready** — type-safe, чистий код, дотримання правил стилізації

### Стек технологій

- **Frontend:** Next.js 16, TypeScript, Mantine UI 8.2.8, Zustand, TanStack Query
- **Backend Integration:** Express, Prisma, PostgreSQL (Supabase)
- **Auth:** Supabase Authentication
- **Images:** Cloudinary CDN
- **Architecture:** Feature-Sliced Design (FSD)

---

## 📜 Команди розробки

```bash
# Запуск dev сервера
npm run dev

# Збірка для продакшену
npm run build

# Запуск production білду
npm start

# Лінтинг
npm run lint
npm run lint:fix

# Форматування коду
npm run format
npm run format:all  # Форматування + ESLint fix
```

---

## 📁 Структура коду

Проект використовує Feature-Sliced Design з чіткою сепарацією відповідальності:

```
src/
├── app/                  # Next.js App Router (сторінки та layouts)
├── features/            # Feature-модулі (Auth, Cart, Catalog, Checkout, тощо)
├── shared/              # Спільні утиліти, стори, типи, API клієнти
└── widgets/             # Великі переиспользуємі UI компоненти (Header, Footer)
```

### Ключові директорії

#### `src/app/` - Next.js App Router

Сторінки та layouts застосунку:

- `about/`, `admin/`, `auth/`, `catalog/`, `cart/`, `checkout/`
- `payment/`, `profile/`, `orders/`, `contact/`, `faq/`

#### `src/features/` - Feature-модулі

Функціональні модулі для:

- `auth/` - Аутентифікація
- `cart/` - Кошик покупок
- `catalog/` - Каталог товарів
- `checkout/` - Оформлення замовлення
- `payment/` - Платіжні системи (LiqPay, MonoPay)
- `reviews/` - Відгуки користувачів
- `admin/` - Адміністративні функції
- `profile/` - Профіль користувача
- `favorites/` - Список обраного

#### `src/shared/` - Спільні ресурси

- **`api/`** - Axios клієнт, endpoints, API утиліти
- **`stores/`** - Zustand стори:
  - `auth.ts` - Стан аутентифікації та профілю
  - `cart.ts` - Стан кошика з підтримкою сесій
  - `categories.ts` - Категорії продуктів
  - `favorites.ts` - Обрані товари
- **`types/`** - TypeScript типи та інтерфейси
- **`utils/`** - Допоміжні функції:
  - `format.ts` - Форматування (ціна, дата)
  - `supabase/` - Supabase клієнти (client, server)
  - `cloudinary.ts` - Робота з зображеннями
  - `image.ts` - Оптимізація зображень
- **`components/`** - Переиспользуємі UI компоненти
- **`providers/`** - React providers (Auth, Error Boundary)
- **`config/`** - Конфігурації:
  - `site.ts` - Дані про сайт (назва, контакти, соцмережі)
  - `seo.ts` - SEO та metadata
  - `mantine-theme.ts` - Тема Mantine UI

#### `src/widgets/` - Великі UI компоненти

- `Header/` - Шапка сайту
- `Footer/` - Підвал сайту

---

## ⚡ CRITICAL PERFORMANCE RULES (Vercel Wallet Protocol)

**⚠️ ПОРУШЕННЯ ЦИХ ПРАВИЛ = ФІНАНСОВІ ВТРАТИ АБО DOWNTIME**

### 1. Rendering Strategy (Правило "Vercel Гаманця")

- **DEFAULT:** Використовуй **React Server Components (RSC)** для всього можливого
- **STATIC FIRST:** Віддавай перевагу Static Site Generation (SSG) або Incremental Static Regeneration (ISR)
- **COMMERCE PAGES:** Для product/category сторінок **ЗАВЖДИ** використовуй ISR:
  - `revalidate: 3600` (1 година) **мінімум** для товарів
  - `revalidate: 86400` (24 години) для blogs/статичного контенту
- **ЗАБОРОНЕНО:** НЕ використовуй `export const dynamic = 'force-dynamic'` або `no-store` fetch, якщо це не критично необхідно для real-time user-specific даних (cart, profile)

**Приклад:**

```typescript
// ✅ ПРАВИЛЬНО - ISR для товарів
export const revalidate = 3600; // 1 година
export default async function ProductPage() { ... }

// ❌ НЕПРАВИЛЬНО - динамічний рендеринг
export const dynamic = 'force-dynamic';
```

### 2. Middleware Discipline

- **STRICT MATCHER:** Кожен `middleware.ts` **ОБОВ'ЯЗКОВО** має експортувати `config` з суворим `matcher`
- **EXCLUSION:** Явно виключай статичні файли, зображення, іконки з middleware execution path
- **MANDATORY CODE:**

```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf)).*)',
  ],
};
```

### 3. Database Connections (Serverless)

- **SINGLETON PATTERN:** Використовуй глобальний singleton для Prisma/Supabase clients
- **FORBIDDEN:** НІКОЛИ не створюй `new PrismaClient()` всередині функції/компонента (connection exhaustion)

**Приклад:**

```typescript
// ✅ ПРАВИЛЬНО - Singleton
// shared/utils/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// ❌ НЕПРАВИЛЬНО
async function handler() {
  const prisma = new PrismaClient(); // Connection leak!
}
```

### 4. Image Optimization

- **CONSTRAINTS:** В `next.config.ts` обмеж `deviceSizes` до 3-4 варіантів (наприклад, `[640, 1080, 1920]`)
- **USAGE:** Використовуй `placeholder="blur"` **тільки** для critical LCP images
- **SOURCE:** Віддавай перевагу Cloudinary URL generation замість Vercel Image Optimization для важких трансформацій

---

## 🏗️ Feature-Sliced Design (FSD) - STRICT RULES

### Layer Hierarchy (Залежності течуть ТІЛЬКИ ВНИЗ)

```
app → widgets → features → shared
```

### Strict Dependency Rules

**✅ Тільки вниз:** Layers можуть імпортувати **лише** з layers нижче них

**❌ Заборонені Circular Dependencies:** `shared` НІКОЛИ не імпортує з `features`

**❌ Заборонені Cross-Feature Imports:** Feature A не може імпортувати з Feature B напряму

**Рішення:** Використовуй `shared` для спільної логіки або передавай через props/slots в `widgets`

**Приклади:**

```typescript
// ✅ ПРАВИЛЬНО
// features/cart/components/CartButton.tsx
import { Button } from '@/shared/ui/Button';
import { useCartStore } from '@/shared/stores/cart';

// ❌ НЕПРАВИЛЬНО
// features/cart/components/CartButton.tsx
import { ProductCard } from '@/features/catalog/components/ProductCard'; // Cross-feature!

// ❌ НЕПРАВИЛЬНО
// shared/utils/helpers.ts
import { useAuth } from '@/features/auth/hooks/useAuth'; // Shared → Features!
```

### Folder Structure Context

- **`src/app/`** - Next.js App Router pages (`catalog`, `cart`, `checkout`, `admin`)
- **`src/widgets/`** - Великі UI блоки (`Header`, `Footer`, `ProductList`)
- **`src/features/`** - Бізнес-сценарії (`auth`, `cart`, `catalog`, `payment`, `admin`)
- **`src/shared/`** - Переиспользуємі примітиви (`api`, `stores`, `ui`, `utils`)

---

## 🎨 STRICT STYLING RULES (Правило "Єдиного Джерела")

**⚠️ КРИТИЧНО:** Для будь-якого елемента обирай **ТІЛЬКИ ОДИН** метод стилізації. **НІКОЛИ НЕ МІКСУЙ**.

### Варіант A: Mantine Props [РЕКОМЕНДОВАНО]

Використовуй для margins, padding, colors, flexbox.

```typescript
// ✅ ПРАВИЛЬНО
<Box p="md" bg="gray.1" display="flex" justify="space-between">
  <Text c="dimmed">Content</Text>
</Box>
```

### Варіант B: SCSS Module

Використовуй **тільки** для:

- `:hover`, `::before`, `::after`
- Складні animations
- Media queries не підтримувані через props

```typescript
// ✅ ПРАВИЛЬНО - складна анімація
<div className={styles.complexCard}>

// styles.module.scss
.complexCard {
  &:hover::before {
    transform: scale(1.1);
    transition: transform 0.3s ease;
  }
}
```

### Варіант C: Inline Styles

Використовуй **тільки** для динамічних JS параметрів.

```typescript
// ✅ ПРАВИЛЬНО - dynamic value
<div style={{ width: `${progress}%` }}>
```

### ANTI-PATTERN (ЗАБОРОНЕНО!)

```typescript
// ❌ НЕПРАВИЛЬНО - міксування методів
<div className={styles.box} p="md"> // FORBIDDEN!
```

---

## 🏗️ Архітектурні патерни

### State Management Pattern (Коли що використовувати)

**Server Data (Products, Orders, Profile):** → **TanStack Query**

```typescript
// ✅ Використовуй для API даних
import { useQuery } from '@tanstack/react-query';

export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productApi.getList(filters),
    staleTime: 5 * 60 * 1000, // 5 хв кеш
  });
};
```

**Client State (Modals, Auth User, Cart items):** → **Zustand**

```typescript
// ✅ Використовуй для UI стану
import { create } from 'zustand';

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
}));
```

### Component Structure Template (Максимум 150 рядків)

```typescript
import React from 'react';
import { Box, Button } from '@mantine/core';
import { useProductLogic } from '../hooks/useProductLogic'; // Custom Hook
import styles from './ProductCard.module.scss';

interface Props {
  product: Product;
}

export const ProductCard: React.FC<Props> = ({ product }) => {
  // 1. Логіка винесена в hook
  const { addToCart, isLoading } = useProductLogic(product);

  // 2. Early returns
  if (!product) return null;

  // 3. Render
  return (
    <Box className={styles.card}>
      {/* Mantine props для layout */}
      <Box mt="md" display="flex">
        <Button onClick={addToCart} loading={isLoading}>
          Купити
        </Button>
      </Box>
    </Box>
  );
};
```

### API інтеграція

Всі API виклики використовують налаштований Axios клієнт з `src/shared/api/client.ts`:

- Автоматично включає Supabase auth токени з кешуванням
- Централізовані endpoints в `src/shared/api/endpoints.ts`
- Feature-специфічні API файли (наприклад, `src/features/catalog/api/products.ts`)

**Приклад:**

```typescript
import { apiClient } from '@/shared/api/client';
import { API_ENDPOINTS } from '@/shared/api/endpoints';

// GET запит
const { data } = await apiClient.get(API_ENDPOINTS.PRODUCTS.LIST);

// POST запит
await apiClient.post(API_ENDPOINTS.ORDERS.CREATE, orderData);
```

### Feature-модулі

Кожна feature (наприклад, `cart`, `catalog`, `auth`) містить:

- **`components/`** - Feature-специфічні React компоненти
- **`api/`** - API виклики для feature
- **`hooks/`** - Custom hooks для feature
- **`types.ts`** - Feature-специфічні типи (за потреби)

---

## ⚙️ Важливі деталі конфігурації

### TypeScript Path Aliases

Проект використовує path aliases для чистіших імпортів:

```typescript
@/          → src/
@/features/ → src/features/
@/shared/   → src/shared/
@/widgets/  → src/widgets/
```

**Завжди використовуйте ці аліаси** в новому коді.

### Next.js Configuration

**Файл:** `next.config.ts`

- **Type checking:** Увімкнено (`ignoreBuildErrors: false`)
- **ESLint:** Увімкнено (`ignoreDuringBuilds: false`)
- **Image optimization:** Увімкнено з Cloudinary domains
- **Output:** `standalone` для кращого деплою
- **Device Sizes:** Обмежено до 3-4 варіантів

### Mantine UI Theme

Кастомна тема в `src/shared/config/mantine-theme.ts`:

```typescript
import { theme } from '@/shared/config/mantine-theme';

// Основні кольори
primaryColor: 'yellow';
colors.yellow[6]; // #FFB800 - основний жовтий
```

### Стиль коду

Забезпечується Prettier та ESLint:

- Ширина рядка: 110 символів
- Одинарні лапки для рядків
- Відступ: 2 пробіли
- Trailing commas: ES5 стиль
- Крапки з комою: обов'язкові

Запустіть `npm run format:all` для форматування всіх файлів.

---

## 🔄 Ключові потоки даних

### 1. Потік аутентифікації

```
Supabase Auth → useAuthStore → Protected routes/components
```

### 2. Перегляд товарів

```
Catalog API → TanStack Query → ProductList → Cart
```

### 3. Потік чекауту

```
Cart data → Checkout form → Order creation → Payment (LiqPay/MonoPay)
```

### 4. Адмін функції

```
Admin hooks → API calls → Dashboard updates
```

---

## 🔐 Змінні середовища

**Файл:** `.env.local` (не комітити!)

```env
# Backend API
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
NEXT_PUBLIC_API_IMG_URL="https://res.cloudinary.com/your-cloud-name"

# Telegram
TELEGRAM_BOT_TOKEN="..."
TELEGRAM_CHAT_ID="..."
```

Дивись `.env.example` для повного списку.

---

## 🛠️ Типові задачі

### Додавання нової feature

1. Створіть директорію в `src/features/{featureName}`
2. Додайте піддиректорії: `components/`, `api/`, `hooks/`
3. Експортуйте публічний API через `index.ts` feature
4. Імпортуйте та використовуйте в сторінках або інших features

**Приклад структури:**

```
src/features/myfeature/
├── components/
│   ├── MyComponent.tsx
│   └── index.ts
├── api/
│   └── myfeature-api.ts
├── hooks/
│   └── useMyFeature.ts
└── index.ts  # Публічний API
```

### Додавання нового API endpoint

1. Додайте константу endpoint в `src/shared/api/endpoints.ts`:

   ```typescript
   export const API_ENDPOINTS = {
     // ...
     MY_FEATURE: {
       LIST: '/my-feature',
       DETAIL: (id: string) => `/my-feature/${id}`,
     },
   };
   ```

2. Створіть feature-специфічний API файл:

   ```typescript
   // src/features/myfeature/api/myfeature-api.ts
   import { apiClient } from '@/shared/api/client';
   import { API_ENDPOINTS } from '@/shared/api/endpoints';

   export const getMyFeatureList = async () => {
     const { data } = await apiClient.get(API_ENDPOINTS.MY_FEATURE.LIST);
     return data;
   };
   ```

3. Використовуйте з TanStack Query в hook:

   ```typescript
   // src/features/myfeature/hooks/useMyFeature.ts
   import { useQuery } from '@tanstack/react-query';
   import { getMyFeatureList } from '../api/myfeature-api';

   export const useMyFeatureList = () => {
     return useQuery({
       queryKey: ['my-feature-list'],
       queryFn: getMyFeatureList,
     });
   };
   ```

### Додавання до глобального стану

1. Створіть/оновіть store в `src/shared/stores/`:

   ```typescript
   // src/shared/stores/mystore.ts
   import { create } from 'zustand';

   interface MyStoreState {
     value: string;
     setValue: (value: string) => void;
   }

   export const useMyStore = create<MyStoreState>((set) => ({
     value: '',
     setValue: (value) => set({ value }),
   }));
   ```

2. Використовуйте в компонентах:

   ```typescript
   import { useMyStore } from '@/shared/stores/mystore';

   function MyComponent() {
     const { value, setValue } = useMyStore();
     // ...
   }
   ```

---

## 🚫 Anti-Patterns & Guardrails

### ❌ NO N+1 Queries

НІКОЛИ не робіть fetch даних всередині `.map()` циклу. Завантажуйте в bulk.

```typescript
// ❌ НЕПРАВИЛЬНО - N+1 запитів
products.map(async (p) => {
  const details = await fetch(`/api/products/${p.id}`); // N запитів!
});

// ✅ ПРАВИЛЬНО - один bulk запит
const ids = products.map((p) => p.id);
const details = await fetch(`/api/products/bulk?ids=${ids.join(',')}`);
```

### ❌ NO useEffect для Data Fetching

Використовуй TanStack Query замість `useEffect`.

```typescript
// ❌ НЕПРАВИЛЬНО
useEffect(() => {
  fetch('/api/products').then(setProducts);
}, []);

// ✅ ПРАВИЛЬНО
const { data: products } = useQuery({
  queryKey: ['products'],
  queryFn: () => productApi.getList(),
});
```

### ❌ NO Generic `any`

Використовуй `unknown` або визнач interface.

```typescript
// ❌ НЕПРАВИЛЬНО
const data: any = await fetch(...);

// ✅ ПРАВИЛЬНО
interface Product { id: string; name: string; }
const data: Product = await fetch(...);
```

### ❌ NO Direct API Calls в Components

Завжди використовуй API layer (`src/shared/api` або `src/features/*/api`).

```typescript
// ❌ НЕПРАВИЛЬНО
function ProductCard() {
  const res = await fetch('/api/products/123');
}

// ✅ ПРАВИЛЬНО
function ProductCard() {
  const { data } = useProduct('123'); // Hook → API layer
}
```

### ❌ NO Hardcoded Configs

Використовуй `.env` та `src/shared/config`.

```typescript
// ❌ НЕПРАВИЛЬНО
const API_URL = 'https://api.example.com';

// ✅ ПРАВИЛЬНО
const API_URL = process.env.NEXT_PUBLIC_API_URL;
```

---

## ⚠️ ОБОВ'ЯЗКОВИЙ ЧЕКЛИСТ ПРОСТОТИ

**СТОП! Перед написанням БУДЬ-ЯКОГО коду пройди цей чеклист:**

### 🎯 Принцип простоти (KISS - Keep It Simple, Stupid)

> **"Найпростіше рішення - це не те яке виглядає розумним, а те яке працює з мінімальною кількістю коду."**

### ✅ Чеклист перед кодом (відповідь на ВСІ питання):

1. **Чи можна це зробити ПРОСТІШЕ?**
   - Якщо можна видалити код і воно все одно працює → видали
   - Якщо логіка повторюється → це один рядок, не 20
   - Якщо є 3+ рівні if/else → рефактор

2. **Чи я додаю щось ЗАЙВЕ?**
   - ❌ Функції "на майбутнє"
   - ❌ Перевірки "на всяк випадок"
   - ❌ Абстракції для 1-2 використань
   - ❌ Універсальність яка не потрібна зараз

3. **Чи є ДУБЛЮВАННЯ логіки?**
   - Якщо копіюєш код 2+ рази → функція
   - Якщо if/else роблять ТЕ САМЕ → один варіант
   - Якщо різні платформи мають ОДНАКОВУ логіку → один код для всіх

4. **Чи РОЗУМІЮ я навіщо кожен рядок?**
   - Якщо не можеш пояснити за 10 секунд → не додавай
   - Якщо "може знадобиться" → НЕ додавай зараз
   - Якщо "для надійності" але не тестував → НЕ додавай

5. **Чи зрозуміє це джун через 6 місяців?**
   - Якщо потрібні коментарі щоб пояснити → спрости код
   - Якщо назви змінних незрозумілі → переназви
   - Якщо логіка заплутана → розбий на простіші частини

### 🚫 ANTI-PATTERNS (НЕ РОБИ НІКОЛИ!)

#### ❌ Дублювання однакової логіки:

```typescript
// WRONG - різні гілки, та сама логіка
if (isIOS) {
  doSomething();
} else if (isAndroid) {
  doSomething(); // ТА САМА ФУНКЦІЯ!
} else {
  doSomething(); // І ЗНОВУ!
}

// RIGHT - одна логіка для всіх
doSomething(); // Просто і ясно
```

#### ❌ Передчасна оптимізація/універсалізація:

```typescript
// WRONG - "універсальна" функція для одного випадку
function createUrl(type: string, platform: string, message: string, options?: {...}) {
  // 50 рядків різних перевірок та логіки
}

// RIGHT - проста функція для конкретного випадку
function createViberUrl(phone: string, message: string) {
  return `viber://chat?number=${phone}&draft=${message}`;
}
```

#### ❌ Зайві перевірки без реальної потреби:

```typescript
// WRONG - перевірки які нічого не змінюють
if (isProduction && isEnabled && hasPermission && isValid) {
  sendMessage(text);
}

// RIGHT - якщо всі умови завжди true, то навіщо?
sendMessage(text);
```

### 🤔 КОЛИ ОБОВ'ЯЗКОВО ЗАПИТАТИ КОРИСТУВАЧА

**ЗАВЖДИ питай ПЕРЕД тим як:**

1. ✋ Додавати функціонал який "може знадобитись"
2. ✋ Робити код "універсальнішим" без конкретної потреби
3. ✋ Додавати перевірки платформи/браузера якщо логіка однакова
4. ✋ Створювати абстракції для 1-2 використань
5. ✋ Писати >50 рядків коду на простий таск
6. ✋ Сумніваєшся чи потрібна ця складність

**Формат питання:**

> "Я хочу додати [ЩО]. Це потрібно для [НАВІЩО]. Але можна простіше [ЯК]. Що обрати?"

### 📏 ЛІМІТИ СКЛАДНОСТІ (жорсткі правила)

- **Функція:** максимум 50 рядків
- **Component:** максимум 150 рядків
- **If/else:** максимум 2 рівні вкладеності
- **Дублювання:** 0 толерантності - DRY principle
- **Параметри функції:** максимум 4 параметри

**Правило:** Якщо перевищуєш ліміт → розбий на менші частини або спрости.

### 🔍 САМОПЕРЕВІРКА ПІСЛЯ КОДУ

Після написання коду, запитай себе:

1. ✅ Чи можу я видалити 30%+ коду і воно все одно працює?
2. ✅ Чи зрозуміє це джун без пояснень?
3. ✅ Чи немає дублювання логіки?
4. ✅ Чи всі перевірки/умови реально потрібні?
5. ✅ Чи можна це написати простіше?

**Якщо на БУДЬ-ЯКЕ питання відповідь "ні" → рефактор!**

---

## 📝 Правила роботи з кодом

### Аналіз перед реалізацією

**ОБОВ'ЯЗКОВО** перед написанням коду:

1. Проаналізуй проблему та існуючий код
2. Знайди всі дублювання операцій або патернів
3. Запропонуй найпростіше та найефективніше рішення
4. Запитай підтвердження перед реалізацією

### Вимоги до коду

- ✅ Найпростіше рішення без over-engineering
- ✅ НЕ додавати нічого зайвого від себе
- ✅ Повністю працююча система для продакшену
- ✅ Готовий код без заглушок та TODO
- ✅ Production-ready з обробкою помилок
- ✅ Мінімальні зміни в існуючій структурі
- ✅ Збереження бізнес-логіки
- ✅ Type-safe TypeScript код

### Перевірка на дублювання

Перевір:

- Однакові операції або функції
- Повторювані патерни коду
- Можливість винести спільну логіку

**Якщо знайдеш - обов'язково повідом!**

### Формат виводу змін

Показувати тільки:

- 1 рядок до зміни
- Змінені рядки
- 1 рядок після зміни

**Повний код** - тільки якщо змінюється >50% файлу.

---

## ✅ Pre-Commit Checklist (Перевірка перед кодом)

Перед генерацією коду, перевір:

- [ ] Чи використав `revalidate` для публічних content сторінок? (Cost-Efficiency)
- [ ] Чи Middleware має strict matcher? (Cost-Efficiency)
- [ ] Чи використав Mantine props замість створення нових CSS класів? (Styling)
- [ ] Чи імпорти використовують Path Aliases (`@/`)? (Structure)
- [ ] Чи DB connection безпечний для Serverless (Singleton)? (Stability)
- [ ] Чи бізнес-логіка відокремлена від UI? (FSD)
- [ ] Чи код дотримується KISS принципу? (Simplicity)
- [ ] Чи використав TanStack Query для API даних замість `useEffect`? (Pattern)
- [ ] Чи компонент менше 150 рядків? (Maintainability)
- [ ] Чи немає Cross-Feature imports? (FSD)

---

## 🧪 Тестування та Дебаг

- **Browser DevTools** - для React/Network дебагу
- **React Query DevTools** - доступні в dev режимі
- **Next.js build output** - перевіряйте на type/lint помилки
- **Vercel Analytics** - моніторинг CPU usage та performance

---

## ⚠️ Важливі нотатки

- Проект використовує **Next.js App Router** (не Pages Router)
- **Supabase** - провайдер аутентифікації (розумійте SSR helper інтеграцію)
- Build має `ignoreBuildErrors: false` - виправляйте помилки локально
- Feature-модулі мають мінімізувати cross-feature залежності
- Використовуйте **shared layer** для спільної логіки
- Кошик підтримує гостьові сесії (auth не обов'язковий)
- **Cost-Efficient:** Мінімальне використання Vercel Compute (Fluid Active CPU)
- **Scalable:** Готовність до 1000+ користувачів без архітектурних змін
- **Performant:** 95+ Lighthouse scores за замовчуванням

---

## 🎯 Контекст проекту

- **Stack:** Next.js 16, TypeScript, Zustand, Mantine 8.2.8, TanStack React Query, Express, Prisma, PostgreSQL (Supabase)
- **Architecture:** Feature-Sliced Design (frontend) + Clean Architecture (backend)
- **Domain:** Український e-commerce магазин м'ясних виробів
- **Roles:** customer, manager, admin, super_admin

---

## 🚀 Швидкий старт для розробника

```bash
# 1. Клонування та встановлення
git clone <repo-url>
cd nameprogect/frontend
npm install

# 2. Налаштування
cp .env.example .env.local
# Відредагуйте .env.local

# 3. Запуск
npm run dev
```

Детальніше дивись **README.md**.

---

## 📚 Корисні посилання

- [Next.js 16 Docs](https://nextjs.org/docs)
- [Mantine UI 8](https://mantine.dev/)
- [Zustand](https://docs.pmnd.rs/zustand/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Vercel Edge Middleware](https://vercel.com/docs/concepts/functions/edge-middleware)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)

---

**Успішної розробки! 🎉**
