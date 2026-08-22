'use client';
// Рядок кошика за дизайн-специфікацією (v2026-08). Один компонент для сторінки
// і для шухляди — саме тому рядок компактний (~84px замість колишніх 179px):
// у вузьку шухляду він влазить без окремої розмітки.
//
// Ключові рішення дизайну, які видно в коді:
//   • справа ЗАВЖДИ сума за позицію; ціна за штуку зʼявляється лише коли
//     кількість > 1 і живе біля «Видалити» — так зникло дублювання ціни;
//   • видалення не викидає тост — рядок віддає подію нагору, а CartList малює
//     на його місці смужку «Повернути» (фокус лишається в списку);
//   • степер оновлює число одразу, а на час запиту гасне — видно, що йде робота,
//     але кліки не блокуються.
import { useState, useCallback, memo } from 'react';
import Link from 'next/link';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import { CartItemWithProduct } from '@/shared/utils/cart-calculations';
import { formatPrice } from '@/shared/utils/format';
import { CloudinaryImage } from '@/shared/components/CloudinaryImage/CloudinaryImage';
import { getVariantDisplayBadges } from '@/shared/utils/variant-display';
import { useDebounce } from '@/shared/hooks';
import { useCartDrawerActions } from '@/shared/stores/cart';
import { useCart } from '../../hooks/useCart';
import styles from './CartItem.module.scss';

interface CartItemProps {
  item: CartItemWithProduct;
  /** Шухляда: та сама розмітка, лише трохи щільніші поля */
  compact?: boolean;
  isFirst?: boolean;
  /** Видалення обробляє CartList — він же показує «Повернути» */
  onRemove: () => void;
}

const CartItemComponent = ({ item, compact = false, isFirst = false, onRemove }: CartItemProps) => {
  const { updateItemQuantity } = useCart();
  // Перехід на товар мусить ЗАКРИТИ шухляду. Сама вона цього не робить:
  // usePathname у CartDrawer потрібен лише для телеграм-префікса, реакції на
  // зміну маршруту там немає, тож кошик лишався розкритим поверх щойно
  // відкритого товару. Кнопки всередині шухляди («До каталогу», «Оформити»)
  // закривають її явно — тут той самий прийом для рядка товару.
  //
  // На сторінці /cart шухляда й так закрита, і виклик стає холостим: селектор
  // повертає те саме false, тож React навіть не перемальовує.
  const { close: closeDrawer } = useCartDrawerActions();
  const [quantity, setQuantity] = useState(item.quantity);
  // Чи є неоформлений запит на зміну кількості саме цього рядка. Глобальний
  // isUpdatingItem для цього не годиться: він гасив би степери всіх товарів
  const [pending, setPending] = useState(false);

  const maxAvailable = item.variant?.availableQuantity ?? item.product.availableQuantity ?? 0;
  const isMaxReached = quantity >= maxAvailable;

  const debouncedUpdate = useDebounce((itemId: string, next: number) => {
    updateItemQuantity(itemId, next);
    setPending(false);
  }, 500);

  const handleQuantityChange = useCallback(
    (next: number) => {
      if (next < 1 || next > maxAvailable) return;
      setQuantity(next);
      setPending(true);
      debouncedUpdate(item.id, next);
    },
    [item.id, maxAvailable, debouncedUpdate]
  );

  const unitPrice = item.finalPrice;
  const lineTotal = unitPrice * quantity;
  const oldLineTotal = item.hasPromo ? item.originalPrice * quantity : null;
  const badges = getVariantDisplayBadges(item.variant?.options || item.product.options);
  const name = item.variant?.name || item.product.name;

  return (
    <div className={`${styles.row} ${compact ? styles.rowCompact : ''} ${isFirst ? styles.rowFirst : ''}`}>
      <Link
        href={`/catalog/${item.product.slug}`}
        className={styles.thumb}
        aria-label={name}
        onClick={closeDrawer}>
        <CloudinaryImage
          src={item.product.primaryImage?.url || '/assets/img/placeholder-product.jpg'}
          alt=""
          width={128}
          height={128}
        />
      </Link>

      <div className={styles.body}>
        <div className={styles.head}>
          <div className={styles.titleBlock}>
            <Link href={`/catalog/${item.product.slug}`} className={styles.name} onClick={closeDrawer}>
              {name}
            </Link>
            {badges.length > 0 && (
              <p className={styles.meta}>{badges.map((b) => `${b.label}: ${b.value}`).join(' · ')}</p>
            )}
          </div>

          {/* Справа — тільки сума за позицію. Ціна за штуку нижче й лише коли
              вона справді додає інформацію (кількість > 1) */}
          <div className={styles.priceBlock}>
            {oldLineTotal && <s className={styles.oldPrice}>{formatPrice(oldLineTotal)}</s>}
            <span className={`${styles.price} ${oldLineTotal ? styles.pricePromo : ''}`}>
              {formatPrice(lineTotal)}
            </span>
          </div>
        </div>

        <div className={styles.controls}>
          <div className={`${styles.stepper} ${pending ? styles.stepperPending : ''}`}>
            <button
              type="button"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              aria-label="Зменшити кількість">
              <IconMinus size={16} />
            </button>
            <span aria-live="polite">{quantity}</span>
            <button
              type="button"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={isMaxReached}
              aria-label="Збільшити кількість">
              <IconPlus size={16} />
            </button>
          </div>

          {/* Одне тихе пояснення на рядок: або чому «+» не тисне, або з чого
              складається сума. Обидва разом ніколи не потрібні */}
          {isMaxReached ? (
            <span className={styles.note}>Більше немає в наявності</span>
          ) : quantity > 1 ? (
            <span className={styles.note}>
              {quantity} × {formatPrice(unitPrice)}
            </span>
          ) : null}

          <button type="button" className={styles.remove} onClick={onRemove}>
            Видалити
          </button>
        </div>
      </div>
    </div>
  );
};

export const CartItem = memo(CartItemComponent);
