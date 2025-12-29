import { Metadata } from 'next';
import Script from 'next/script';
import { Box } from '@mantine/core';
import { TelegramProvider } from '@/shared/providers/TelegramProvider';
import { TelegramAuthProvider } from '@/shared/providers/TelegramAuthProvider';
import { TelegramBottomNav } from '@/widgets/TelegramBottomNav';

export const metadata: Metadata = {
  title: 'Telegram Mini App - Shop Sausages',
  description: 'Інтернет-магазин м\'ясних виробів в Telegram',
};

export default function TelegramLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Telegram WebApp Script - завантажується першим */}
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />

      <TelegramProvider>
        <TelegramAuthProvider>
          <Box style={{ paddingBottom: '64px', minHeight: '100vh' }}>
            {children}
          </Box>
          <TelegramBottomNav />
        </TelegramAuthProvider>
      </TelegramProvider>
    </>
  );
}
