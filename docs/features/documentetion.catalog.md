# 📋 Документація модуля Каталог

## Огляд

Модуль каталогу реалізує повний функціонал перегляду товарів без авторизації для українського e-commerce м'ясних продуктів. Включає сторінки каталогу, деталей товару, фільтрацію, пошук та пагінацію.

## 🏗️ Архітектура

### Feature-Sliced Design структура:

```
features/catalog/
├── api/products.ts          # API функції для товарів/категорій
├── components/
│   ├── ProductCard/         # Карточка товару
│   └── CatalogFilters/      # Фільтри каталогу
└── hooks/useCatalogFilters.ts # Store для фільтрів + URL sync

shared/
├── stores/categories.ts     # Store категорій (Zustand)
├── components/
│   ├── Pagination/         # Пагінація
│   └── SearchInput/        # Пошук з debounce
└── types/                  # TypeScript типи

app/(shop)/
├── catalog/page.tsx        # Список товарів
└── catalog/[slug]/page.tsx # Деталі товару
```

## 🔌 API Інтеграція

### Ендпоінти:

- `GET /api/v1/products` - список товарів з фільтрами
- `GET /api/v1/products/{slug}` - деталі товару
- `GET /api/v1/categories` - дерево категорій
- `GET /api/v1/categories/navigation` - спрощена навігація

### Типи відповідей:

```typescript
interface ProductsResponse {
  success: boolean;
  data: Product[];
  meta: { total: number; limit: number; offset: number; hasMore: boolean };
  message: string;
}

interface ProductResponse {
  success: boolean;
  data: ProductWithRelations & {
    relatedProducts?: Product[];
    breadcrumbs?: { name: string; slug: string; url: string }[];
  };
  message: string;
}
```

## 📊 State Management

### 1. Categories Store (`useCategoriesStore`)

**Призначення:** Управління категоріями в пам'яті

```typescript
interface CategoriesState {
  categories: Category[];
  navigation: Category[];
  isLoading: boolean;
  error: string | null;

  fetchCategories: () => Promise<void>;
  fetchNavigation: () => Promise<void>;
  getCategoryBySlug: (slug: string) => Category | undefined;
  getCategoryChildren: (parentId: string) => Category[];
}
```

**Особливості:**

- Завантажує категорії один раз при старті
- НЕ ВИКОРИСТОВУЄ persist (тільки в пам'яті)
- Підтримує ієрархічну структуру

### 2. Catalog Filters Store (`useCatalogFilters`)

**Призначення:** Фільтри + URL синхронізація + sessionStorage

```typescript
interface CatalogFiltersState {
  filters: ProductFilters;
  pagination: Pagination;

  setFilter: (key: keyof ProductFilters, value: any) => void;
  setFilters: (filters: Partial<ProductFilters>) => void;
  clearFilters: () => void;
  setPagination: (pagination: Partial<Pagination>) => void;

  getUrlParams: () => URLSearchParams;
  setFromUrlParams: (params: URLSearchParams) => void;
}
```

**Особливості:**

- Синхронізація з URL параметрами
- Збереження в sessionStorage
- Автоматичний reset pagination при зміні фільтрів

## 🎨 Компоненти

### ProductCard

**Файл:** `features/catalog/components/ProductCard/ProductCard.tsx`
**Призначення:** Карточка товару для сітки каталогу

**Props:**

```typescript
interface ProductCardProps {
  product: Product;
  className?: string;
}
```

**Функціонал:**

- Відображення ціни в UAH
- Статус наявності
- Вага товару
- Бейдж "Популярне" для featured товарів
- Hover ефекти
- Responsive дизайн

**CSS клас структура:**

```css
.product-card
├── .product-card__link
├── .product-card__image-container
│   ├── .product-card__image
│   └── .product-card__badge
├── .product-card__content
│   ├── .product-card__title
│   ├── .product-card__description
│   └── .product-card__footer
│       ├── .product-card__price
│       └── .product-card__actions
```

### CatalogFilters

**Файл:** `features/catalog/components/CatalogFilters/CatalogFilters.tsx`
**Призначення:** Бічна панель з фільтрами

**Props:**

```typescript
interface CatalogFiltersProps {
  onFiltersChange?: () => void;
  className?: string;
}
```

**Фільтри:**

- **Сортування:** популярність, ціна, назва, дата створення
- **Категорії:** radio buttons (тільки одна категорія)
- **Ціновий діапазон:** два input для min/max
- **Наявність:** checkbox "Тільки в наявності"
- **Кнопка "Очистити"** для reset всіх фільтрів

### Pagination

**Файл:** `shared/components/Pagination/Pagination.tsx`
**Призначення:** Класична пагінація з номерами сторінок

**Props:**

```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}
```

**Логіка відображення:**

- ≤7 сторінок: показати всі
- \>7 сторінок: використовувати еліпсис `...`
- Завжди показувати першу та останню сторінку
- Кнопки "Попередня"/"Наступна" з іконками

### SearchInput

**Файл:** `shared/components/SearchInput/SearchInput.tsx`
**Призначення:** Пошук для header з debounce

**Props:**

```typescript
interface SearchInputProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}
```

**Функціонал:**

- **Debounce 300ms** для автоматичного пошуку
- Кнопка очищення при наявності тексту
- Escape для blur
- Sync з `useCatalogFilters`
- Перенаправлення на `/catalog?search=...`

## 📄 Сторінки

### Catalog Page `/catalog`

**Файл:** `app/(shop)/catalog/page.tsx`
**Призначення:** Головна сторінка каталогу з сіткою товарів

**URL параметри:**

- `search` - пошуковий запит
- `categorySlug` - slug категорії
- `minPrice`, `maxPrice` - ціновий діапазон
- `sortBy`, `sortOrder` - сортування
- `limit` - товарів на сторінці (default: 20)
- `page` - номер сторінки

**Layout:**

```
Header: заголовок + кількість знайдених товарів
Content:
├── Sidebar: CatalogFilters (sticky)
└── Main:
    ├── ProductGrid (3-4 колонки)
    └── Pagination
```

**States:**

- `Loading`: skeleton grid з 12 елементів
- `Error`: retry кнопка
- `Empty`: повідомлення "Товари не знайдені"
- `Success`: сітка товарів + пагінація

### Product Page `/catalog/[slug]`

**Файл:** `app/(shop)/catalog/[slug]/page.tsx`
**Призначення:** Детальна сторінка товару

**Layout:**

```
Breadcrumbs: Каталог → Назва товару
ProductDetails:
├── Images: головне фото + thumbnails
└── Info:
    ├── Заголовок + мета (артикул, вага)
    ├── Ціна
    ├── Короткий опис
    └── Actions:
        ├── Quantity selector
        ├── "Додати в кошик" button
        └── Наявність

Description: повний опис товару
RelatedProducts: сітка 2x2 схожих товарів
```

**Функціонал:**

- Галерея зображень з переключенням
- Quantity selector з валідацією stock
- Кнопка кошика (поки console.log)
- Breadcrumbs навігація
- Mobile-optimized layout

## 🔄 Data Flow

### 1. Ініціалізація каталогу:

```
1. User → /catalog
2. Page → useCatalogFilters.setFromUrlParams(searchParams)
3. Page → useEffect → fetchProducts(filters, pagination)
4. API → productsApi.getProducts() → ProductsResponse
5. State → setProducts(response.data)
6. Render → ProductCard grid + Pagination
```

### 2. Зміна фільтрів:

```
1. User → CatalogFilters input change
2. useCatalogFilters → setFilter(key, value)
3. Auto → sessionStorage.setItem('catalog-filters')
4. Auto → pagination.offset = 0 (reset to first page)
5. Trigger → onFiltersChange callback
6. Page → router.push with new URL params
7. Cycle → fetchProducts with new filters
```

### 3. Пагінація:

```
1. User → Pagination button click
2. handlePageChange(newPage)
3. Calculate → newOffset = (page - 1) * limit
4. useCatalogFilters → setPagination({ offset: newOffset })
5. Router → push new URL with ?page=X
6. Auto → scroll to top
7. Trigger → fetchProducts with new pagination
```

### 4. Пошук:

```
1. User → SearchInput typing
2. Debounce → 300ms delay
3. useCatalogFilters → setFilter('search', query)
4. Router → push /catalog?search=query
5. Auto → filters change triggers fetchProducts
```

## 🎯 Налаштування за замовчуванням

### Фільтри:

```typescript
const defaultFilters: ProductFilters = {
  categorySlug: undefined,
  search: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  isActive: true, // тільки активні товари
  sortBy: 'salesCount', // за популярністю
  sortOrder: 'desc', // спочатку популярні
};
```

### Пагінація:

```typescript
const defaultPagination: Pagination = {
  limit: 20, // товарів на сторінці
  offset: 0, // початок з першої сторінки
};
```

## 📱 Responsive Design

### Breakpoints:

- **Desktop (>1024px):** сітка 3-4 колонки, sidebar 280px
- **Tablet (768-1024px):** сітка 2-3 колонки, sidebar 240px
- **Mobile (<768px):** сітка 1-2 колонки, sidebar під контентом

### Mobile оптимізації:

- Filters переходять вниз під сітку товарів
- ProductCard стає компактнішою
- Quantity selector + Add to Cart стають sticky внизу на product page
- Pagination показує тільки іконки без тексту

## 🐛 Обробка помилок

### API Errors:

```typescript
try {
  const response = await productsApi.getProducts();
  // success
} catch (error) {
  setError(error.message);
  setProducts([]);
  // показуємо error state з retry кнопкою
}
```

### Empty States:

- **Товари не знайдені:** коли API повертає пустий масив
- **Категорії не завантажились:** loading spinner
- **Мережева помилка:** retry кнопка

## 🔗 Інтеграції

### С кошиком:

```typescript
// TODO: заглушка в ProductCard та ProductPage
const handleAddToCart = () => {
  console.log('Add to cart:', { productId, quantity });
  // Інтеграція з features/cart
};
```

### З авторизацією:

- Обрані товари (favorites) поки не реалізовані
- Історія переглядів відсутня
- Персоналізовані рекомендації не підключені

## 🚀 Готовність до продакшну

### ✅ Готово:

- Повний UI/UX каталогу
- TypeScript типізація
- Responsive design
- URL синхронізація
- Error handling
- Loading states
- SEO friendly URLs

### 🔧 Для розробки:

Модуль готовий до використання після додавання базових shared компонентів. API інтеграція налаштована під backend з документації.
