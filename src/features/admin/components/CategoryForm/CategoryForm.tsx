// src/features/admin/components/CategoryForm/CategoryForm.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  TextInput,
  Textarea,
  Select,
  Switch,
  Button,
  Group,
  Stack,
  Alert,
  FileInput,
  Image,
  Text,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconUpload, IconX } from '@tabler/icons-react';
import { CategoryFormProps, CategoryFormData } from '@/shared/types/admin.types';
import { generateSlug } from '@/shared/utils/generation-slug';
import { apiClient } from '@/shared/api/client';

export const CategoryForm = ({ category, categories, onSubmit, onCancel, isLoading }: CategoryFormProps) => {
  const [sizeGuideFile, setSizeGuideFile] = useState<File | null>(null);
  const [sizeGuidePreview, setSizeGuidePreview] = useState<string | null>(category?.sizeGuideImage || null);
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState<string | null>(category?.image || null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<CategoryFormData>({
    initialValues: {
      name: category?.name || '',
      slug: category?.slug || '',
      description: category?.description || '',
      parentId: category?.parentId || '',
      isActive: category?.isActive ?? true,
      metaTitle: category?.metaTitle || '',
      metaDescription: category?.metaDescription || '',
      sizeGuideImage: category?.sizeGuideImage || null,
      sizeGuideText: category?.sizeGuideText || '',
    },
    validate: {
      name: (value) => (!value?.trim() ? "Назва категорії обов'язкова" : null),
      slug: (value) => {
        if (value && !/^[a-z0-9-]*$/.test(value)) {
          return 'Slug може містити лише англійські літери в нижньому регістрі, цифри та дефіс';
        }
        return null;
      },
    },
  });

  // Auto-generate slug from name
  useEffect(() => {
    if (form.values.name && !category) {
      const slug = generateSlug(form.values.name);
      form.setFieldValue('slug', slug);
    }
  }, [form.values.name, category]);

  // Flatten categories for parent selection
  const flattenCategories = (
    cats: any[],
    depth = 0,
    exclude?: string
  ): Array<{ value: string; label: string }> => {
    const result: Array<{ value: string; label: string }> = [];

    for (const cat of cats) {
      // Don't include the category being edited as a potential parent
      if (exclude && cat.id === exclude) continue;

      result.push({
        value: cat.id,
        label: '  '.repeat(depth) + cat.name,
      });

      if (cat.children && cat.children.length > 0) {
        result.push(...flattenCategories(cat.children, depth + 1, exclude));
      }
    }

    return result;
  };

  const parentOptions = [
    { value: '', label: 'Без батьківської категорії' },
    ...flattenCategories(categories, 0, category?.id),
  ];

  const handleSubmit = async (values: CategoryFormData) => {
    try {
      setIsUploading(true);

      const cleanedData = {
        name: values.name.trim(),
        slug: values.slug.trim() || generateSlug(values.name),
        description: values.description.trim(),
        parentId: values.parentId || null,
        isActive: values.isActive,
        metaTitle: values.metaTitle.trim() || null,
        metaDescription: values.metaDescription.trim() || null,
        sizeGuideImage: values.sizeGuideImage || null,
        sizeGuideText: values.sizeGuideText?.trim() || null,
        promoType: values.promoType || undefined,
        promoConfig: values.promoConfig || undefined,
        promoEndsAt: values.promoEndsAt instanceof Date ? values.promoEndsAt.toISOString() : undefined,
      };

      // Спочатку зберігаємо категорію і отримуємо її ID
      const result = await onSubmit(cleanedData);

      // Отримуємо ID категорії (для нової - з response, для існуючої - з props)
      const categoryId = category?.id || (result as any)?.id;

      if (!categoryId) {
        console.error('Category ID not found after save');
        return;
      }

      // Якщо є новий файл основного зображення - завантажуємо його
      if (categoryImageFile) {
        const formData = new FormData();
        formData.append('image', categoryImageFile);

        await apiClient.post(`/admin/categories/${categoryId}/image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      // Якщо є новий файл size guide - завантажуємо його
      if (sizeGuideFile) {
        const formData = new FormData();
        formData.append('sizeGuideImage', sizeGuideFile);
        if (values.sizeGuideText) {
          formData.append('sizeGuideText', values.sizeGuideText);
        }

        await apiClient.post(`/admin/categories/${categoryId}/size-guide`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      throw error; // Пробрасываем ошибку дальше
    } finally {
      setIsUploading(false);
    }
  };

  const handleSizeGuideFileChange = (file: File | null) => {
    if (file) {
      // Перевірка розміру файлу (5MB = 5 * 1024 * 1024 bytes)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(
          `Файл занадто великий! Максимальний розмір: 5 МБ. Розмір вибраного файлу: ${(file.size / 1024 / 1024).toFixed(2)} МБ`
        );
        return;
      }

      setSizeGuideFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSizeGuidePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSizeGuideFile(null);
    }
  };

  const removeSizeGuide = () => {
    setSizeGuideFile(null);
    setSizeGuidePreview(null);
    form.setFieldValue('sizeGuideImage', null);
  };

  const handleCategoryImageChange = (file: File | null) => {
    if (file) {
      // Перевірка розміру файлу (5MB = 5 * 1024 * 1024 bytes)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(
          `Файл занадто великий! Максимальний розмір: 5 МБ. Розмір вибраного файлу: ${(file.size / 1024 / 1024).toFixed(2)} МБ`
        );
        return;
      }

      setCategoryImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCategoryImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setCategoryImageFile(null);
    }
  };

  const removeCategoryImage = () => {
    setCategoryImageFile(null);
    setCategoryImagePreview(null);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
      <Stack gap="md">
        <TextInput
          label="Назва категорії"
          placeholder="Введіть назву категорії"
          required
          {...form.getInputProps('name')}
        />

        <TextInput label="Slug (URL)" placeholder="url-friendly-name" {...form.getInputProps('slug')} />

        <Textarea label="Опис" placeholder="Опис категорії" rows={3} {...form.getInputProps('description')} />

        <Select
          label="Батьківська категорія"
          placeholder="Оберіть батьківську категорію"
          data={parentOptions}
          value={form.values.parentId}
          onChange={(value) => form.setFieldValue('parentId', value || '')}
          clearable
        />

        {/* Category Main Image */}
        <div style={{ marginTop: '16px', padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
          <Text size="sm" fw={600} mb="md">
            Головне зображення категорії
          </Text>

          <FileInput
            label="Зображення категорії"
            placeholder="Оберіть зображення"
            description="Максимальний розмір файлу: 5 МБ. Підтримувані формати: PNG, JPEG, JPG, WEBP"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            leftSection={<IconUpload size={16} />}
            onChange={handleCategoryImageChange}
            clearable
          />

          {categoryImagePreview && (
            <div style={{ position: 'relative', marginTop: '12px' }}>
              <Image
                src={categoryImagePreview}
                alt="Category image preview"
                height={150}
                fit="contain"
                radius="md"
              />
              <Button
                size="xs"
                color="red"
                variant="filled"
                leftSection={<IconX size={14} />}
                onClick={removeCategoryImage}
                style={{ position: 'absolute', top: 8, right: 8 }}>
                Видалити
              </Button>
            </div>
          )}
        </div>

        <TextInput label="Meta Title" placeholder="SEO заголовок" {...form.getInputProps('metaTitle')} />

        <Textarea
          label="Meta Description"
          placeholder="SEO опис"
          rows={2}
          {...form.getInputProps('metaDescription')}
        />

        {/* Size Guide Section */}
        <div style={{ marginTop: '16px', padding: '16px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
          <Text size="sm" fw={600} mb="md">
            Таблиця розмірів (Size Guide)
          </Text>

          <FileInput
            label="Зображення таблиці розмірів"
            placeholder="Оберіть зображення"
            description="Максимальний розмір файлу: 5 МБ. Підтримувані формати: PNG, JPEG, JPG, WEBP"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            leftSection={<IconUpload size={16} />}
            onChange={handleSizeGuideFileChange}
            clearable
          />

          {sizeGuidePreview && (
            <div style={{ position: 'relative', marginTop: '12px' }}>
              <Image src={sizeGuidePreview} alt="Size guide preview" height={200} fit="contain" radius="md" />
              <Button
                size="xs"
                color="red"
                variant="filled"
                leftSection={<IconX size={14} />}
                onClick={removeSizeGuide}
                style={{ position: 'absolute', top: 8, right: 8 }}>
                Видалити
              </Button>
            </div>
          )}

          <Textarea
            label="Текстовий опис таблиці розмірів"
            placeholder="Додатковий опис таблиці розмірів (опціонально)"
            rows={3}
            mt="md"
            {...form.getInputProps('sizeGuideText')}
          />
        </div>

        <Switch label="Активна категорія" {...form.getInputProps('isActive', { type: 'checkbox' })} />

        {/* Validation Errors */}
        {Object.keys(form.errors).length > 0 && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
            Виправте помилки у формі
          </Alert>
        )}

        {/* Actions */}
        <Group justify="flex-end" mt="xl">
          <Button variant="subtle" onClick={onCancel} disabled={isLoading || isUploading}>
            Скасувати
          </Button>
          <Button
            type="submit"
            loading={isLoading || isUploading}
            style={{ background: 'var(--btn-primary)', color: 'var(--text-white)' }}>
            {category ? 'Оновити категорію' : 'Створити категорію'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
