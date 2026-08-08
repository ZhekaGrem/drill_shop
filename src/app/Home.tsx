// src/app/Home.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Suspense, lazy, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/shared/components/Button/Button';
import { ArrowRight } from '@/shared/components/Svg';
import { PopularProductsSlider } from '@/widgets/PopularProductsSlider/PopularProductsSlider';
import { useCategoriesStore } from '@/shared/stores/categories';
import { CategoriesInitializer } from '@/shared/components/CategoriesInitializer/CategoriesInitializer';
import styles from './home.module.scss';

// Lazy load Spline компоненти для оптимізації
const Spline = lazy(() => import('@splinetool/react-spline'));

const ADVANTAGES = [
  { title: 'Доставка 1-2 дні', text: 'Нова пошта по всій Україні' },
  { title: 'Оплата при отриманні', text: 'Або онлайн — як зручно' },
  { title: 'Обмін і повернення', text: '14 днів без питань' },
];

const Home = () => {
  const router = useRouter();
  const [isSplineLoaded, setIsSplineLoaded] = useState(false);
  const categories = useCategoriesStore((s) => s.categories);

  return (
    <div className={styles.page}>
      {/* Ініціалізує стор категорій, якщо він ще не завантажений (напр. при заході одразу на "/") */}
      <CategoriesInitializer />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>Офіційний мерч shchilnui Drill</h1>
          <p className={styles.heroSubtitle}>Футболки, худі та аксесуари з дропів гурту</p>
          <Button size="lg" variant="primary" onClick={() => router.push('/catalog')}>
            До каталогу <ArrowRight />
          </Button>
        </div>
        <div className={styles.heroVisual}>
          {!isSplineLoaded && (
            <Image
              src="/assets/img/tshirt.webp"
              alt="Футболка Drill shop — офіційний мерч"
              width={520}
              height={520}
              className={styles.placeholderImage}
              priority
            />
          )}
          <div
            className={styles.splineWrapper}
            style={{ opacity: isSplineLoaded ? 1 : 0, transition: 'opacity 0.5s ease' }}>
            <Suspense fallback={null}>
              <Spline
                scene="https://prod.spline.design/j2veMJqqV2QABEh9/scene.splinecode"
                onLoad={() => setIsSplineLoaded(true)}
              />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Категорії */}
      {categories && categories.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Категорії</h2>
          <div className={styles.categoryGrid}>
            {categories.slice(0, 4).map((cat) => (
              <Link key={cat.id} href={`/catalog/category/${cat.slug}`} className={styles.categoryCard}>
                <span className={styles.categoryName}>{cat.name}</span>
                <ArrowRight />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Популярне */}
      <section className={styles.section}>
        <PopularProductsSlider />
      </section>

      {/* Переваги */}
      <section className={styles.section}>
        <div className={styles.advantages}>
          {ADVANTAGES.map((a) => (
            <div key={a.title} className={styles.advantageCard}>
              <span className={styles.advantageTitle}>{a.title}</span>
              <span className={styles.advantageText}>{a.text}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
