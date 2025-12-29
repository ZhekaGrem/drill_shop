import { useState, useEffect, useMemo } from 'react';
import { ProductWithRelations } from '@/shared/types';

export const useProductImages = (product: ProductWithRelations | null) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showScrollArrows, setShowScrollArrows] = useState(false);

  const images = product?.images || [];

  // Сортуємо зображення: primary спочатку, потім за sortOrder
  const sortedImages = useMemo(() => {
    return [...images].sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });
  }, [images]);

  // Визначаємо чи показувати стрілочки скролу
  useEffect(() => {
    setShowScrollArrows(sortedImages.length > 6);
  }, [sortedImages.length]);

  // Скидуємо індекс при зміні продукту
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [product?.id]);

  const handlePreviousImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1));
  };

  const handleScrollUp = () => {
    const container = document.querySelector('.productGallery__thumbnails');
    if (container) {
      container.scrollBy({ top: -88, behavior: 'smooth' });
    }
  };

  const handleScrollDown = () => {
    const container = document.querySelector('.productGallery__thumbnails');
    if (container) {
      container.scrollBy({ top: 88, behavior: 'smooth' });
    }
  };

  return {
    sortedImages,
    selectedImageIndex,
    showScrollArrows,
    setSelectedImageIndex,
    handlePreviousImage,
    handleNextImage,
    handleScrollUp,
    handleScrollDown,
  };
};
