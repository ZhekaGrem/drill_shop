import NextImage, { type ImageProps } from 'next/image';
import { withStorefrontPath } from '@/shared/config/storefront-path';

// Next prefixes the optimizer URL, but leaves local string sources unchanged.
export default function StoreImage({ src, overrideSrc, ...props }: ImageProps) {
  return (
    <NextImage
      {...props}
      src={typeof src === 'string' ? withStorefrontPath(src) : src}
      overrideSrc={overrideSrc ? withStorefrontPath(overrideSrc) : undefined}
    />
  );
}
