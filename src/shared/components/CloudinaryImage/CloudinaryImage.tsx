// src/shared/components/CloudinaryImage/CloudinaryImage.tsx
'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

interface CloudinaryImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
}

export function CloudinaryImage({
  src,
  alt,
  width = 400,
  height = 400,
  className = '',
  loading = 'lazy',
  priority = false,
  sizes,
}: CloudinaryImageProps) {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const getImageUrl = (url: string): string => {
    if (!url || error) {
      return '/assets/img/placeholder-product.jpg'; // ВИПРАВЛЕНО: додано /
    }

    if (url.startsWith('http') || url.startsWith('/')) {
      return url;
    }

    // Якщо це Cloudinary publicId
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (cloudName) {
      return `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},h_${height},c_fill,f_auto,q_auto/${url}`;
    }

    return '/assets/img/placeholder-product.jpg';
  };

  const blurUrl = src.startsWith('http') ? src.replace('/upload/', '/upload/w_50,q_auto:low,f_auto/') : src;

  const imageUrl = getImageUrl(src);

  // Якщо priority=true, не можна використовувати loading='lazy'
  const baseProps = {
    src: imageUrl,
    alt,
    width,
    height,
    className,
    placeholder: 'blur' as const,
    blurDataURL: blurUrl,
    onLoad: () => setIsLoading(false),
    sizes: sizes || `(max-width: 768px) 100vw, ${width}px`,
    onError: () => {
      setIsLoading(false);
      setImageError(true);
    },
    style: {
      opacity: isLoading ? 0 : 1,
      filter: isLoading ? 'blur(10px)' : 'blur(0px)',
      transition: '0.3s ease-in-out, filter 0.5s ease-in-out',
    },
  };

  // Додаємо priority або loading, але не обидва одночасно
  if (priority) {
    return <Image {...baseProps} priority />;
  }

  return <Image {...baseProps} loading={loading} />;
}
