'use client';

import Image from 'next/image';
import { IconBuildingStore, IconCashBanknote, IconCreditCard, IconTruck } from '@tabler/icons-react';
import { Page } from '@/shared/components/Page/Page';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Section } from '@/shared/components/Section/Section';
import { ListGroup, ListRow } from '@/shared/components/ListGroup/ListGroup';
import styles from './deliveryPayment.module.scss';

const DeliveryAndPayment = () => {
  return (
    <Page>
      <PageHeader
        title="Доставка та оплата"
        description="Відправляємо по всій Україні Новою Поштою. Відправка — протягом 1–2 робочих днів після підтвердження замовлення."
      />

      <div className={styles.hero}>
        <Image src="/assets/img/about/about.webp" alt="" fill className={styles.heroImage} />
      </div>

      <Section title="Доставка">
        <ListGroup>
          <ListRow
            media={<IconTruck stroke={1.5} />}
            title="Нова Пошта — відділення"
            hint="Вартість розраховується автоматично при оформленні замовлення."
          />
          <ListRow
            media={<IconBuildingStore stroke={1.5} />}
            title="Нова Пошта — поштомат"
            hint="Зручно, якщо не встигаєте до відділення в робочі години."
          />
        </ListGroup>
      </Section>

      <Section title="Оплата">
        <ListGroup>
          <ListRow
            media={<IconCreditCard stroke={1.5} />}
            title="Картка онлайн"
            hint="Visa та Mastercard через сервіс Plata by Mono."
          />
          <ListRow
            media={<IconCashBanknote stroke={1.5} />}
            title="Накладений платіж"
            hint="Готівковий або безготівковий розрахунок при отриманні на Новій Пошті. Комісія за накладений платіж не стягується."
          />
        </ListGroup>
      </Section>
    </Page>
  );
};

export default DeliveryAndPayment;
