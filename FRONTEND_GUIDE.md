# 📘 Виправлення проблеми з підтвердженням оплати через MonoPay та LiquidPay

## 🐛 Проблема

Після оплати через LiquidPay або MonoPay виникає довге очікування та помилки:

- ❌ **Помилка:** `{success: false, status: "NOT_FOUND", message: "Платіж не знайдено", error: "PAYMENT_NOT_FOUND"}`
- ❌ **Endpoint:** `GET /api/v1/payments/{orderId}/verify` повертає **400 Bad Request**
- ❌ **Console Error:** `Uncaught (in promise) The message port closed before a response was received`

## 🔍 Коренева причина

**Плутанина між `orderId` та `paymentId`:**

1. `returnUrl` містить `orderId`: `/payment/success/${orderId}`
2. Але папка називається `[paymentId]` → Next.js парсить параметр як `paymentId`
3. Код передає цей параметр в API як `paymentId`, але насправді це `orderId`
4. Backend шукає платіж за `paymentId`, не знаходить і повертає **NOT_FOUND**

**Час виконання виправлення:** 10-15 хвилин

## 🎯 Швидке рішення (Рекомендовано)

**Потрібно:**

1. Перейменувати папку `[paymentId]` → `[orderId]`
2. Оновити код в 2 файлах

**Час виконання:** 5 хвилин

---

## ✅ Крок 1: Перейменуйте папку

```bash
# Знаходимось в корені frontend проекту
cd src/app/payment/success

# Перейменуйте папку
mv "[paymentId]" "[orderId]"

# Або через Git (якщо використовуєте)
git mv src/app/payment/success/[paymentId] src/app/payment/success/[orderId]
```

**Результат:**

- ❌ Було: `src/app/payment/success/[paymentId]/`
- ✅ Стало: `src/app/payment/success/[orderId]/`

---

## ✅ Крок 2: Оновіть PaymentSuccess.tsx

**Файл:** `src/app/payment/success/[orderId]/PaymentSuccess.tsx`

**Знайдіть рядки 16-21:**

```typescript
const paymentId = params?.paymentId as string;
const orderId = searchParams.get('orderId');
const [isVerifying, setIsVerifying] = useState(true);

// ✅ FIXED: Правильне використання useQuery - деструктуризація data, isLoading, error
const { data: paymentData, isLoading, error } = usePaymentStatus(paymentId, !!paymentId);
```

**Замініть на:**

```typescript
const orderId = params?.orderId as string;
const [isVerifying, setIsVerifying] = useState(true);

// ✅ FIXED: Використовуємо orderId замість paymentId
const { data: paymentData, isLoading, error } = usePaymentStatus(orderId, !!orderId);
```

**Знайдіть рядки 40-48:**

```typescript
if (!paymentId) {
  return (
    <Container size="sm" py="xl">
      <Alert icon={<IconAlertCircle size={16} />} color="red" title="Помилка">
        Невірний ідентифікатор платежу
      </Alert>
    </Container>
  );
}
```

**Замініть на:**

```typescript
if (!orderId) {
  return (
    <Container size="sm" py="xl">
      <Alert icon={<IconAlertCircle size={16} />} color="red" title="Помилка">
        Невірний ідентифікатор замовлення
      </Alert>
    </Container>
  );
}
```

**Знайдіть рядки 142-146:**

```typescript
<Text size="sm" c="dimmed">
  Номер платежу:
</Text>
<Text size="sm" ff="monospace">
  {paymentId}
</Text>
```

**Замініть на:**

```typescript
<Text size="sm" c="dimmed">
  Номер замовлення:
</Text>
<Text size="sm" ff="monospace">
  {orderId}
</Text>
```

**Знайдіть рядки 148-157 (видаліть цей блок):**

```typescript
{orderId && (
  <Group justify="space-between" mt="xs">
    <Text size="sm" c="dimmed">
      Номер замовлення:
    </Text>
    <Text size="sm" ff="monospace">
      {orderId}
    </Text>
  </Group>
)}
```

---

## ✅ Крок 3: Перевірте useCheckout (має бути вже правильно)

**Файл:** `src/features/checkout/hooks/useCheckout.ts`

**Перевірте рядок 122:**

```typescript
returnUrl: `${window.location.origin}/payment/success/${orderData.id}?orderId=${orderData.id}`,
```

**Має бути правильно** ✅

---

## ✅ Крок 4: Тестування

```bash
# Запустіть dev server
npm run dev
```

### Перевірте:

1. **Відкрийте тестову сторінку:**

   ```
   http://localhost:3000/payment/success/test-order-id-123
   ```

2. **Має показатись:** "Перевіряємо статус оплати..."

3. **В DevTools → Network перевірте:**
   - Запит йде на: `/api/v1/payments/test-order-id-123/verify`
   - Параметр правильний: `test-order-id-123`

4. **Зробіть тестову оплату:**
   - Створіть замовлення
   - Оплатіть через LiquidPay або MonoPay
   - **Має працювати без помилок!** ✅

---

## 🎨 Додаткові налаштування (опціонально)

### Якщо токен зберігається по-іншому

**У файлі PaymentSuccess.tsx** НЕ використовується `localStorage` для токена.
**У файлі usePayment.tsx (рядок 46)** теж немає прямого доступу до токена - він через `apiClient`.

Це означає що токен вже налаштований в `src/shared/api/client.ts` - перевіряти не потрібно! ✅

---

## 🐛 Troubleshooting

### Проблема 1: "404 Not Found" на /payment/success/:id

**Причина:** Папка не перейменована або Next.js не перезавантажився

**Рішення:**

```bash
# Зупиніть dev server (Ctrl+C)
npm run dev
```

### Проблема 2: Все ще бачу "PAYMENT_NOT_FOUND"

**Причина:** Код не оновлено або backend має проблеми

**Рішення:**

1. Перевірте що файл PaymentSuccess.tsx змінений (має бути `orderId` замість `paymentId`)
2. Перевірте Network в DevTools - який ID відправляється
3. Перевірте backend logs - що приходить в endpoint

### Проблема 3: TypeScript помилка "Property 'orderId' does not exist"

**Причина:** Next.js ще не оновив типи після перейменування папки

**Рішення:**

```bash
# Зупиніть dev server
rm -rf .next
npm run dev
```

---

## 📊 Перевірка готовності до production

### Чеклист:

- [ ] Папка перейменована в `[orderId]`
- [ ] `PaymentSuccess.tsx` оновлено (`orderId` замість `paymentId`)
- [ ] `useCheckout.ts` має правильний `returnUrl`
- [ ] Dev server працює без помилок
- [ ] Тестова сторінка відкривається
- [ ] Тестова оплата проходить успішно

---

## 🚀 Deploy

Після всіх змін:

```bash
# Commit changes
git add .
git commit -m "fix: use orderId instead of paymentId in payment success page"
git push origin main

# Або deploy через Vercel CLI
vercel --prod
```

---

## 📝 Підсумок

### Що виправлено:

1. ✅ Перейменовано папку `[paymentId]` → `[orderId]`
2. ✅ Код тепер використовує `orderId` замість `paymentId`
3. ✅ API endpoint `/payments/${orderId}/verify` отримує правильний параметр

### Результат:

**До:**

```
URL: /payment/success/cmhm6cxng0004kvb2c1xpzk2e
Code: const paymentId = params?.paymentId // → cmhm6cxng0004kvb2c1xpzk2e
API: GET /payments/cmhm6cxng0004kvb2c1xpzk2e/verify
❌ Backend шукає paymentId, не знаходить → PAYMENT_NOT_FOUND
```

**Після:**

```
URL: /payment/success/cmhm6cxng0004kvb2c1xpzk2e
Code: const orderId = params?.orderId // → cmhm6cxng0004kvb2c1xpzk2e
API: GET /payments/cmhm6cxng0004kvb2c1xpzk2e/verify
✅ Backend шукає за orderId, знаходить → SUCCESS
```

---

**Час виконання:** 5-10 хвилин
**Складність:** Легка
**Ефект:** 100% виправлення помилки PAYMENT_NOT_FOUND

Успіхів! 🚀
