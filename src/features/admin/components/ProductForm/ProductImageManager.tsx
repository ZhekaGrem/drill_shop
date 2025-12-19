// src/features/admin/components/ProductForm/ProductImageManager.tsx
import { Grid, FileInput, Image, ActionIcon, Card, Text, Button } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { IconTrash, IconUpload, IconStar, IconStarFilled } from '@tabler/icons-react';
import { ProductFormData } from '@/shared/types/admin.types';
import { useDeleteProductImage } from '@/features/admin/hooks/adminHooks';
import { apiClient } from '@/shared/api/client';

interface ImageState {
  newFiles: File[];
  existingImages: any[];
  primaryIndex: number; // Unified index: 0..existingImages.length-1 = existing, existingImages.length+ = new
  secondaryIndex: number | null;
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

  const handleRemoveNewFile = (fileIndex: number) => {
    onImageStateChange((prev) => {
      const newFiles = prev.newFiles.filter((_, i) => i !== fileIndex);
      const removedGlobalIndex = prev.existingImages.length + fileIndex;

      let newPrimaryIndex = prev.primaryIndex;
      let newSecondaryIndex = prev.secondaryIndex;

      // Adjust primary index
      if (prev.primaryIndex === removedGlobalIndex) {
        newPrimaryIndex = 0; // Reset to first image
      } else if (prev.primaryIndex > removedGlobalIndex) {
        newPrimaryIndex = prev.primaryIndex - 1;
      }

      // Adjust secondary index
      if (prev.secondaryIndex === removedGlobalIndex) {
        newSecondaryIndex = null;
      } else if (prev.secondaryIndex !== null && prev.secondaryIndex > removedGlobalIndex) {
        newSecondaryIndex = prev.secondaryIndex - 1;
      }

      return {
        ...prev,
        newFiles,
        primaryIndex: newPrimaryIndex,
        secondaryIndex: newSecondaryIndex,
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

        onImageStateChange((prev) => {
          const deletedIndex = prev.existingImages.findIndex((img) => img.id === imageId);
          if (deletedIndex === -1) return prev;

          const newExistingImages = prev.existingImages.filter((img) => img.id !== imageId);

          let newPrimaryIndex = prev.primaryIndex;
          let newSecondaryIndex = prev.secondaryIndex;

          // If deleted image was primary, reset to first
          if (prev.primaryIndex === deletedIndex) {
            newPrimaryIndex = 0;
          }
          // If primary was after deleted image (including new files), shift down
          else if (prev.primaryIndex > deletedIndex) {
            newPrimaryIndex = prev.primaryIndex - 1;
          }

          // Same for secondary
          if (prev.secondaryIndex === deletedIndex) {
            newSecondaryIndex = null;
          } else if (prev.secondaryIndex !== null && prev.secondaryIndex > deletedIndex) {
            newSecondaryIndex = prev.secondaryIndex - 1;
          }

          return {
            ...prev,
            existingImages: newExistingImages,
            primaryIndex: newPrimaryIndex,
            secondaryIndex: newSecondaryIndex,
          };
        });
      } catch (error) {
        console.error('Error deleting image:', error);
        alert('Помилка при видаленні зображення');
      }
    }
  };

  const handleSetPrimary = async (globalIndex: number) => {
    onImageStateChange((prev) => ({
      ...prev,
      primaryIndex: globalIndex,
    }));

    // If editing existing product and selected existing image, update on server
    if (product?.id && globalIndex < imageState.existingImages.length) {
      const imageId = imageState.existingImages[globalIndex].id;
      try {
        await apiClient.patch(`/admin/products/${product.id}/images/${imageId}/primary`);
      } catch (error) {
        console.error('Error setting primary image:', error);
        alert('Помилка при встановленні головного зображення');
      }
    }
  };

  const handleSetSecondary = async (globalIndex: number | null) => {
    onImageStateChange((prev) => ({
      ...prev,
      secondaryIndex: globalIndex,
    }));

    // If editing existing product and selected existing image, update on server
    if (product?.id && globalIndex !== null && globalIndex < imageState.existingImages.length) {
      const imageId = imageState.existingImages[globalIndex].id;
      try {
        await apiClient.patch(`/admin/products/${product.id}/images/${imageId}/secondary`);
      } catch (error) {
        console.error('Error setting secondary image:', error);
        alert('Помилка при встановленні другого зображення');
      }
    }
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
            {imageState.existingImages.map((image, index) => {
              const globalIndex = index;
              const isPrimary = imageState.primaryIndex === globalIndex;
              const isSecondary = imageState.secondaryIndex === globalIndex;

              return (
                <Grid.Col key={image.id} span={{ base: 6, sm: 4, md: 3 }}>
                  <div style={{ position: 'relative' }}>
                    <Image
                      src={image.url.startsWith('http') ? image.url : `${baseUrl}${image.url}`}
                      alt={image.altText || 'Product image'}
                      height={120}
                      fit="cover"
                      radius="md"
                      fallbackSrc="/assets/img/placeholder-product.jpg"
                    />

                    {/* Primary star indicator */}
                    {isPrimary && (
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
                      variant={isPrimary ? 'filled' : 'light'}
                      color="yellow"
                      style={{
                        position: 'absolute',
                        bottom: 30,
                        left: 5,
                        padding: '4px 8px',
                      }}
                      onClick={() => handleSetPrimary(globalIndex)}
                      title={isPrimary ? 'Головна' : 'Зробити головною'}>
                      {isPrimary ? <IconStarFilled size={14} /> : <IconStar size={14} />}
                    </Button>

                    {/* Make secondary button */}
                    <Button
                      size="xs"
                      variant={isSecondary ? 'filled' : 'light'}
                      color="blue"
                      style={{
                        position: 'absolute',
                        bottom: 5,
                        left: 5,
                        padding: '4px 6px',
                        fontSize: '10px',
                      }}
                      onClick={() => handleSetSecondary(globalIndex)}
                      title={isSecondary ? 'Друга (hover)' : 'Зробити другою'}>
                      {isSecondary ? '2-га' : '2'}
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
              );
            })}
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
            {imageState.newFiles.map((file, index) => {
              const globalIndex = imageState.existingImages.length + index;
              const isPrimary = imageState.primaryIndex === globalIndex;
              const isSecondary = imageState.secondaryIndex === globalIndex;

              return (
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
                    {isPrimary && (
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
                      variant={isPrimary ? 'filled' : 'light'}
                      color="yellow"
                      style={{
                        position: 'absolute',
                        bottom: 30,
                        left: 5,
                        padding: '4px 8px',
                      }}
                      onClick={() => handleSetPrimary(globalIndex)}
                      title={isPrimary ? 'Головна' : 'Зробити головною'}>
                      {isPrimary ? <IconStarFilled size={14} /> : <IconStar size={14} />}
                    </Button>

                    {/* Make secondary button */}
                    <Button
                      size="xs"
                      variant={isSecondary ? 'filled' : 'light'}
                      color="blue"
                      style={{
                        position: 'absolute',
                        bottom: 5,
                        left: 5,
                        padding: '4px 6px',
                        fontSize: '10px',
                      }}
                      onClick={() => handleSetSecondary(globalIndex)}
                      title={isSecondary ? 'Друга (hover)' : 'Зробити другою'}>
                      {isSecondary ? '2-га' : '2'}
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
              );
            })}
          </Grid>
        </div>
      )}
    </Card>
  );
};
