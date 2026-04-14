# CLAUDE.md

Цей файл містить інструкції для Claude Code (claude.ai/code) при роботі з кодом цього репозиторію.

---

## 🎯 Огляд проекту

**shchilnui Drill** — це Next.js e-commerce магазин мерчу (футболки, худі, аксесуари) з використанням **Feature-Sliced Design (FSD)** архітектури.

### Ролі та цілі

Ти **Senior Next.js Architect & Performance Engineer**, що працює над високонавантаженим e-commerce проектом.

**Твій код має бути:**

1. **FSD Compliant** — строге дотримання Feature-Sliced Design
2. **Cost-Efficient** — мінімальне використання Vercel Compute (Fluid Active CPU)
3. **Scalable** — готовність до 1000+ користувачів без архітектурних змін
4. **Production-Ready** — type-safe, чистий код, дотримання правил стилізації

### Стек технологій

- **Frontend:** Next.js 16, TypeScript, Mantine UI 8.3, Zustand, TanStack Query
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
- `delivery-and-payment/`, `forgot-password/`, `privacy-policy/`, `public-offer/`
- `register/`, `resend-verification/`, `login/`

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
- `notify-availability/` - Сповіщення про наявність товару

#### `src/shared/` - Спільні ресурси

- **`api/`** - Axios клієнт, endpoints, API утиліти
- **`stores/`** - Zustand стори:
  - `auth.ts` - Стан аутентифікації та профілю
  - `cart.ts` - Стан кошика з підтримкою сесій
  - `categories.ts` - Категорії продуктів
  - `favorites.ts` - Обрані товари
  - `telegram-auth.ts` - Telegram аутентифікація
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
  - `mantine-theme.ts` - Тема Mantine UI
  - `assets.ts` - Шляхи до статичних ресурсів
  - `content.ts` - Контентні конфігурації
  - `design-tokens.ts` - Дизайн-токени
  - `react-query.ts` - Конфігурація TanStack Query

#### `src/widgets/` - Великі UI компоненти

- `Header/` - Шапка сайту
- `Footer/` - Підвал сайту
- `ChatWidget/` - Чат-віджет
- `HeroImage/` - Hero секція головної сторінки
- `PopularProductsSlider/` - Слайдер популярних товарів
- `TelegramBottomNav/` - Нижня навігація для Telegram

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

**Заборонено:** `export const dynamic = 'force-dynamic'` та `no-store` fetch без реальної потреби

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

- **SINGLETON PATTERN:** Глобальний singleton для Prisma/Supabase clients
- **FORBIDDEN:** НІКОЛИ `new PrismaClient()` всередині функції/компонента (connection exhaustion)

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

**Заборонено:** cross-feature imports (`features/cart` → `features/catalog`) та `shared` → `features`

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

### State Management

- **Server Data** (Products, Orders, Profile) → **TanStack Query** (hooks в `features/*/hooks/`)
- **Client State** (Modals, Auth, Cart) → **Zustand** (stores в `shared/stores/`)

### API інтеграція

- Axios клієнт: `src/shared/api/client.ts` (авто-включає Supabase auth токени)
- Endpoints: `src/shared/api/endpoints.ts`
- Feature API: `src/features/*/api/`

### Feature-модулі

Кожна feature містить: `components/`, `api/`, `hooks/`, опціонально `types.ts`

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

1. Створіть `src/features/{featureName}/` з піддиректоріями: `components/`, `api/`, `hooks/`
2. Endpoint → `src/shared/api/endpoints.ts`, API файл → `features/*/api/`, Hook з TanStack Query → `features/*/hooks/`
3. Store (якщо потрібен) → `src/shared/stores/`

---

## 🚫 Anti-Patterns (Короткий список)

- **NO N+1 Queries** — не fetch в `.map()`, завантажуй bulk
- **NO useEffect для Data Fetching** — використовуй TanStack Query
- **NO Generic `any`** — використовуй `unknown` або конкретний interface
- **NO Direct API Calls в Components** — завжди через API layer (`shared/api` або `features/*/api`)
- **NO Hardcoded Configs** — використовуй `.env` та `shared/config`

---

## ⚠️ Принципи простоти (KISS)

### Ліміти складності

- **Функція:** максимум 50 рядків
- **Component:** максимум 150 рядків
- **If/else:** максимум 2 рівні вкладеності
- **Параметри функції:** максимум 4
- **Дублювання:** 0 толерантності (DRY)

### Коли запитати користувача

Питай ПЕРЕД тим як: додавати функціонал "на майбутнє", робити код "універсальнішим", створювати абстракції для 1-2 використань, або писати >50 рядків на простий таск.

---

## 📝 Правила роботи з кодом

- Аналізуй існуючий код та шукай дублювання перед реалізацією
- Найпростіше рішення, production-ready, type-safe, без заглушок/TODO
- Мінімальні зміни в існуючій структурі, збереження бізнес-логіки
- Показуй тільки змінені рядки (+1 рядок контексту), повний код — якщо >50% файлу змінено

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

- **App Router** (не Pages Router), build з `ignoreBuildErrors: false`
- Кошик підтримує гостьові сесії (auth не обов'язковий)
- Supabase SSR helper інтеграція для аутентифікації

---

## 🎯 Контекст проекту

- **Domain:** Український магазин мерчу музикантів shchilnui Drill
- **Roles:** customer, manager, admin, super_admin
