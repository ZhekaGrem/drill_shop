# CheckoutCard Component

## Опис

`CheckoutCard` - компактна read-only картка товару для сторінки оформлення замовлення. Це спрощена версія `CartItem` без можливості редагування кількості чи видалення товару.

---

## Призначення

Використовується на сторінці **checkout** для відображення списку товарів у замовленні в read-only режимі.

---

## Відмінності від CartItem

| Функція | CartItem | CheckoutCard |
|---------|----------|--------------|
| Розмір зображення | 160x160px (compact) / 260x260px (full) | 80x80px |
| Кнопки кількості | ✅ Є | ❌ Немає |
| Кнопка видалення | ✅ Є | ❌ Немає |
| Відображення кількості | Інпут з +/- | Текст "Кількість: X" |
| Редагування | ✅ Можливе | ❌ Тільки перегляд |
| Призначення | Сторінка кошика | Сторінка checkout |

---

## Використання

```tsx
import { CheckoutCard } from '@/features/checkout/components/CheckoutCard';

<Stack gap={0}>
  {items.map((item) => (
    <CheckoutCard key={item.id} item={item} />
  ))}
</Stack>
```

---

## Props

### `item: CartItemWithProduct`

Об'єкт товару з кошика.

**Структура:**
```typescript
interface CartItemWithProduct {
  id: string;
  quantity: number;
  product: Product;
  variant?: ProductVariant;
  finalPrice: number;
  originalPrice?: number;
  hasPromo: boolean;
}
```

---

## Що відображається

1. **Зображення товару** (80x80px)
   - З border та правильним aspect ratio
   - Placeholder якщо немає зображення

2. **Назва товару**
   - Назва варіанту якщо є, інакше назва продукту
   - Обмежено 2 рядками (lineClamp)
   - Font: condensed, bold

3. **Ціна**
   - Стара ціна (закреслена) якщо є промо
   - Поточна ціна (червоним якщо є знижка)
   - Вже помножена на кількість

4. **Варіанти товару** (якщо є)
   - Розмір, колір тощо
   - У вигляді маленьких badges
   - Font: mono, 10px

5. **Кількість**
   - Текст "Кількість: X"
   - Font: condensed, xs
   - Сірим кольором

---

## Стилі

### Основні класи

- `.wrapper` - контейнер картки з hover ефектом
- `.image` - стилі зображення
- `.info` - контейнер інформації
- `.productName` - назва товару
- `.priceContainer` - контейнер цін
- `.currentPrice` - поточна ціна
- `.oldPrice` - стара ціна
- `.variantText` - текст варіантів
- `.quantity` - текст кількості

### Responsive

На екранах `< 480px`:
- Зображення: 60x60px
- Шрифти зменшуються
- Padding зменшується

---

## Приклад в CheckoutForm

```tsx
<div className={styles.orderSummary}>
  <h3 className={styles.summaryTitle}>ВАШЕ ЗАМОВЛЕННЯ</h3>

  <Stack gap={0}>
    {items.map((item) => (
      <CheckoutCard key={item.id} item={item} />
    ))}
  </Stack>

  {/* Промокод, підсумок тощо */}
</div>
```

---

## Переваги

✅ **Компактний розмір** - займає менше місця
✅ **Read-only** - користувач не може змінити кількість на checkout
✅ **Консистентний дизайн** - схожий на CartItem
✅ **Легкий** - менше коду ніж CartItem
✅ **Responsive** - адаптується до мобільних
✅ **Мemoized** - оптимізований для перформансу

---

## Коли використовувати

### ✅ Використовуй CheckoutCard:
- Сторінка checkout/оформлення замовлення
- Підтвердження замовлення
- Історія замовлень (read-only перегляд)
- Email підтвердження

### ❌ НЕ використовуй CheckoutCard:
- Сторінка кошика (використовуй CartItem)
- Коли потрібна можливість редагування
- Коли потрібні кнопки видалення/зміни кількості

---

## Файли

```
src/features/checkout/components/CheckoutCard/
├── CheckoutCard.tsx         # Компонент
├── CheckoutCard.module.scss # Стилі
└── index.ts                 # Експорт
```

---

**Версія:** 1.0
**Дата створення:** 2025-12-06
**Автор:** Claude Code
