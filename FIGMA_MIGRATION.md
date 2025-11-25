# Міграція дизайну з Figma "Щільний дріл"

## Зміни в проекті

### 1. Mantine Theme (`src/shared/config/mantine-theme.ts`)

Оновлено кольорову палітру згідно з Figma дизайном:

**Нові кольори:**

- `yellow` - жовті відтінки (#E6DB1B - primary button)
- `beige` - бежеві відтінки (#D5D3B5 - primary background)
- `dark` - темні відтінки (#2B2B27 - primary text)
- `green` - зелені відтінки (#33603B - green button)
- `red` - червоні відтінки (#A63C48 - menu red)

**Шрифти:**

- Body: `IBM Plex Sans`
- Condensed: `IBM Plex Sans Condensed`
- Headings: `Rubik Glitch`
- Price: `Rubik` (900 weight)
- Monospace: `IBM Plex Mono`

**Стиль:**

- Pixel art стиль - всі радіуси = 0
- Жорсткі тіні (box-shadow без blur)
- Borders:

### 2. Global CSS Variables (`src/app/globals.css`)

Оновлено CSS змінні:

```css
/* Кольори фону */
--background: #d5d3b5;
--background-secondary: #e0ddca;

/* Кольори кнопок */
--btn-primary: #e6db1b;
--btn-green: #33603b;
--btn-red: #a63c48;
--btn-beige: #e0ddca;

/* Тіні (pixel art) */
--shadow-md: 3px 3px 0px rgba(43, 43, 39, 0.3);

/* Border */
--border-width: 2px;
--border-color: #2b2b27;
```

### 3. Button Component (`src/shared/components/Button/`)

Оновлено компонент кнопки згідно з Figma:

**Нові варіанти:**

- `primary` - жовта кнопка (#E6DB1B)
- `green` - зелена кнопка (#33603B)
- `red` - червона кнопка (#A63C48)
- `beige` - бежева кнопка (#E0DDCA)
- `outline` - прозора з border
- `ghost` - прозора без border

**Розміри:**

- `sm` - 40px height
- `md` - 48px height (default)
- `lg` - 52px height
- `menu` - 48px height, full width

**Pixel art ефекти:**

- Hover: transform: translate(1px, 1px) + зменшена тінь
- Active: transform: translate(2px, 2px) + мінімальна тінь

### 4. Типографіка

Оновлено стилі заголовків:

- h1: 40px (Rubik Glitch)
- h2: 36px (Rubik Glitch)
- h3: 32px (Rubik Glitch)
- h4: 27px (Rubik Glitch)
- h5: 24px (IBM Plex Sans Bold)
- h6: 20px (IBM Plex Sans Bold)

## Приклади використання

### Button

```tsx
import { Button } from '@/shared/components/Button';

// Жовта кнопка (primary)
<Button variant="primary" size="md">
  В магазин
</Button>

// Зелена кнопка
<Button variant="green" size="lg">
  Оформити замовлення
</Button>

// Червона кнопка меню
<Button variant="red" size="menu">
  Розпродаж
</Button>

// Бежева кнопка меню
<Button variant="beige" size="menu">
  ТОП продажів
</Button>
```

### Кольори з Mantine

```tsx
import { Box, Text } from '@mantine/core';

<Box bg="beige.5">
  <Text c="dark.8">Темний текст</Text>
</Box>

<Box bg="yellow.6">
  <Text c="dark.8">Текст на жовтому фоні</Text>
</Box>
```

## Що далі?

1. Встановити шрифти (IBM Plex Sans, Rubik Glitch, Rubik)
2. Оновити інші компоненти (Card, Input, Modal)
3. Імплементувати екрани з Figma
4. Додати pixel art іконки

## Примітки

- Дизайн використовує pixel art стиль
- Всі елементи квадратні (border-radius: 0)
- Тіні жорсткі (без blur)
- Анімації прості (translate для hover/active)
- Кольори яскраві та контрастні
