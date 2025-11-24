// src/app/catalog/LoadingSkeleton.tsx
'use client';

import styles from './LoadingSkeleton.module.scss';

export default function LoadingSkeleton() {
  return (
    <div className={styles.catalogPage}>
      <div className={styles.container}>
        {/* Заголовок */}
        <div className={styles.header}>
          <div className={styles.titleSkeleton}></div>
          <div className={styles.resultsCountSkeleton}></div>
        </div>

        <div className={styles.content}>
          {/* Сайдбар з фільтрами */}
          <aside className={styles.sidebar}>
            <div className={styles.filtersSkeleton}>
              {/* Блок категорій */}
              <div className={styles.filterGroup}>
                <div className={styles.filterTitle}></div>
                <div className={styles.filterOptions}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={styles.filterOption}></div>
                  ))}
                </div>
              </div>

              {/* Блок цін */}
              <div className={styles.filterGroup}>
                <div className={styles.filterTitle}></div>
                <div className={styles.priceRange}>
                  <div className={styles.priceInput}></div>
                  <div className={styles.priceInput}></div>
                </div>
              </div>

              {/* Блок брендів */}
              <div className={styles.filterGroup}>
                <div className={styles.filterTitle}></div>
                <div className={styles.filterOptions}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={styles.filterOption}></div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Основний контент */}
          <div className={styles.main}>
            <div className={styles.products}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className={styles.productSkeleton}>
                  <div className={styles.productSkeleton__image}>
                    <div className={styles.shimmer}></div>
                  </div>
                  <div className={styles.productSkeleton__content}>
                    <div className={styles.productSkeleton__title}>
                      <div className={styles.shimmer}></div>
                    </div>
                    <div className={styles.productSkeleton__description}>
                      <div className={styles.shimmer}></div>
                    </div>
                    <div className={styles.productSkeleton__price}>
                      <div className={styles.shimmer}></div>
                    </div>
                    <div className={styles.productSkeleton__button}>
                      <div className={styles.shimmer}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Пагінація skeleton */}
            <div className={styles.paginationSkeleton}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={styles.paginationItem}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
