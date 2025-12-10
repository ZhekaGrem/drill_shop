// src/shared/components/Pagination/Pagination.tsx
import React from 'react';
import { Pagination as MantinePagination, Group } from '@mantine/core';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Компонент пагінації, що використовує Mantine Pagination.
 * Відображається тільки якщо сторінок більше однієї.
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  // Не відображати компонент, якщо сторінка лише одна або менше
  if (totalPages <= 1) {
    return null;
  }

  return (
    <Group justify="center" mt="xl" className={className}>
      <MantinePagination
        total={totalPages}
        value={currentPage}
        onChange={onPageChange}
        withEdges // Показувати кнопки "на початок" і "в кінець"
        boundaries={1} // Кількість сторінок по краях
        color="red" // Використовуємо основний колір з теми
      />
    </Group>
  );
};
