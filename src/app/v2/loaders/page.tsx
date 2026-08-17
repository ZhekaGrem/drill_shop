// Галерея завантажувальних екранів /v2/loaders: живі приклади, з яких
// вибираємо той, що стане app/loading.tsx. Гейт DEV_MODE — серверний,
// як у /v2/dev і /v2/lab.
import { notFound } from 'next/navigation';
import { DEV_MODE } from '@/shared/config/dev-mode';
import { LoaderGallery } from './LoaderGallery';

export const metadata = { title: 'Завантажувальні екрани', robots: { index: false } };

export default function LoadersPage() {
  if (!DEV_MODE) notFound();
  return <LoaderGallery />;
}
