'use client';

import { Box, Container, Title, Text } from '@mantine/core';
import Image from 'next/image';
import styles from './deliveryPayment.module.scss';

const DeliveryAndPayment = () => {
  return (
    <>
      <Container size="xl" py="lg">
        <Title className={styles.pageTitle}>ДОСТАВКА ТА ОПЛАТА</Title>
      </Container>

      <Box className={styles.contentGrid}>
        <Box className={styles.textContent}>
          <Container size="lg" py={80}>
            <Title className={styles.sectionTitle} mb="xl">
              ДОСТАВКА
            </Title>
            <Text className={styles.description} mb="lg">
              Ми доставляємо наш мерч по всій Україні через Нову Пошту. Відправка здійснюється протягом 1-2 робочих
              днів після підтвердження замовлення.
            </Text>
            <Text className={styles.description} mb="lg">
              <strong>Нова Пошта:</strong> Доставка на відділення або поштомат. Вартість доставки розраховується
              автоматично при оформленні замовлення.
            </Text>
            {/* <Text className={styles.description} mb="xl">
              <strong>Безкоштовна доставка:</strong> При замовленні від 2000 грн доставка за наш рахунок!
            </Text> */}

            <Title className={styles.sectionTitle} mb="xl">
              ОПЛАТА
            </Title>
            <Text className={styles.description} mb="lg">
              Ви можете оплатити ваше замовлення одним із наступних способів:
            </Text>
            <Text className={styles.description} mb="lg">
              <strong>Оплата карткою</strong> - ми приймаємо онлайн оплату за допомогою банківських карт Visa,
              Mastercard через сервіс онлайн оплати Plata by Mono.
            </Text>
            <Text className={styles.description}>
              <strong>Накладений платіж</strong> - готівковий або безготівковий розрахунок при отриманні накладеного
              платежу на Новій Пошті (комісія за накладений платіж не стягується).
            </Text>
          </Container>
        </Box>
        <Box className={styles.imageContent}>
          <Image src="/assets/img/about/about.webp" alt="Delivery" fill className={styles.sideImage} />
        </Box>
      </Box>
    </>
  );
};

export default DeliveryAndPayment;
