// src/app/not-found.tsx - FIXED 404 PAGE
import { Container, Group, Text, Title } from '@mantine/core';
import styles from './notFound.module.scss';
import Link from 'next/link';
import { Button } from '@/shared/components/Button/Button';
const NotFoundPage = () => {
  return (
    <div className={styles.root}>
      <Container>
        <div className={styles.label}>404</div>

        <Title className={styles.title}>Сторінку не знайдено</Title>

        <Text size="lg" ta="center" className={styles.description}>
          На жаль, сторінка, яку ви шукаєте, не існує або була переміщена. Можливо, ви перейшли за
          неправильним посиланням або адреса була змінена.
        </Text>

        <Group justify="center" mt="xl">
          <Link href="/">
            <Button>На головну</Button>
          </Link>
          <Link href="/catalog">
            <Button>До каталогу</Button>
          </Link>
        </Group>

        {/* Popular links */}
      </Container>
    </div>
  );
};

export default NotFoundPage;
