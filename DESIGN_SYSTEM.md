# Pixel Art Design System - "Щільний дріл"

## 🎨 Кольорова Палітра

### Основні кольори

- **Primary (Yellow):** `#E6DB1B` - основні кнопки, акценти
- **Secondary (Beige):** `#E0DDCA` - фон карток, світлі елементи
- **Background:** `#D5D3B5` - основний фон сторінок
- **Text:** `#2B2B27` - основний текст

### Кнопки

- **Primary Button:** `#E6DB1B` (жовта)
- **Green Button:** `#33603B` (зелена для CTA)
- **Red Button:** `#A63C48` (червона для акцій)
- **Beige Button:** `#E0DDCA` (бежева для меню)

### Статуси

- **Success:** `#56DA64`
- **Error:** `#9C0C3D`
- **Warning:** `#E6DB1B`
- **Info:** `#0088FF`

---

## 📝 Типографіка

### Шрифти

```tsx
--font-body: 'IBM Plex Sans'           // Основний текст
--font-condensed: 'IBM Plex Sans Condensed'  // UI елементи
--font-heading: 'Rubik Glitch'         // Заголовки (pixel art)
--font-price: 'Rubik'                  // Ціни (weight 900)
--font-mono: 'IBM Plex Mono'           // Код
```

### Розміри

- **h1:** 40px (Rubik Glitch)
- **h2:** 36px (Rubik Glitch)
- **h3:** 32px (Rubik Glitch)
- **h4:** 27px (Rubik Glitch)
- **h5:** 24px (IBM Plex Sans Bold)
- **h6:** 20px (IBM Plex Sans Bold)
- **Body:** 16px (IBM Plex Sans)
- **Small:** 14px
- **XSmall:** 12px

---

## 🔲 Pixel Art Стиль

### Borders

```css
border: 2px solid #2b2b27;
border-radius: 0; /* Все квадратне! */
```

### Shadows (жорсткі, без blur)

```css
--shadow-xs: 2px 2px 0px rgba(43, 43, 39, 0.1);
--shadow-sm: 2px 2px 0px rgba(43, 43, 39, 0.2);
--shadow-md: 3px 3px 0px rgba(43, 43, 39, 0.3);
--shadow-lg: 4px 4px 0px rgba(43, 43, 39, 0.4);
```

### Hover/Active Ефекти

```scss
// Hover - елемент "натискається"
&:hover {
  transform: translate(1px, 1px);
  box-shadow: var(--shadow-sm);
}

// Active - елемент повністю натиснутий
&:active {
  transform: translate(2px, 2px);
  box-shadow: var(--shadow-xs);
}
```

---

## 🎯 Компоненти

### Button

**Варіанти:**

- `primary` - жовта
- `secondary` - темна
- `green` - зелена
- `red` - червона
- `beige` - бежева
- `outline` - прозора з border
- `ghost` - прозора без border

**Розміри:**

- `sm` - 40px
- `md` - 48px (default)
- `lg` - 52px
- `xl` - 60px
- `menu` - full width

**Приклад:**

```tsx
<Button variant="primary" size="md">
  В магазин
</Button>
```

### Card

**Стилі:**

- Border: 2px solid
- Shadow: жорстка тінь
- Background: beige
- Hover: translate ефект

### Input/Textarea

**Стилі:**

- Border: 2px solid
- Border-radius: 0
- Font: IBM Plex Sans Condensed
- Focus: жовтий border + glow

---

## 🛠️ Utility Classes

```css
.pixel-border      /* 2px solid border, no radius */
.pixel-shadow      /* Medium shadow */
.pixel-shadow-sm   /* Small shadow */
.pixel-shadow-lg   /* Large shadow */
```

**Приклад:**

```tsx
<div className="pixel-border pixel-shadow">Pixel art контейнер</div>
```

---

## 📐 Spacing

```css
--spacing-xs: 4px --spacing-sm: 8px --spacing-md: 16px --spacing-lg: 24px --spacing-xl: 32px
  --spacing-2xl: 48px;
```

---

## ⚡ Transitions

```css
--transition-fast: 0.15s ease /* Для hover ефектів */ --transition-normal: 0.2s ease
  /* Для модалів, dropdown */ --transition-slow: 0.3s ease /* Для складних анімацій */;
```

---

## 📱 Breakpoints

```css
--container-mobile: 320px --container-max-width: 1200px --container-wide: 1600px;
```

**Media queries:**

```css
@media (max-width: 768px) {
  /* Mobile */
}
@media (min-width: 769px) and (max-width: 1199px) {
  /* Tablet */
}
@media (min-width: 1200px) {
  /* Desktop */
}
```

---

## 🎨 Приклади Використання

### Pixel Art Card

```tsx
<Card className="pixel-border pixel-shadow" bg="beige.3">
  <Text c="dark.8" fw={700}>
    Заголовок картки
  </Text>
</Card>
```

### Button Group

```tsx
<Group gap="md">
  <Button variant="primary" size="lg">
    Додати в кошик
  </Button>
  <Button variant="outline" size="lg">
    Детальніше
  </Button>
</Group>
```

### Form Input

```tsx
<TextInput
  label="Email"
  placeholder="your@email.com"
  styles={{
    input: {
      fontFamily: 'var(--font-condensed)',
      border: '2px solid var(--border-color)',
      borderRadius: 0,
    },
  }}
/>
```

---

## ✅ Чеклист Імплементації

Коли створюєш новий компонент:

- [ ] Використовуєш pixel art стиль (border-radius: 0)
- [ ] Додаєш жорсткі тіні
- [ ] Використовуєш правильні кольори з палітри
- [ ] Додаєш hover/active translate ефекти
- [ ] Використовуєш правильні шрифти
- [ ] Перевіряєш на мобільних пристроях
- [ ] TypeScript без помилок

**Pixel Art = Квадрати + Жорсткі тіні + Прості анімації** 🎮
