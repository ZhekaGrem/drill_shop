// src/widgets/HeroShop/HeroShop.tsx
// Герой 3 (комерційний): зліва картка товару вибраного дизайну — ціна, розмір,
// «У кошик», «Детальніше»; справа той самий 3D-перемикач у контрольованому
// режимі. Потік кошика — 1:1 зі сторінкою товару (addItem + selectedVariant).
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/Button/Button';
import { ArrowRight, IconCart3 } from '@/shared/components/Svg';
import { useCart } from '@/features/cart/hooks/useCart';
import { sortVariantsBySize } from '@/shared/utils/size-sort';
import { HeroVisual } from '@/widgets/HeroVisual/HeroVisual';
import { HERO3_DESIGNS, HERO3_SLUGS } from './config';
import type { Hero3Key } from './config';
import { useHeroProducts } from './useHeroProducts';
import styles from './HeroShop.module.scss';

export const HeroShop = () => {
  const router = useRouter();
  const { addItem, isAddingItem } = useCart();
  const products = useHeroProducts();

  const [design, setDesign] = useState<string>(Object.keys(HERO3_DESIGNS)[0]);
  // Вибір розміру пам'ятаємо разом із дизайном: зміна дизайну = перший розмір
  const [picked, setPicked] = useState<{ design: string; variantId: string } | null>(null);
  const [added, setAdded] = useState(false);

  const product = products[design as Hero3Key];
  const variants = sortVariantsBySize(product?.variants ?? []);
  const variant =
    (picked?.design === design ? variants.find((v) => v.id === picked.variantId) : undefined) ?? variants[0];
  const price = variant?.price ?? product?.price;

  const handleAddToCart = () => {
    if (!product) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    addItem(product.id, 1, variant?.id, {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: variant?.price || product.price,
      unitValue: variant?.unitValue || product.unitValue,
      primaryImage: product.images?.find((img) => img.isPrimary) || product.images?.[0] || null,
      variants: product.variants,
      promoType: variant?.promoType || product.promoType,
      promoConfig: variant?.promoConfig || product.promoConfig,
      promoEndsAt: variant?.promoEndsAt || product.promoEndsAt,
    });
  };

  return (
    <section className={styles.hero}>
      <div className={styles.panel}>
        <h2 className={styles.title}>{product?.name ?? HERO3_DESIGNS[design].label}</h2>
        {price != null && <p className={styles.price}>{price} грн</p>}

        {variants.length > 0 && (
          <div className={styles.sizes} role="group" aria-label="Розмір">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                className={styles.size}
                aria-pressed={variant?.id === v.id}
                disabled={v.quantity <= 0}
                onClick={() => setPicked({ design, variantId: v.id })}>
                {String(v.options?.size ?? v.name)}
              </button>
            ))}
          </div>
        )}

        <div className={styles.actions}>
          <Button size="lg" variant="primary" onClick={handleAddToCart} disabled={!product || isAddingItem}>
            {added ? 'Додано ✓' : 'У кошик'} <IconCart3 size={20} />
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => router.push(`/catalog/${product?.slug ?? HERO3_SLUGS[design as Hero3Key]}`)}>
            Детальніше <ArrowRight size={20} />
          </Button>
        </div>
      </div>

      <HeroVisual designs={HERO3_DESIGNS} value={design} onChange={setDesign} />
    </section>
  );
};
