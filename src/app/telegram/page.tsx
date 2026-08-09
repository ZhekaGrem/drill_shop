'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/Button/Button';
import { ArrowRight } from '@/shared/components/Svg';
import { useTelegramAuthStore } from '@/shared/stores/telegram-auth';
import styles from './telegramHome.module.scss';

export default function TelegramHomePage() {
  const router = useRouter();
  const { userProfile } = useTelegramAuthStore();

  const handleGoToShop = () => {
    router.push('/telegram/catalog');
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>
            {userProfile?.firstName ? `Привіт, ${userProfile.firstName}!` : 'Офіційний мерч shchilnui Drill'}
          </h1>
          <p className={styles.heroSubtitle}>Футболки, худі та аксесуари з дропів гурту — прямо в Telegram</p>
          <Button size="lg" variant="primary" onClick={handleGoToShop}>
            До каталогу <ArrowRight />
          </Button>
        </div>
      </section>
    </div>
  );
}
