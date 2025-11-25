// src/app/LayoutWrapper.tsx
'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/widgets/Header/Header';
import { Footer } from '@/widgets/Footer/Footer';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Головна сторінка - БЕЗ Header і Footer (тільки картинка і кнопка)
  const isHomePage = pathname === '/';

  if (isHomePage) {
    return <>{children}</>;
  }

  // Всі інші сторінки - З Header і Footer
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
