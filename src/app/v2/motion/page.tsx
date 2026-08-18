// Пілот «3D в каталозі як анімація»: turntable-рендери hoodie-buba.glb
// (Blender headless -> animated WebP) у макеті картки каталогу. Мета —
// оцінити плавність, вагу і вигляд перед рішенням про повний конвеєр.
// Гейт DEV_MODE — серверний, як у /v2/dev.
import { notFound } from 'next/navigation';
import { DEV_MODE } from '@/shared/config/dev-mode';
import { MotionPilot } from './MotionPilot';

export const metadata = { title: 'Motion-пілот каталогу', robots: { index: false } };

export default function MotionPage() {
  if (!DEV_MODE) notFound();
  return <MotionPilot />;
}
