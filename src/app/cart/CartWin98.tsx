// src/app/cart/CartWin98.tsx
// Кошик у дизайні Windows 98 — вікно Провідника «Кошик» (так в українській Windows зветься й кошик на робочому
// столі): товари — великі значки, які можна виділити; панель кнопок над полем діє на виділений товар («Відкрити»,
// кількість, «Видалити»); рядок стану; групове поле «Підсумок» і кнопки «Оформити замовлення» / «До каталогу».
// Решта дизайнів рендерить незмінний Cart.tsx. Логіка та сама: оптимістична кількість + відкладене збереження,
// видалення з «Повернути» на 5 секунд.
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import { useCart } from '@/features/cart/hooks/useCart';
import { CloudinaryImage } from '@/shared/components/CloudinaryImage/CloudinaryImage';
import { Page } from '@/shared/components/Page/Page';
import { Win98Icon } from '@/shared/components/Windows98/Win98Icons';
import { Win98Window } from '@/shared/components/Windows98/Win98Window';
import type { CartItemWithProduct } from '@/shared/utils/cart-calculations';
import { formatPrice, formatProducts } from '@/shared/utils/format';
import { getVariantDisplayBadges } from '@/shared/utils/variant-display';
import styles from './cartWin98.module.scss';

const UNDO_MS = 5000;
const SAVE_DELAY_MS = 500;

interface PendingQuantitySave {
  timer: ReturnType<typeof setTimeout>;
  save: () => void;
}

const nameOf = (item: CartItemWithProduct) => item.variant?.name || item.product.name;
const optionsOf = (item: CartItemWithProduct) =>
  getVariantDisplayBadges(item.variant?.options || item.product.options)
    .map((b) => b.value)
    .join(' · ');
const maxOf = (item: CartItemWithProduct) =>
  item.variant?.availableQuantity ?? item.product.availableQuantity ?? 0;

export function CartWin98({ basePath = '' }: { basePath?: string }) {
  const router = useRouter();
  const { items, calculations, error, isLoading, addItem, removeItem, setItemQuantity, updateItemQuantity } =
    useCart();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [removed, setRemoved] = useState<CartItemWithProduct | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimers = useRef<Map<string, PendingQuantitySave>>(new Map());

  // Виділений товар: вибраний людиною або перший у кошику
  const selected = items.find((item) => item.id === selectedId) ?? items[0] ?? null;
  const discount = calculations.discountAmount ?? 0;

  useEffect(() => {
    const timers = saveTimers.current;
    return () => {
      // Перехід до оформлення не має губити останній клік степера.
      timers.forEach(({ timer, save }) => {
        clearTimeout(timer);
        save();
      });
      timers.clear();
      if (undoTimer.current) clearTimeout(undoTimer.current);
    };
  }, []);

  const changeQuantity = useCallback(
    (item: CartItemWithProduct, next: number) => {
      if (next < 1 || next > maxOf(item)) return;
      // Підсумок рухається одразу, а запит іде, коли людина перестала тиснути
      setItemQuantity(item.id, next);
      const prev = saveTimers.current.get(item.id);
      if (prev) clearTimeout(prev.timer);
      const save = () => {
        updateItemQuantity(item.id, next);
        saveTimers.current.delete(item.id);
      };
      saveTimers.current.set(item.id, { timer: setTimeout(save, SAVE_DELAY_MS), save });
    },
    [setItemQuantity, updateItemQuantity]
  );

  const remove = useCallback(
    (item: CartItemWithProduct) => {
      const pending = saveTimers.current.get(item.id);
      if (pending) {
        clearTimeout(pending.timer);
        saveTimers.current.delete(item.id);
      }
      removeItem(item.id);
      setRemoved(item);
      setSelectedId(null);
      if (undoTimer.current) clearTimeout(undoTimer.current);
      undoTimer.current = setTimeout(() => setRemoved(null), UNDO_MS);
    },
    [removeItem]
  );

  const undo = () => {
    if (!removed) return;
    addItem(removed.product.id, removed.quantity, removed.variant?.id, removed.product);
    setRemoved(null);
  };

  const open = (item: CartItemWithProduct) => router.push(`${basePath}/catalog/${item.product.slug}`);

  const status = removed ? (
    <>
      «{nameOf(removed)}» видалено з кошика.{' '}
      <button type="button" className={styles.statusAction} onClick={undo}>
        Повернути
      </button>
    </>
  ) : selected ? (
    `Об'єктів: ${items.length} · Вибрано: ${nameOf(selected)}`
  ) : (
    `Об'єктів: ${items.length}`
  );

  if (error) {
    return (
      <Page className={styles.page}>
        <Win98Window as="h1" title="Кошик" icon={<Win98Icon name="binEmpty" />}>
          <div className={styles.message}>
            <Win98Icon name="error" />
            <div>
              <p className={styles.messageTitle}>Не вдалося відкрити кошик</p>
              <p>Перевірте зʼєднання з інтернетом і спробуйте ще раз.</p>
              <button type="button" className={styles.button} onClick={() => window.location.reload()}>
                Спробувати знову
              </button>
            </div>
          </div>
        </Win98Window>
      </Page>
    );
  }

  const empty = !isLoading && items.length === 0;

  return (
    <Page className={styles.page}>
      <Win98Window
        as="h1"
        title={items.length > 0 ? `Кошик — ${formatProducts(calculations.itemsCount)}` : 'Кошик'}
        icon={<Win98Icon name={items.length > 0 ? 'binFull' : 'binEmpty'} />}
        status={!empty && !isLoading ? status : undefined}>
        {!empty && !isLoading && selected && (
          <div className={styles.toolbar} role="toolbar" aria-label="Дії з вибраним товаром">
            <button type="button" className={styles.tool} onClick={() => open(selected)}>
              Відкрити
            </button>
            <span className={styles.toolSeparator} aria-hidden="true" />
            <span className={styles.spinner}>
              <button
                type="button"
                className={styles.tool}
                onClick={() => changeQuantity(selected, selected.quantity - 1)}
                disabled={selected.quantity <= 1}
                aria-label={`Зменшити кількість: ${nameOf(selected)}`}>
                <IconMinus size={16} aria-hidden="true" />
              </button>
              <span className={styles.quantity} aria-live="polite">
                {selected.quantity} шт
              </span>
              <button
                type="button"
                className={styles.tool}
                onClick={() => changeQuantity(selected, selected.quantity + 1)}
                disabled={selected.quantity >= maxOf(selected)}
                aria-label={`Збільшити кількість: ${nameOf(selected)}`}>
                <IconPlus size={16} aria-hidden="true" />
              </button>
            </span>
            <span className={styles.toolSeparator} aria-hidden="true" />
            <button type="button" className={styles.tool} onClick={() => remove(selected)}>
              Видалити
            </button>
          </div>
        )}

        {isLoading ? (
          <p className={styles.message} aria-busy="true">
            Відкриваємо кошик…
          </p>
        ) : empty ? (
          <div className={styles.message}>
            <Win98Icon name="binEmpty" />
            <div>
              <p className={styles.messageTitle}>Кошик порожній</p>
              <p>Але це легко виправити. Лімітований мерч чекає на тебе.</p>
              {removed && (
                <button type="button" className={styles.button} onClick={undo}>
                  Повернути «{nameOf(removed)}»
                </button>
              )}
              <Link href={`${basePath}/catalog`} className={`${styles.button} ${styles.buttonDefault}`}>
                Перейти до каталогу
              </Link>
            </div>
          </div>
        ) : (
          <ul className={styles.icons} aria-label="Товари в кошику">
            {items.map((item) => {
              const isSelected = selected?.id === item.id;
              const options = optionsOf(item);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={styles.icon}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedId(item.id)}
                    onDoubleClick={() => open(item)}>
                    <span className={styles.thumb}>
                      <CloudinaryImage
                        src={item.product.primaryImage?.url || '/assets/img/placeholder-product.jpg'}
                        alt=""
                        width={128}
                        height={128}
                      />
                      {item.quantity > 1 && <span className={styles.badge}>×{item.quantity}</span>}
                    </span>
                    <span className={styles.label}>{nameOf(item)}</span>
                    <span className={styles.meta}>
                      {options && `${options} · `}
                      {formatPrice(item.finalPrice * item.quantity)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {!empty && !isLoading && (
          <>
            <fieldset className={styles.summary}>
              <legend>Підсумок</legend>
              <div className={styles.summaryRow}>
                <span>Товари ({calculations.itemsCount})</span>
                <span>{formatPrice(calculations.subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className={`${styles.summaryRow} ${styles.summaryDiscount}`}>
                  <span>Знижка</span>
                  <span>− {formatPrice(discount)}</span>
                </div>
              )}
              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                <span>До сплати</span>
                <span>{formatPrice(calculations.totalAmount)}</span>
              </div>
              <p className={styles.summaryNote}>Доставка та оплата обираються на наступному кроці</p>
            </fieldset>

            <div className={styles.actions}>
              <Link href={`${basePath}/catalog`} className={styles.button}>
                До каталогу
              </Link>
              <Link href={`${basePath}/checkout`} className={`${styles.button} ${styles.buttonDefault}`}>
                Оформити замовлення
              </Link>
            </div>
          </>
        )}
      </Win98Window>
    </Page>
  );
}
