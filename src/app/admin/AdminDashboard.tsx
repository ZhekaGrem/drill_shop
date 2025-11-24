// src/app/admin/AdminDashboard.tsx - FIXED IMPORTS AND FUNCTIONS
'use client';

import { useState } from 'react';
import {
  Grid,
  Card,
  Text,
  Group,
  Stack,
  Badge,
  Progress,
  LoadingOverlay,
  Alert,
  Table,
  Button,
  Container,
  Box,
} from '@mantine/core';

import {
  IconTrendingUp,
  IconShoppingCart,
  IconUsers,
  IconPackage,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useAdminDashboard } from '@/features/admin/hooks/adminHooks';
import { formatPrice } from '@/shared/utils/format';

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
}

interface LowStockProduct {
  id: string;
  name: string;
  currentStock: number;
  reorderLevel: number;
}

interface RecentCustomer {
  id: string;
  name: string;
  email: string;
  totalOrders: number;
}

// FIXED: Add missing helper functions
function getStatusColor(status: string) {
  switch (status) {
    case 'PENDING':
      return 'yellow';
    case 'CONFIRMED':
      return 'blue';
    case 'PROCESSING':
      return 'cyan';
    case 'SHIPPED':
      return 'orange';
    case 'DELIVERED':
      return 'green';
    case 'CANCELLED':
      return 'red';
    default:
      return 'gray';
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'PENDING':
      return 'Очікує';
    case 'CONFIRMED':
      return 'Підтверджено';
    case 'PROCESSING':
      return 'Обробка';
    case 'SHIPPED':
      return 'Відправлено';
    case 'DELIVERED':
      return 'Доставлено';
    case 'CANCELLED':
      return 'Скасовано';
    default:
      return status;
  }
}

export default function AdminDashboard() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');

  const { data: dashboardData, isLoading, error } = useAdminDashboard({ period });

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
        Помилка завантаження даних: {error.message}
      </Alert>
    );
  }

  const stats = dashboardData?.data?.overview;
  const recentActivity = dashboardData?.data?.recentActivity;

  return (
    <Container size="xl" p="1.5rem">
      {/* Header */}
      <Group justify="space-between" mb="xl">
        <Box>
          <Text size="xl" fw={700}>
            Панель адміністратора
          </Text>
          <Text c="dimmed">Огляд системи</Text>
        </Box>

        <Group>
          {(['today', 'week', 'month'] as const).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'filled' : 'outline'}
              size="xs"
              onClick={() => setPeriod(p)}>
              {p === 'today' ? 'Сьогодні' : p === 'week' ? 'Тиждень' : 'Місяць'}
            </Button>
          ))}
        </Group>
      </Group>

      {/* Stats Cards */}
      <Grid mb="xl">
        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Загальний дохід"
            value={stats ? formatPrice(stats.totalRevenue) : 'Завантаження...'}
            icon={<IconTrendingUp size={24} />}
            color="green"
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Замовлення"
            value={stats ? stats.totalOrders.toString() : 'Завантаження...'}
            icon={<IconShoppingCart size={24} />}
            color="blue"
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Клієнти"
            value={stats ? stats.totalCustomers.toString() : 'Завантаження...'}
            icon={<IconUsers size={24} />}
            color="violet"
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Товари"
            value={stats ? stats.totalProducts.toString() : 'Завантаження...'}
            icon={<IconPackage size={24} />}
            color="orange"
          />
        </Grid.Col>
      </Grid>

      {/* Recent Activity */}
      <Grid>
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text size="lg" fw={600} mb="md">
              Останні замовлення
            </Text>

            {recentActivity?.recentOrders ? (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Номер</Table.Th>
                    <Table.Th>Клієнт</Table.Th>
                    <Table.Th>Сума</Table.Th>
                    <Table.Th>Статус</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {recentActivity.recentOrders.map((order: RecentOrder) => (
                    <Table.Tr key={order.id}>
                      <Table.Td>{order.orderNumber}</Table.Td>
                      <Table.Td>{order.customerName}</Table.Td>
                      <Table.Td>{formatPrice(order.totalAmount)}</Table.Td>
                      <Table.Td>
                        <Badge color={getStatusColor(order.status)} variant="light">
                          {getStatusLabel(order.status)}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            ) : (
              <Alert color="blue" variant="light">
                Немає даних про останні замовлення
              </Alert>
            )}
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text size="lg" fw={600} mb="md">
                Мало на складі
              </Text>

              {recentActivity?.lowStockProducts ? (
                <Stack gap="xs">
                  {recentActivity.lowStockProducts.map((product: LowStockProduct) => (
                    <Box key={product.id}>
                      <Group justify="space-between">
                        <Text size="sm">{product.name}</Text>
                        <Badge color="red" size="xs">
                          {product.currentStock} шт
                        </Badge>
                      </Group>
                      <Progress
                        value={(product.currentStock / product.reorderLevel) * 100}
                        size="xs"
                        color="red"
                      />
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Alert color="blue" variant="light">
                  Немає товарів з низьким запасом
                </Alert>
              )}
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text size="lg" fw={600} mb="md">
                Нові клієнти
              </Text>

              {recentActivity?.recentCustomers ? (
                <Stack gap="xs">
                  {recentActivity.recentCustomers.map((customer: RecentCustomer) => (
                    <Group key={customer.id} justify="space-between">
                      <Box>
                        <Text size="sm" fw={500}>
                          {customer.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {customer.email}
                        </Text>
                      </Box>
                      <Badge variant="light" size="xs">
                        {customer.totalOrders} зам.
                      </Badge>
                    </Group>
                  ))}
                </Stack>
              ) : (
                <Alert color="blue" variant="light">
                  Немає нових клієнтів
                </Alert>
              )}
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

// Helper component for stat cards
interface StatCardProps {
  title: string;
  value: string;
  growth?: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, growth, icon, color }: StatCardProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between">
        <Box>
          <Text size="xs" tt="uppercase" fw={700} c="dimmed">
            {title}
          </Text>
          <Text size="xl" fw={700}>
            {value}
          </Text>
          {growth !== undefined && (
            <Text size="xs" c={growth >= 0 ? 'green' : 'red'}>
              {growth >= 0 ? '+' : ''}
              {growth.toFixed(1)}%
            </Text>
          )}
        </Box>
        <Box c={color}>{icon}</Box>
      </Group>
    </Card>
  );
}
