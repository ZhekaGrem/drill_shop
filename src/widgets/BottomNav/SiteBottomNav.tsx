// src/widgets/BottomNav/SiteBottomNav.tsx
// Веб-варіант таб-бара: тільки мобільний, замість бургер-шторки в хедері.
//
// Набір — режими застосунку, а не розділи сайту. «Про нас», «Контакти»,
// «Доставка» тощо переїхали на екран «Меню» (/menu) — так само, як у Дії
// вторинне живе на екрані «Меню», а не в панелі знизу (Miller: у панелі
// стільки пунктів, скільки видно одним поглядом).
'use client';

import { usePathname } from 'next/navigation';
import { IconCart, IconCatalog, IconHome, MenuIcon } from '@/shared/components/Svg';
import { useCartCalculations } from '@/shared/stores/cart';
import { BottomNav, type BottomNavItem } from './BottomNav';
import styles from './BottomNav.module.scss';

// /telegram має власну панель, в /admin нижня навігація магазину не потрібна
const HIDDEN_PREFIXES = ['/admin', '/telegram'];

export function SiteBottomNav() {
  const pathname = usePathname() ?? '';
  const calculations = useCartCalculations();

  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  const items: BottomNavItem[] = [
    { label: 'Головна', href: '/', icon: IconHome },
    { label: 'Каталог', href: '/catalog', icon: IconCatalog },
    { label: 'Кошик', href: '/cart', icon: IconCart, badge: calculations?.itemsCount },
    // «Меню», а не «Кабінет»: за цим табом лежить довідка, доставка й правове,
    // а особистий кабінет — лише перша група всередині. Назва має відповідати
    // вмісту (Nielsen #2) і маршруту /menu, інакше незалогінений очікує вхід,
    // а бачить FAQ. Іконка — бургер, як на табі «Меню» в Дії: силует людини
    // обіцяв профіль, а не меню (та сама евристика відповідності).
    { label: 'Меню', href: '/menu', icon: MenuIcon },
  ];

  return <BottomNav items={items} className={styles.mobileOnly} scope="mobile" ariaLabel="Нижня навігація" />;
}
