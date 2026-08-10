'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { IconCart, IconCatalog, IconInfo, IconUser } from '@/shared/components/Svg';
import { useTelegram } from '@/shared/providers/TelegramProvider';
import { useCartCalculations, useCartStore } from '@/shared/stores/cart';
import { triggerHapticFeedback } from '@/shared/utils/telegram';
import { BottomNav, type BottomNavItem } from '@/widgets/BottomNav';

// Геометрія, стани, бейдж і safe-area живуть у спільному BottomNav — тут
// лишається тільки те, що властиве саме Telegram: перевірка середовища,
// синхронізація кошика при вході й haptic feedback на тап.
//
// Іконки беремо з @/shared/components/Svg, як і веб-панель. Раніше тут стояли
// @tabler/icons-react (у т.ч. IconBong як «Про нас» — випадкова іконка з
// чернетки): дві панелі на спільній основі малювали той самий кошик двома
// різними наборами (Nielsen #4, design-system drift).
export function TelegramBottomNav() {
  const { isTelegramEnv } = useTelegram();
  const pathname = usePathname();
  const calculations = useCartCalculations();
  const syncCart = useCartStore((state) => state.syncCart);

  useEffect(() => {
    if (isTelegramEnv) {
      syncCart();
    }
  }, [isTelegramEnv, syncCart]);

  if (!isTelegramEnv) return null;
  if (pathname?.startsWith('/admin')) return null;

  const items: BottomNavItem[] = [
    { label: 'Про нас', href: '/telegram/about', icon: IconInfo },
    { label: 'Каталог', href: '/telegram/catalog', icon: IconCatalog },
    {
      label: 'Кошик',
      href: '/telegram/cart',
      icon: IconCart,
      badge: calculations?.itemsCount,
    },
    { label: 'Профіль', href: '/telegram/profile', icon: IconUser },
  ];

  return (
    <BottomNav
      items={items}
      ariaLabel="Нижня навігація"
      onNavigate={() => {
        void triggerHapticFeedback('impact', 'light');
      }}
    />
  );
}
