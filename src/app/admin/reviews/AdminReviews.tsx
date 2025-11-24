// src/app/admin/reviews/AdminReviews.tsx
'use client';

import { useState } from 'react';
import { useAdminGuard } from '@/features/auth/hooks/authHooks';
import {
  useAdminReviews,
  useReviewStats,
  useDeleteReview,
  useBulkDeleteReviews,
} from '@/features/admin/hooks/reviewHooks';
import {
  Grid,
  Card,
  Text,
  Group,
  Badge,
  LoadingOverlay,
  Alert,
  TextInput,
  Select,
  Button,
  Stack,
  Modal,
  Checkbox,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconSearch, IconAlertCircle, IconStar, IconTrash, IconMessage } from '@tabler/icons-react';
import { ReviewCard } from '@/features/admin/components/ReviewCard/ReviewCard';
import { EmptyState } from '@/shared/components/EmptyState';

export default function AdminReviews() {
  const { isAdmin, isManager } = useAdminGuard();
  const [opened, { open, close }] = useDisclosure(false);
  const [viewingReview, setViewingReview] = useState<any>(null);
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);

  const [filters, setFilters] = useState({
    search: '',
    rating: '',
    limit: 20,
    offset: 0,
  });

  const { data: reviewsData, isLoading, error } = useAdminReviews(filters);
  const { data: statsData } = useReviewStats();

  const deleteMutation = useDeleteReview();
  const bulkDeleteMutation = useBulkDeleteReviews();

  if (!isAdmin && !isManager) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
        У вас немає прав для управління відгуками
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
        Помилка завантаження відгуків: {error.message}
      </Alert>
    );
  }

  const reviews = reviewsData?.data || [];
  const meta = reviewsData?.meta || reviewsData?.pagination;
  const stats = statsData?.data;

  const handleDeleteReview = async (id: string) => {
    if (confirm('Ви впевнені, що хочете видалити цей відгук?')) {
      try {
        await deleteMutation.mutateAsync(id);
        notifications.show({
          title: 'Успіх',
          message: 'Відгук видалено',
          color: 'green',
        });
      } catch (error: any) {
        notifications.show({
          title: 'Помилка',
          message: error.message || 'Не вдалося видалити відгук',
          color: 'red',
        });
      }
    }
  };

  const handleViewReview = (review: any) => {
    setViewingReview(review);
    open();
  };

  const handleBulkDelete = async () => {
    if (selectedReviews.length === 0) return;

    if (confirm(`Ви впевнені, що хочете видалити ${selectedReviews.length} відгуків?`)) {
      try {
        await bulkDeleteMutation.mutateAsync(selectedReviews);
        setSelectedReviews([]);
        notifications.show({
          title: 'Успіх',
          message: `Видалено ${selectedReviews.length} відгуків`,
          color: 'green',
        });
      } catch (error: any) {
        notifications.show({
          title: 'Помилка',
          message: error.message || 'Не вдалося видалити відгуки',
          color: 'red',
        });
      }
    }
  };

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, offset: 0 }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      {/* Header */}
      <Group justify="space-between" mb="xl">
        <div>
          <Text size="xl" fw={700}>
            Управління відгуками
          </Text>
          <Text c="dimmed">Перегляд та видалення відгуків користувачів</Text>
        </div>

        {selectedReviews.length > 0 && (
          <Group>
            <Button
              leftSection={<IconTrash size={16} />}
              onClick={handleBulkDelete}
              loading={bulkDeleteMutation.isPending}
              color="red">
              Видалити вибрані ({selectedReviews.length})
            </Button>
            <Button variant="light" onClick={() => setSelectedReviews([])}>
              Скасувати вибір
            </Button>
          </Group>
        )}
      </Group>

      {/* Stats Cards */}
      {/* {stats && (
        <Grid mb="xl">
          <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Всього відгуків
              </Text>
              <Text size="xl" fw={700}>
                {stats.total || 0}
              </Text>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Середній рейтинг
              </Text>
              <Text size="xl" fw={700} c="blue">
                {stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'} ⭐
              </Text>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Цього місяця
              </Text>
              <Text size="xl" fw={700} c="green">
                {stats.thisMonth || 0}
              </Text>
            </Card>
          </Grid.Col>
        </Grid>
      )} */}

      {/* Filters */}
      {/* <Card shadow="sm" padding="lg" radius="md" withBorder mb="xl">
        <Grid>
          <Grid.Col span={{ base: 12, md: 5 }}>
            <TextInput
              placeholder="Пошук відгуків..."
              leftSection={<IconSearch size={16} />}
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Select
              placeholder="Рейтинг"
              data={[
                { value: '', label: 'Всі рейтинги' },
                { value: '5', label: '5 зірок' },
                { value: '4', label: '4 зірки' },
                { value: '3', label: '3 зірки' },
                { value: '2', label: '2 зірки' },
                { value: '1', label: '1 зірка' }
              ]}
              value={filters.rating}
              onChange={(value) => setFilters(prev => ({ ...prev, rating: value || '', offset: 0 }))}
            />
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Button 
              variant="light" 
              onClick={() => setFilters({
                search: '',
                rating: '',
                limit: 20,
                offset: 0
              })}
              fullWidth
            >
              Очистити
            </Button>
          </Grid.Col>
        </Grid>
      </Card> */}

      {/* Reviews List */}
      <Stack gap="md">
        {reviews.map((review: any) => (
          <div key={review.id} style={{ position: 'relative' }}>
            <Checkbox
              checked={selectedReviews.includes(review.id)}
              onChange={(event) => {
                if (event.currentTarget.checked) {
                  setSelectedReviews((prev) => [...prev, review.id]);
                } else {
                  setSelectedReviews((prev) => prev.filter((id) => id !== review.id));
                }
              }}
              style={{
                position: 'absolute',
                top: 10,
                left: 10,
                zIndex: 1,
              }}
            />
            <div style={{ paddingLeft: '2rem' }}>
              <ReviewCard
                review={review}
                onDelete={handleDeleteReview}
                onView={handleViewReview}
                isLoading={deleteMutation.isPending}
              />
            </div>
          </div>
        ))}

        {reviews.length === 0 && !isLoading && (
          <EmptyState
            icon={IconMessage}
            iconSize={70}
            title="Відгуки не знайдені"
            description="Спробуйте змінити фільтри пошуку або почекайте, поки користувачі залишать відгуки"
            minHeight={250}
          />
        )}
      </Stack>

      {/* Simple Pagination */}
      {meta && meta.total > meta.limit && (
        <Card shadow="sm" padding="md" radius="md" withBorder mt="md">
          <Group justify="center">
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
        </Card>
      )}

      {/* View Review Modal */}
      <Modal opened={opened} onClose={close} title="Деталі відгуку" size="lg">
        {viewingReview && (
          <Stack gap="md">
            <Group justify="space-between">
              <div>
                <Text fw={600}>{viewingReview.author?.name || 'Анонім'}</Text>
                <Text size="sm" c="dimmed">
                  {formatDate(viewingReview.createdAt)}
                </Text>
              </div>
              <Badge
                color={viewingReview.rating >= 4 ? 'green' : viewingReview.rating >= 3 ? 'yellow' : 'red'}
                variant="light">
                <Group gap={4}>
                  <IconStar size={12} />
                  {viewingReview.rating}
                </Group>
              </Badge>
            </Group>

            {viewingReview.product && (
              <div>
                <Text size="sm" c="dimmed">
                  Товар:
                </Text>
                <Text fw={500}>{viewingReview.product.name}</Text>
              </div>
            )}

            {viewingReview.title && (
              <div>
                <Text size="sm" c="dimmed">
                  Заголовок:
                </Text>
                <Text fw={500}>{viewingReview.title}</Text>
              </div>
            )}

            {viewingReview.content && (
              <div>
                <Text size="sm" c="dimmed">
                  Відгук:
                </Text>
                <Text>{viewingReview.content}</Text>
              </div>
            )}

            {/* <Group>
              {viewingReview.author?.isVerified && (
                <Badge color="blue" variant="light">
                  Верифікований покупець
                </Badge>
              )}
              
              <Badge color="gray" variant="light">
                👍 {viewingReview.helpfulCount || 0}
              </Badge>
            </Group> */}

            <Group justify="flex-end" mt="xl">
              <Button variant="light" onClick={close}>
                Закрити
              </Button>
              <Button
                color="red"
                onClick={() => {
                  close();
                  handleDeleteReview(viewingReview.id);
                }}>
                Видалити
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </div>
  );
}
