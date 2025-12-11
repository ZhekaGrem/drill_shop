# CLAUDE.md

Цей файл містить інструкції для Claude Code (claude.ai/code) при роботі з кодом цього репозиторію.

---

## 🎯 Огляд проекту

**Shop** — це Next.js e-commerce застосунок для продажу
**Feature-Sliced Design (FSD)** архітектури.

## ⚡ Quick Rules for Development

Before writing code, CHECK:

- [ ] Використовуєш Mantine props замість inline styles?
- [ ] Перевірив чи є компонент в `src/shared/components/`?
- [ ] API виклик через TanStack Query, НЕ напряму в компоненті?
- [ ] TypeScript типи імпортовані з `src/shared/types/`?
- [ ] Zustand store оновлюється через actions, НЕ напряму?
- [ ] Компонент < 150 рядків? (Якщо ні — розділи)
- [ ] Немає дублювання логіки з інших features?
- [ ] Path aliases використані (`@/shared`, `@/features`)?

### Стек технологій

- **Frontend:** Next.js 15, TypeScript, Mantine UI 8.2.8, Zustand, TanStack Query
- **TelegramMiniApp:** Next.js 15, TypeScript, Mantine UI 8.2.8, Zustand, TanStack Query
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

## 🏗️ Feature-Sliced Design Rules

### Layer hierarchy (dependencies flow DOWN only):

```
app → widgets → features → shared
 ↓       ↓         ↓         ↓
Pages  Layout   Business  Utils
```

**Strict rules:**

- ✅ `features/` can import from `shared/`
- ✅ `widgets/` can import from `features/` and `shared/`
- ✅ `app/` can import from everything
- ❌ `shared/` NEVER imports from `features/`
- ❌ Features NEVER import from other features directly
- ❌ Circular dependencies = immediate refactor

**Cross-feature communication:**

```typescript
// ❌ BAD - direct feature import
import { CartButton } from '@/features/cart';

// ✅ GOOD - через shared layer або props
import { useCartStore } from '@/shared/stores/cart';
// або передай через props з parent component
```

### Feature structure template:

```
src/features/{featureName}/
├── components/           # Feature UI components
│   ├── ComponentName.tsx
│   ├── ComponentName.module.scss
│   └── index.ts
├── api/                 # API calls for this feature
│   └── feature-api.ts
├── hooks/               # Custom hooks
│   └── useFeature.ts
├── types.ts            # Feature-specific types (optional)
└── index.ts            # Public API (only export what's needed)
```

**Rules:**

- Each feature is **self-contained** (can be deleted without breaking others)
- Export **minimal public API** через `index.ts`
- Internal files (helpers, utils) = prefix with `_` (e.g., `_helpers.ts`)

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

## 🏗️ Архітектурні патерни

## 🗄️ State Management (Zustand)

### Store location and naming:

- **Global stores** → `src/shared/stores/`
- **Feature stores** → `src/features/{feature}/store.ts` (if feature-specific)

### Store structure pattern:

```typescript
// src/shared/stores/example.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ExampleState {
  // State
  items: Item[];
  isLoading: boolean;

  // Actions (mutations)
  setItems: (items: Item[]) => void;
  addItem: (item: Item) => void;
  clearItems: () => void;

  // Async actions (with error handling)
  fetchItems: () => Promise;
}

export const useExampleStore = create()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      isLoading: false,

      // Sync actions
      setItems: (items) => set({ items }),
      addItem: (item) =>
        set((state) => ({
          items: [...state.items, item],
        })),
      clearItems: () => set({ items: [] }),

      // Async actions
      fetchItems: async () => {
        set({ isLoading: true });
        try {
          const data = await apiCall();
          set({ items: data, isLoading: false });
        } catch (error) {
          console.error('Failed to fetch items:', error);
          set({ isLoading: false });
        }
      },
    }),
    { name: 'example-storage' } // localStorage key
  )
);
```

### Rules:

- ✅ Use `persist` middleware для даних які треба зберігати між сесіями
- ✅ Async логіка В store actions (не в компонентах)
- ✅ Error handling в async actions
- ❌ НЕ мутуй state напряму — тільки через `set()`
- ❌ НЕ викликай store actions в render (тільки в useEffect/handlers)
- ❌ НЕ дублюй server state (products, orders) — використовуй TanStack Query

### When to use Zustand vs TanStack Query:

**Zustand** (client state):

- Auth state (user, isAuthenticated)
- Cart (local items before checkout)
- UI state (modals, filters, preferences)
- Favorites (optimistic updates)

**TanStack Query** (server state):

- Products list
- Orders history
- User profile (from API)
- Categories tree

## 🌐 API Integration

### API client setup:

**Location:** `src/shared/api/client.ts`

```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (add auth token)
apiClient.interceptors.request.use((config) => {
  const token = getSupabaseToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor (handle errors)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error);
  }
);
```

### Endpoints structure:

**Location:** `src/shared/api/endpoints.ts`

```typescript
export const API_ENDPOINTS = {
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}`,
    SEARCH: '/products/search',
  },
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
  },
  // ...
} as const;
```

### Feature API pattern:

**Location:** `src/features/{feature}/api/feature-api.ts`

```typescript
import { apiClient } from '@/shared/api/client';
import { API_ENDPOINTS } from '@/shared/api/endpoints';
import type { Product, ApiResponse } from '@/shared/types';

export const productApi = {
  getList: async (params?: ProductFilters): Promise<Product[]> => {
    const { data } = await apiClient.get<ApiResponse<Product[]>>(API_ENDPOINTS.PRODUCTS.LIST, { params });
    return data.data;
  },

  getDetail: async (id: string): Promise<Product> => {
    const { data } = await apiClient.get<ApiResponse<Product>>(API_ENDPOINTS.PRODUCTS.DETAIL(id));
    return data.data;
  },
};
```

### TanStack Query integration:

**Location:** `src/features/{feature}/hooks/useFeatureQuery.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../api/product-api';

// Query keys (centralized)
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters?: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

// Query hook
export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productApi.getList(filters),
    staleTime: 5 * 60 * 1000, // 5 min
  });
};

// Mutation hook (with cache invalidation)
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
};
```

### Rules:

- ✅ API calls ONLY through `apiClient` (not raw fetch/axios)
- ✅ Endpoints centralized in `API_ENDPOINTS`
- ✅ TanStack Query для server state (не Zustand)
- ✅ Query keys централізовані (`productKeys`, `orderKeys`)
- ✅ Cache invalidation після mutations
- ❌ НЕ викликай API напряму в компонентах — тільки через hooks
- ❌ НЕ дублюй query keys (використовуй helper functions)

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

## 🧪 Тестування та Дебаг

- **Browser DevTools** - для React/Network дебагу
- **React Query DevTools** - доступні в dev режимі
- **Next.js build output** - перевіряйте на type/lint помилки

---

## ⚠️ Важливі нотатки

- Проект використовує **Next.js App Router** (не Pages Router)
- не використовувати any
- **Supabase** - провайдер аутентифікації (розумійте SSR helper інтеграцію)
- Build поки що має `ignoreBuildErrors: false` - виправляйте помилки локально
- Feature-модулі мають мінімізувати cross-feature залежності
- Використовуйте **shared layer** для спільної логіки
- Кошик підтримує гостьові сесії (auth не обов'язковий)

---

## 🎨 STRICT STYLING RULES (CRITICAL)

### 1. The "Single Source" Rule

Для кожного окремого HTML-елемента обери **ТІЛЬКИ ОДИН** метод стилізації. ЗАБОРОНЕНО змішувати їх.

- **Варіант A (Mantine Props):** Для відступів, кольорів, шрифтів, flex/grid лейаутів.
  - _Приклад:_ `<Box p="md" bg="gray.1" display="flex">`
- **Варіант B (SCSS Module):** Тільки для складних анімацій, псевдо-елементів (`::before`), медіа-запитів, яких немає в Mantine, або каскадних селекторів.
  - _Приклад:_ `<div className={styles.complexCard}>`
- **Варіант C (Inline Styles):** Тільки для динамічних значень (змінні JS).
  - _Приклад:_ `style={{ width: `${progress}%` }}`

### 🚫 HARD FORBIDDEN (ANTI-PATTERNS)

1. **NO HYBRID STYLING:** Ніколи не пиши `className={styles.box} p="md"`. Якщо є клас — всі стилі пиши в SCSS. Якщо є пропси — не додавай клас.
2. **NO INLINE STATIC STYLES:** `style={{ marginTop: '10px' }}` -> **BAN**. Використовуй `mt={10}` або `mt="xs"`.
3. **NO GLOBAL CLASSES:** Ніколи не використовуй глобальні класи (типу `.mb-10`), окрім тих, що в `globals.scss`.
4. **NO DUPLICATE CSS VARIABLES:** Не створюй `color: #FFB800` в SCSS. Імпортуй тему або використовуй Mantine змінні (`var(--mantine-color-yellow-6)`).

### 🔍 Styling Algorithm (Follow Step-by-Step)

Перед написанням стилів:

1. Чи можу я це зробити через Mantine Props (`m`, `p`, `c`, `bg`, `flex`)? -> **Так?** -> Використовуй Props.
2. Це потребує `hover`, `focus` або складного позиціонування? -> **Так?** -> Створи `.module.scss`.
3. Це залежить від runtime змінної? -> **Так?** -> Inline style.

### SCSS Structure

````scss
// BAD
.wrapper {
  padding: 16px; // Use Mantine prop p="md" instead
  color: #000;   // Use Mantine prop c="black" instead
}

// GOOD (Only things Mantine props can't do easily)
.userAvatar {
  transition: transform 0.3s ease;
  &:hover {
    transform: scale(1.1);
    box-shadow: var(--mantine-shadow-md);
  }
}
## 📝 Правила роботи з кодом

### ⚡ Головний принцип

**МІНІМУМ КОДУ = МАКСИМУМ ЯКОСТІ**

Перед кожною зміною запитай: "Чи можна вирішити це меншою кількістю рядків?"

---

### 🚫 ЗАБОРОНИ

#### Не ускладнюй

- **НЕ додавай властивості/параметри "на всяк випадок"** — якщо одна властивість вирішує задачу, друга не потрібна
- **НЕ дублюй функціонал** — якщо A вже робить роботу, B для того ж самого = зайве
- **НЕ додавай fallbacks** без реальної браузерної потреби
- **НЕ пиши defensive code** там де він не потрібен

#### Не відволікайся

- **НЕ рефактор** код який працює і не пов'язаний з задачею
- **НЕ пропонуй "покращення"** які не просили
- **НЕ змінюй стиль/форматування** існуючого коду без потреби
- **НЕ додавай коментарі** до очевидного коду

#### Не гадай

- **пропонуй 2-3 варіанти** — і пиши всі варіанти(коротко) і показуй яке ОДНЕ ти вважаєш найкращим рішенням для цієї проблеми
- **НЕ пиши "можливо", "напевно", "варто б"** — або знаєш, або питай
- **НЕ припускай** що потрібно користувачу — питай якщо неясно

---

### ✅ Алгоритм перед написанням коду

1. **Яка конкретна проблема?** (одне речення)
2. **Який мінімальний код її вирішує?** (ідеально 1-5 рядків)
3. **Чи є вже щось в проекті що робить схожу роботу?** (перевір перед створенням нового)
4. **Чи кожен рядок мого рішення необхідний?** (видали все зайве)

---

### 🎯 Вимоги до коду

- Найпростіше рішення яке працює
- Production-ready без заглушок та TODO
- Type-safe TypeScript
- Мінімальні зміни в існуючій структурі
- Обробка помилок тільки там де реально потрібна

---

### 🔍 Перевірка на дублювання

Перед написанням нового коду перевір:

- Чи є схожа функція/компонент в проекті?
- Чи можна розширити існуюче замість створення нового?
- Чи не дублюю я логіку яка вже є?

**Знайшов дублювання — повідом перед реалізацією!**

---

### 📤 Формат виводу змін

**Мінімальний контекст:**

- 1 рядок до зміни
- Змінені рядки
- 1 рядок після зміни

**Повний код** — тільки якщо змінюється >50% файлу.

**Без пояснень** — якщо зміна очевидна, код говорить сам за себе.

## 🎯 Контекст проекту

- **Stack:** Next.js 15, TypeScript, Zustand, Mantine 8.2.8, TanStack React Query, Express, Prisma, PostgreSQL (Supabase), REDIS
- **Architecture:** Feature-Sliced Design (frontend) + Clean Architecture (backend)
- **Domain:** Український e-commerce магазин м'ясних виробів
- **Roles:** customer, manager, admin, super_admin

---

## 🚀 Швидкий старт для розробника

```bash
# 1. Клонування та встановлення
git clone <repo-url>
cd shop/frontend
npm install

# 2. Налаштування
cp .env.example .env.local
# Відредагуйте .env.local

# 3. Запуск
npm run dev
````

Детальніше дивись **README.md**.

---

## 📚 Корисні посилання

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Mantine UI 8](https://mantine.dev/)
- [Zustand](https://docs.pmnd.rs/zustand/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

---

## 🧩 Component Development Rules

### Component size limit:

- **Max 150 lines** per component
- Якщо більше → розділи на sub-components або extract logic to hooks

### Component structure:

```typescript
// 1. Imports (grouped)
import React from 'react';
import { Box, Button } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/shared/stores/auth';
import { formatPrice } from '@/shared/utils/format';
import type { Product } from '@/shared/types';

import styles from './ProductCard.module.scss';

// 2. Types/Interfaces
interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

// 3. Component
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart
}) => {
  // 3.1. Hooks (top of component)
  const { user } = useAuthStore();
  const { data, isLoading } = useProductDetails(product.id);

  // 3.2. Event handlers
  const handleAddToCart = () => {
    onAddToCart?.(product);
  };

  // 3.3. Early returns
  if (isLoading) return <Skeleton />;
  if (!data) return null;

  // 3.4. Render
  return (
    <Box className={styles.card}>
      <Text>{product.name}</Text>
      <Button onClick={handleAddToCart}>
        {formatPrice(product.price)}
      </Button>
    </Box>
  );
};
```

### Rules:

- ✅ Named exports (не default exports для components)
- ✅ Props interface явно типізований
- ✅ Hooks на початку компонента
- ✅ Event handlers перед render
- ✅ Early returns для loading/error states
- ❌ НЕ inline functions в JSX (винеси в handlers)
- ❌ НЕ складна логіка в render — extract to hooks/utils
- ❌ НЕ useState для server data — використовуй TanStack Query

### When to extract to custom hook:

```typescript
// ❌ BAD - logic in component
function ProductList() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetch('/api/products')
      .then(res => res.json())
      .then(setProducts)
      .finally(() => setIsLoading(false));
  }, []);

  return <div>{products.map(...)}</div>;
}

// ✅ GOOD - logic in custom hook
function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: productApi.getList,
  });
}

function ProductList() {
  const { data: products, isLoading } = useProducts();
  return <div>{products?.map(...)}</div>;
}
```

## ⚡ Performance Best Practices

### Image optimization:

```typescript
// ✅ GOOD - Next.js Image with Cloudinary
import Image from 'next/image';

<Image
  src={getCloudinaryUrl(product.image, { width: 400, quality: 80 })}
  alt={product.name}
  width={400}
  height={300}
  loading="lazy"
/>

// ❌ BAD - raw <img>
<img src={product.image} />
```

### Code splitting:

```typescript
// ✅ GOOD - dynamic import для heavy components
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false, // if client-only
});
```

### Memoization:

```typescript
// Use мемоізацію ONLY якщо є performance проблема

// ✅ Expensive calculations
const sortedProducts = useMemo(() => products.sort((a, b) => b.price - a.price), [products]);

// ✅ Callbacks passed to child components
const handleClick = useCallback(
  (id: string) => {
    addToCart(id);
  },
  [addToCart]
);

// ❌ НЕ мемоізуй все підряд (premature optimization)
```

### Bundle size:

- ✅ Use barrel exports обережно (`index.ts` може імпортувати багато)
- ✅ Tree-shaking friendly imports:

```typescript
// ✅ GOOD
import { Button } from '@mantine/core';

// ❌ BAD (imports everything)
import * as Mantine from '@mantine/core';
```

- ✅ Lazy load routes/features коли можливо

## 📘 TypeScript Best Practices

### Type location:

- **Shared types** → `src/shared/types/`
- **Feature types** → `src/features/{feature}/types.ts`
- **Component props** → в тому ж файлі що компонент

### Rules:

- ✅ **NO `any`** (use `unknown` якщо тип невідомий)
- ✅ **NO type assertions** без потреби (`as`)
- ✅ Interface для object shapes, Type для unions
- ✅ Generic types для reusable logic
- ❌ НЕ duplicate types (import з `@/shared/types`)
- ❌ НЕ пропускай типи (`implicit any`)

### Examples:

```typescript
// ✅ GOOD - explicit types
interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  variant?: 'default' | 'compact';
}

// ✅ GOOD - utility types
type PartialProduct = Partial<Product>;
type ProductWithoutId = Omit<Product, 'id'>;

// ❌ BAD - any
function handleData(data: any) { ... }

// ✅ GOOD - unknown + type guard
function handleData(data: unknown) {
  if (isProduct(data)) {
    // data is Product here
  }
}
```

### API response types:

```typescript
// src/shared/types/api.ts
export interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    total: number;
    limit: number;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
```
