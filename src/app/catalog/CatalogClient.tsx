'use client';

import { useEffect, useLayoutEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Loader, Center } from '@mantine/core';
import { IconMoodEmpty } from '@tabler/icons-react';
import { Button } from '@/shared/components/Button/Button';
import { Page } from '@/shared/components/Page/Page';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Breadcrumbs } from '@/shared/components/Breadcrumbs';
import { ProductCard } from '@/features/catalog/components/ProductCard/ProductCard';
import { useCatalogFilters, countActiveFilters } from '@/features/catalog/hooks/useCatalogFilters';
import { useHiddenProductSlugs } from '@/shared/hooks/useTurntables';
import { useCatalogProducts } from '@/features/catalog/hooks/useCatalogProducts';
import { ProductsResponse } from '@/features/catalog/api/products';
import styles from './catalog.module.scss';

/** Скільки сторінок дотягує автоскрол, перш ніж передати кермо людині */
const AUTO_PAGES_STEP = 2;

interface CatalogProps {
  initialData?: ProductsResponse | null;
  basePath?: string;
}

export default function CatalogClient({ initialData, basePath = '' }: CatalogProps) {
  const [initialized, setInitialized] = useState(false);
  // Нескінченний скрол ховав футер назавжди: сторінка довантажувалась швидше,
  // ніж людина доходила до низу, а в футері живуть єдині посилання на оферту,
  // повернення й політику. Дві автопідвантаження — далі явна кнопка.
  const [autoPagesBudget, setAutoPagesBudget] = useState(AUTO_PAGES_STEP);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { filters, setFromUrlParams, clearFilters } = useCatalogFilters();

  const observerTarget = useRef<HTMLDivElement>(null);

  // initialData тільки після initialized: до того, як useLayoutEffect нижче
  // розбере URL, filters у сторі ще дефолтні {}. Якщо віддати SSG-дані одразу,
  // matchesServerDefault({}) в useCatalogProducts тривіально true — і
  // TanStack Query на мить репортує status:'success' з нефільтрованим
  // списком під URL із `?categoryId=…`, ще до того, як реальний URL взагалі
  // прочитаний. Це не про час фарби (для цього досить useLayoutEffect) — це
  // про те, щоб хибний seed узагалі не стався: без initialized продукти тут
  // ніколи не рендерились у SSR/SSG HTML (сторінка використовує
  // useSearchParams, тому results-секція суто клієнтська), тож втрати
  // немає, а гонка зникає архітектурно, а не лише за таймінгом.
  const { data, status, error, refetch, isFetchingNextPage, fetchNextPage, hasNextPage } = useCatalogProducts(
    {
      filters: filters,
      enabled: initialized,
      initialData: initialized ? initialData : undefined,
    }
  );

  // Товари прихованих розділів (config/hidden-collections) з каталогу
  // відсіюємо на фронті: лістовий /products нічого не знає про колекції,
  // а деталка вимагає isActive=true — тож ховати можна лише тут
  const { data: hiddenSlugs } = useHiddenProductSlugs();

  // Обʼєднуємо всі сторінки в один масив
  const products = (data?.pages.flatMap((page) => page.data) || []).filter((p) => !hiddenSlugs?.has(p.slug));
  // undefined, поки запит ще не осів — «Знайдено 0 товарів» не має права
  // звучати з aria-live, доки ми не знаємо реальної кількості (крок 5).
  // Мінус приховані: вони в лічильнику бекенда, але не на вітрині
  const rawTotal = data?.pages[0]?.meta.total;
  const totalCount = rawTotal !== undefined ? Math.max(0, rawTotal - (hiddenSlugs?.size ?? 0)) : undefined;
  const activeFilterCount = countActiveFilters(filters);

  // useLayoutEffect, а не useEffect: перший рендер завжди монтується з
  // дефолтним filters={} (стор — глобальний синглтон, читає URL лише тут), і
  // на цьому дефолті initialData від SSG одразу дає status:'success' —
  // TanStack Query за одну фарбу встигає показати нефільтрований список як
  // ніби це вже відповідь на `?categoryId=X`. useLayoutEffect розбирає URL і
  // комітить правильні filters синхронно, до того як браузер намалює кадр
  // після гідратації, тож ця хибна «завершена» відповідь ніколи не потрапляє
  // на екран — той самий прийом, що вже є в useAuthGuard/useAdminGuard.
  useLayoutEffect(() => {
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

  // Фільтр тепер приходить лише з URL (?categoryId=… з категорій і пошуку),
  // тож лишається єдина дія — скинути його й показати весь каталог
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

      {/* Фільтри прибрані з каталогу (рішення власника): кнопка «Фільтри»,
          десктопна панель і мобільний bottom sheet. Стан фільтрів у сторі
          лишається — його читає URL (?categoryId=…), тож переходи з категорій
          працюють, просто керувати ними зі сторінки більше не можна. */}

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
            <IconMoodEmpty size={40} stroke={1.5} className={styles.emptyIcon} />
            <h3>Нічого не знайдено</h3>
            {/* Керувати фільтрами зі сторінки більше не можна, тож про них
                згадуємо лише тоді, коли вони справді прийшли з URL — інакше
                порожній каталог радив би скинути те, чого людина не вмикала */}
            {activeFilterCount > 0 ? (
              <>
                <p>За обраним добором товарів немає.</p>
                <Button variant="secondary" onClick={handleResetFilters}>
                  Показати весь каталог
                </Button>
              </>
            ) : (
              <p>Схоже, товарів поки немає. Зазирни трохи згодом.</p>
            )}
          </div>
        )}
      </div>
    </Page>
  );
}
