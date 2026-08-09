// src/shared/components/ServicesGroup/ServicesGroup.tsx
// Доставка / оплата / повернення однією групою. Живе в shared, бо потрібне
// і на головній, і на сторінці товару — інакше словник іконок і розмітка
// існували б двома копіями, які розʼїдуться на першій же правці.
import type { ReactNode } from 'react';
import { IconArrowBackUp, IconCashBanknote, IconCreditCard, IconTruck } from '@tabler/icons-react';
import { ListGroup, ListRow } from '@/shared/components/ListGroup/ListGroup';
import { content } from '@/shared/config/content';

// Іконка привʼязана до id послуги, а не до порядку в масиві:
// перестановка в content.ts інакше мовчки переплутала б іконки.
const SERVICE_ICONS: Record<string, ReactNode> = {
  delivery: <IconTruck stroke={1.5} />,
  card: <IconCreditCard stroke={1.5} />,
  cod: <IconCashBanknote stroke={1.5} />,
  returns: <IconArrowBackUp stroke={1.5} />,
};

export const ServicesGroup = () => (
  <ListGroup>
    {content.services.map((service) => (
      <ListRow
        key={service.id}
        href={service.href}
        media={SERVICE_ICONS[service.id]}
        title={service.title}
        hint={service.hint}
      />
    ))}
  </ListGroup>
);
