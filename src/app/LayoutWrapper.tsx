// src/app/LayoutWrapper.tsx
'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/widgets/Header/Header';
import { Footer } from '@/widgets/Footer/Footer';
import { EmailVerificationBanner } from '@/shared/components/EmailVerificationBanner';
import { ThemeClock } from '@/shared/components/ThemeClock/ThemeClock';
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

  // Десктопна заглушка-ґейт (поіменний список сторінок, рішення власника
  // 2026-08-16) знята повністю: десктоп відкритий усьому сайту, а не лише
  // головній і /v2/*. DEV_MODE лишається — він і далі керує /v2/dev,
  // /v2/lab та іншими внутрішніми dev-сторінками окремо від цього рішення.
  return (
    <>
      <ThemeClock />
      <div className={styles.siteAlways}>
        {/* viewTransitionName вилучає хедер зі знімка сторінки, щоб він не їхав
          разом із контентом. Правило анімації — в globals.css. Inline-стиль —
          варіант C правил стилізації: це унікальний ідентифікатор ділянки,
          а не оформлення; у SCSS-модулі імʼя захешувалось би.

          position/top/z-index (P0.2) навмисно тут, а не в header.module.scss.
          Sticky-елемент не може вийти за межі БЕЗПОСЕРЕДНЬОГО батька — раніше
          sticky стояв на самому Header (.wrapper), і цей div був тим батьком,
          заввишки рівно з хедер: діапазон прилипання дорівнював нулю, і хедер
          їхав геть зі сторінкою (заміряно 2026-08-17). Тут батько — .site,
          заввишки в усю сторінку, тож прилипати є де. Три властивості лишаються
          в тому самому inline-стилі, а не в новому класі: інакше на одному
          елементі змішались би два методи стилізації (SCSS-модуль + inline). */}
        <div style={{ viewTransitionName: 'site-header', position: 'sticky', top: 0, zIndex: 100 }}>
          <Header />
        </div>
        <EmailVerificationBanner />
        <main>{children}</main>
        <div style={{ viewTransitionName: 'site-footer' }}>
          <Footer />
        </div>
        {/* Нижня панель навігації видалена (рішення власника): каталог і меню
            переїхали в кнопки-іконки хедера */}
      </div>
    </>
  );
}
