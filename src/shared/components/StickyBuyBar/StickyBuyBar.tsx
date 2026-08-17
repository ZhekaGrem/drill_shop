// src/shared/components/StickyBuyBar/StickyBuyBar.tsx
// Липка панель дії на сторінці товару (≤1023px). Одна на обидві сторінки
// товару — /catalog/[slug] і /v2/a/[slug]: раніше кожна мала власну, і вони
// розійшлися (в одній панель стояла з першого екрана без ціни, в іншій
// зʼявлялась на скролі з ціною й розміром).
//
// Компонент презентаційний: коли показувати панель, вирішує сторінка через
// useActionOffscreen — саме там живе інлайн-кнопка, за якою стежить observer.
'use client';

import { Button } from '../Button/Button';
import { IconCart3, IconCheck } from '../Svg';
import { formatPrice } from '@/shared/utils/format';
import styles from './StickyBuyBar.module.scss';

interface StickyBuyBarProps {
  /** Панель у кадрі. Рендер за умовою, а не приховування: невидима кнопка
      лишалась би у фокусній послідовності. */
  visible: boolean;
  price: number;
  /** Ціна до знижки. Є — показуємо закресленою, а ціну фарбуємо в акцент. */
  oldPrice?: number | null;
  /** Підпис обраного варіанта («M», «42»). Немає варіантів — немає рядка. */
  sizeLabel?: string | null;
  disabled?: boolean;
  /** Щойно додали: іконка на пару секунд стає галочкою. Колір кнопки НЕ
      міняється — зелена кнопка була єдиним місцем на сайті з таким фоном. */
  added?: boolean;
  onAdd: () => void;
}

export const StickyBuyBar = ({
  visible,
  price,
  oldPrice = null,
  sizeLabel = null,
  disabled = false,
  added = false,
  onAdd,
}: StickyBuyBarProps) => {
  if (!visible) return null;

  const hasDiscount = typeof oldPrice === 'number' && oldPrice > price;
  // Кнопка без підпису — назву дії несе aria-label, інакше для скрінрідера
  // це «кнопка» без імені.
  const actionLabel = added ? 'Додано в кошик' : 'Додати в кошик';

  return (
    <div className={styles.bar}>
      <div className={styles.info}>
        <span className={styles.priceRow}>
          <span className={`${styles.price} ${hasDiscount ? styles.priceDiscount : ''}`}>
            {formatPrice(price)}
          </span>
          {hasDiscount && <span className={styles.oldPrice}>{formatPrice(oldPrice)}</span>}
        </span>
        {sizeLabel && <span className={styles.size}>Розмір {sizeLabel}</span>}
      </div>

      <Button
        className={styles.action}
        size="lg"
        variant="primary"
        aria-label={actionLabel}
        disabled={disabled}
        onClick={onAdd}>
        {added ? <IconCheck size={22} /> : <IconCart3 size={22} />}
      </Button>
    </div>
  );
};
