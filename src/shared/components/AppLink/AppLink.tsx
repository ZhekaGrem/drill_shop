// src/shared/components/AppLink/AppLink.tsx
// next/link + напрямок переходу. Тип переходу автоматично не визначається:
// браузер не знає, чи посилання веде «вглиб» застосунку, чи повертає назад.
// Напрямок кодує сенс — вперед екран заїжджає справа, назад їде вправо.
import type { ComponentProps } from 'react';
import Link from 'next/link';

type AppLinkProps = Omit<ComponentProps<typeof Link>, 'children'> & {
  children: React.ReactNode;
  /** back — для повернень: хлібні крихти, кнопки «до каталогу» */
  direction?: 'forward' | 'back';
};

export const AppLink = ({ direction = 'forward', ...props }: AppLinkProps) => (
  <Link {...props} transitionTypes={[direction === 'back' ? 'nav-back' : 'nav-forward']} />
);
