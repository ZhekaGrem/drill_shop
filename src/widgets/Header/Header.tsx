// src/widgets/Header/Header.tsx
'use client';
import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Box, Badge } from '@mantine/core';
import { useEffect } from 'react';
import styles from './header.module.scss';
import Link from 'next/link';
import { useCartDrawerActions, useCartCalculations, useCartStore } from '@/shared/stores/cart';
import { CartDrawer } from '@/features/cart/components/CartDrawer/CartDrawer';
import { Logo } from '@/shared/components/Logo';
import { IconX, IconSearch, IconCart } from '@/shared/components/Svg';
import { useCatalogFilters } from '@/features/catalog/hooks/useCatalogFilters';

// Тільки десктопна навігація. На мобільному ці розділи живуть у таб-барі
// (widgets/BottomNav) і на екрані «Кабінет» — бургер-шторки більше немає.
const NAV_ITEMS = [
  { label: 'Каталог', href: '/catalog' },
  { label: 'Про нас', href: '/about' },
  { label: 'Контакти', href: '/contact' },
];

/** Порівнюємо ТІЛЬКИ pathname, свідомо: щоб врахувати query, потрібен
 *  `useSearchParams()`, а він у Next вимагає Suspense і вибиває сторінку зі
 *  статичної генерації. Проєкт тримається на SSG/ISR — підкреслений пункт
 *  того не вартий. Наразі жоден пункт навігації query й не має. */
const isNavItemActive = (href: string, pathname: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

const RECENT_KEY = 'recent-searches';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const calculations = useCartCalculations();
  const { toggle: toggleCartDrawer } = useCartDrawerActions();
  const syncCart = useCartStore((state) => state.syncCart);

  useEffect(() => {
    syncCart();
  }, [syncCart]);

  const saveRecent = (q: string) => {
    const next = [q, ...recentSearches.filter((s) => s !== q)].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  };

  // router.push, а не window.location.href: останнє перезавантажує весь
  // документ (заново шрифти, JS, стан кошика) там, де достатньо клієнтського
  // переходу. Пошук — найчастіша дія в магазині, і саме вона була найповільнішою
  // (4.7 Doherty: відгук має вкладатись у ~400 мс).
  //
  // Пошук іде через стор фільтрів каталогу, а не будує URL з нуля: інакше
  // кожен пошук з хедера стирав категорії й ціну, які людина вже обрала на
  // сторінці каталогу (URL містив би лише `search`, і нічого більше).
  const goToSearch = (query: string) => {
    saveRecent(query);
    const { setFilter, updateUrl } = useCatalogFilters.getState();
    setFilter('search', query);
    updateUrl(router);
    setIsSearchExpanded(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) goToSearch(query);
  };

  const handleSearchFocus = () => {
    try {
      setRecentSearches(JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'));
    } catch {
      setRecentSearches([]);
    }
    setIsSearchExpanded(true);
  };

  const handleSearchClear = () => {
    setSearchQuery('');
    setIsSearchExpanded(false);
  };

  return (
    <Box className={styles.wrapper}>
      <header className={styles.header}>
        {/* Left group: Logo + Nav */}
        <div className={styles.headerLeft}>
          {/* Logo (Left) */}
          {/* inverse — хедер тепер чорний, як верхня панель Дії. Без цього
              ворд-марка малюється --text-primary, тобто чорним по чорному. */}
          <Link href="/" className={styles.logoLink} aria-label="ye-dril — на головну">
            <Logo inverse className={styles.headerLogo} />
          </Link>

          {/* Desktop navigation */}
          <nav className={styles.desktopNav} aria-label="Основна навігація">
            {NAV_ITEMS.map((item) => {
              const active = isNavItemActive(item.href, pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                  aria-current={active ? 'page' : undefined}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right group: Search + Cart + Account */}
        <div className={styles.headerRight}>
          {/* Search pill (desktop) */}
          <button
            type="button"
            className={styles.searchPill}
            onClick={handleSearchFocus}
            aria-label="Відкрити пошук">
            <span className={styles.searchPillText}>Пошук</span>
            <IconSearch className={styles.searchPillIcon} />
          </button>

          {/* Search icon (mobile) */}
          <button
            type="button"
            className={styles.searchTrigger}
            onClick={handleSearchFocus}
            aria-label="Відкрити пошук">
            <IconSearch className={styles.searchPlaceholder} />
          </button>

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

      {/* Expanded Search Bar */}
      {isSearchExpanded && (
        <div className={styles.expandedSearchContainer}>
          <form onSubmit={handleSearch} className={styles.expandedSearchForm}>
            <input
              type="text"
              className={styles.expandedSearchInput}
              placeholder="Пошук товарів…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => {
                if (!searchQuery.trim()) {
                  setIsSearchExpanded(false);
                }
              }}
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.expandedSearchClear}
                onClick={handleSearchClear}
                aria-label="Очистити">
                <IconX />
              </button>
            )}
          </form>
          {recentSearches.length > 0 && !searchQuery && (
            <div className={styles.searchSuggestions}>
              <span className={styles.suggestionsLabel}>Останні запити</span>
              {recentSearches.map((q) => (
                <button
                  key={q}
                  type="button"
                  className={styles.suggestionItem}
                  onMouseDown={() => goToSearch(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Auth Drawer */}
    </Box>
  );
}
