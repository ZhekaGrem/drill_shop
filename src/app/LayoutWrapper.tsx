// src/app/LayoutWrapper.tsx
'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/widgets/Header/Header';
import { Footer } from '@/widgets/Footer/Footer';
import { EmailVerificationBanner } from '@/shared/components/EmailVerificationBanner';
import { useRandomGradientPhase } from '@/shared/hooks';
import styles from './LayoutWrapper.module.scss';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // До раннього return для /telegram: правила хуків + telegram-сторінки теж
  // мають кнопки. Слухач один на весь документ.
  useRandomGradientPhase();

  // Telegram сторінки - БЕЗ Header і Footer (свій окремий layout)
  const isTelegramPage = pathname?.startsWith('/telegram');

  if (isTelegramPage) {
    return <>{children}</>;
  }

  // Всі інші сторінки - З Header і Footer. Десктоп бачить лише заглушку
  // (копі власника, дослівно) — сайт зараз мобільний.
  return (
    <>
      <div className={styles.plug} role="status">
        <h1 className={styles.plugTitle}>Вибачте в нас проблеми з підключенням...</h1>
        <p className={styles.plugHint}>але з телефона може запрацює...</p>
      </div>
      <div className={styles.site}>
        {/* viewTransitionName вилучає хедер зі знімка сторінки, щоб він не їхав
          разом із контентом. Правило анімації — в globals.css. Inline-стиль —
          варіант C правил стилізації: це унікальний ідентифікатор ділянки,
          а не оформлення; у SCSS-модулі імʼя захешувалось би. */}
        <div style={{ viewTransitionName: 'site-header' }}>
          <Header />
        </div>
        <EmailVerificationBanner />
        <main>{children}</main>
        <div style={{ viewTransitionName: 'site-footer' }}>
          <Footer />
        </div>
      </div>
    </>
  );
}
