// src/features/admin/components/ProductForm/ProductForm.tsx - DECOMPOSED
'use client';

import { useState, useEffect } from 'react';
import { Stack, Group, Button, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import { ProductFormData, ProductFormProps } from '@/shared/types/admin.types';
import { ProductStatus, ProductUnit } from '@/shared/types/generated.types';
import { generateSlug } from '@/shared/utils/generation-slug';
import { validateVariants } from '@/shared/utils/variant-validation';

// Import decomposed components
import { ProductBasicInfo } from './ProductBasicInfo';
import { ProductPricingInventory } from './ProductPricingInventory';
import { ProductCategorySelector } from './ProductCategorySelector';
import { ProductImageManager } from './ProductImageManager';
import { ProductPromotion } from './ProductPromotion';
import { ProductVariants } from './ProductVariants';
import { ProductSettings } from './ProductSettings';
import { ProductOptions } from './ProductOptions';

export const ProductForm = ({ product, onSubmit, onCancel, isLoading }: ProductFormProps) => {
  // Extract category IDs helper
  const extractCategoryIds = (productCategories: any[]): string[] => {
    if (!productCategories || !Array.isArray(productCategories)) return [];

    return productCategories
      .map((pc) => {
        if (typeof pc === 'string') return pc;
        if (pc.categoryId) return pc.categoryId;
        if (pc.category?.id) return pc.category.id;
        if (pc.id) return pc.id;
        return pc;
      })
      .filter(Boolean);
  };

  // Main form setup
  const form = useForm<ProductFormData>({
    initialValues: {
      sku: product?.sku || '',
      name: product?.name || '',
      slug: product?.slug || '',
      description: product?.description || '',
      shortDescription: product?.shortDescription || '',
      price: product?.price || 0,
      comparePrice: product?.comparePrice || undefined,
      costPrice: product?.costPrice || undefined,
      unitValue: product?.unitValue || undefined,
      quantity: product?.quantity || 0,
      unit: product?.unit || 'PIECE',
      isActive: product?.isActive !== false,
      isFeatured: Boolean(product?.isFeatured),
      hasVariants: Boolean(product?.hasVariants),
      categoryIds: extractCategoryIds(product?.categories || []),
      options: product?.options || {},
      promoType: product?.promoType || null,
      promoConfig: product?.promoConfig || null,
      promoEndsAt: product?.promoEndsAt ? new Date(product.promoEndsAt) : null,
    },
    validate: {
      sku: (value) => {
        if (!value?.trim()) return "Артикул обов'язковий";
        if (!/^[a-zA-Z0-9_-]*$/.test(value)) {
          return 'Артикул може містити лише англійські літери, цифри, - та _';
        }
        return null;
      },
      name: (value) => (!value?.trim() ? "Назва обов'язкова" : null),
      slug: (value) => {
        if (value && !/^[a-z0-9-]*$/.test(value)) {
          return 'Slug може містити лише англійські літери в нижньому регістрі, цифри та дефіс';
        }
        return null;
      },
      price: (value) => (value <= 0 ? 'Ціна повинна бути більше 0' : null),
      quantity: (value) => (value < 0 ? 'Кількість не може бути негативною' : null),
    },
  });

  // Image management state
  const [imageState, setImageState] = useState({
    newFiles: [] as File[],
    primaryImageIndex: 0,
    secondaryImageIndex: null as number | null,
    existingImages: product?.images || [],
    existingPrimaryId: product?.images?.find((img: any) => img.isPrimary)?.id || null,
    existingSecondaryId: product?.images?.find((img: any) => img.isSecondary)?.id || null,
  });

  // Variants management state
  const [variants, setVariants] = useState<any[]>(() => {
    if (product?.variants && Array.isArray(product.variants)) {
      return product.variants.map((v: any) => ({
        id: v.id,
        sku: v.sku || '',
        name: v.name || '',
        price: Number(v.price) || 0,
        costPrice: v.costPrice ? Number(v.costPrice) : undefined,
        unitValue: v.unitValue ? Number(v.unitValue) : undefined,
        quantity: v.quantity || 0,
        options: v.options || {},
        promoType: v.promoType || null,
        promoConfig: v.promoConfig || null,
        promoEndsAt: v.promoEndsAt ? new Date(v.promoEndsAt) : null,
      }));
    }
    return [];
  });

  // Reset form when product changes
  useEffect(() => {
    if (product?.id) {
      form.setValues({
        sku: product.sku || '',
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        price: product.price || 0,
        comparePrice: product.comparePrice || undefined,
        costPrice: product.costPrice || undefined,
        unitValue: product.unitValue || undefined,
        quantity: product.quantity || 0,
        unit: product.unit || 'PIECE',
        isActive: product.isActive !== false,
        isFeatured: Boolean(product.isFeatured),
        hasVariants: Boolean(product.hasVariants),
        categoryIds: extractCategoryIds(product.categories || []),
        options: product.options || {},
        promoType: product.promoType || null,
        promoConfig: product.promoConfig || null,
        promoEndsAt: product.promoEndsAt ? new Date(product.promoEndsAt) : null,
      });
    }
  }, [product?.id, product?.hasVariants, product?.isFeatured, product?.isActive]);

  // Auto-generate slug from name
  useEffect(() => {
    form.setFieldValue('slug', form.values.sku);
  }, [form.values.sku]);

  const handleSubmit = async (values: ProductFormData) => {
    try {
      // Main product validation
      if (!values.sku?.trim()) {
        alert("Артикул основного товару обов'язковий");
        return;
      }

      if (!values.name?.trim()) {
        alert("Назва товару обов'язкова");
        return;
      }

      if (values.price <= 0) {
        alert('Ціна повинна бути більше 0');
        return;
      }

      // Images validation - мінімум 2 фото
      const totalImages = imageState.existingImages.length + imageState.newFiles.length;
      if (totalImages < 2) {
        alert('Товар повинен мати мінімум 2 фото (головне та друге для hover)');
        return;
      }

      // Promo validation
      if (values.promoType && !values.promoConfig) {
        alert("Налаштування акції обов'язкові при виборі типу акції");
        return;
      }

      // Variants validation - delegate to ProductVariants component
      if (variants.length > 0) {
        const variantErrors = validateVariants(variants, values.sku);
        if (variantErrors.length > 0) {
          alert(`Помилки у варіантах:\n${variantErrors.join('\n')}`);
          return;
        }
      }

      // Prepare submission data
      const cleanedData = {
        sku: values.sku.trim(),
        name: values.name.trim(),
        slug: values.slug?.trim() || generateSlug(values.name),
        description: values.description?.trim() || '',
        shortDescription: values.shortDescription?.trim() || '',
        price: Number(values.price),
        comparePrice: values.comparePrice ? Number(values.comparePrice) : undefined,
        costPrice: values.costPrice ? Number(values.costPrice) : undefined,
        unitValue: values.unitValue ? Number(values.unitValue) : undefined,
        quantity: Number(values.quantity),
        unit: values.unit as ProductUnit,
        status: ProductStatus.ACTIVE,
        isActive: values.isActive,
        isFeatured: values.isFeatured,
        hasVariants: values.hasVariants,
        metaTitle: `${values.name.trim()} | М'ясний магазин`,
        metaDescription: values.shortDescription?.trim() || values.description?.trim().substring(0, 160),
        categoryIds: values.categoryIds,
        primaryImageIndex: imageState.primaryImageIndex,
        options: values.options || {},
        promoType: values.promoType || undefined,
        promoConfig: values.promoType && values.promoConfig ? values.promoConfig : undefined,
        promoEndsAt:
          values.promoType && values.promoEndsAt instanceof Date
            ? values.promoEndsAt.toISOString()
            : undefined,
        variants:
          variants.length > 0
            ? variants
                .map((v, index) => ({
                  ...(v.id && { id: v.id }),
                  sku: v.sku.trim(),
                  name: v.name?.trim() || null,
                  price: Number(v.price),
                  costPrice: v.costPrice ? Number(v.costPrice) : null,
                  unitValue: v.unitValue ? Number(v.unitValue) : null,
                  quantity: Number(v.quantity) || 0,
                  options: v.options || {},
                  promoType: v.promoType || null,
                  promoConfig: v.promoType && v.promoConfig ? v.promoConfig : null,
                  promoEndsAt:
                    v.promoType && v.promoEndsAt instanceof Date ? v.promoEndsAt.toISOString() : null,
                  sortOrder: index,
                  isActive: true,
                }))
                .filter((v) => v.sku && v.price > 0)
            : undefined,
        deletedVariantIds:
          product?.variants
            ?.filter((originalVariant: any) => !variants.some((v) => v.id === originalVariant.id))
            .map((v: any) => v.id) || [],
      };

      await onSubmit({
        data: cleanedData,
        files: imageState.newFiles.length > 0 ? imageState.newFiles : undefined,
      });

      // Reset form state
      setImageState((prev) => ({ ...prev, newFiles: [], primaryImageIndex: 0, secondaryImageIndex: null }));
      setVariants([]);
    } catch (error) {
      console.error('❌ Form submission error:', error);
      alert(`Помилка збереження: ${error instanceof Error ? error.message : 'Невідома помилка'}`);
    }
  };

  // Validation helper for variants

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        {/* Basic Information */}
        <ProductBasicInfo form={form} />

        {/* Pricing and Inventory */}
        <ProductPricingInventory form={form} />

        {/* Categories */}
        <ProductCategorySelector form={form} />

        {/* Images */}
        <ProductImageManager
          form={form}
          product={product}
          imageState={imageState}
          onImageStateChange={setImageState}
        />

        {/* Promotions */}
        <ProductPromotion form={form} />
        <ProductOptions form={form} />

        {/* Variants */}
        <ProductVariants form={form} variants={variants} onVariantsChange={setVariants} />

        {/* Settings */}
        <ProductSettings form={form} />

        {/* Validation Errors */}
        {Object.keys(form.errors).length > 0 && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
            <div>Помилки валідації:</div>
            <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
              {Object.entries(form.errors).map(([field, error]) => (
                <li key={field}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Actions */}
        <Group justify="flex-end" mt="xl">
          <Button variant="subtle" onClick={onCancel} disabled={isLoading}>
            Скасувати
          </Button>
          <Button type="submit" style={{ background: 'var(--btn-primary)', color: 'var(--text-white)' }}>
            {product ? 'Оновити товар' : 'Створити товар'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
