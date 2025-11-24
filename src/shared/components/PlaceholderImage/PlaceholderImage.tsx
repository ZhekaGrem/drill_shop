// src/shared/components/PlaceholderImage/PlaceholderImage.tsx
'use client';

import { useState } from 'react';
import { Image } from '@mantine/core';

interface PlaceholderImageProps {
  src?: string | null;
  alt?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  fit?: 'contain' | 'cover' | 'fill' | 'scale-down';
  radius?: string | number;
}

// FIXED: Inline SVG placeholder to avoid 404 errors
const createPlaceholderSVG = (width: number = 300, height: number = 200) => {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e0e0e0" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="#f5f5f5"/>
      <rect width="100%" height="100%" fill="url(#grid)" opacity="0.3"/>
      <circle cx="${width / 2}" cy="${height / 2 - 20}" r="25" fill="#d0d0d0"/>
      <rect x="${width / 2 - 30}" y="${height / 2 + 10}" width="60" height="8" rx="4" fill="#d0d0d0"/>
      <rect x="${width / 2 - 20}" y="${height / 2 + 25}" width="40" height="6" rx="3" fill="#e0e0e0"/>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export const PlaceholderImage = ({
  src,
  alt = 'Product image',
  width = 300,
  height = 200,
  className = '',
  style = {},
  fit = 'cover',
  radius = 'md',
}: PlaceholderImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Determine the actual image source
  const getImageSrc = () => {
    if (imageError || !src) {
      const w = typeof width === 'number' ? width : 300;
      const h = typeof height === 'number' ? height : 200;
      return createPlaceholderSVG(w, h);
    }

    // Handle relative URLs from API
    if (src.startsWith('/uploads') || src.startsWith('/images')) {
      const baseUrl = process.env.NEXT_PUBLIC_API_IMG_URL || '';
      return `${baseUrl}${src}`;
    }

    return src;
  };

  const handleError = () => {
    setImageError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  return (
    <div className={className} style={style}>
      <Image
        src={getImageSrc()}
        alt={alt}
        width={width}
        height={height}
        fit={fit}
        radius={radius}
        onError={handleError}
        onLoad={handleLoad}
        style={{
          transition: 'opacity 0.3s ease',
          opacity: loading ? 0.7 : 1,
        }}
      />
    </div>
  );
};
