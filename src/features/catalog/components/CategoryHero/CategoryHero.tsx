// src/features/catalog/components/CategoryHero/CategoryHero.tsx
'use client';

import { Container, Title, Text } from '@mantine/core';
import { Category } from '@/shared/types';
import { CloudinaryImage } from '@/shared/components/CloudinaryImage/CloudinaryImage';
import styles from './CategoryHero.module.scss';

interface CategoryHeroProps {
  category: Category;
  productsCount?: number;
}

export function CategoryHero({ category, productsCount }: CategoryHeroProps) {
  return (
    <>
      <section className={styles.hero}>
        {/* Фонове зображення категорії */}

        <Container size="xl" className={styles.heroContent}>
          {category.image && (
            <CloudinaryImage
              src={category.image}
              alt={category.name}
              width={1920}
              height={400}
              className={styles.heroImage}
              priority
            />
          )}
          <div className={styles.heroText}>
            <Title order={1} className={styles.title}>
              {category.name}
            </Title>

            {category.description && <Text className={styles.description}>{category.description}</Text>}
          </div>
        </Container>
      </section>
      <div className={styles.heroInliner} />
    </>
  );
}
