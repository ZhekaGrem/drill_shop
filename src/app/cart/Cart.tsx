// src/app/cart/Cart.tsx
'use client';

import Link from 'next/link';
import { IconShoppingCart } from '@tabler/icons-react';
import { ArrowLeft } from '@/shared/components/Svg';
import { useCart } from '@/features/cart/hooks/useCart';
import { CartItem } from '@/features/cart/components/CartItem/CartItem';
import { formatPrice, formatProducts } from '@/shared/utils/format';
import { Button } from '@/shared/components/Button/Button';
import { Page } from '@/shared/components/Page/Page';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import styles from './cart.module.scss';

interface CartPageProps {
  basePath?: string;
}

export default function CartPage({ basePath = '' }: CartPageProps) {
  const { items, calculations, error, isLoading } = useCart();

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
    <Page>
      <PageHeader
        title="Кошик"
        description={
          items.length > 0 ? `${formatProducts(calculations.itemsCount)} у кошику` : 'Поки що порожній'
        }
        aside={
          <Link href={`${basePath}/catalog`} className={styles.backLink}>
            <ArrowLeft size={18} />
            До каталогу
          </Link>
        }
      />

      {isLoading ? (
        <div className={styles.state}>
          <p>Завантажуємо кошик…</p>
        </div>
      ) : items.length === 0 ? (
        <div className={styles.state}>
          <IconShoppingCart size={48} stroke={1.5} className={styles.stateIcon} />
          <h2>Ваш кошик порожній</h2>
          <p>Додайте товари до кошика, щоб продовжити покупки.</p>
          <div className={styles.stateActions}>
            <Button variant="primary" onClick={() => (window.location.href = `${basePath}/catalog`)}>
              Перейти до каталогу
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.cart}>
          {/* Список товарів — одна біла картка, рядки розділені всередині */}
          <div className={styles.itemsList}>
            {items.map((item, index) => (
              <CartItem key={item.id} item={item} compact={false} isFirst={index === 0} />
            ))}
          </div>

          {/* Підсумок. Раніше це була картка з градієнтом, у яку вкладалась ще
              одна біла картка — градієнт на градієнті сторінки. */}
          <aside className={styles.summary}>
            <h2 className={styles.summaryTitle}>Разом</h2>

            <div className={styles.summaryRow}>
              <span>Товари ({calculations.itemsCount})</span>
              <span>{formatPrice(calculations.subtotal)}</span>
            </div>

            <div className={styles.summaryRow}>
              <span>Доставка</span>
              <span className={styles.summaryMuted}>За тарифами перевізника</span>
            </div>

            <div className={styles.total}>
              <span>До сплати</span>
              <span className={styles.totalPrice}>{formatPrice(calculations.totalAmount)}</span>
            </div>

            <Link href={`${basePath}/checkout`} className={styles.checkoutLink}>
              <Button variant="primary" size="lg" fullWidth>
                <span className={styles.desktopText}>Перейти до оформлення</span>
                <span className={styles.mobileText}>Оформити</span>
              </Button>
            </Link>

            <ul className={styles.notes}>
              <li>Відправка за 1–2 робочі дні</li>
              <li>Оплата карткою або при отриманні</li>
              <li>14 днів на повернення</li>
            </ul>
          </aside>
        </div>
      )}
    </Page>
  );
}
