// src/app/admin/categories/AdminCategories.tsx - WITH CRUD API CALLS
'use client';

import { useState, useEffect } from 'react';
import { useAdminGuard } from '@/features/auth/hooks/authHooks';
import {
  Card,
  Text,
  Group,
  Button,
  LoadingOverlay,
  Alert,
  Table,
  ActionIcon,
  Modal,
  Badge,
  Container,
  Box,
  Center,
} from '@mantine/core';

import { useDisclosure } from '@mantine/hooks';
import { showNotification } from '@/shared/utils/notifications';
import { IconPlus, IconEdit, IconTrash, IconAlertCircle } from '@tabler/icons-react';
import { useCategoriesStore } from '@/shared/stores/categories';
import { CategoryForm } from '@/features/admin/components/CategoryForm/CategoryForm';

interface Category {
  id: string;
  name: string;
  slug: string;
  depth?: number;
}

interface CategoryFormData {
  name: string;
  slug: string;
  parentId?: string | null;
}

export default function AdminCategories() {
  const { isAdmin, isManager } = useAdminGuard();
  const [opened, { open, close }] = useDisclosure(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    categories,
    isLoading,
    error,
    fetchCategories,
    flattenCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    isInitialized,
  } = useCategoriesStore();

  useEffect(() => {
    if (!isInitialized) {
      fetchCategories();
    }
  }, [isInitialized, fetchCategories]);

  if (!isAdmin && !isManager) {
    return (
      <Center p="2rem">
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
          У вас немає прав для управління категоріями
        </Alert>
      </Center>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
        Помилка завантаження категорій: {error}
      </Alert>
    );
  }

  const handleCreateCategory = () => {
    setEditingCategory(null);
    open();
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    open();
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (confirm(`Ви впевнені, що хочете видалити категорію "${name}"?`)) {
      try {
        await deleteCategory(id);
        showNotification({
          title: 'Успіх',
          message: `Категорію "${name}" видалено`,
          color: 'green',
        });
      } catch (error) {
        showNotification({
          title: 'Помилка',
          message: error instanceof Error ? error.message : 'Не вдалося видалити категорію',
          color: 'red',
        });
      }
    }
  };

  const handleCategorySubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);

    try {
      let result;
      if (editingCategory) {
        result = await updateCategory(editingCategory.id, data);
        showNotification({
          title: 'Успіх',
          message: 'Категорію оновлено',
          color: 'green',
        });
      } else {
        result = await createCategory(data);
        showNotification({
          title: 'Успіх',
          message: 'Категорію створено',
          color: 'green',
        });
      }

      close();
      setEditingCategory(null);
      return result; // Повертаємо результат для CategoryForm
    } catch (error) {
      showNotification({
        title: 'Помилка',
        message: error instanceof Error ? error.message : 'Не вдалося зберегти категорію',
        color: 'red',
      });
      throw error; // Пробрасываем ошибку
    } finally {
      setIsSubmitting(false);
    }
  };

  const flatCategories = flattenCategories();

  return (
    <Container size="xl" p="1.5rem">
      {/* Header */}
      <Group justify="space-between" mb="xl">
        <Box>
          <Text size="xl" fw={700}>
            Управління категоріями
          </Text>
          <Text c="dimmed">Створення та редагування категорій товарів</Text>
        </Box>

        <Button leftSection={<IconPlus size={16} />} onClick={handleCreateCategory}>
          Додати категорію
        </Button>
      </Group>

      {/* Categories Table */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Text size="lg" fw={600}>
            Категорії ({flatCategories.length})
          </Text>
          <Button variant="light" size="xs" onClick={() => fetchCategories()} loading={isLoading}>
            Оновити
          </Button>
        </Group>

        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Назва</Table.Th>
              <Table.Th>Slug</Table.Th>
              <Table.Th>Статус</Table.Th>
              <Table.Th>Дії</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {flatCategories.map((category: Category) => (
              <Table.Tr key={category.id}>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    {'  '.repeat(category.depth || 0)}
                    {category.name}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {category.slug}
                  </Text>
                </Table.Td>

                <Table.Td>
                  <Badge color="green" variant="light">
                    Активна
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      size="sm"
                      variant="light"
                      color="orange"
                      onClick={() => handleEditCategory(category)}
                      title="Редагувати">
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      size="sm"
                      variant="light"
                      color="red"
                      onClick={() => handleDeleteCategory(category.id, category.name)}
                      title="Видалити">
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {flatCategories.length === 0 && !isLoading && (
          <Center p="2rem">
            <Box>
              <Text c="dimmed">Категорії не знайдені</Text>
              <Text c="dimmed" size="sm" mt="xs">
                Додайте першу категорію для початку роботи
              </Text>
            </Box>
          </Center>
        )}
      </Card>

      {/* Category Form Modal */}
      <Modal
        opened={opened}
        onClose={() => {
          if (!isSubmitting) {
            close();
            setEditingCategory(null);
          }
        }}
        title={editingCategory ? 'Редагування категорії' : 'Нова категорія'}
        size="lg"
        closeOnClickOutside={!isSubmitting}
        closeOnEscape={!isSubmitting}>
        <CategoryForm
          category={editingCategory}
          categories={categories}
          onSubmit={handleCategorySubmit}
          onCancel={() => {
            if (!isSubmitting) {
              close();
              setEditingCategory(null);
            }
          }}
          isLoading={isSubmitting}
        />
      </Modal>
    </Container>
  );
}
