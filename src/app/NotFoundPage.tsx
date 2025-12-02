// src/app/not-found.tsx - FIXED 404 PAGE
import { Container, Group, Text, Title } from '@mantine/core';
import styles from './notFound.module.scss';
import Link from 'next/link';
import { Button } from '@/shared/components/Button/Button';
import { ArrowRight } from '@/shared/components/Svg';

const NotFoundPage = () => {
  return (
    <div className={styles.root}>
      <Container pb={50}>


        <Text size="lg" ta="center" className={styles.description}>
          Здається, ми не знайшли те, що ви шукали. Сторінка, яку ви шукали, не існує, недоступна або завантажувалася неправильно.
        </Text>

        <Group justify="center" mt="xl">
          <Link href="/">
            <Button size="promo" variant="yellow" >
              <span className={styles.bthSpan}>
                В МАГАЗИН <ArrowRight />
              </span>
            </Button>
          </Link>

        </Group>

        {/* Popular links */}
      </Container>
    </div>
  );
};

export default NotFoundPage;
