# CLAUDE.md

Цей файл містить інструкції для Claude Code (claude.ai/code) при роботі з кодом цього репозиторію.

---

## 🎯 Огляд проекту

**Shop Sausages** — це Next.js e-commerce застосунок для продажу одягу
**Feature-Sliced Design (FSD)** архітектури.

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

## 🏗️ Архітектурні патерни

### Управління станом (Zustand)

Стори знаходяться в `src/shared/stores/`:

```typescript
// Приклад використання
import { useAuthStore } from '@/shared/stores/auth';
import { useCartStore } from '@/shared/stores/cart';

function Component() {
  const { user, isAuthenticated } = useAuthStore();
  const { items, addItem } = useCartStore();
  // ...
}
```

### API інтеграція

Всі API виклики використовують налаштований Axios клієнт з `src/shared/api/client.ts`:

- Автоматично включає Supabase auth токени
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
- **Supabase** - провайдер аутентифікації (розумійте SSR helper інтеграцію)
- Build поки що має `ignoreBuildErrors: false` - виправляйте помилки локально
- Feature-модулі мають мінімізувати cross-feature залежності
- Використовуйте **shared layer** для спільної логіки
- Кошик підтримує гостьові сесії (auth не обов'язковий)

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

## 🎯 Контекст проекту

- **Stack:** Next.js 15, TypeScript, Zustand, Mantine 8.2.8, TanStack React Query, Express, Prisma, PostgreSQL (Supabase)
- **Architecture:** Feature-Sliced Design (frontend) + Clean Architecture (backend)
- **Domain:** Український e-commerce магазин м'ясних виробів
- **Roles:** customer, manager, admin, super_admin

---

## 🚀 Швидкий старт для розробника

```bash
# 1. Клонування та встановлення
git clone <repo-url>
cd shop_sausages/frontend
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

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Mantine UI 8](https://mantine.dev/)
- [Zustand](https://docs.pmnd.rs/zustand/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

---

**Успішної розробки! 🎉**
