// src/app/zlypni/page.tsx
// Сторінка розділу «є. Злипні». Той самий поділ, що в /prokliatyi: метадані статичні тут,
// колекції приходять на клієнті з GET /collections — сервер нічого не тягне, ISR-сторінка дешева.
// Сусідній [key]/page.tsx — прихована галерея старих дизайнів, інша сторінка.
import type { Metadata } from 'next';
import { content } from '@/shared/config/content';
import Zlypni from './Zlypni';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: content.zlypni.title,
  description: content.zlypni.description,
  alternates: { canonical: 'https://www.ye-dril.com/zlypni' },
};

export default function ZlypniPage() {
  return <Zlypni />;
}
