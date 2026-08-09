// src/app/profile/UserProfile.tsx
'use client';

import { useState } from 'react';
import { IconHeart, IconLogout, IconPackage, IconUser } from '@tabler/icons-react';
import { useAuthStore } from '@/shared/stores/auth';
import UserData from '@/features/profile/components/UserData/UserData';
import UserOrders from '@/features/profile/components/UserOrders/UserOrders';
import UserFavorites from '@/features/profile/components/UserFavorites/UserFavorites';
import { Page } from '@/shared/components/Page/Page';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { ListGroup, ListRow } from '@/shared/components/ListGroup/ListGroup';
import styles from './profile.module.scss';

type ProfilePage = 'data' | 'orders' | 'favorites';

const MENU: { page: ProfilePage; label: string; hint: string; icon: React.ReactNode }[] = [
  { page: 'data', label: 'Профіль', hint: 'Особисті дані та пароль', icon: <IconUser stroke={1.5} /> },
  {
    page: 'orders',
    label: 'Мої замовлення',
    hint: 'Історія та статуси',
    icon: <IconPackage stroke={1.5} />,
  },
  {
    page: 'favorites',
    label: 'Обрані товари',
    hint: 'Збережене на потім',
    icon: <IconHeart stroke={1.5} />,
  },
];

const UserProfile = () => {
  const [activePage, setActivePage] = useState<ProfilePage>('data');
  const { logout } = useAuthStore();

  const renderContent = () => {
    switch (activePage) {
      case 'orders':
        return <UserOrders />;
      case 'favorites':
        return <UserFavorites />;
      default:
        return <UserData />;
    }
  };

  const activeLabel = MENU.find((item) => item.page === activePage)?.label ?? 'Профіль';

  return (
    <Page>
      <PageHeader title="Кабінет" description="Дані, замовлення та збережені товари в одному місці." />

      <div className={styles.grid}>
        {/* Навігація групою-карткою, як «Меню» в Дії. Раніше цей список був
            оголошений у компоненті, але не рендерився взагалі — сторінка
            показувала лише вкладку «Профіль» без жодного способу перемкнутись. */}
        <nav className={styles.sidebar} aria-label="Розділи кабінету">
          <ListGroup>
            {MENU.map((item) => (
              <ListRow
                key={item.page}
                onClick={() => setActivePage(item.page)}
                media={item.icon}
                title={item.label}
                hint={item.hint}
                arrow={false}
                className={activePage === item.page ? styles.navRowActive : undefined}
              />
            ))}
          </ListGroup>

          <ListGroup className={styles.logoutGroup}>
            <ListRow onClick={logout} media={<IconLogout stroke={1.5} />} title="Вийти" arrow={false} />
          </ListGroup>
        </nav>

        <section className={styles.content} aria-label={activeLabel}>
          {renderContent()}
        </section>
      </div>
    </Page>
  );
};

export default UserProfile;
