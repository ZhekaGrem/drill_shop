// src/pages/User/UserProfile/UserProfile.tsx
'use client';

import { useState } from 'react';
import { Container, Grid, Paper, NavLink } from '@mantine/core';
import { IconUser, IconShoppingBag, IconHeart, IconLogout } from '@tabler/icons-react';
import { useAuthStore } from '@/shared/stores/auth';
import UserData from '@/features/profile/components/UserData/UserData';
import UserOrders from '@/features/profile/components/UserOrders/UserOrders';
import UserFavorites from '@/features/profile/components/UserFavorites/UserFavorites';
// import UserAddresses from '../UserAddresses/UserAddresses';

const UserProfile = () => {
  const [activePage, setActivePage] = useState('data');
  const { logout } = useAuthStore();

  const menuItems = [
    { icon: IconUser, label: 'Мої дані', page: 'data' },
    { icon: IconShoppingBag, label: 'Мої замовлення', page: 'orders' },
    { icon: IconHeart, label: 'Обрані товари', page: 'favorites' },
  ];

  const renderContent = () => {
    switch (activePage) {
      case 'data':
        return <UserData />;
      case 'orders':
        return <UserOrders />;
      case 'favorites':
        return <UserFavorites />;
      default:
        return <UserData />;
    }
  };

  return (
    <Container size="lg" py="xl">
      <Grid>
        <Grid.Col span={{ base: 12, md: 9 }}>
          <Paper withBorder radius="md" p="xl">
            {renderContent()}
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default UserProfile;
