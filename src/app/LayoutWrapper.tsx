// src/app/LayoutWrapper.tsx
'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/widgets/Header/Header';
import { Footer } from '@/widgets/Footer/Footer';
import { SiteBottomNav } from '@/widgets/BottomNav';
import { EmailVerificationBanner } from '@/shared/components/EmailVerificationBanner';
import { ThemeClock } from '@/shared/components/ThemeClock/ThemeClock';
import { useRandomGradientPhase } from '@/shared/hooks';
import { DEV_MODE } from '@/shared/config/dev-mode';
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

  // Десктоп відкритий не всьому сайту, а поіменному списку (рішення власника,
  // 2026-08-16): головна і все під /v2 мають власну широку розкладку, решта
  // лишається мобільною і бачить заглушку. DEV_MODE відкриває все одразу.
  //
  // Головна звіряється на ТОЧНИЙ збіг: startsWith('/') відкрив би геть усе.
  const isDesktopAllowed = DEV_MODE || pathname === '/' || pathname?.startsWith('/v2');

  // Решта сторінок на широкому екрані бачить заглушку (копі власника,
  // дослівно) — вони досі мобільні.
  return (
    <>
      <ThemeClock />
      {!isDesktopAllowed && (
        <div className={styles.plug} role="status">
          <h1 className={styles.plugTitle}>Вибачте, у нас проблеми з підключенням</h1>
          <p className={styles.plugHint}>але з телефона може запрацює...</p>
          <p className={styles.plugHint}>(Якщо сайт не робе, не пишіт мені)</p>
        </div>
      )}
      <div className={isDesktopAllowed ? styles.siteAlways : styles.site}>
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
        {/* Нижня панель живе ВСЕРЕДИНІ .site, а не поруч із ним. Інакше в
            діапазоні 769–1023px вона малювалась би поверх десктопної заглушки:
            .site ховається від 769px, а власний брейкпоінт панелі — 1024px.
            Сама панель фіксована, тож на розкладку всередині контейнера це не
            впливає; відступ під неї ставить body[data-bottom-nav] (globals.css). */}
        <SiteBottomNav />
      </div>
    </>
  );
}
