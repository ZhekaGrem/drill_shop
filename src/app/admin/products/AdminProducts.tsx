// src/app/admin/products/AdminProducts.tsx - FIXED VARIANTS LOADING

'use client';

import { useState } from 'react';
import { useAdminGuard } from '@/features/auth/hooks/authHooks';
import {
  useAdminProducts,
  useAdminProduct,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '@/features/admin/hooks/adminHooks';
import {
  Grid,
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
  Modal,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconSearch, IconEdit, IconTrash, IconEye, IconAlertCircle } from '@tabler/icons-react';
import { formatPrice } from '@/shared/utils/format';
import { ProductForm } from '@/features/admin/components/ProductForm/ProductForm';
import { AdminPagination } from '@/shared/components/AdminPagination/AdminPagination';
import { notifications } from '@mantine/notifications';
// FIXED: Wrapper component to fetch full product data for editing
const ProductFormWrapper = ({ editingProduct, onSubmit, onCancel, isLoading }: any) => {
  const shouldFetchFullData = editingProduct && editingProduct.needsFullData;
  const { data: fullProductData, isLoading: isLoadingFullData } = useAdminProduct(
    shouldFetchFullData ? editingProduct.id : ''
  );

  const productToUse = shouldFetchFullData ? fullProductData?.data || editingProduct : editingProduct;

  if (shouldFetchFullData && isLoadingFullData) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <Text>Завантаження даних товару...</Text>
      </div>
    );
  }

  return <ProductForm product={productToUse} onSubmit={onSubmit} onCancel={onCancel} isLoading={isLoading} />;
};

export default function AdminProducts() {
  const { isAdmin, isManager } = useAdminGuard();
  const [opened, { open, close }] = useDisclosure(false);
  const [viewOpened, { open: openView, close: closeView }] = useDisclosure(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [viewingProduct, setViewingProduct] = useState<any>(null);

  const [filters, setFilters] = useState({
    search: '',
    limit: 20,
    offset: 0,
  });

  const { data: productsData, isLoading, error } = useAdminProducts(filters);

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  if (!isAdmin && !isManager) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
          У вас немає прав для управління товарами
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
        Помилка завантаження товарів: {error.message}
      </Alert>
    );
  }

  const products = productsData?.data || [];
  const meta = productsData?.meta || productsData?.pagination;
  const currentPage = Math.floor(filters.offset / filters.limit) + 1;
  const totalPages = meta ? Math.ceil(meta.total / filters.limit) : 1;
  const totalItems = meta?.total || 0;

  const handlePageChange = (page: number) => {
    const newOffset = (page - 1) * filters.limit;
    setFilters((prev) => ({ ...prev, offset: newOffset }));
  };

  const handleLimitChange = (newLimit: number) => {
    setFilters((prev) => ({
      ...prev,
      limit: newLimit,
      offset: 0,
    }));
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    open();
  };

  // FIXED: Enhanced product fetching for editing with full variant data
  const handleEditProduct = (product: any) => {
    // For editing, we need to fetch full product data with variants from the backend
    setEditingProduct({ ...product, needsFullData: true });
    open();
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Ви впевнені, що хочете видалити товар "${name}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Delete error:', error);
        alert('Помилка при видаленні товару');
      }
    }
  };

  // FIXED: Handle product submission with proper variants structure
  const handleProductSubmit = async ({ data, files }: { data: any; files?: File[] }) => {
    try {
      console.log('📦 Product submission data (before cleaning):', data);

      // Clean variants data properly
      const submissionData = {
        ...data,
        variants:
          data.variants && data.variants.length > 0
            ? data.variants
                .map((variant: any) => ({
                  ...(variant.id && { id: variant.id }),
                  sku: variant.sku?.trim(),
                  name: variant.name?.trim() || null,
                  price: Number(variant.price) || 0,
                  costPrice: variant.costPrice ? Number(variant.costPrice) : null,
                  unitValue: variant.unitValue ? Number(variant.unitValue) : null,
                  quantity: Number(variant.quantity) || 0,
                  options: variant.options || {},
                  promoType: variant.promoType || null,
                  promoConfig: variant.promoType && variant.promoConfig ? variant.promoConfig : null,
                  promoEndsAt: variant.promoEndsAt || null,
                }))
                .filter((v: any) => v.sku && v.price > 0)
            : undefined,

        // Include deleted variant IDs for updates
        deletedVariantIds: data.deletedVariantIds || [],
      };

      console.log('✅ Cleaned submission data (with variants promotions):', submissionData);
      console.log('🎯 Variants with promotions:', submissionData.variants);

      if (editingProduct) {
        await updateMutation.mutateAsync({
          id: editingProduct.id,
          data: submissionData,
          files,
        });
        notifications.show({
          title: 'Успіх',
          message: 'Товар успішно створено',
          color: 'green',
        });
      } else {
        await createMutation.mutateAsync({ data: submissionData, files });
      }

      close();
      setEditingProduct(null);
    } catch (error: any) {
      let errorTitle = 'Помилка';
      let errorMessage = 'Помилка при збереженні товару';

      if (error.response?.status === 409) {
        // Конфлікт - товар вже існує
        errorMessage = error.response?.data?.message || 'Товар з таким артикулом вже існує';
      } else if (error.response?.status === 400) {
        // Помилка валідації
        const errors = error.response?.data?.errors;
        if (errors && Array.isArray(errors)) {
          errorMessage = `Помилка валідації:\n${errors.join('\n')}`;
        } else {
          errorMessage = error.response?.data?.message || 'Помилка валідації даних';
        }
      } else if (error.response?.data?.message) {
        // Інша помилка з повідомленням від сервера
        errorMessage = error.response.data.message;
      } else if (error.message) {
        // Помилка з message
        errorMessage = error.message;
      }

      notifications.show({
        title: errorTitle,
        message: errorMessage,
        color: 'red',
        autoClose: 5000,
      });
    }
  };

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, offset: 0 }));
  };

  const handleViewProduct = (product: any) => {
    setViewingProduct(product);
    openView();
  };

  return (
    <div
      style={{
        padding: '1.5rem',
        minHeight: '100vh',
      }}>
      {/* Header */}
      <Group justify="space-between" mb="xl">
        <div>
          <Text size="xl" fw={700}>
            Управління товарами
          </Text>
          <Text c="dimmed">Додавання, редагування та видалення товарів</Text>
        </div>

        <Button
          leftSection={<IconPlus size={16} />}
          onClick={handleCreateProduct}
          style={{ background: 'var(--btn-primary)' }}>
          Додати товар
        </Button>
      </Group>

      {/* Simple search only */}
      <Card shadow="sm" padding="lg" radius="md" withBorder mb="xl">
        <TextInput
          placeholder="Пошук товарів..."
          leftSection={<IconSearch size={16} />}
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          style={{ maxWidth: 400 }}
        />
      </Card>

      {/* Products Table */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text size="lg" fw={600} mb="md">
          Товари ({meta?.total || 0})
        </Text>

        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Артикул</Table.Th>
              <Table.Th>Назва</Table.Th>
              <Table.Th>Ціна</Table.Th>
              <Table.Th>Наявність</Table.Th>
              <Table.Th>Статус</Table.Th>
              <Table.Th>Дії</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {products.map((product: any, index: number) => (
              <Table.Tr key={product.id}>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    {index + 1}. {product.sku}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{product.name}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{formatPrice(product.price)}</Text>
                </Table.Td>
                {/* <Table.Td>
                  
                  {product.variants && product.variants.length > 0 ? (
                    <Badge variant="light" color="blue">
                      {product.variants.length + 1} варіантів
                    </Badge>
                  ) : (
                    <Text size="xs" c="dimmed">
                      1 варіант
                    </Text>
                  )}
                </Table.Td> */}
                <Table.Td>
                  <Badge color={product.isInStock ? 'green' : 'red'} variant="light">
                    {product.isInStock ? 'В наявності' : 'Немає'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge color={product.isActive ? 'green' : 'red'} variant="light">
                    {product.isActive ? 'Активний' : 'Неактивний'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      size="sm"
                      variant="light"
                      color="blue"
                      onClick={() => handleViewProduct(product)}>
                      <IconEye size={16} />
                    </ActionIcon>
                    <ActionIcon
                      size="sm"
                      variant="light"
                      color="orange"
                      onClick={() => handleEditProduct(product)}>
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      size="sm"
                      variant="light"
                      color="red"
                      onClick={() => handleDeleteProduct(product.id, product.name)}
                      loading={deleteMutation.isPending && deleteMutation.variables === product.id}
                      disabled={deleteMutation.isPending}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {products.length === 0 && !isLoading && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Text c="dimmed">Товари не знайдені</Text>
            <Text c="dimmed" size="sm" mt="xs">
              Спробуйте змінити фільтри або додайте новий товар
            </Text>
          </div>
        )}

        {/* Simple Pagination */}
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={filters.limit}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          loading={isLoading}
        />
      </Card>

      {/* Product Form Modal */}
      <Modal
        opened={opened}
        onClose={() => {
          close();
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Редагування товару' : 'Новий товар'}
        size="70%"
        closeOnClickOutside={false}
        closeOnEscape={false}
        zIndex={1000}>
        <ProductFormWrapper
          editingProduct={editingProduct}
          onSubmit={handleProductSubmit}
          onCancel={() => {
            close();
            setEditingProduct(null);
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      {/* Product View Modal - ENHANCED with variants display */}
      <Modal
        opened={viewOpened}
        onClose={() => {
          closeView();
          setViewingProduct(null);
        }}
        title="Деталі товару"
        size="xl"
        zIndex={1000}>
        {viewingProduct && (
          <div style={{ padding: '1rem' }}>
            <Grid>
              <Grid.Col span={12}>
                <Text size="xl" fw={700} mb="md">
                  {viewingProduct.name}
                </Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">
                  Артикул:
                </Text>
                <Text fw={500}>{viewingProduct.sku}</Text>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">
                  Ціна:
                </Text>
                <Text fw={500} c="blue" size="lg">
                  {formatPrice(viewingProduct.price)}
                </Text>
              </Grid.Col>

              {/* ENHANCED: Better variants display in view modal */}
              {/* {viewingProduct.variants && viewingProduct.variants.length > 0 && (
                <Grid.Col span={12}>
                  <Text size="sm" c="dimmed" mb="xs">
                    Варіанти ({viewingProduct.variants.length}):
                  </Text>
                  <div style={{ marginTop: '8px' }}>
                    {viewingProduct.variants.map((variant: any, index: number) => (
                      <div
                        key={variant.id || index}
                        style={{
                          padding: '12px',
                          border: '1px solid #e5e5e5',
                          borderRadius: '6px',
                          marginBottom: '8px',
                          backgroundColor: '#f9f9f9',
                        }}>
                        <Group justify="space-between" align="flex-start">
                          <div>
                            <Text size="sm" fw={600} mb="xs">
                              {variant.name || `Варіант ${index + 1}`}
                            </Text>
                            <Text size="xs" c="dimmed" mb="xs">
                              Артикул: {variant.sku}
                            </Text>
                            {variant.options && Object.keys(variant.options).length > 0 && (
                              <div>
                                <Text size="xs" c="dimmed">Характеристики:</Text>
                                {Object.entries(variant.options).map(([key, value]) => (
                                  <Text key={key} size="xs" c="dimmed">
                                    {key}: {String(value)}
                                  </Text>
                                ))}
                              </div>
                            )}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <Text size="sm" fw={600} c="blue">
                              {formatPrice(variant.price)}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {variant.quantity || 0} шт
                            </Text>
                            {variant.unitValue && (
                              <Text size="xs" c="dimmed">
                                {variant.unitValue} кг
                              </Text>
                            )}
                          </div>
                        </Group>
                      </div>
                    ))}
                  </div>
                </Grid.Col>
              )} */}

              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">
                  Наявність:
                </Text>
                <Badge color={viewingProduct.isInStock ? 'green' : 'red'} variant="light">
                  {viewingProduct.isInStock ? 'В наявності' : 'Немає'}
                </Badge>
              </Grid.Col>

              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">
                  Кількість:
                </Text>
                <Text fw={500}>{viewingProduct.quantity || 0} шт</Text>
              </Grid.Col>

              {viewingProduct.description && (
                <Grid.Col span={12}>
                  <Text size="sm" c="dimmed">
                    Опис:
                  </Text>
                  <Text>{viewingProduct.description}</Text>
                </Grid.Col>
              )}

              <Grid.Col span={12}>
                <Text size="sm" c="dimmed">
                  Дата створення:
                </Text>
                <Text fw={500}>{new Date(viewingProduct.createdAt).toLocaleDateString('uk-UA')}</Text>
              </Grid.Col>
            </Grid>

            <Group justify="flex-end" mt="xl">
              <Button
                variant="light"
                onClick={() => {
                  closeView();
                  setViewingProduct(null);
                }}>
                Закрити
              </Button>
              <Button
                onClick={() => {
                  closeView();
                  setViewingProduct(null);
                  handleEditProduct(viewingProduct);
                }}>
                Редагувати
              </Button>
            </Group>
          </div>
        )}
      </Modal>
    </div>
  );
}
