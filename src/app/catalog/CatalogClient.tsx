'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Loader, Center } from '@mantine/core';
import { IconFilter, IconMoodEmpty } from '@tabler/icons-react';
import { Button } from '@/shared/components/Button/Button';
import { Page } from '@/shared/components/Page/Page';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Breadcrumbs } from '@/shared/components/Breadcrumbs';
import { ProductCard } from '@/features/catalog/components/ProductCard/ProductCard';
import { CatalogFilters } from '@/features/catalog/components/CatalogFilters/CatalogFilters';
import { MobileFilterModal } from '@/features/catalog/components/MobileFilterModal/MobileFilterModal';
import { useCatalogFilters, countActiveFilters } from '@/features/catalog/hooks/useCatalogFilters';
import { useCatalogProducts } from '@/features/catalog/hooks/useCatalogProducts';
import { ProductsResponse } from '@/features/catalog/api/products';
import styles from './catalog.module.scss';

/** Скільки сторінок дотягує автоскрол, перш ніж передати кермо людині */
const AUTO_PAGES_STEP = 2;

interface CatalogProps {
  initialData?: ProductsResponse | null;
  initialCategories?: any[];
  basePath?: string;
}

export default function CatalogClient({ initialData, initialCategories, basePath = '' }: CatalogProps) {
  const [initialized, setInitialized] = useState(false);
  const [filtersModalOpened, setFiltersModalOpened] = useState(false);
  // Нескінченний скрол ховав футер назавжди: сторінка довантажувалась швидше,
  // ніж людина доходила до низу, а в футері живуть єдині посилання на оферту,
  // повернення й політику. Дві автопідвантаження — далі явна кнопка.
  const [autoPagesBudget, setAutoPagesBudget] = useState(AUTO_PAGES_STEP);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { filters, setFromUrlParams, clearFilters, updateUrl } = useCatalogFilters();

  const observerTarget = useRef<HTMLDivElement>(null);

  const { data, status, error, refetch, isFetchingNextPage, fetchNextPage, hasNextPage } = useCatalogProducts(
    {
      filters: filters,
      enabled: initialized,
      initialData: initialData,
    }
  );

  // Обʼєднуємо всі сторінки в один масив
  const products = data?.pages.flatMap((page) => page.data) || [];
  // undefined, поки запит ще не осів — «Знайдено 0 товарів» не має права
  // звучати з aria-live, доки ми не знаємо реальної кількості (крок 5)
  const totalCount = data?.pages[0]?.meta.total;
  const activeFilterCount = countActiveFilters(filters);

  useEffect(() => {
    setFromUrlParams(searchParams);
    setInitialized(true);
  }, [searchParams, setFromUrlParams]);

  // Скролимо до верху при зміні маршруту. Зміну фільтрів сюди свідомо не
  // додаємо: `handleFiltersChange` нижче вже робить плавний скрол на ту саму
  // подію, і instant+smooth одночасно давали подвійний, зойомий стрибок (крок 8).
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  // Скільки сторінок уже дотягнув автоскрол — рахуємо з самих даних, а не
  // окремим станом: при зміні фільтрів TanStack Query і так починає з однієї
  // сторінки, тож скидати нічого не треба.
  const autoLoadExhausted = (data?.pages.length ?? 1) - 1 >= autoPagesBudget;

  // Intersection Observer для безкінечного скролу
  useEffect(() => {
    if (autoLoadExhausted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, autoLoadExhausted]);

  const handleFiltersChange = useCallback(() => {
    // Стан фільтрів іде в URL одразу після кожної зміни (крок 1) — інакше
    // оновлення сторінки чи «назад» у браузері мовчки скидають усе, що обрав
    // користувач.
    updateUrl(router, basePath);
    setAutoPagesBudget(AUTO_PAGES_STEP);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateUrl, router, basePath]);

  const handleResetFilters = useCallback(() => {
    clearFilters();
    router.replace(pathname);
  }, [clearFilters, router, pathname]);

  return (
    <Page className={styles.catalogPage}>
      <Breadcrumbs items={[{ label: 'Головна', href: `${basePath}/` }, { label: 'Каталог' }]} />
      <PageHeader
        title="Каталог"
        description="Футболки, худі, постери та аксесуари — офіційний мерч, лімітовані тиражі."
        aside={
          totalCount !== undefined && totalCount > 0 ? (
            <span className={styles.totalCount}>{totalCount} товарів</span>
          ) : null
        }
      />

      {/* Кнопка фільтрів для мобільних — з лічильником активних.
          Була ще й IconChevronDown праворуч: «шеврон вниз» обіцяє акордеон,
          а відкривався bottom sheet. Одна іконка = одне значення (3.11). */}
      <Button
        variant="secondary"
        className={styles.filtersButton}
        onClick={() => setFiltersModalOpened(true)}
        aria-haspopup="dialog"
        aria-expanded={filtersModalOpened}
        fullWidth>
        <IconFilter size={18} stroke={1.5} />
        <span>Фільтри</span>
        {activeFilterCount > 0 && <span className={styles.filtersBadge}>{activeFilterCount}</span>}
      </Button>

      {/* Фільтри для десктопу */}
      <div className={styles.desktopFilters}>
        <CatalogFilters
          onFiltersChange={handleFiltersChange}
          initialCategories={initialCategories}
          resultsCount={totalCount}
        />
      </div>

      {/* Мобільний bottom sheet з фільтрами */}
      <MobileFilterModal
        opened={filtersModalOpened}
        onClose={() => setFiltersModalOpened(false)}
        onFiltersChange={handleFiltersChange}
        initialCategories={initialCategories}
        resultsCount={totalCount}
      />

      <div className={styles.results}>
        {error && (
          <div className={styles.error}>
            <h3>Не вдалося завантажити товари</h3>
            <p>Перевірте з&apos;єднання з інтернетом і спробуйте ще раз.</p>
            <Button variant="primary" onClick={() => refetch()}>
              Спробувати ще раз
            </Button>
          </div>
        )}

        {/* status === 'pending' охоплює і «URL ще не розібраний» (enabled=false),
            і сам перший запит — обидва варто показувати скелетоном, а не
            порожнім кадром «Нічого не знайдено» (крок 4) */}
        {status === 'pending' && (
          <div className={styles.products}>
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className={styles.productSkeleton}>
                <div className={styles.productSkeleton__image} />
                <div className={styles.productSkeleton__content}>
                  <div className={styles.productSkeleton__title} />
                  <div className={styles.productSkeleton__stock} />
                  <div className={styles.productSkeleton__price} />
                </div>
                <div className={styles.productSkeleton__action} />
              </div>
            ))}
          </div>
        )}

        {status === 'success' && products.length > 0 && (
          <>
            <div className={styles.products}>
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} basePath={basePath} index={index} />
              ))}
            </div>

            {/* Intersection observer target */}
            <div ref={observerTarget} className={styles.observerTarget} />

            {/* Індикатор завантаження наступної сторінки */}
            {isFetchingNextPage && (
              <Center py="xl">
                <Loader size="md" />
              </Center>
            )}

            {/* Після ліміту автопідвантажень — явна дія, щоб футер став досяжним */}
            {hasNextPage && autoLoadExhausted && !isFetchingNextPage && (
              <div className={styles.loadMore}>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setAutoPagesBudget((n) => n + AUTO_PAGES_STEP);
                    fetchNextPage();
                  }}>
                  Показати ще
                </Button>
                <span className={styles.loadMoreHint}>
                  Показано {products.length} з {totalCount}
                </span>
              </div>
            )}

            {/* Повідомлення про кінець списку. Було Text c="dimmed" — сірий
                Mantine повз токени проєкту. */}
            {!hasNextPage && products.length > 0 && (
              <p className={styles.listEnd}>Всі товари завантажено ({totalCount})</p>
            )}
          </>
        )}

        {/* Повідомлення якщо товарів немає — тільки коли запит реально осів
            порожнім, а не поки він ще в польоті (крок 4) */}
        {status === 'success' && products.length === 0 && (
          <div className={styles.empty}>
            {/* Була IconFilter — та сама іконка, що й на кнопці «Фільтри»:
                один знак ніс два різні значення */}
            <IconMoodEmpty size={40} stroke={1.5} className={styles.emptyIcon} />
            <h3>Нічого не знайдено</h3>
            <p>За обраними фільтрами товарів немає. Спробуйте змінити або скинути фільтри.</p>
            <Button variant="secondary" onClick={handleResetFilters}>
              Скинути фільтри
            </Button>
          </div>
        )}
      </div>
    </Page>
  );
}
