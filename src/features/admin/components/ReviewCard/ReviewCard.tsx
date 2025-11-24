// src/features/admin/components/ReviewCard/ReviewCard.tsx
import { Card, Group, Text, Badge, Stack, ActionIcon, Avatar } from '@mantine/core';
import { IconStar, IconEye, IconTrash } from '@tabler/icons-react';

interface ReviewCardProps {
  review: any;
  onDelete: (id: string) => void;
  onView: (review: any) => void;
  isLoading?: boolean;
}

export function ReviewCard({ review, onDelete, onView, isLoading }: ReviewCardProps) {
  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'green';
    if (rating >= 3) return 'yellow';
    return 'red';
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
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="xs">
        <Group gap="sm">
          <Avatar size="sm" color="blue">
            {review.author?.name?.[0] || '?'}
          </Avatar>
          <div>
            <Text fw={500} size="sm">
              {review.author?.name || 'Анонім'}
            </Text>
            <Text size="xs" c="dimmed">
              {formatDate(review.createdAt)}
            </Text>
          </div>
        </Group>

        <Badge color={getRatingColor(review.rating)} variant="light">
          <Group gap={4}>
            <IconStar size={12} />
            {review.rating}
          </Group>
        </Badge>
      </Group>

      <Stack gap="xs" my="md">
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Товар:
          </Text>
          <Text size="sm" fw={500} style={{ maxWidth: '60%', textAlign: 'right' }}>
            {review.product?.name || 'Товар видалено'}
          </Text>
        </Group>

        {review.title && (
          <Group justify="space-between" align="flex-start">
            <Text size="sm" c="dimmed">
              Заголовок:
            </Text>
            <Text size="sm" fw={500} style={{ maxWidth: '60%', textAlign: 'right' }}>
              {review.title}
            </Text>
          </Group>
        )}

        {review.content && (
          <div>
            <Text size="sm" c="dimmed" mb="xs">
              Відгук:
            </Text>
            <Text size="sm" lineClamp={3}>
              {review.content}
            </Text>
          </div>
        )}

        {/* <Group justify="space-between">
          <Text size="sm" c="dimmed">Корисність:</Text>
          <Text size="sm">👍 {review.helpfulCount || 0}</Text>
        </Group> */}

        {review.author?.isVerified && (
          <Badge color="blue" variant="light" size="sm">
            Верифікований покупець
          </Badge>
        )}
      </Stack>

      <Group gap="xs">
        <ActionIcon size="sm" variant="light" color="blue" onClick={() => onView(review)} title="Переглянути">
          <IconEye size={16} />
        </ActionIcon>

        <ActionIcon
          size="sm"
          variant="light"
          color="red"
          onClick={() => onDelete(review.id)}
          title="Видалити">
          <IconTrash size={16} />
        </ActionIcon>
      </Group>
    </Card>
  );
}
