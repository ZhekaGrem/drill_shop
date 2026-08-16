// Лабораторія героя /v2/lab: приклад героя з новими 3D-моделями ДО того, як
// вони стануть товарами в БД. Гейт DEV_MODE — серверний, як у /v2/dev.
import { notFound } from 'next/navigation';
import { DEV_MODE } from '@/shared/config/dev-mode';
import { LabHero } from './LabHero';

export const metadata = { title: 'Hero Lab', robots: { index: false } };

export default function LabPage() {
  if (!DEV_MODE) notFound();
  return <LabHero />;
}
