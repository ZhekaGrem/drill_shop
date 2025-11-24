// src/shared/utils/cloudinary.ts
export function getCloudinaryUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  } = {}
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const { width = 800, height, crop = 'scale', quality = 'auto', format = 'auto' } = options;

  const transformations = [
    width && `w_${width}`,
    height && `h_${height}`,
    `c_${crop}`,
    `q_${quality}`,
    `f_${format}`,
  ]
    .filter(Boolean)
    .join(',');

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
}
