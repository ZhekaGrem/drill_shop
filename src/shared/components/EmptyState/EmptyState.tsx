// src/shared/components/EmptyState/EmptyState.tsx
'use client';

import { ReactNode } from 'react';
import { Center, Stack, Title, Text, Group } from '@mantine/core';
import type { TablerIcon } from '@tabler/icons-react';

export interface EmptyStateProps {
  /** Іконка для відображення (Tabler Icon component) */
  icon: TablerIcon;
  /** Розмір іконки в пікселях */
  iconSize?: number;
  /** Колір іконки */
  iconColor?: string;
  /** Заголовок */
  title: string;
  /** Опис (опціональний) */
  description?: string;
  /** Primary дія (кнопка) */
  primaryAction?: ReactNode;
  /** Secondary дія (кнопка) */
  secondaryAction?: ReactNode;
  /** Висота контейнера */
  minHeight?: number | string;
  /** Максимальна ширина контенту */
  maxWidth?: number;
}

export const EmptyState = ({
  icon: Icon,
  iconSize = 80,
  iconColor = 'var(--mantine-color-gray-5)',
  title,
  description,
  primaryAction,
  secondaryAction,
  minHeight = 300,
  maxWidth = 400,
}: EmptyStateProps) => {
  return (
    <Center py="xl" style={{ minHeight }}>
      <Stack align="center" gap="xl" maw={maxWidth}>
        <Icon size={iconSize} color={iconColor} stroke={1.5} />

        <Stack align="center" gap="sm">
          <Title order={2} ta="center" c="dimmed">
            {title}
          </Title>
          {description && (
            <Text ta="center" c="dimmed">
              {description}
            </Text>
          )}
        </Stack>

        {(primaryAction || secondaryAction) && (
          <Group gap="sm" justify="center">
            {secondaryAction}
            {primaryAction}
          </Group>
        )}
      </Stack>
    </Center>
  );
};
