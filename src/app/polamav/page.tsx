// src/app/polamav/page.tsx
// Сторінка розділу «є. Поламав». Той самий поділ, що в головної (page.tsx +
// Home.tsx): метадані статичні тут, колекції приходять на клієнті з
// GET /collections — сервер нічого не тягне, тож ISR-сторінка дешева.
import type { Metadata } from 'next';
import { content } from '@/shared/config/content';
import Polamav from './Polamav';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: content.polamav.title,
  description: content.polamav.description,
  alternates: { canonical: 'https://www.ye-dril.com/polamav' },
};

export default function PolamavPage() {
  return <Polamav />;
}
