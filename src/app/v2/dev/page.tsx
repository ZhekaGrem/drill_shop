// Дев-сторінка /v2/dev: гейт DEV_MODE живе тут, у серверному компоненті —
// без прапорця notFound() малює 404-екран, і контент панелі взагалі не
// потрапляє у відповідь. HTTP-статус при цьому 200: кореневий loading.tsx
// обгортає сторінки в Suspense, оболонка стрімиться до вердикту сторінки
// (це поведінка всього застосунку для in-route notFound). Панель — DevPanel.
import { notFound } from 'next/navigation';
import { DEV_MODE } from '@/shared/config/dev-mode';
import { DevPanel } from './DevPanel';

export const metadata = { title: 'Dev mode', robots: { index: false } };

export default function DevPage() {
  if (!DEV_MODE) notFound();
  return <DevPanel />;
}
