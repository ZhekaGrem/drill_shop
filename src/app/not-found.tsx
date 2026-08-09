// src/app/not-found.tsx
import Link from 'next/link';
import { Button } from '@/shared/components/Button/Button';
import { StatusPage } from '@/shared/components/StatusPage/StatusPage';
import { ArrowRight } from '@/shared/components/Svg';

const NotFoundPage = () => (
  <StatusPage
    eyebrow="Помилка 404"
    title="Сторінку не знайдено"
    description="Здається, такої сторінки немає або вона переїхала. Спробуйте почати з каталогу."
    actions={
      <>
        <Link href="/catalog">
          <Button variant="primary">
            До каталогу <ArrowRight size={20} />
          </Button>
        </Link>
        <Link href="/">
          <Button variant="secondary">На головну</Button>
        </Link>
      </>
    }
  />
);

export default NotFoundPage;
