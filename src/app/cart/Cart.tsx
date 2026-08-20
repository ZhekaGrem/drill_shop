// src/app/cart/Cart.tsx
// Кошик за дизайн-специфікацією (v2026-08):
//   • список — головне, підсумок вторинний до моменту рішення;
//   • знижка окремим рядком, доставка прибрана з математики й перетворена
//     на тиху обіцянку під сумою;
//   • на мобільному сума й дія живуть у липкій панелі над нижньою навігацією.
'use client';

import Link from 'next/link';
import { IconShoppingCart } from '@tabler/icons-react';
import { ArrowLeft } from '@/shared/components/Svg';
import { useCart } from '@/features/cart/hooks/useCart';
import { CartList } from '@/features/cart/components/CartList/CartList';
import { formatPrice, formatProducts } from '@/shared/utils/format';
import { Button } from '@/shared/components/Button/Button';
import { Page } from '@/shared/components/Page/Page';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import styles from './cart.module.scss';

interface CartPageProps {
  basePath?: string;
}

// Скелет повторює геометрію справжнього рядка (фото 64 + два текстові рядки),
// тож поява товарів не зсуває сторінку
const CartSkeleton = () => (
  <div className={styles.itemsList} aria-busy="true" aria-label="Завантажуємо кошик">
    {[0, 1, 2].map((i) => (
      <div key={i} className={styles.skeletonRow}>
        <span className={styles.skeletonThumb} />
        <span className={styles.skeletonLines}>
          <span className={styles.skeletonLine} />
          <span className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
        </span>
      </div>
    ))}
  </div>
);

export default function CartPage({ basePath = '' }: CartPageProps) {
  const { items, calculations, error, isLoading } = useCart();
  const hasItems = items.length > 0;
  const discount = calculations.discountAmount ?? 0;

  if (error) {
    return (
      <Page>
        <PageHeader title="Кошик" />
        <div className={styles.state}>
          <h2>Не вдалося завантажити кошик</h2>
          <p>Перевірте зʼєднання з інтернетом і спробуйте ще раз.</p>
          <Button onClick={() => window.location.reload()}>Спробувати знову</Button>
        </div>
      </Page>
    );
  }

  return (
    <Page className={hasItems ? styles.pageWithBar : undefined}>
      <PageHeader
        title="Кошик"
        description={hasItems ? `${formatProducts(calculations.itemsCount)} у кошику` : undefined}
        aside={
          <Link href={`${basePath}/catalog`} className={styles.backLink}>
            <ArrowLeft size={18} />
            До каталогу
          </Link>
        }
      />

      {isLoading ? (
        <CartSkeleton />
      ) : !hasItems ? (
        // Порожній кошик — не глухий кут, а запрошення (рішення дизайну)
        <div className={styles.state}>
          <IconShoppingCart size={48} stroke={1.5} className={styles.stateIcon} />
          <h2>Кошик поки що порожній</h2>
          <p>Але це легко виправити. Лімітований мерч чекає на тебе.</p>
          <div className={styles.stateActions}>
            <Link href={`${basePath}/catalog`}>
              <Button variant="primary" size="lg">
                Перейти до каталогу
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className={styles.cart}>
          <div className={styles.itemsList}>
            <CartList items={items} />
          </div>

          <aside className={styles.summary}>
            <h2 className={styles.summaryTitle}>Підсумок</h2>

            <div className={styles.summaryRow}>
              <span>Товари ({calculations.itemsCount})</span>
              <span className={styles.summaryValue}>{formatPrice(calculations.subtotal)}</span>
            </div>

            {/* Знижка зʼявляється лише коли вона є, і єдина в підсумку
                носить акцентний колір */}
            {discount > 0 && (
              <div className={`${styles.summaryRow} ${styles.summaryDiscount}`}>
                <span>Знижка</span>
                <span className={styles.summaryValue}>− {formatPrice(discount)}</span>
              </div>
            )}

            <div className={styles.total}>
              <span>До сплати</span>
              <span className={styles.totalPrice}>{formatPrice(calculations.totalAmount)}</span>
            </div>

            {/* Доставку тут не рахуємо — спосіб і адресу людина обирає далі.
                Замість порожнього рядка в математиці — чесна обіцянка */}
            <p className={styles.deliveryNote}>Доставка та оплата обираються на наступному кроці</p>

            <Link href={`${basePath}/checkout`} className={styles.checkoutLink}>
              <Button variant="primary" size="lg" fullWidth>
                Оформити замовлення
              </Button>
            </Link>

            <ul className={styles.notes}>
              <li>Відправка за 3-7 днів</li>
              <li>З оплатою розберемся легесенько</li>
              <li>14 днів на повернення</li>
            </ul>
          </aside>

          {/* Мобільна липка панель: сума й дія завжди на виду, над нижньою
              навігацією. На десктопі її роль виконує картка підсумку праворуч */}
          <div className={styles.stickyBar}>
            <div className={styles.stickyTotal}>
              <span className={styles.stickyLabel}>До сплати</span>
              <span className={styles.stickyPrice}>{formatPrice(calculations.totalAmount)}</span>
            </div>
            <Link href={`${basePath}/checkout`} className={styles.stickyAction}>
              <Button variant="primary" size="lg" fullWidth>
                Оформити
              </Button>
            </Link>
          </div>
        </div>
      )}
    </Page>
  );
}
