'use client';
// v2 «C · Дія-список»: мінімалістичний державний стиль — компактний опис
// колекції, фото, картка покупки, а вся інформація — рядками ListGroup
// (як розділи в Дії). Демо-репрезентація для вибору власником.
import { use, useState } from 'react';
import Image from 'next/image';
import { useProduct } from '@/widgets/ProductV2/useProduct';
import { COLLECTION_INFO, itemBySlug } from '@/widgets/ProductV2/collections';
import { BuyPanel } from '@/widgets/ProductV2/BuyPanel';
import { CollectionStrip } from '@/widgets/ProductV2/CollectionStrip';
import { VersionSwitch } from '@/widgets/ProductV2/VersionSwitch';
import { Page } from '@/shared/components/Page/Page';
import { ListGroup, ListRow } from '@/shared/components/ListGroup/ListGroup';
import { ServicesGroup } from '@/shared/components/ServicesGroup/ServicesGroup';
import { Section } from '@/shared/components/Section/Section';
import { sanitizeHTML } from '@/shared/utils/sanitize';
import styles from '@/widgets/ProductV2/ProductV2.module.scss';

export default function ProductV2C({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const item = itemBySlug(slug);
  const { data: product } = useProduct(slug);
  const [openDescription, setOpenDescription] = useState(false);

  return (
    <Page>
      <div className={styles.page}>
        <VersionSwitch current="c" slug={slug} />

        <div className={styles.collectionHead}>
          <h1>{COLLECTION_INFO.title}</h1>
          <p>{COLLECTION_INFO.description}</p>
        </div>

        <CollectionStrip activeSlug={slug} version="c" />

        <div className={styles.card}>
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
          <h2 className={styles.productName}>{product?.name ?? item?.design.label ?? slug}</h2>
          {product && <BuyPanel product={product} />}
        </div>

        <ListGroup>
          <ListRow
            title="Про товар"
            hint={openDescription ? 'згорнути' : 'розгорнути'}
            onClick={() => setOpenDescription((v) => !v)}
          />
        </ListGroup>
        {openDescription && product?.description && (
          <div className={styles.card}>
            <div
              className={styles.description}
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(product.description) }}
            />
          </div>
        )}

        <Section title="Доставка й оплата">
          <ServicesGroup />
        </Section>
      </div>
    </Page>
  );
}
