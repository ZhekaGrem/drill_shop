// Галерея стилів свотчів /v2/swatches: варіанти поділу кружечка на кольорові
// зони (піци, половинки, кільця, смужки…) на реальних парах кольорів товарів.
// Власник вибирає стиль — далі одна команда перераховує switcherSwatch у БД.
// Гейт DEV_MODE — серверний, як у /v2/dev.
import { notFound } from 'next/navigation';
import { DEV_MODE } from '@/shared/config/dev-mode';
import { SwatchExamples } from './SwatchExamples';

export const metadata = { title: 'Свотчі — приклади', robots: { index: false } };

export default function SwatchesPage() {
  if (!DEV_MODE) notFound();
  return <SwatchExamples />;
}
