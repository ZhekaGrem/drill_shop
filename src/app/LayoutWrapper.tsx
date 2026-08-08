// src/app/LayoutWrapper.tsx
'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/widgets/Header/Header';
import { Footer } from '@/widgets/Footer/Footer';
import { EmailVerificationBanner } from '@/shared/components/EmailVerificationBanner';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Telegram сторінки - БЕЗ Header і Footer (свій окремий layout)
  const isTelegramPage = pathname?.startsWith('/telegram');

  if (isTelegramPage) {
    return <>{children}</>;
  }

  // Всі інші сторінки - З Header і Footer
  return (
    <>
      <Header />
      <EmailVerificationBanner />
      <main>{children}</main>
      <Footer />
    </>
  );
}
