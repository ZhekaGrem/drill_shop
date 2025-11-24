// src/shared/components/AdminPagination/AdminPagination.tsx
import { Group, Text, Select } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { Button } from '@/shared/components/Button/Button';
interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  showLimitSelector?: boolean;
  loading?: boolean;
}

export const AdminPagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onLimitChange,
  showLimitSelector = true,
  loading = false,
}: AdminPaginationProps) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page
    if (startPage > 1) {
      pages.push(
        <Button
          key={1}
          variant={1 === currentPage ? 'ghost' : 'primary'}
          onClick={() => onPageChange(1)}
          size="sm">
          1
        </Button>
      );

      if (startPage > 2) {
        pages.push(
          <Text key="dots1" size="sm">
            ...
          </Text>
        );
      }
    }

    // Visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? 'ghost' : 'primary'}
          onClick={() => onPageChange(i)}
          size="sm">
          {i}
        </Button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <Text key="dots2" size="sm">
            ...
          </Text>
        );
      }

      pages.push(
        <Button
          key={totalPages}
          variant={totalPages === currentPage ? 'ghost' : 'primary'}
          onClick={() => onPageChange(totalPages)}
          size="sm">
          {totalPages}
        </Button>
      );
    }

    return pages;
  };

  if (totalItems === 0) return null;

  return (
    <Group justify="space-between" mt="lg" wrap="wrap">
      {/* Items info */}
      <Text size="sm" c="dimmed">
        Показано {startItem}-{endItem} з {totalItems} записів
      </Text>

      {/* Page controls */}
      <Group gap="xs">
        {/* Previous button */}
        <Button
          leftSection={<IconChevronLeft size={16} />}
          onClick={handlePrevious}
          disabled={currentPage <= 1 || loading}
          size="sm">
          Попередня
        </Button>

        {/* Page numbers */}
        {totalPages > 1 && <Group gap="xs">{renderPageNumbers()}</Group>}

        {/* Next button */}
        <Button
          rightSection={<IconChevronRight size={16} />}
          onClick={handleNext}
          disabled={currentPage >= totalPages || loading}
          size="sm">
          Наступна
        </Button>
      </Group>

      {/* Limit selector */}
      {showLimitSelector && onLimitChange && (
        <Group gap="xs" align="center">
          <Text size="sm" c="dimmed">
            Показувати по:
          </Text>
          <Select
            value={itemsPerPage.toString()}
            onChange={(value) => onLimitChange(Number(value) || 20)}
            data={[
              { value: '10', label: '10' },
              { value: '20', label: '20' },
              { value: '50', label: '50' },
              { value: '100', label: '100' },
            ]}
            size="sm"
            w={70}
          />
          <Text size="sm" c="dimmed">
            записів
          </Text>
        </Group>
      )}
    </Group>
  );
};
