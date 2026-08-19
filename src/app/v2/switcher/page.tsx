// Приклади перемикача товарів /v2/switcher: варіант «Г» з дизайн-брифу —
// текстові чипи й збільшені картки-мініатюри замість дрібних свотчів.
// Усе на РЕАЛЬНИХ колекціях з БД, щоб було видно найгірший випадок (16 товарів).
// Гейт DEV_MODE — серверний, як у /v2/dev.
import { notFound } from 'next/navigation';
import { DEV_MODE } from '@/shared/config/dev-mode';
import { SwitcherExamples } from './SwitcherExamples';

export const metadata = { title: 'Перемикач товарів — приклади', robots: { index: false } };

export default function SwitcherPage() {
  if (!DEV_MODE) notFound();
  return <SwitcherExamples />;
}
