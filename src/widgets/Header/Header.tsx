// src/widgets/Header/Header.tsx
//
// Хедер гортається вбік: замість «є. Дріл» приїжджає «є. Олько» зі своїми
// пунктами навігації. Візуально смуга не змінилась ані на піксель — ті самі
// класи, токени й розкладка, що були до свайпу. Через це тут НЕМА ні крапок-
// індикатора, ні визирання наступного розділу з краю: будь-яка з цих підказок
// була б новим елементом у смузі.
//
// Що саме їде: тільки ліва група (лого + навігація). Права з кошиком і меню
// прибита намертво — вона глобальна, не належить жодному розділу, і якби вона
// поїхала теж, посеред жесту було б видно дві копії кошика, а сам він на мить
// ставав би недосяжним.
//
// Що саме ловить жест: УВЕСЬ хедер, на всю ширину. Тягнути можна звідки
// завгодно, зокрема з правої половини смуги, — рухається при цьому ліва група.
// Тому ліва група тепер `flex: 1`: їй потрібна ширина, задана розкладкою, а не
// власним вмістом, інакше доріжка з двох панелей роздула б її під max-content.
//
// Активний розділ визначає МАРШРУТ, а не локальний стан: інакше після переходу
// по звичайному лінку смуга показувала б не той розділ, у якому ти опинився.
'use client';
import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Box, Badge } from '@mantine/core';
import styles from './header.module.scss';
import Link from 'next/link';
import { useCartDrawerActions, useCartCalculations, useCartStore } from '@/shared/stores/cart';
import { CartDrawer } from '@/features/cart/components/CartDrawer/CartDrawer';
import { Logo } from '@/shared/components/Logo';
import { useHiddenWordmarks } from '@/shared/hooks/useTurntables';
import { useSwipePager } from '@/shared/hooks/useSwipePager';
import { NAV_WORLDS, worldIndexByWordmark } from '@/shared/config/nav-worlds';
import { IconCart, IconCatalog, MenuIcon } from '@/shared/components/Svg';

/**
 * Підказка живе, поки нею не скористались. Щойно людина гортнула (пальцем,
 * мишею чи стрілками) — механіку знайдено, і визирати більше нема чого.
 * Так підказка вчить і йде з дороги, замість набридати вічно.
 */
const SWIPE_USED_KEY = 'nav-swipe-used';
/** Проміжок між панелями доріжки; дзеркалить gap у .headerTrack */
const GAP = 24;

/** Порівнюємо ТІЛЬКИ pathname, свідомо: щоб врахувати query, потрібен
 *  `useSearchParams()`, а він у Next вимагає Suspense і вибиває сторінку зі
 *  статичної генерації. Проєкт тримається на SSG/ISR — підкреслений пункт
 *  того не вартий. Наразі жоден пункт навігації query й не має. */
const isNavItemActive = (href: string, pathname: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  // Прихований розділ підмінює словомарку логотипа (є. Дріл → є. Олько):
  // слаг товару зі шляху сторінки товару шукаємо серед товарів прихованих
  // колекцій (мапа з /collections, спільний кеш ['collections-raw'])
  const { data: hiddenWordmarks } = useHiddenWordmarks();
  const productSlug = pathname.match(/^\/(?:v2\/a|catalog)\/([^/]+)$/)?.[1];
  const wordmark = (productSlug && hiddenWordmarks?.[decodeURIComponent(productSlug)]) || undefined;
  const routeIndex = worldIndexByWordmark(wordmark);

  // Свайп має зрушити доріжку ОДРАЗУ, не чекаючи, поки завершиться перехід,
  // тому індекс тримається локально. А коли маршрут змінився сам (звичайний
  // лінк, «назад» у браузері, підвантажена мапа словомарок) — синхронізуємо.
  // Це правка стану під час рендера, документований прийом React: ефект тут
  // дав би зайвий кадр зі старим розділом.
  const [index, setIndex] = useState(routeIndex);
  const [seenRoute, setSeenRoute] = useState(routeIndex);
  if (seenRoute !== routeIndex) {
    setSeenRoute(routeIndex);
    setIndex(routeIndex);
  }

  const leftRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [panelW, setPanelW] = useState(0);

  const calculations = useCartCalculations();
  const { toggle: toggleCartDrawer } = useCartDrawerActions();
  const syncCart = useCartStore((state) => state.syncCart);

  useEffect(() => {
    syncCart();
  }, [syncCart]);

  // ResizeObserver сам віддає початковий розмір першим викликом, тож замір не
  // потребує синхронного setState у тілі ефекту (а він — помилка правила
  // react-hooks/set-state-in-effect, яка ламає прод-білд).
  useEffect(() => {
    const el = leftRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setPanelW(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Визирання вішаємо класом напряму на вузол, без стану: рендер тут нічого
  // не вирішує, а читати localStorage під час рендера не можна — розмітка
  // сервера не збіглася б із клієнтською.
  //
  // Визирає САМЕ наступна панель, а не доріжка цілком. Якби їхала доріжка,
  // разом із нею совалась би й поточна словомарка — тобто головний елемент
  // хедера смикався б сам по собі. А так «є. Дріл» стоїть нерухомо, і з-за
  // правого краю визирає та ховається сусідня марка.
  useEffect(() => {
    if (localStorage.getItem(SWIPE_USED_KEY)) return;
    const next = trackRef.current?.children[index + 1] as HTMLElement | undefined;
    if (!next) return; // на останньому розділі визирати нема чому
    next.classList.add(styles.headerPanelPeek);
    return () => next.classList.remove(styles.headerPanelPeek);
  }, [index]);

  const step = panelW + GAP;
  const goTo = (next: number) => {
    // Скористались — підказку прибираємо назавжди. Ефект вище перезапуститься
    // від зміни index, зніме клас у cleanup і більше його не поверне.
    localStorage.setItem(SWIPE_USED_KEY, '1');
    setIndex(next);
    router.push(NAV_WORLDS[next].href);
  };

  const { dx, dragging, handlers } = useSwipePager({
    count: NAV_WORLDS.length,
    index,
    step,
    onChange: goTo,
  });

  return (
    <Box className={styles.wrapper}>
      <header
        className={styles.header}
        role="group"
        aria-label="Розділи сайту — гортай убік"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
          const next = index + (e.key === 'ArrowRight' ? 1 : -1);
          if (next < 0 || next >= NAV_WORLDS.length) return;
          e.preventDefault();
          goTo(next);
        }}
        {...handlers}>
        {/* Ліва група: вікно доріжки. Панелі всередині — те саме, що стояло
            тут раніше: лого й десктопна навігація, тими самими класами */}
        <div className={styles.headerLeft} ref={leftRef}>
          <div
            ref={trackRef}
            className={dragging ? styles.headerTrack : styles.headerTrackSnap}
            style={{ transform: `translate3d(${-index * step + dx}px, 0, 0)` }}>
            {NAV_WORLDS.map((world, i) => (
              <div
                key={world.id}
                className={styles.headerPanel}
                style={{ width: panelW || undefined }}
                aria-hidden={i !== index}>
                {/* inverse — хедер чорний, як верхня панель Дії. Без цього
                    ворд-марка малюється --text-primary, тобто чорним по чорному.
                    Від 1024px смуга світла — там колір перекриває .headerLogo */}
                <Link
                  href={world.href}
                  className={styles.logoLink}
                  tabIndex={i === index ? 0 : -1}
                  aria-label={`є. ${world.wordmark} — на головну`}>
                  <Logo inverse className={styles.headerLogo} wordmark={world.wordmark} />
                </Link>

                <nav className={styles.desktopNav} aria-label={`Навігація: ${world.wordmark}`}>
                  {world.navItems.map((item) => {
                    const active = i === index && isNavItemActive(item.href, pathname);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                        aria-current={active ? 'page' : undefined}
                        tabIndex={i === index ? 0 : -1}
                        draggable={false}>
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Права група (рішення власника): каталог, меню, кошик — самі іконки.
            У жесті не бере участі: ці кнопки спільні для всіх розділів. */}
        <div className={styles.headerRight}>
          <Link href="/catalog" className={styles.iconButton} aria-label="Каталог">
            <IconCatalog />
          </Link>

          <Link href="/menu" className={styles.iconButton} aria-label="Меню">
            <MenuIcon />
          </Link>

          <button className={styles.cartButton} onClick={toggleCartDrawer} aria-label="Кошик">
            <IconCart />
            {calculations && calculations.itemsCount > 0 && (
              /* key змушує React перемонтувати бейдж на кожній зміні числа —
                 pop-анімація програється знову, і додавання товару видно боковим
                 зором навіть коли кошик далеко від кнопки «додати» */
              <Badge size="sm" circle className={styles.cartIconBadge} key={calculations.itemsCount}>
                {calculations.itemsCount > 99 ? '99+' : calculations.itemsCount}
              </Badge>
            )}
          </button>
          {/* Кнопка «Кабінет» прибрана з навбару (рішення власника) —
              профіль/адмінка доступні прямими URL */}
        </div>
      </header>

      {/* Cart Drawer */}
      <CartDrawer />
    </Box>
  );
}
