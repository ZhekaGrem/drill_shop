'use client';

import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import 'yet-another-react-lightbox/plugins/counter.css';
import { getImageUrl } from '@/shared/utils/image';
import './lightbox-custom.css';

interface ImageData {
  id: string;
  url?: string | null;
  publicId?: string | null;
  altText?: string | null;
}

interface ImageGalleryModalProps {
  images: ImageData[];
  opened: boolean;
  onClose: () => void;
  initialIndex?: number;
  productName: string;
}

export const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({
  images,
  opened,
  onClose,
  initialIndex = 0,
  productName,
}) => {
  // Конвертуємо зображення в формат lightbox
  const slides = images.map((image, index) => ({
    src: getImageUrl(image.url || image.publicId),
    alt: image.altText || `${productName} - зображення ${index + 1}`,
  }));

  return (
    <Lightbox
      open={opened}
      close={onClose}
      slides={slides}
      index={initialIndex}
      plugins={[Zoom, Counter]}
      zoom={{
        maxZoomPixelRatio: 3,
        scrollToZoom: true,
      }}
      counter={{
        container: { style: { top: 'unset', bottom: '20px' } },
      }}
      styles={{
        container: { backgroundColor: 'rgba(0, 0, 0, 0.95)' },
      }}
    />
  );
};
