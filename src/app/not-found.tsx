// src/app/not-found.tsx - Diia-style 404
import { Container, Group, Text, Title } from '@mantine/core';
import styles from './notFound.module.scss';
import Link from 'next/link';
import { Button } from '@/shared/components/Button/Button';
import { ArrowRight } from '@/shared/components/Svg';

const NotFoundPage = () => {
  return (
    <div className={styles.root}>
      <Container size="sm">
        <div className={styles.card}>
          <span className={styles.code}>404</span>
          <Title order={1} className={styles.title}>
            Сторінку не знайдено
          </Title>
          <Text ta="center" className={styles.description}>
            Здається, ми не знайшли те, що ви шукали. Сторінка, яку ви шукали, не існує, недоступна або
            завантажувалася неправильно.
          </Text>

          <Group justify="center" mt="xl">
            <Link href="/">
              <Button size="promo" variant="primary">
                <span className={styles.bthSpan}>
                  В магазин <ArrowRight />
                </span>
              </Button>
            </Link>
          </Group>
        </div>
      </Container>
    </div>
  );
};

export default NotFoundPage;
