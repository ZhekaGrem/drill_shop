// src/app/prokliatyi/page.tsx
// Сторінка розділу «є. Проклятий». Той самий поділ, що в головної (page.tsx +
// Home.tsx): метадані статичні тут, колекції приходять на клієнті з
// GET /collections — сервер нічого не тягне, тож ISR-сторінка дешева.
import type { Metadata } from 'next';
import { content } from '@/shared/config/content';
import Prokliatyi from './Prokliatyi';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: content.prokliatyi.title,
  description: content.prokliatyi.description,
  alternates: { canonical: 'https://www.ye-dril.com/prokliatyi' },
};

export default function ProkliatyiPage() {
  return <Prokliatyi />;
}
