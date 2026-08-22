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
 * Підказка живе, поки нею не скористались PEEK_USES разів.
 *
 * Спершу тут стояла одиниця — і це виявилось замало: одне випадкове
 * спрацювання (а воно було, скрол по шапці зараховувався як гортання)
 * вимикало підказку назавжди, ще до того, як людина взагалі зрозуміла, що
 * смуга гортається. Пʼять разів — це вже не випадковість, а звичка.
 *
 * Рахуються ТІЛЬКИ справжні переходи: свайп по горизонталі або стрілки.
 * Вертикальний скрол у лічильник не потрапляє — за це відповідає замок осі
 * в useSwipePager.
 */
const PEEK_USES_KEY = 'nav-swipe-uses';
const PEEK_USES = 5;

/** Скільки разів уже гортали. Сміття у сховищі читається як нуль. */
const readUses = (): number => {
  const n = Number(localStorage.getItem(PEEK_USES_KEY));
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
};
/** Проміжок між панелями доріжки; дзеркалить крок у .headerPanel */
const GAP = 24;

/** Скільки розділів у кільці, і як позиція доріжки лягає на розділ */
const WORLDS = NAV_WORLDS.length;
const modWorld = (p: number) => ((p % WORLDS) + WORLDS) % WORLDS;

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

  // Позиція доріжки — БЕЗМЕЖНЕ ціле, а не індекс 0..N-1. У цьому вся кільцевість:
  // після Сєріка pos просто стає 3, доріжка їде далі вправо, а показує вона
  // знову Дріл (pos % 3). Якби позиція була індексом, перехід з останнього на
  // перший означав би стрибок з -2·крок на 0 — тобто смуга проїхала б назад
  // через усі розділи замість того, щоб винести наступний справа.
  const [pos, setPos] = useState(routeIndex);
  const [seenRoute, setSeenRoute] = useState(routeIndex);
  if (seenRoute !== routeIndex) {
    setSeenRoute(routeIndex);
    // Маршрут змінився сам (звичайний лінк, «назад» у браузері, підвантажена
    // мапа словомарок) — доганяємо НАЙКОРОТШИМ шляхом по колу, інакше з
    // третього розділу на перший смуга котилася б через увесь список.
    let d = (routeIndex - modWorld(pos)) % WORLDS;
    if (d > WORLDS / 2) d -= WORLDS;
    if (d < -WORLDS / 2) d += WORLDS;
    setPos(pos + d);
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
    if (readUses() >= PEEK_USES) return;
    // Вікно [pos-1, pos, pos+1], тож наступна панель — третя. Перевірки «а чи
    // є наступна» більше не треба: у кільці наступна є завжди. А от до першого
    // заміру сусідів ще не рендеримо — тому panelW у залежностях.
    const next = trackRef.current?.children[2] as HTMLElement | undefined;
    if (!next) return;
    next.classList.add(styles.headerPanelPeek);
    return () => next.classList.remove(styles.headerPanelPeek);
  }, [pos, panelW]);

  const step = panelW + GAP;
  /**
   * Сусідні панелі зʼявляються ЛИШЕ після заміру ширини.
   *
   * Панелі стоять абсолютно на слотах pos·крок, а крок рахується з panelW.
   * Поки заміру немає, крок дорівнює одному лише проміжку — і три словомарки
   * лягають одна на одну з інтервалом 24px. Заміряно: x панелей −24/0/+24.
   * Поточна панель завжди на слоті 0, тож сама по собі малюється правильно
   * з першого кадру. До абсолютних слотів цього не було видно: flex розкладав
   * панелі послідовно, і нульовий крок лише зсував доріжку, а не накладав її.
   */
  const slots = panelW > 0 ? [pos - 1, pos, pos + 1] : [pos];
  const goStep = (dir: -1 | 1) => {
    // Кожен справжній перехід — плюс один до лічильника. Ефект вище
    // перезапуститься від зміни pos і на пʼятому разі вже не поверне клас.
    localStorage.setItem(PEEK_USES_KEY, String(readUses() + 1));
    const next = pos + dir;
    setPos(next);
    router.push(NAV_WORLDS[modWorld(next)].href);
  };

  const { dx, dragging, handlers } = useSwipePager({ step, onStep: goStep });

  return (
    <Box className={styles.wrapper}>
      <header
        className={styles.header}
        role="group"
        aria-label="Розділи сайту — гортай убік"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
          e.preventDefault();
          goStep(e.key === 'ArrowRight' ? 1 : -1);
        }}
        {...handlers}>
        {/* Ліва група: вікно доріжки. Панелі всередині — те саме, що стояло
            тут раніше: лого й десктопна навігація, тими самими класами */}
        <div className={styles.headerLeft} ref={leftRef}>
          <div
            ref={trackRef}
            className={dragging ? styles.headerTrack : styles.headerTrackSnap}
            style={{ transform: `translate3d(${-pos * step + dx}px, 0, 0)` }}>
            {slots.map((slot) => {
              const world = NAV_WORLDS[modWorld(slot)];
              const current = slot === pos;
              return (
                <div
                  key={slot}
                  className={styles.headerPanel}
                  // Панелі стоять абсолютно на своїх слотах, а не потоком: у
                  // потоці вікно з трьох завжди лежало б поспіль, і кільце
                  // вимагало б стрибка доріжки після кожного переходу. Слот
                  // у змінній, бо анімація визирання мусить додаватись ДО
                  // нього, а не замість.
                  style={{ width: panelW || undefined, '--slot': `${slot * step}px` } as React.CSSProperties}
                  aria-hidden={!current}>
                  {/* inverse — хедер чорний, як верхня панель Дії. Без цього
                    ворд-марка малюється --text-primary, тобто чорним по чорному.
                    Від 1024px смуга світла — там колір перекриває .headerLogo */}
                  <Link
                    href={world.href}
                    className={styles.logoLink}
                    tabIndex={current ? 0 : -1}
                    aria-label={`є. ${world.wordmark} — на головну`}>
                    <Logo inverse className={styles.headerLogo} wordmark={world.wordmark} />
                  </Link>

                  <nav className={styles.desktopNav} aria-label={`Навігація: ${world.wordmark}`}>
                    {world.navItems.map((item) => {
                      const active = current && isNavItemActive(item.href, pathname);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                          aria-current={active ? 'page' : undefined}
                          tabIndex={current ? 0 : -1}
                          draggable={false}>
                          {item.label}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              );
            })}
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
