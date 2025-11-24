// src/shared/utils/image.ts - ВИПРАВЛЕНО
export function getImageUrl(imageUrl?: string | null): string {
  if (!imageUrl) {
    return '/assets/img/placeholder-product.jpeg';
  }

  // Якщо це вже повний URL (Cloudinary, інший CDN)
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }

  // Якщо це відносний шлях
  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }

  // Якщо це тільки publicId від Cloudinary
  if (imageUrl.includes('/') && !imageUrl.startsWith('http')) {
    // Припускаємо що це Cloudinary publicId
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (cloudName) {
      return `https://res.cloudinary.com/${cloudName}/image/upload/${imageUrl}`;
    }
  }

  // Fallback на placeholder
  return '/assets/img/placeholder-product.jpeg';
}

// Для кошика
export function getCartProductImageUrl(product: any): string {
  const primaryImage = product.images?.find((img: any) => img.isPrimary) || product.images?.[0];
  return getImageUrl(primaryImage?.url || primaryImage?.publicId);
}

// Оптимізація Cloudinary URL
export function getOptimizedImageUrl(
  imageUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: 'auto' | 'best' | 'good' | 'eco';
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  } = {}
): string {
  const url = getImageUrl(imageUrl);

  // Тільки для Cloudinary URL
  if (!url.includes('cloudinary.com')) {
    return url;
  }

  try {
    const { width = 400, height = 400, quality = 'auto', format = 'auto' } = options;
    const transformation = `w_${width},h_${height},c_fill,q_${quality},f_${format}`;

    if (url.includes('/upload/')) {
      return url.replace('/upload/', `/upload/${transformation}/`);
    }

    return url;
  } catch {
    return url;
  }
}
