// src/features/admin/components/ProductForm/ProductImageManager.tsx
import { Grid, FileInput, Image, ActionIcon, Card, Text, Button } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { IconTrash, IconUpload, IconStar, IconStarFilled } from '@tabler/icons-react';
import { ProductFormData } from '@/shared/types/admin.types';
import { useDeleteProductImage } from '@/features/admin/hooks/adminHooks';
import { apiClient } from '@/shared/api/client';

interface ImageState {
  newFiles: File[];
  primaryImageIndex: number;
  secondaryImageIndex: number | null;
  existingImages: any[];
  existingPrimaryId: string | null;
  existingSecondaryId: string | null;
}

interface ProductImageManagerProps {
  form: UseFormReturnType<ProductFormData>;
  product?: any;
  imageState: ImageState;
  onImageStateChange: (updater: (prev: ImageState) => ImageState) => void;
}

export const ProductImageManager = ({
  form,
  product,
  imageState,
  onImageStateChange,
}: ProductImageManagerProps) => {
  const deleteImageMutation = useDeleteProductImage();
  const baseUrl = process.env.NEXT_PUBLIC_API_IMG_URL || '';

  const handleFileAdd = (files: File[] | null) => {
    if (files && files.length > 0) {
      onImageStateChange((prev) => ({
        ...prev,
        newFiles: [...prev.newFiles, ...files],
      }));
    }
  };

  const handleRemoveNewFile = (index: number) => {
    onImageStateChange((prev) => {
      const newFiles = prev.newFiles.filter((_, i) => i !== index);
      let newPrimaryIndex = prev.primaryImageIndex;

      if (prev.primaryImageIndex === index) {
        newPrimaryIndex = 0;
      } else if (prev.primaryImageIndex > index) {
        newPrimaryIndex = prev.primaryImageIndex - 1;
      }

      return {
        ...prev,
        newFiles,
        primaryImageIndex: newPrimaryIndex,
      };
    });
  };

  const handleDeleteExistingImage = async (imageId: string) => {
    if (!product?.id) return;

    if (confirm('Ви впевнені, що хочете видалити це зображення?')) {
      try {
        await deleteImageMutation.mutateAsync({
          productId: product.id,
          imageId: imageId,
        });

        onImageStateChange((prev) => ({
          ...prev,
          existingImages: prev.existingImages.filter((img) => img.id !== imageId),
          existingPrimaryId: prev.existingPrimaryId === imageId ? null : prev.existingPrimaryId,
        }));
      } catch (error) {
        console.error('Error deleting image:', error);
        alert('Помилка при видаленні зображення');
      }
    }
  };

  const handleSetPrimaryImage = (index: number) => {
    onImageStateChange((prev) => ({
      ...prev,
      primaryImageIndex: index,
    }));
  };

  const handleSetExistingPrimary = async (imageId: string) => {
    if (!product?.id) {
      // Якщо товар ще не створений - зберігаємо локально
      onImageStateChange((prev) => ({
        ...prev,
        existingPrimaryId: imageId,
      }));
      return;
    }

    // Якщо товар вже існує - відправляємо запит на сервер
    try {
      await apiClient.patch(`/admin/products/${product.id}/images/${imageId}/primary`);

      onImageStateChange((prev) => ({
        ...prev,
        existingPrimaryId: imageId,
      }));
    } catch (error) {
      console.error('Error setting primary image:', error);
      alert('Помилка при встановленні головного зображення');
    }
  };

  const handleSetExistingSecondary = async (imageId: string) => {
    if (!product?.id) {
      // Якщо товар ще не створений - зберігаємо локально
      onImageStateChange((prev) => ({
        ...prev,
        existingSecondaryId: imageId,
      }));
      return;
    }

    // Якщо товар вже існує - відправляємо запит на сервер
    try {
      await apiClient.patch(`/admin/products/${product.id}/images/${imageId}/secondary`);

      onImageStateChange((prev) => ({
        ...prev,
        existingSecondaryId: imageId,
      }));
    } catch (error) {
      console.error('Error setting secondary image:', error);
      alert('Помилка при встановленні другого зображення');
    }
  };

  const handleSetSecondaryImage = (index: number | null) => {
    onImageStateChange((prev) => ({
      ...prev,
      secondaryImageIndex: index,
    }));
  };

  return (
    <Card padding="md" withBorder>
      <Text size="lg" fw={600} mb="md">
        Зображення
      </Text>

      {/* Existing Images */}
      {imageState.existingImages.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <Text size="sm" fw={500} mb="xs">
            Поточні зображення:
          </Text>
          <Grid>
            {imageState.existingImages.map((image) => (
              <Grid.Col key={image.id} span={{ base: 6, sm: 4, md: 3 }}>
                <div style={{ position: 'relative' }}>
                  <Image
                    src={image.url.startsWith('http') ? image.url : `${baseUrl}${image.url}`}
                    alt={image.altText || 'Product image'}
                    height={120}
                    fit="cover"
                    radius="md"
                    fallbackSrc="/assets/img/placeholder-product.jpeg"
                  />

                  {/* Primary star indicator */}
                  {imageState.existingPrimaryId === image.id && (
                    <IconStarFilled
                      size={24}
                      style={{
                        position: 'absolute',
                        top: 5,
                        left: 5,
                        color: 'gold',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                      }}
                    />
                  )}

                  {/* Make primary button */}
                  <Button
                    size="xs"
                    variant={imageState.existingPrimaryId === image.id ? 'filled' : 'light'}
                    color="yellow"
                    style={{
                      position: 'absolute',
                      bottom: 30,
                      left: 5,
                      padding: '4px 8px',
                    }}
                    onClick={() => handleSetExistingPrimary(image.id)}
                    title={imageState.existingPrimaryId === image.id ? 'Головна' : 'Зробити головною'}>
                    {imageState.existingPrimaryId === image.id ? (
                      <IconStarFilled size={14} />
                    ) : (
                      <IconStar size={14} />
                    )}
                  </Button>

                  {/* Make secondary button */}
                  <Button
                    size="xs"
                    variant={imageState.existingSecondaryId === image.id ? 'filled' : 'light'}
                    color="blue"
                    style={{
                      position: 'absolute',
                      bottom: 5,
                      left: 5,
                      padding: '4px 6px',
                      fontSize: '10px',
                    }}
                    onClick={() => handleSetExistingSecondary(image.id)}
                    title={imageState.existingSecondaryId === image.id ? 'Друга (hover)' : 'Зробити другою'}>
                    {imageState.existingSecondaryId === image.id ? '2-га' : '2'}
                  </Button>

                  {/* Delete button */}
                  <ActionIcon
                    color="red"
                    size="sm"
                    variant="filled"
                    style={{
                      position: 'absolute',
                      top: 5,
                      right: 5,
                    }}
                    onClick={() => handleDeleteExistingImage(image.id)}
                    loading={deleteImageMutation.isPending}>
                    <IconTrash size={14} />
                  </ActionIcon>
                </div>
              </Grid.Col>
            ))}
          </Grid>
        </div>
      )}

      <FileInput
        label="Додати нові зображення (можна обрати декілька)"
        placeholder="Натисніть для вибору файлів"
        multiple
        accept="image/*"
        leftSection={<IconUpload size={16} />}
        onChange={handleFileAdd}
        clearable={false}
        value={undefined}
      />

      {/* Display new files */}
      {imageState.newFiles.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <Text size="sm" fw={500} mb="xs">
            Нові зображення ({imageState.newFiles.length}):
          </Text>
          <Grid>
            {imageState.newFiles.map((file, index) => (
              <Grid.Col key={`${file.name}-${index}`} span={{ base: 6, sm: 4, md: 3 }}>
                <div style={{ position: 'relative' }}>
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={`New image ${index + 1}`}
                    height={120}
                    fit="cover"
                    radius="md"
                  />

                  {/* Primary star */}
                  {imageState.primaryImageIndex === index && (
                    <IconStarFilled
                      size={24}
                      style={{
                        position: 'absolute',
                        top: 5,
                        left: 5,
                        color: 'gold',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                      }}
                    />
                  )}

                  {/* Make primary button */}
                  <Button
                    size="xs"
                    variant={imageState.primaryImageIndex === index ? 'filled' : 'light'}
                    color="yellow"
                    style={{
                      position: 'absolute',
                      bottom: 5,
                      left: 5,
                      padding: '4px 8px',
                    }}
                    onClick={() => handleSetPrimaryImage(index)}
                    title={imageState.primaryImageIndex === index ? 'Головна' : 'Зробити головною'}>
                    {imageState.primaryImageIndex === index ? (
                      <IconStarFilled size={14} />
                    ) : (
                      <IconStar size={14} />
                    )}
                  </Button>

                  {/* Delete button */}
                  <ActionIcon
                    color="red"
                    size="sm"
                    variant="filled"
                    style={{
                      position: 'absolute',
                      top: 5,
                      right: 5,
                    }}
                    onClick={() => handleRemoveNewFile(index)}>
                    <IconTrash size={14} />
                  </ActionIcon>

                  <div
                    style={{
                      position: 'absolute',
                      bottom: 30,
                      left: 5,
                      background: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '10px',
                    }}>
                    {file.name.substring(0, 15)}...
                  </div>
                </div>
              </Grid.Col>
            ))}
          </Grid>
        </div>
      )}
    </Card>
  );
};
