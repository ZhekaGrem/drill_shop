// src/app/Home.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/Button/Button';
import { IconShoppingBag } from '@tabler/icons-react';
import styles from './home.module.scss';

const Home = () => {
  const router = useRouter();

  const handleGoToShop = () => {
    router.push('/catalog');
  };

  return (
    <div className={styles.landingPage}>
      <div className={styles.landingContent}>
        <Button
          size="promo"
          variant="primary"
          onClick={handleGoToShop}
          leftIcon={<IconShoppingBag size={32} />}>
          В МАГАЗИН
        </Button>
      </div>
    </div>
  );
};

export default Home;
