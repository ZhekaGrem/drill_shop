# 🛒 Shop - E-Commerce Frontend

> Сучасний інтернет-магазин на Next.js 15 з Feature-Sliced Design архітектурою

---

## 📋 Зміст

- [Про проект](#-про-проект)
- [Технології](#-технології)
- [Передумови](#-передумови)
- [Швидкий старт](#-швидкий-старт)
- [Налаштування](#-налаштування)
  - [1. Supabase (Аутентифікація)](#1-supabase-аутентифікація)
  - [2. Cloudinary (Зображення)](#2-cloudinary-зображення)
  - [3. Telegram Bot (Сповіщення)](#3-telegram-bot-сповіщення)
  - [4. Backend API](#4-backend-api)
- [Запуск проекту](#-запуск-проекту)
- [Скрипти](#-скрипти)
- [Структура проекту](#-структура-проекту)
- [Кастомізація](#-кастомізація)
- [Деплой](#-деплой)
- [Вирішення проблем](#-вирішення-проблем)

---

## 🎯 Про проект

**Shop** — це повнофункціональний e-commerce застосунок для продажу м'ясних виробів з:

- ✅ Каталогом товарів з фільтрами та пошуком
- ✅ Кошиком та оформленням замовлення
- ✅ Інтеграцією з платіжними системами (LiqPay, MonoPay)
- ✅ Адмін-панеллю для управління товарами та замовленнями
- ✅ Системою відгуків та рейтингів
- ✅ Особистим кабінетом користувача
- ✅ Інтеграцією з Нова Пошта API
- ✅ Адаптивним дизайном

---

## 🚀 Технології

### Frontend

- **Next.js 15** - React фреймворк з App Router
- **TypeScript** - типізація коду
- **Mantine UI 8.2.8** - UI бібліотека компонентів
- **Zustand** - управління глобальним станом
- **TanStack Query (React Query)** - кешування та синхронізація даних
- **Axios** - HTTP клієнт
- **React Hook Form + Zod** - валідація форм
- **Keen Slider** - слайдери/каруселі
- **Framer Motion** - анімації

### Backend Integration

- **Express + Prisma** (окремий backend)
- **PostgreSQL** (через Supabase)
- **Supabase Auth** - аутентифікація користувачів
- **Cloudinary** - хостинг зображень

### Архітектура

- **Feature-Sliced Design (FSD)** - модульна архітектура

---

## 🔧 Передумови

Перед початком переконайтеся, що встановлено:

- **Node.js** >= 18.x (рекомендовано 20.x)
- **npm** >= 9.x
- **Git**

Перевірте версії:

```bash
node --version
npm --version
```

---

## ⚡ Швидкий старт

```bash
# 1. Клонування репозиторію
git clone <your-repo-url>
cd shop/frontend

# 2. Встановлення залежностей
npm install

# 3. Налаштування змінних середовища
cp .env.example .env.local
# Відредагуйте .env.local (інструкції нижче)

# 4. Запуск dev сервера
npm run dev
```

Відкрийте [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Налаштування

### 1. Supabase (Аутентифікація)

**Що це:** База даних PostgreSQL + аутентифікація користувачів

**Кроки:**

1. Перейдіть на [supabase.com](https://supabase.com)
2. Натисніть **"Start your project"** → **Sign up**
3. Створіть новий проект:
   - **Project name**: `shop-frontend`
   - **Database Password**: Збережіть пароль!
   - **Region**: Europe West (для України)
4. Дочекайтеся створення (~2 хвилини)
5. Перейдіть у **Settings** → **API**
6. Скопіюйте в `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

**Важливо:** Увімкніть Email Authentication:

- Settings → Authentication → Email Auth → **Enable**

---

### 2. Cloudinary (Зображення)

**Що це:** CDN для зберігання та оптимізації зображень продуктів

**Кроки:**

1. Перейдіть на [cloudinary.com](https://cloudinary.com)
2. Зареєструйтеся (безкоштовний план - 25 GB)
3. На Dashboard знайдіть **Account Details**
4. Скопіюйте в `.env.local`:
   ```env
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
   NEXT_PUBLIC_API_IMG_URL="https://res.cloudinary.com/your-cloud-name"
   ```

**Опціонально (для завантаження з фронтенду):**

- Settings → Upload → Upload presets → Add upload preset
- Preset name: `shop-products`
- Signing Mode: `Unsigned`

---

### 3. Telegram Bot (Сповіщення)

**Що це:** Отримання сповіщень про нові замовлення в Telegram

#### Крок 1: Створити бота

1. Відкрийте Telegram → знайдіть [@BotFather](https://t.me/BotFather)
2. Напишіть `/newbot`
3. Введіть назву: `Shop Orders Bot`
4. Введіть username: `your_shop_orders_bot`
5. Збережіть токен → це ваш `TELEGRAM_BOT_TOKEN`

#### Крок 2: Отримати Chat ID

**Для особистих повідомлень:**

1. Знайдіть свого бота в Telegram
2. Натисніть **Start**
3. Відкрийте в браузері:
   ```
   https://api.telegram.org/bot<ВАШ_ТОКЕН>/getUpdates
   ```
4. Знайдіть `"chat":{"id":123456789}` → це ваш Chat ID

**Для групи:**

1. Додайте бота в групу
2. Зробіть його адміністратором
3. Напишіть повідомлення в групі
4. Відкрийте URL вище
5. Chat ID буде починатися з `-` (наприклад: `-1001234567890`)

**Додайте в `.env.local`:**

```env
TELEGRAM_BOT_TOKEN="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
TELEGRAM_CHAT_ID="-1001234567890"
```

---

### 4. Backend API

**Що це:** Ваш власний сервер на Express + PostgreSQL + Prisma

**Локальна розробка:**

```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
```

**Продакшн:**

1. Задеплойте backend на:
   - [Railway.app](https://railway.app) (рекомендовано)
   - [Render.com](https://render.com)
   - Heroku
   - VPS

2. Оновіть URL в `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL="https://your-backend.railway.app/api/v1"
   ```

---

## 🏃 Запуск проекту

### Development Mode

```bash
npm run dev
```

Відкрийте [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
# 1. Збірка
npm run build

# 2. Запуск
npm start
```

---

## 📜 Скрипти

```bash
# Розробка
npm run dev              # Запуск dev сервера

# Білд і продакшн
npm run build            # Збірка для продакшену
npm start                # Запуск production білду

# Код-стайл
npm run lint             # Перевірка ESLint
npm run lint:fix         # Виправлення помилок ESLint
npm run format           # Форматування Prettier
npm run format:all       # Форматування + ESLint fix
```

---

## 📁 Структура проекту

```
frontend/
├── src/
│   ├── app/                      # Next.js App Router (сторінки)
│   │   ├── about/               # Про нас
│   │   ├── admin/               # Адмін-панель
│   │   │   ├── products/       # Управління товарами
│   │   │   ├── orders/         # Управління замовленнями
│   │   │   ├── categories/     # Управління категоріями
│   │   │   └── users/          # Управління користувачами
│   │   ├── auth/               # Аутентифікація (login, register)
│   │   ├── catalog/            # Каталог товарів
│   │   │   └── [slug]/         # Сторінка товару
│   │   ├── cart/               # Кошик
│   │   ├── checkout/           # Оформлення замовлення
│   │   ├── payment/            # Оплата
│   │   │   └── success/        # Успішна оплата
│   │   ├── profile/            # Особистий кабінет
│   │   ├── orders/             # Історія замовлень
│   │   ├── contact/            # Контакти
│   │   ├── faq/                # FAQ
│   │   └── ...                 # Інші статичні сторінки
│   │
│   ├── features/                # Feature-модулі (FSD)
│   │   ├── auth/               # Аутентифікація
│   │   │   ├── components/
│   │   │   ├── api/
│   │   │   └── hooks/
│   │   ├── cart/               # Кошик
│   │   ├── catalog/            # Каталог
│   │   ├── checkout/           # Чекаут
│   │   ├── favorites/          # Обрані товари
│   │   ├── payment/            # Оплата
│   │   ├── reviews/            # Відгуки
│   │   ├── admin/              # Адмін функції
│   │   └── profile/            # Профіль користувача
│   │
│   ├── shared/                 # Спільні ресурси
│   │   ├── api/               # API клієнт (Axios)
│   │   │   ├── client.ts      # Налаштований Axios instance
│   │   │   └── endpoints.ts   # API endpoints
│   │   ├── components/        # Переиспользуємі UI компоненти
│   │   ├── config/            # Конфігурації
│   │   │   ├── site.ts        # Дані про сайт (назва, контакти)
│   │   │   ├── seo.ts         # SEO налаштування
│   │   │   └── mantine-theme.ts # Тема Mantine UI
│   │   ├── stores/            # Zustand стори
│   │   │   ├── auth.ts        # Стан аутентифікації
│   │   │   ├── cart.ts        # Стан кошика
│   │   │   ├── categories.ts  # Категорії
│   │   │   └── favorites.ts   # Обрані товари
│   │   ├── types/             # TypeScript типи
│   │   ├── utils/             # Утиліти
│   │   │   ├── supabase/      # Supabase клієнти
│   │   │   ├── cloudinary.ts  # Робота з Cloudinary
│   │   │   ├── format.ts      # Форматування (ціна, дата)
│   │   │   └── image.ts       # Оптимізація зображень
│   │   └── providers/         # React providers
│   │
│   └── widgets/                # Великі UI блоки
│       ├── Header/            # Шапка сайту
│       └── Footer/            # Підвал сайту
│
├── public/                     # Статичні файли
│   ├── logo/                  # Логотипи
│   ├── assets/                # Зображення, іконки
│   └── favicon.ico
│
├── .env.local                 # Змінні середовища (НЕ комітити!)
├── .env.example               # Приклад змінних
├── next.config.ts             # Конфігурація Next.js
├── tsconfig.json              # TypeScript конфігурація
├── package.json
├── README.md
└── CLAUDE.md                  # Інструкції для Claude Code
```

---

## 🎨 Кастомізація

### 1. Інформація про магазин

**Файл:** `src/shared/config/site.ts`

```typescript
export const siteConfig = {
  name: 'Назва Магазину',
  fullName: 'Повна назва магазину',
  description: 'Короткий опис вашого магазину',
  url: 'https://your-domain.com',

  contacts: {
    phone: '+380 XX XXX XX XX',
    phone2: '+380 XX XXX XX XX',
    email: 'info@your-shop.com',
    address: 'вул. Ваша, 123, м. Місто',
    city: 'Ваше Місто',
    country: 'Україна',
  },

  socials: {
    tiktok: 'https://www.tiktok.com/@your_shop',
    instagram: 'https://www.instagram.com/your_shop',
    youtube: 'https://www.youtube.com/@your_shop',
    threads: 'https://www.threads.com/@your_shop',
  },

  workingHours: 'Пн-Пт: 08:00 - 20:00 | Сб-Нд: 09:00 - 18:00',
};
```

### 2. SEO налаштування

**Файл:** `src/shared/config/seo.ts`

```typescript
export const baseMetadata: Metadata = {
  metadataBase: new URL('https://your-domain.com'),

  title: {
    default: 'Ваш Магазин | Слоган',
    template: '%s | Ваш Магазин',
  },

  description: 'Детальний опис для пошукових систем (150-160 символів)',

  openGraph: {
    title: 'Ваш Магазин',
    description: 'Опис для соціальних мереж',
    url: 'https://your-domain.com',
    images: [{ url: '/logo/og-image.jpg', width: 1200, height: 630 }],
  },
};
```

### 3. Зміна логотипу

1. Підготуйте зображення:
   - Логотип: `public/logo/logo-5.png` (PNG з прозорим фоном)
   - OG Image: `public/logo/og-image.jpg` (1200x630px для соц. мереж)
   - Favicon: `public/favicon.ico` (32x32px)
   - Apple Icon: `public/apple-touch-icon.png` (180x180px)

2. Оновіть шлях в `src/shared/config/assets.ts`:
   ```typescript
   export const assets = {
     logo: {
       main: '/logo/your-logo.png',
     },
   };
   ```

### 4. Зміна кольорів теми

**Файл:** `src/shared/config/mantine-theme.ts`

```typescript
export const theme = createTheme({
  primaryColor: 'yellow', // Змініть на: blue, red, green, тощо

  colors: {
    yellow: [
      '#FFF9E6', // 0 - найсвітліший
      '#FFB800', // 6 - основний
      '#CC9400', // 9 - найтемніший
    ],
  },
});
```

**CSS змінні:** `src/app/globals.css`

```css
:root {
  --primary: #fbb800;
  --accent: #e6a600;
  --btn-primary: #fbb800;
  --btn-hover: #e6a600;
}
```

### 5. Редагування контенту сторінок

- **Головна:** `src/app/Home.tsx`
- **Про нас:** `src/app/about/page.tsx`
- **Контакти:** `src/app/contact/Contact.tsx`
- **FAQ:** `src/app/faq/FAQ.tsx`
- **Доставка:** `src/app/delivery-and-payment/DeliveryAndPayment.tsx`

---

## 🌍 Деплой

### Vercel (Рекомендовано)

1. Push код на GitHub
2. Перейдіть на [vercel.com](https://vercel.com)
3. Імпортуйте репозиторій
4. Додайте змінні середовища з `.env.local`
5. Deploy!

### Netlify

```bash
npm run build
# Завантажте папку .next на Netlify
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

---

## 🐛 Вирішення проблем

### Помилка: "NEXT_PUBLIC_SUPABASE_URL is not defined"

**Рішення:**

```bash
# Перевірте що .env.local існує
cat .env.local

# Перезапустіть dev сервер
npm run dev
```

### Помилка при build: TypeScript errors

**Рішення:**

```bash
# Очистіть кеш
rm -rf .next

# Перевстановіть залежності
rm -rf node_modules
npm install

# Білд
npm run build
```

### Зображення не завантажуються

**Причини:**

- Невірний `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- Зображення не завантажені в Cloudinary
- Домени не додані в `next.config.ts`

**Рішення:**

1. Перевірте `.env.local`
2. Перевірте Cloudinary Dashboard
3. Перевірте `next.config.ts` → `images.remotePatterns`

### Помилка 401 при API запитах

**Причина:** Токен аутентифікації не передається або застарів

**Рішення:**

- Перелогіньтесь
- Перевірте що Supabase session активна
- Перевірте Network tab в DevTools → Headers

---

## 📚 Корисні посилання

- [Next.js Docs](https://nextjs.org/docs)
- [Mantine UI](https://mantine.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Cloudinary Docs](https://cloudinary.com/documentation)

---

## 📝 Ліцензія

Цей проект є приватним і призначений для комерційного використання.

---

## 👨‍💻 Автор

Створено для українського бізнесу 🇺🇦

---

## 📞 Підтримка

Якщо у вас виникли питання:

- Створіть Issue в GitHub
- Напишіть на email

---

**Успішного запуску! 🚀**
