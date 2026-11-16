// src/app/zlypni/page.tsx
// Сторінка розділу «є. Злипні». Той самий поділ, що в /prokliatyi: метадані статичні тут,
// колекції приходять на клієнті з GET /collections — сервер нічого не тягне, ISR дешевий.
import type { Metadata } from 'next';
import { content } from '@/shared/config/content';
import { ZLYPNI_HREF, ZLYPNI_LIVE } from '@/shared/config/zlypni';
import Zlypni from './Zlypni';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: content.zlypni.title,
  description: content.zlypni.description,
  alternates: { canonical: `https://www.ye-dril.com${ZLYPNI_HREF}` },
  // До запуску сторінка пише «скоро» — пошуковикам її не показуємо
  ...(ZLYPNI_LIVE ? {} : { robots: { index: false, follow: false } }),
};

export default function ZlypniPage() {
  return <Zlypni />;
}
