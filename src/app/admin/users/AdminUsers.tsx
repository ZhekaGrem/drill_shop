// src/app/admin/users/AdminUsers.tsx - SIMPLE FIX
'use client';

import { useState } from 'react';
import { useAdminGuard } from '@/features/auth/hooks/authHooks';
import { useAdminUsers, useUpdateUserRole, useUpdateUserStatus } from '@/features/admin/hooks/adminHooks';
import {
  Card,
  Text,
  Group,
  Badge,
  LoadingOverlay,
  Alert,
  Table,
  ActionIcon,
  Button,
  TextInput,
  Select,
  Grid,
  Avatar,
  Menu,
  Stack,
  Box,
} from '@mantine/core';
import { IconSearch, IconAlertCircle, IconDotsVertical, IconUserCheck, IconUserX } from '@tabler/icons-react';
import { UserRole } from '@/shared/types/generated.types';

export default function AdminUsers() {
  const { canManageUsers } = useAdminGuard();

  // FIXED: Simple filters only
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    isActive: '',
    limit: 20,
    offset: 0,
  });

  const { data: usersData, isLoading, error } = useAdminUsers(filters);
  const updateRoleMutation = useUpdateUserRole();
  const updateStatusMutation = useUpdateUserStatus();

  if (!canManageUsers) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
        У вас немає прав для управління користувачами
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
        Помилка завантаження користувачів: {error.message}
      </Alert>
    );
  }

  const users = usersData?.data || [];
  const meta = usersData?.meta || usersData?.pagination;

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateRoleMutation.mutateAsync({ id: userId, role: newRole });
    } catch (error) {
      console.error('Role update error:', error);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await updateStatusMutation.mutateAsync({ id: userId, isActive: !currentStatus });
    } catch (error) {
      console.error('Status update error:', error);
    }
  };

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, offset: 0 }));
  };

  const handleRoleFilter = (value: string | null) => {
    setFilters((prev) => ({ ...prev, role: value || '', offset: 0 }));
  };

  const handleStatusFilter = (value: string | null) => {
    setFilters((prev) => ({ ...prev, isActive: value || '', offset: 0 }));
  };

  return (
    <Box p="xl">
      {/* Header */}
      <Group justify="space-between" mb="xl">
        <div>
          <Text size="xl" fw={700}>
            Управління користувачами
          </Text>
          <Text c="dimmed">Керування ролями та доступом</Text>
        </div>

        <Badge color="blue" variant="light">
          Всього: {meta?.total || 0}
        </Badge>
      </Group>

      {/* FIXED: Simple filters */}
      <Card shadow="sm" padding="lg" radius="md" withBorder mb="xl">
        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              placeholder="Пошук за ім'ям або email..."
              leftSection={<IconSearch size={16} />}
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Select
              placeholder="Роль"
              data={[
                { value: '', label: 'Всі ролі' },
                { value: UserRole.CUSTOMER, label: 'Клієнт' },
                { value: UserRole.MANAGER, label: 'Менеджер' },
                { value: UserRole.ADMIN, label: 'Адміністратор' },
                { value: UserRole.SUPER_ADMIN, label: 'Супер адмін' },
              ]}
              value={filters.role}
              onChange={handleRoleFilter}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Select
              placeholder="Статус"
              data={[
                { value: '', label: 'Всі статуси' },
                { value: 'true', label: 'Активні' },
                { value: 'false', label: 'Заблоковані' },
              ]}
              value={filters.isActive}
              onChange={handleStatusFilter}
            />
          </Grid.Col>
        </Grid>
      </Card>

      {/* Users Table */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text size="lg" fw={600} mb="md">
          Користувачі ({meta?.total || 0})
        </Text>

        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Користувач</Table.Th>
              <Table.Th>Email/TG</Table.Th>
              <Table.Th>Телефон</Table.Th>
              <Table.Th>Роль</Table.Th>
              <Table.Th>Статус</Table.Th>
              <Table.Th>Замовлень</Table.Th>
              <Table.Th>Дії</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.map((user: any) => (
              <Table.Tr key={user.id}>
                <Table.Td>
                  <Group gap="sm">
                    <Avatar size="sm" color="blue">
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </Avatar>
                    <div>
                      <Text size="sm" fw={500}>
                        {user.firstName} {user.lastName}
                      </Text>
                      <Text size="xs" c="dimmed">
                        ID: {user.id.slice(0, 8)}...
                      </Text>
                    </div>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{user.email || (user.telegramId ? `TG: ${user.telegramId}` : '-')}</Text>
                  {user.isVerified && (
                    <Badge color="green" size="xs" variant="light">
                      Підтверджено
                    </Badge>
                  )}
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{user.phone || '-'}</Text>
                </Table.Td>
                <Table.Td>
                  <Select
                    size="xs"
                    value={user.role}
                    onChange={(value) => handleRoleChange(user.id, value!)}
                    data={[
                      { value: UserRole.CUSTOMER, label: 'Клієнт' },
                      { value: UserRole.MANAGER, label: 'Менеджер' },
                      { value: UserRole.ADMIN, label: 'Адміністратор' },
                    ]}
                    disabled={user.role === UserRole.SUPER_ADMIN}
                  />
                </Table.Td>
                <Table.Td>
                  <Badge color={user.isActive ? 'green' : 'red'} variant="light">
                    {user.isActive ? 'Активний' : 'Заблокований'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Stack gap={2}>
                    <Text size="sm">{user.statistics?.totalOrders || 0}</Text>
                    <Text size="xs" c="dimmed">
                      ₴{user.statistics?.totalSpent || 0}
                    </Text>
                  </Stack>
                </Table.Td>
                <Table.Td>
                  <Menu position="bottom-end">
                    <Menu.Target>
                      <ActionIcon variant="subtle">
                        <IconDotsVertical size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={user.isActive ? <IconUserX size={16} /> : <IconUserCheck size={16} />}
                        onClick={() => handleStatusToggle(user.id, user.isActive)}
                        color={user.isActive ? 'red' : 'green'}>
                        {user.isActive ? 'Заблокувати' : 'Активувати'}
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {users.length === 0 && !isLoading && (
          <Box p={32} style={{ textAlign: 'center' }}>
            <Text c="dimmed">Користувачі не знайдені</Text>
            <Text c="dimmed" size="sm" mt="xs">
              Спробуйте змінити фільтри пошуку
            </Text>
          </Box>
        )}

        {/* Simple Pagination */}
        {meta && meta.total > meta.limit && (
          <Group justify="center" mt="md">
            <Button
              variant="light"
              disabled={meta.offset === 0}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  offset: Math.max(0, prev.offset - prev.limit),
                }))
              }>
              Попередня
            </Button>
            <Text size="sm">
              {meta.offset + 1} - {Math.min(meta.offset + meta.limit, meta.total)} з {meta.total}
            </Text>
            <Button
              variant="light"
              disabled={meta.offset + meta.limit >= meta.total}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  offset: prev.offset + prev.limit,
                }))
              }>
              Наступна
            </Button>
          </Group>
        )}
      </Card>
    </Box>
  );
}
