import { notFound } from 'next/navigation';
import { DEV_MODE } from '@/shared/config/dev-mode';
import { AnimationLab } from './AnimationLab';

export const metadata = { title: 'Анімації 3D · Dev', robots: { index: false, follow: false } };

export default function AnimationsPage() {
  if (!DEV_MODE) notFound();
  return <AnimationLab />;
}
