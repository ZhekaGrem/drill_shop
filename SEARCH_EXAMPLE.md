# Приклад використання SearchInput

## Компонент готовий до використання в Header

### Імпорт та використання:

```tsx
// src/widgets/Header/Header.tsx
import { SearchInput } from '@/features/catalog';

export const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>Shop Sausages</div>

      {/* Пошук товарів */}
      <div className={styles.searchWrapper}>
        <SearchInput placeholder="Пошук м'яса..." />
      </div>

      <div className={styles.actions}>{/* Cart, Auth, etc */}</div>
    </header>
  );
};
```

### Стилізація контейнера:

```scss
// Header.module.scss
.searchWrapper {
  flex: 1;
  max-width: 600px;
  margin: 0 20px;

  @media (max-width: 768px) {
    max-width: 100%;
    margin: 10px 0;
  }
}
```

## Що створено:

### 1. API функція

- `productsApi.searchProducts(query)` - запит до `/products/search?q={query}`
- Мінімум 2 символи
- TypeScript типізація

### 2. Hook з debounce

- `useProductSearch(query, options)` - TanStack Query hook
- Debounce 400ms
- Автоматичне кешування 5 хвилин
- Налаштування: `debounceMs`, `minLength`, `enabled`

### 3. UI компонент

- **Autocomplete dropdown** паттерн
- **До 5 товарів** у результатах
- **Фото + назва + ціна**
- **Клік на товар** → `/catalog/{slug}`
- **Escape / клік поза** → закриття
- **Обробка станів**: loading, error, empty, success

## UX Features:

✅ **Debounce 400ms** - запит після паузи в введенні
✅ **Мінімум 2 символи** для пошуку
✅ **Автоматичне закриття** (Escape, клік поза)
✅ **Індикатор завантаження**
✅ **Обробка помилок**
✅ **Responsive дизайн**
✅ **Keyboard navigation готовий** (може бути розширений)

## API Backend:

Endpoint: `GET /products/search?q={query}`

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "Ковбаса...",
      "slug": "kovbasa-...",
      "price": 150,
      "images": [{ "url": "..." }]
    }
  ],
  "meta": {
    "total": 5,
    "query": "ковбаса"
  }
}
```

## Налаштування:

### Змінити debounce час:

```tsx
<SearchInput placeholder="..." />
// В hook: debounceMs можна змінити в useProductSearch.ts
```

### Змінити кількість результатів:

```tsx
// SearchInput.tsx, line 31
const products = data?.data?.slice(0, 5) || []; // Змінити 5 на іншу цифру
```

### Кастомна стилізація:

```tsx
<SearchInput className="my-custom-class" placeholder="..." />
```

Компонент готовий до production! 🚀
