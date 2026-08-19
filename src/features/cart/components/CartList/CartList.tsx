'use client';
// Список кошика з inline-скасуванням видалення (дизайн-специфікація v2026-08).
//
// Чому undo живе тут, а не в самому рядку: щойно товар прибрано зі стору,
// рядок відмонтовується разом зі своїм станом — підтвердження просто не
// встигло б показатись. Тому список памʼятає, ЩО і НА ЯКОМУ місці зникло,
// і малює смужку «Товар видалено · Повернути» рівно там, де був товар.
//
// Товар прибирається одразу, а не через 5 секунд: інакше підсумок ці пʼять
// секунд показував би суму з уже видаленою річчю.
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CartItemWithProduct } from '@/shared/utils/cart-calculations';
import { useCart } from '../../hooks/useCart';
import { CartItem } from '../CartItem/CartItem';
import styles from './CartList.module.scss';

interface UndoEntry {
  key: string;
  index: number;
  item: CartItemWithProduct;
}

// Скільки живе шанс повернути товар
const UNDO_MS = 5000;

export const CartList = ({ items, compact = false }: { items: CartItemWithProduct[]; compact?: boolean }) => {
  const { removeItem, addItem } = useCart();
  const [undos, setUndos] = useState<UndoEntry[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const drop = useCallback((key: string) => {
    const t = timers.current.get(key);
    if (t) clearTimeout(t);
    timers.current.delete(key);
    setUndos((prev) => prev.filter((u) => u.key !== key));
  }, []);

  const handleRemove = useCallback(
    (item: CartItemWithProduct, index: number) => {
      const key = `${item.id}-${index}`;
      removeItem(item.id);
      setUndos((prev) => [...prev, { key, index, item }]);
      timers.current.set(
        key,
        setTimeout(() => drop(key), UNDO_MS)
      );
    },
    [removeItem, drop]
  );

  const handleUndo = useCallback(
    (entry: UndoEntry) => {
      addItem(entry.item.product.id, entry.item.quantity, entry.item.variant?.id, entry.item.product);
      drop(entry.key);
    },
    [addItem, drop]
  );

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach((t) => clearTimeout(t));
  }, []);

  // Рядки товарів, у які на збережені позиції вставлені смужки скасування
  const nodes = items.map((item, index) => (
    <CartItem
      key={item.id}
      item={item}
      compact={compact}
      isFirst={index === 0 && undos.every((u) => u.index > 0)}
      onRemove={() => handleRemove(item, index)}
    />
  ));

  undos.forEach((entry) => {
    nodes.splice(
      Math.min(entry.index, nodes.length),
      0,
      <div
        key={entry.key}
        className={`${styles.undoRow} ${compact ? styles.undoRowCompact : ''}`}
        role="status">
        <span className={styles.text}>Товар видалено з кошика.</span>
        <button type="button" className={styles.undo} onClick={() => handleUndo(entry)}>
          Повернути
        </button>
      </div>
    );
  });

  return <>{nodes}</>;
};
