// src/app/admin/discounts/AdminDiscounts.tsx
'use client';

import { useState } from 'react';
import { useAdminGuard } from '@/features/auth/hooks/authHooks';
import {
  useAdminDiscounts,
  useCreateDiscount,
  useUpdateDiscount,
  useDeleteDiscount,
  useDiscountStats,
} from '@/features/admin/hooks/discountHooks';
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
  Modal,
  Stack,
  Progress,
  Tooltip,
} from '@mantine/core';

import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconEye,
  IconAlertCircle,
  IconPercentage,
  IconCurrencyHryvnia,
  IconCalendar,
  IconUsers,
  IconChartBar,
} from '@tabler/icons-react';
import { DiscountForm } from '@/features/admin/components/DiscountForm/DiscountForm';
import { DiscountType } from '@/shared/types/generated.types';
import { formatPrice } from '@/shared/utils/format';

export default function AdminDiscounts() {
  const { isAdmin, isManager } = useAdminGuard();
  const [opened, { open, close }] = useDisclosure(false);
  const [statsOpened, { open: openStats, close: closeStats }] = useDisclosure(false);
  const [editingDiscount, setEditingDiscount] = useState<any>(null);
  const [selectedDiscountId, setSelectedDiscountId] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    search: '',
    type: '',
    isActive: '',
    hasCode: '',
    limit: 20,
    offset: 0,
  });

  const { data: discountsData, isLoading, error } = useAdminDiscounts(filters);

  const { data: statsData } = useDiscountStats(selectedDiscountId || '');

  const createMutation = useCreateDiscount();
  const updateMutation = useUpdateDiscount();
  const deleteMutation = useDeleteDiscount();

  if (!isAdmin && !isManager) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
        У вас немає прав для управління знижками
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
        Помилка завантаження знижок: {error.message}
      </Alert>
    );
  }

  const discounts = discountsData?.data || [];
  const meta = discountsData?.meta || discountsData?.pagination;

  const handleCreateDiscount = () => {
    setEditingDiscount(null);
    open();
  };

  const handleEditDiscount = (discount: any) => {
    setEditingDiscount(discount);
    open();
  };

  const handleViewStats = (discountId: string) => {
    setSelectedDiscountId(discountId);
    openStats();
  };

  const handleDeleteDiscount = async (id: string, name: string) => {
    if (confirm(`Ви впевнені, що хочете видалити знижку "${name}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
        notifications.show({
          title: 'Успіх',
          message: `Знижку "${name}" видалено`,
          color: 'green',
        });
      } catch (error: any) {
        notifications.show({
          title: 'Помилка',
          message: error.message || 'Не вдалося видалити знижку',
          color: 'red',
        });
      }
    }
  };

  const handleDiscountSubmit = async (data: any) => {
    try {
      if (editingDiscount) {
        await updateMutation.mutateAsync({ id: editingDiscount.id, data });
        notifications.show({
          title: 'Успіх',
          message: 'Знижку оновлено',
          color: 'green',
        });
      } else {
        await createMutation.mutateAsync(data);
        notifications.show({
          title: 'Успіх',
          message: 'Знижку створено',
          color: 'green',
        });
      }

      close();
      setEditingDiscount(null);
    } catch (error: any) {
      notifications.show({
        title: 'Помилка',
        message: error.message || 'Не вдалося зберегти знижку',
        color: 'red',
      });
    }
  };

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, offset: 0 }));
  };

  const getDiscountTypeIcon = (type: DiscountType) => {
    switch (type) {
      case DiscountType.PERCENTAGE:
        return <IconPercentage size={16} />;
      case DiscountType.FIXED_AMOUNT:
        return <IconCurrencyHryvnia size={16} />;
      default:
        return <IconPercentage size={16} />;
    }
  };

  const getDiscountTypeLabel = (type: DiscountType) => {
    switch (type) {
      case DiscountType.PERCENTAGE:
        return 'Відсоток';
      case DiscountType.FIXED_AMOUNT:
        return 'Фіксована сума';
      default:
        return type;
    }
  };

  const formatDiscountValue = (discount: any) => {
    if (discount.type === DiscountType.PERCENTAGE) {
      return `${discount.value}%`;
    }
    return formatPrice(discount.value);
  };

  const getUsagePercentage = (discount: any) => {
    if (!discount.usageLimit) return null;
    return (discount.usageCount / discount.usageLimit) * 100;
  };

  const isDiscountExpired = (discount: any) => {
    return discount.endsAt && new Date() > new Date(discount.endsAt);
  };

  const isDiscountFuture = (discount: any) => {
    return discount.startsAt && new Date() < new Date(discount.startsAt);
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      {/* Header */}
      <Group justify="space-between" mb="xl">
        <div>
          <Text size="xl" fw={700}>
            Управління знижками
          </Text>
          <Text c="dimmed">Створення та редагування промокодів і автоматичних знижок</Text>
        </div>

        <Button
          leftSection={<IconPlus size={16} />}
          onClick={handleCreateDiscount}
          style={{ background: 'var(--btn-primary)' }}>
          Додати знижку
        </Button>
      </Group>

      {/* Filters */}
      <Card shadow="sm" padding="lg" radius="md" withBorder mb="xl">
        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              placeholder="Пошук за назвою або кодом..."
              leftSection={<IconSearch size={16} />}
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 3 }}>
            <Select
              placeholder="Тип знижки"
              data={[
                { value: '', label: 'Всі типи' },
                { value: DiscountType.PERCENTAGE, label: 'Відсоткові' },
                { value: DiscountType.FIXED_AMOUNT, label: 'Фіксовані' },
              ]}
              value={filters.type}
              onChange={(value) => setFilters((prev) => ({ ...prev, type: value || '', offset: 0 }))}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 3 }}>
            <Select
              placeholder="Статус"
              data={[
                { value: '', label: 'Всі статуси' },
                { value: 'true', label: 'Активні' },
                { value: 'false', label: 'Неактивні' },
              ]}
              value={filters.isActive}
              onChange={(value) => setFilters((prev) => ({ ...prev, isActive: value || '', offset: 0 }))}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 2 }}>
            <Select
              placeholder="Промокод"
              data={[
                { value: '', label: 'Всі' },
                { value: 'true', label: 'З промокодом' },
                { value: 'false', label: 'Автоматичні' },
              ]}
              value={filters.hasCode}
              onChange={(value) => setFilters((prev) => ({ ...prev, hasCode: value || '', offset: 0 }))}
            />
          </Grid.Col>
        </Grid>
      </Card>

      {/* Discounts Table */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text size="lg" fw={600} mb="md">
          Знижки ({meta?.total || 0})
        </Text>

        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Назва</Table.Th>
              <Table.Th>Код</Table.Th>
              <Table.Th>Тип</Table.Th>
              <Table.Th>Значення</Table.Th>
              <Table.Th>Використання</Table.Th>
              <Table.Th>Період</Table.Th>
              <Table.Th>Статус</Table.Th>
              <Table.Th>Дії</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {discounts.map((discount: any) => {
              const usagePercentage = getUsagePercentage(discount);
              const isExpired = isDiscountExpired(discount);
              const isFuture = isDiscountFuture(discount);

              return (
                <Table.Tr key={discount.id}>
                  <Table.Td>
                    <Text size="sm" fw={500}>
                      {discount.name}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    {discount.code ? (
                      <Badge variant="light" color="blue" size="sm">
                        {discount.code}
                      </Badge>
                    ) : (
                      <Text size="xs" c="dimmed">
                        Автоматична
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      {getDiscountTypeIcon(discount.type)}
                      <Text size="sm">{getDiscountTypeLabel(discount.type)}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={600} c="blue">
                      {formatDiscountValue(discount)}
                    </Text>
                    {discount.minOrderAmount && (
                      <Text size="xs" c="dimmed">
                        від {formatPrice(discount.minOrderAmount)}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Stack gap={2}>
                      <Text size="sm">
                        {discount.usageCount} / {discount.usageLimit || '∞'}
                      </Text>
                      {usagePercentage !== null && (
                        <Progress
                          value={usagePercentage}
                          size="xs"
                          color={usagePercentage >= 90 ? 'red' : usagePercentage >= 70 ? 'yellow' : 'blue'}
                        />
                      )}
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Stack gap={2}>
                      {discount.startsAt && (
                        <Text size="xs" c="dimmed">
                          Від: {new Date(discount.startsAt).toLocaleDateString('uk-UA')}
                        </Text>
                      )}
                      {discount.endsAt && (
                        <Text size="xs" c="dimmed">
                          До: {new Date(discount.endsAt).toLocaleDateString('uk-UA')}
                        </Text>
                      )}
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Stack gap={2}>
                      <Badge
                        color={
                          !discount.isActive ? 'gray' : isExpired ? 'red' : isFuture ? 'yellow' : 'green'
                        }
                        variant="light"
                        size="sm">
                        {!discount.isActive
                          ? 'Неактивна'
                          : isExpired
                            ? 'Прострочена'
                            : isFuture
                              ? 'Очікує'
                              : 'Активна'}
                      </Badge>
                      {usagePercentage !== null && usagePercentage >= 100 && (
                        <Badge color="orange" variant="light" size="xs">
                          Вичерпана
                        </Badge>
                      )}
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Tooltip label="Статистика">
                        <ActionIcon
                          size="sm"
                          variant="light"
                          color="blue"
                          onClick={() => handleViewStats(discount.id)}>
                          <IconChartBar size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Редагувати">
                        <ActionIcon
                          size="sm"
                          variant="light"
                          color="orange"
                          onClick={() => handleEditDiscount(discount)}>
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Видалити">
                        <ActionIcon
                          size="sm"
                          variant="light"
                          color="red"
                          onClick={() => handleDeleteDiscount(discount.id, discount.name)}
                          loading={deleteMutation.isPending && deleteMutation.variables === discount.id}
                          disabled={deleteMutation.isPending}>
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>

        {discounts.length === 0 && !isLoading && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Text c="dimmed">Знижки не знайдені</Text>
            <Text c="dimmed" size="sm" mt="xs">
              Створіть першу знижку для початку роботи
            </Text>
          </div>
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

      {/* Discount Form Modal */}
      <Modal
        opened={opened}
        onClose={() => {
          if (!createMutation.isPending && !updateMutation.isPending) {
            close();
            setEditingDiscount(null);
          }
        }}
        title={editingDiscount ? 'Редагування знижки' : 'Нова знижка'}
        size="lg"
        closeOnClickOutside={false}
        closeOnEscape={false}>
        <DiscountForm
          discount={editingDiscount}
          onSubmit={handleDiscountSubmit}
          onCancel={() => {
            if (!createMutation.isPending && !updateMutation.isPending) {
              close();
              setEditingDiscount(null);
            }
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      {/* Stats Modal */}
      <Modal opened={statsOpened} onClose={closeStats} title="Статистика знижки" size="md">
        {statsData ? (
          <Stack gap="md">
            <Card withBorder padding="md">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">
                  Загальне використання
                </Text>
                <Text size="lg" fw={700}>
                  {statsData.data.totalUsage}
                </Text>
              </Group>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">
                  Використання цього місяця
                </Text>
                <Text size="lg" fw={700} c="blue">
                  {statsData.data.usageThisMonth}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Загальна економія клієнтів
                </Text>
                <Text size="lg" fw={700} c="green">
                  {formatPrice(statsData.data.totalSavings)}
                </Text>
              </Group>
            </Card>

            <Group justify="flex-end">
              <Button variant="light" onClick={closeStats}>
                Закрити
              </Button>
            </Group>
          </Stack>
        ) : (
          <Text>Завантаження статистики...</Text>
        )}
      </Modal>
    </div>
  );
}
