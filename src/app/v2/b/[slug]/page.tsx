'use client';
// v2 «B · Швидка картка»: все для покупки вище фолда — фото, назва, ціна,
// розміри, кнопка; колекція — стрічкою мініатюр зверху. Без WebGL: найлегша
// і найшвидша репрезентація. Демо для вибору власником.
import { use } from 'react';
import Image from 'next/image';
import { useProduct } from '@/widgets/ProductV2/useProduct';
import { COLLECTION_INFO, itemBySlug } from '@/widgets/ProductV2/collections';
import { BuyPanel } from '@/widgets/ProductV2/BuyPanel';
import { CollectionStrip } from '@/widgets/ProductV2/CollectionStrip';
import { VersionSwitch } from '@/widgets/ProductV2/VersionSwitch';
import { Page } from '@/shared/components/Page/Page';
import { Section } from '@/shared/components/Section/Section';
import { ServicesGroup } from '@/shared/components/ServicesGroup/ServicesGroup';
import { sanitizeHTML } from '@/shared/utils/sanitize';
import styles from '@/widgets/ProductV2/ProductV2.module.scss';

export default function ProductV2B({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const item = itemBySlug(slug);
  const { data: product } = useProduct(slug);

  return (
    <Page>
      <div className={styles.page}>
        <VersionSwitch current="b" slug={slug} />

        <div className={styles.card}>
          <div className={styles.collectionHead}>
            <p>колекція «{COLLECTION_INFO.title}»</p>
          </div>
          <CollectionStrip activeSlug={slug} version="b" />
          {item && (
            <Image
              className={styles.photo}
              src={item.design.fallback}
              alt={product?.name ?? item.design.label}
              width={840}
              height={840}
              priority
            />
          )}
          <h1 className={styles.productName}>{product?.name ?? item?.design.label ?? slug}</h1>
          {product && <BuyPanel product={product} />}
        </div>

        {product?.description && (
          <Section title="Про товар">
            <div className={styles.card}>
              <div
                className={styles.description}
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(product.description) }}
              />
            </div>
          </Section>
        )}

        <Section title="Доставка й оплата">
          <ServicesGroup />
        </Section>
      </div>
    </Page>
  );
}
