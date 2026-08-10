# v2 Visual Bug Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all confirmed findings from `docs/superpowers/reports/2026-08-10-v2-visual-bug-audit-findings.md` (catalog, product page, cart, checkout) and verify each fix visually against the same mock-backed local environment used for the audit.

**Architecture:** Nine independent, mostly single-file code fixes (CSS + small React/logic changes) across catalog cards, product page, cart, and checkout. No new abstractions — each fix targets the exact root cause already diagnosed against live code, re-verified against the running app (not just theory) during plan-writing. Verification re-uses the same local mock backend (`http://localhost:3005`) + frontend dev server + chrome-devtools MCP browser session as the audit; `.env.local` is pointed at the mock only for the verification task and restored to `http://localhost:3001` at the end.

**Tech Stack:** Next.js 16 (App Router), Mantine UI 8.3, SCSS Modules, react-hook-form.

**Spec:** `docs/superpowers/reports/2026-08-10-v2-visual-bug-audit-findings.md`

## Global Constraints

- Follow CLAUDE.md's "Єдине Джерело" styling rule: don't mix Mantine props, SCSS modules, and inline styles on the same element — every fix below uses whatever method the touched code already uses.
- No hardcoded colors/sizes — use existing design tokens (`--space-*`, `--text-*`) from `src/app/globals.css`, matching what the surrounding code already does.
- Two findings from the audit report were re-investigated against live code while writing this plan and found NOT to be real bugs — do not "fix" them:
  - The "Розмір: M" block on the product page is the intended `specRows` characteristics list (`src/app/catalog/[slug]/ProductDetailsClient.tsx:189-192, 759-765`) — it looked sparse only because the audit's mock product had a single `size` option. No code change.
  - The phone field's `+380` prefix duplication was an artifact of the audit's automated `fill()` tool bypassing `PhoneInput.tsx`'s focus/cursor-positioning logic (`src/shared/components/Input/PhoneInput.tsx:20-36`) — real keyboard typing is unaffected. No code change.
- Verification note: for the product page's line-clamp finding, `-webkit-line-clamp` **is** functioning correctly (box height matches exactly 2 lines + padding) — the real defect is zero `margin-bottom` on `.title`, not a broken clamp. Don't touch the `-webkit-box`/`-webkit-line-clamp` declarations.

---

### Task 1: Extract shared product-count pluralization util, fix duplicate counter and cart grammar

**Files:**

- Modify: `src/shared/utils/format.ts` (add `formatProducts`)
- Modify: `src/features/catalog/components/CatalogFilters/CatalogFilters.tsx` (use shared util, remove local duplicate)
- Modify: `src/features/catalog/components/MobileFilterModal/MobileFilterModal.tsx` (use shared util, remove local duplicate, stop passing `resultsCount` into the nested `<CatalogFilters>`)
- Modify: `src/app/cart/Cart.tsx` (use shared util instead of hardcoded "товарів")

**Interfaces:**

- Produces: `formatProducts(count: number): string` exported from `src/shared/utils/format.ts`, e.g. `formatProducts(1) === '1 товар'`, `formatProducts(3) === '3 товари'`, `formatProducts(12) === '12 товарів'`.

- [ ] **Step 1: Add the shared util**

Add to the end of `src/shared/utils/format.ts`:

```ts
/** «12 товарів» / «1 товар» / «24 товари» */
export const formatProducts = (count: number): string => {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return `${count} товар`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} товари`;
  return `${count} товарів`;
};
```

- [ ] **Step 2: Use the shared util in CatalogFilters, remove the local duplicate**

In `src/features/catalog/components/CatalogFilters/CatalogFilters.tsx`, delete the local `function formatProducts(count: number): string { ... }` (lines 15-23) and add at the top of the file, alongside other imports:

```ts
import { formatProducts } from '@/shared/utils/format';
```

The existing usage at line 413 (`Знайдено {formatProducts(resultsCount)}`) is unchanged — it now calls the shared util.

- [ ] **Step 3: Use the shared util in MobileFilterModal, stop double-rendering the counter**

In `src/features/catalog/components/MobileFilterModal/MobileFilterModal.tsx`:

1. Delete the local `function formatProducts(count: number): string { ... }` (lines 18-25).
2. Add the import:

```ts
import { formatProducts } from '@/shared/utils/format';
```

3. Remove the `resultsCount={resultsCount}` prop passed to the nested `<CatalogFilters>` (around line 45), so it becomes:

```tsx
<CatalogFilters onFiltersChange={onFiltersChange} initialCategories={initialCategories} />
```

This stops `CatalogFilters`'s own internal `{resultsCount !== undefined && ...}` counter from rendering inside the mobile drawer — only the modal's own footer counter (lines 53-58, which the existing code comment says is the intended one: "число живе поруч як тихий підпис") remains.

- [ ] **Step 4: Fix cart pluralization**

In `src/app/cart/Cart.tsx`, add the import:

```ts
import { formatProducts } from '@/shared/utils/format';
```

Change line 40 from:

```tsx
items.length > 0 ? `${calculations.itemsCount} товарів у замовленні` : 'Поки що порожній';
```

to:

```tsx
items.length > 0 ? `${formatProducts(calculations.itemsCount)} у замовленні` : 'Поки що порожній';
```

- [ ] **Step 5: Verify no other usages broke**

Run:

```bash
cd F:\Progect\2025\shop_bogdan\frontend
npx tsc --noEmit
```

Expected: no new type errors referencing `format.ts`, `CatalogFilters.tsx`, `MobileFilterModal.tsx`, or `Cart.tsx`.

- [ ] **Step 6: Commit**

```bash
git add src/shared/utils/format.ts src/features/catalog/components/CatalogFilters/CatalogFilters.tsx src/features/catalog/components/MobileFilterModal/MobileFilterModal.tsx src/app/cart/Cart.tsx
git commit -m "fix(v2): shared product-count pluralization; dedupe mobile filter counter; fix cart grammar"
```

---

### Task 2: Fix mobile size-chip legibility ("S" reading as "N")

**Files:**

- Modify: `src/features/catalog/components/ProductCard/ProductCard.module.scss:325`

**Interfaces:**

- None — pure CSS, no other task depends on this.

- [ ] **Step 1: Bump the mobile variant-chip font-size**

In `src/features/catalog/components/ProductCard/ProductCard.module.scss`, inside the `@media (max-width: 768px)` block, change the `.variantCheckboxText` rule from:

```scss
.variantCheckboxText {
  min-width: 40px;
  min-height: 40px;
  padding: 0 10px;
  font-size: var(--text-xs);
}
```

to:

```scss
.variantCheckboxText {
  min-width: 40px;
  min-height: 40px;
  padding: 0 10px;
  font-size: var(--text-sm);
}
```

This matches the desktop rule's content-width ratio exactly (40px − 2×10px padding = 20px content width on mobile; 44px − 2×12px = 20px on desktop), so `--text-sm` (14px) fits "XL" the same way it already does on desktop.

- [ ] **Step 2: Commit**

```bash
git add src/features/catalog/components/ProductCard/ProductCard.module.scss
git commit -m "fix(v2): bump mobile size-chip font-size so S is legible"
```

---

### Task 3: Fix product-card title crowding the availability status

**Files:**

- Modify: `src/features/catalog/components/ProductCard/ProductCard.module.scss:117-137`

**Interfaces:**

- None — pure CSS, no other task depends on this.

- [ ] **Step 1: Add breathing room below the (correctly) 2-line-clamped title**

In `src/features/catalog/components/ProductCard/ProductCard.module.scss`, change the `.title` rule from:

```scss
.title {
  display: -webkit-box;
  max-width: 100%;
  min-height: calc(1.4em * 2);
  margin: 0;
  padding: var(--space-2) 0;
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--fw-medium);
  line-height: 1.4;
  color: var(--text-primary);
  overflow-wrap: anywhere;
  overflow: hidden;
  transition: var(--transition-fast);
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  &:hover {
    color: var(--accent);
  }
}
```

to (only the `margin` line changes):

```scss
.title {
  display: -webkit-box;
  max-width: 100%;
  min-height: calc(1.4em * 2);
  margin: 0 0 var(--space-1) 0;
  padding: var(--space-2) 0;
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--fw-medium);
  line-height: 1.4;
  color: var(--text-primary);
  overflow-wrap: anywhere;
  overflow: hidden;
  transition: var(--transition-fast);
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  &:hover {
    color: var(--accent);
  }
}
```

`var(--space-1)` is 4px — enough to visually separate the clamped title's last line from the availability status line directly below it, for titles long enough to use both clamped lines.

- [ ] **Step 2: Commit**

```bash
git add src/features/catalog/components/ProductCard/ProductCard.module.scss
git commit -m "fix(v2): add breathing room below 2-line-clamped product title"
```

---

### Task 4: Add accessible name to icon-only add-to-cart button on narrow cards

**Files:**

- Modify: `src/features/catalog/components/ProductCard/ProductCardActions.tsx`

**Interfaces:**

- None — pure prop addition, no other task depends on this.

- [ ] **Step 1: Add aria-label carrying the same text that's visually hidden at ≤768px**

In `src/features/catalog/components/ProductCard/ProductCardActions.tsx`, change:

```tsx
<Button
  disabled={isClicked || !isInStock}
  onClick={onAddToCart}
  type="button"
  fullWidth
  variant="secondary"
  className={styles.addButton}>
  <Group gap={10}>
    <IconCart3 /> <p className={styles.buttonText}> {buttonText} </p>
  </Group>
</Button>
```

to:

```tsx
<Button
  disabled={isClicked || !isInStock}
  onClick={onAddToCart}
  type="button"
  fullWidth
  variant="secondary"
  aria-label={buttonText}
  className={styles.addButton}>
  <Group gap={10}>
    <IconCart3 /> <p className={styles.buttonText}> {buttonText} </p>
  </Group>
</Button>
```

At viewports where `.buttonText` renders (>768px), the button's accessible name comes from its visible text as before, and `aria-label` is redundant but harmless (assistive tech prefers `aria-label` when present, and it matches the visible text exactly). At ≤768px, where `.buttonText` is `display: none`, this `aria-label` is now the button's only accessible name — no more empty-name buttons.

- [ ] **Step 2: Commit**

```bash
git add src/features/catalog/components/ProductCard/ProductCardActions.tsx
git commit -m "fix(v2): give icon-only add-to-cart button an accessible name on mobile"
```

---

### Task 5: Fix product-page two-column grid stretching under long titles

**Files:**

- Modify: `src/app/catalog/[slug]/productDetails.module.scss:9-13`

**Interfaces:**

- None — pure CSS, no other task depends on this.

- [ ] **Step 1: Stop the shorter grid column from stretching to match the taller one**

In `src/app/catalog/[slug]/productDetails.module.scss`, change the `.productDetails` rule from:

```scss
  .productDetails {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-xl);
    margin-bottom: var(--spacing-2xl);
```

to:

```scss
  .productDetails {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: start;
    gap: var(--spacing-xl);
    margin-bottom: var(--spacing-2xl);
```

Both `.productDetails__images` (which sets `height: 100%`, line 259) and `.productDetails__info` will now size to their own content instead of being stretched to match whichever column is taller. Verified against a short-title product (`kepka-z-vyshytym-logotypom`) during plan-writing: the two cards ending at different natural heights reads fine — no regression for the common case, and it removes the large dead space for long titles.

- [ ] **Step 2: Commit**

```bash
git add "src/app/catalog/[slug]/productDetails.module.scss"
git commit -m "fix(v2): stop product gallery column from stretching under a long title"
```

---

### Task 6: Stop leaking raw backend error text in the reviews section

**Files:**

- Modify: `src/features/reviews/components/ReviewList/ReviewList.tsx:87-93`

**Interfaces:**

- None — no other task depends on this.

- [ ] **Step 1: Replace the interpolated raw message with a generic one**

In `src/features/reviews/components/ReviewList/ReviewList.tsx`, change:

```tsx
if (error) {
  return (
    <div className={styles.error}>
      <p>Помилка завантаження відгуків: {error.message}</p>
      <button onClick={() => window.location.reload()}>Спробувати знову</button>
    </div>
  );
}
```

to:

```tsx
if (error) {
  return (
    <div className={styles.error}>
      <p>Не вдалося завантажити відгуки. Спробуйте ще раз.</p>
      <button onClick={() => window.location.reload()}>Спробувати знову</button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/reviews/components/ReviewList/ReviewList.tsx
git commit -m "fix(v2): stop showing raw backend error text in reviews section"
```

---

### Task 7: Fix premature delivery-field validation in checkout

**Files:**

- Modify: `src/features/checkout/components/DeliveryMethod/WarehouseSelect.tsx:274`
- Modify: `src/features/checkout/components/CheckoutForm/sections/DeliverySection.tsx`
- Modify: `src/features/checkout/components/CheckoutForm/DeliveryMethod/CustomDeliveryField.tsx`

**Interfaces:**

- Consumes: `form.formState.isSubmitted` (react-hook-form, already available on the `form` object passed into `DeliverySection` from `src/features/checkout/components/CheckoutForm/CheckoutForm.tsx:138-148`).
- Produces: `CustomDeliveryField` gains an `isSubmitted: boolean` prop.

- [ ] **Step 1: Stop WarehouseSelect from hardcoding its error message**

In `src/features/checkout/components/DeliveryMethod/WarehouseSelect.tsx`, in the "Main render with data" block, change:

```tsx
        error={'Вкажіть адресу доставки'}
```

to:

```tsx
error = { error };
```

`error` is already the prop the component receives (see `WarehouseSelectProps.error` and the destructured parameter at the top of the file) — it's computed correctly by the caller (`NovaPoshtaFields.tsx:27`, `warehouseError = (errors.deliveryData as any)?.warehouseRef?.message`), which is `undefined` until react-hook-form validates the field (default mode: on submit, or on the explicit `form.trigger(...)` already wired to `onBlur`). The hardcoded string was overriding this correctly-computed prop.

- [ ] **Step 2: Thread `isSubmitted` from DeliverySection into CustomDeliveryField**

In `src/features/checkout/components/CheckoutForm/sections/DeliverySection.tsx`, change the destructuring:

```tsx
const {
  control,
  formState: { errors },
} = form;
```

to:

```tsx
const {
  control,
  formState: { errors, isSubmitted },
} = form;
```

Then change the `CustomDeliveryField` usage from:

```tsx
{
  /* Custom delivery field */
}
{
  deliveryMethod === 'other' && (
    <CustomDeliveryField
      value={customDeliveryText}
      onChange={onCustomDeliveryChange}
      onQuickInsert={onQuickInsert}
    />
  );
}
```

to:

```tsx
{
  /* Custom delivery field */
}
{
  deliveryMethod === 'other' && (
    <CustomDeliveryField
      value={customDeliveryText}
      onChange={onCustomDeliveryChange}
      onQuickInsert={onQuickInsert}
      isSubmitted={isSubmitted}
    />
  );
}
```

- [ ] **Step 3: Only show the required-error after a submit attempt**

In `src/features/checkout/components/CheckoutForm/DeliveryMethod/CustomDeliveryField.tsx`, change:

```tsx
interface CustomDeliveryFieldProps {
  value: string;
  onChange: (value: string) => void;
  onQuickInsert: (text: string) => void;
}

export const CustomDeliveryField = ({ value, onChange, onQuickInsert }: CustomDeliveryFieldProps) => {
```

to:

```tsx
interface CustomDeliveryFieldProps {
  value: string;
  onChange: (value: string) => void;
  onQuickInsert: (text: string) => void;
  isSubmitted: boolean;
}

export const CustomDeliveryField = ({ value, onChange, onQuickInsert, isSubmitted }: CustomDeliveryFieldProps) => {
```

And change:

```tsx
        error={!value ? 'Вкажіть адресу доставки' : undefined}
```

to:

```tsx
        error={isSubmitted && !value ? 'Вкажіть адресу доставки' : undefined}
```

- [ ] **Step 4: Verify types**

Run:

```bash
cd F:\Progect\2025\shop_bogdan\frontend
npx tsc --noEmit
```

Expected: no errors referencing `WarehouseSelect.tsx`, `DeliverySection.tsx`, or `CustomDeliveryField.tsx`.

- [ ] **Step 5: Commit**

```bash
git add src/features/checkout/components/DeliveryMethod/WarehouseSelect.tsx src/features/checkout/components/CheckoutForm/sections/DeliverySection.tsx src/features/checkout/components/CheckoutForm/DeliveryMethod/CustomDeliveryField.tsx
git commit -m "fix(v2): stop showing delivery-address errors before the user submits"
```

---

### Task 8: Fix confusable placeholder text in checkout name fields

**Files:**

- Modify: `src/features/checkout/components/CheckoutForm/sections/ContactInfoSection.tsx:28-29, 36-37`

**Interfaces:**

- None — no other task depends on this.

- [ ] **Step 1: Replace name-like placeholders with instructional text**

In `src/features/checkout/components/CheckoutForm/sections/ContactInfoSection.tsx`, change:

```tsx
        <Input
          label="Ім'я"
          placeholder="Іван"
          required
          error={firstNameError}
          {...register('shippingAddress.firstName')}
        />

        <Input
          label="Прізвище"
          placeholder="Петренко"
          required
          error={lastNameError}
          {...register('shippingAddress.lastName')}
        />
```

to:

```tsx
        <Input
          label="Ім'я"
          placeholder="Ваше ім'я"
          required
          error={firstNameError}
          {...register('shippingAddress.firstName')}
        />

        <Input
          label="Прізвище"
          placeholder="Ваше прізвище"
          required
          error={lastNameError}
          {...register('shippingAddress.lastName')}
        />
```

This matches the pattern already used by the phone field on the same form (`+380 (XX) XXX XX XX` — a format mask, not a realistic filled-in value), removing the risk of a user mistaking an empty required field for one that's already filled with their own data.

- [ ] **Step 2: Commit**

```bash
git add src/features/checkout/components/CheckoutForm/sections/ContactInfoSection.tsx
git commit -m "fix(v2): use instructional placeholders for name fields, not realistic names"
```

---

### Task 9: Visual re-verification and cleanup

**Files:**

- Modify (temporarily, reverted at the end): `.env.local`
- Modify: `docs/superpowers/reports/2026-08-10-v2-visual-bug-audit-findings.md` (append fix-verification notes)

**Interfaces:**

- Consumes: all fixes from Tasks 1-8; the same mock backend (`http://localhost:3005`, script at `C:\Users\yevhe\AppData\Local\Temp\claude\F--Progect-2025-shop-bogdan-frontend\337967db-3d49-4743-8af9-6cca9c47602b\scratchpad\mock-backend.js`) and chrome-devtools MCP session already used for the audit and for verifying the grid-stretch/line-clamp diagnoses while writing this plan.

- [ ] **Step 1: Point the frontend at the mock backend again**

Edit `.env.local`, changing both:

```
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
NEXT_PUBLIC_BACKEND_URL="http://localhost:3001/api/v1"
```

to:

```
NEXT_PUBLIC_API_URL="http://localhost:3005/api/v1"
NEXT_PUBLIC_BACKEND_URL="http://localhost:3005/api/v1"
```

- [ ] **Step 2: Ensure the mock backend and frontend dev server are running**

If not already running from the previous session:

```bash
node "C:\Users\yevhe\AppData\Local\Temp\claude\F--Progect-2025-shop-bogdan-frontend\337967db-3d49-4743-8af9-6cca9c47602b\scratchpad\mock-backend.js"
```

(background), then:

```bash
cd F:\Progect\2025\shop_bogdan\frontend
npm run dev
```

(background). Poll `http://localhost:3001` (or whichever port `next dev` actually binds — check with `netstat -ano | grep LISTENING` if port 3000 is occupied by an unrelated process, as it was during the audit) until it responds.

- [ ] **Step 3: Re-screenshot each fixed spot and confirm the defect is gone**

Using chrome-devtools MCP, for each of the 9 fixes, navigate to the relevant page, resize to the viewport(s) the finding applied to, and screenshot:

1. `/catalog` mobile (375×812): size chip on the first product card reads "S", not "N".
2. `/catalog` mobile (375×812): open "Фільтри" — "Знайдено N товарів" appears exactly once.
3. `/catalog` desktop (1440×900): the long-title product card's text no longer visually collides with "В наявності".
4. `/catalog/hudi-rozluchenyy-gryfon-limited-oversize` mobile (375×812): in "Схожі товари", take a snapshot and confirm the add-to-cart buttons now have a non-empty accessible name.
5. `/catalog/hudi-rozluchenyy-gryfon-limited-oversize` desktop (1440×900): no large empty gap below the gallery; also re-check `/catalog/kepka-z-vyshytym-logotypom` desktop to confirm the short-title case still looks acceptable.
6. Same product page: the reviews section shows the generic message, not "Not implemented in mock".
7. `/checkout`: select "Нова Пошта" + a city — confirm the "Відділення/Поштомат" field shows no error until you attempt to submit. Switch to "Інший спосіб" — confirm "Адреса доставки" shows no error until submit.
8. `/checkout`: confirm "Ім'я"/"Прізвище" placeholders read "Ваше ім'я"/"Ваше прізвище".
9. `/cart` with exactly 1 item: confirm the heading reads "1 товар у замовленні" (not "1 товарів").

- [ ] **Step 4: Run lint**

```bash
cd F:\Progect\2025\shop_bogdan\frontend
npm run lint
```

Expected: clean (no errors). Fix any issues found before proceeding.

- [ ] **Step 5: Restore .env.local to its pre-audit state**

Edit `.env.local`, changing both back to:

```
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
NEXT_PUBLIC_BACKEND_URL="http://localhost:3001/api/v1"
```

- [ ] **Step 6: Stop the temporary mock backend and dev server**

Stop both background processes started in Step 2 (and any left running from the audit).

- [ ] **Step 7: Append verification notes to the findings report and commit**

Add a `## Fix verification` section at the end of `docs/superpowers/reports/2026-08-10-v2-visual-bug-audit-findings.md`:

```markdown
## Fix verification

All 8 confirmed findings fixed and re-verified visually (see `docs/superpowers/plans/2026-08-10-v2-visual-bug-fixes.md`). Two findings from the original audit were re-investigated during fix planning and confirmed NOT to be real bugs (see that plan's Global Constraints section): the "Розмір: M" spec block, and the phone-field "+380" prefix duplication.

`npm run lint`: clean.
```

Then:

```bash
git add docs/superpowers/reports/2026-08-10-v2-visual-bug-audit-findings.md
git commit -m "docs(v2): record fix verification for visual bug audit"
```
