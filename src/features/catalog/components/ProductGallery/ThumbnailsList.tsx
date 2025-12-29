import { CloudinaryImage } from '@/shared/components/CloudinaryImage/CloudinaryImage';
import { getImageUrl } from '@/shared/utils/image';
import styles from './productGallery.module.scss';

interface ThumbnailsListProps {
  images: any[];
  selectedIndex: number;
  productName: string;
  showScrollArrows: boolean;
  onImageSelect: (index: number) => void;
  onScrollUp: () => void;
  onScrollDown: () => void;
}

export const ThumbnailsList = ({
  images,
  selectedIndex,
  productName,
  showScrollArrows,
  onImageSelect,
  onScrollUp,
  onScrollDown,
}: ThumbnailsListProps) => {
  if (images.length <= 1) return null;

  return (
    <div className={styles.productGallery__thumbnailsWrapper}>
      {/* Стрілочка вгору */}
      {showScrollArrows && (
        <button
          className={`${styles.productGallery__scrollArrow} ${styles.productGallery__scrollArrowUp}`}
          onClick={onScrollUp}
          aria-label="Прокрутити вгору">
          ▲
        </button>
      )}

      <div className={styles.productGallery__thumbnails}>
        {images.map((image, index) => (
          <button
            key={image.id}
            className={`${styles.productGallery__thumbnail} ${
              index === selectedIndex ? styles.productGallery__thumbnailActive : ''
            }`}
            onClick={() => onImageSelect(index)}>
            <CloudinaryImage
              src={getImageUrl(image.url || image.publicId)}
              alt={image.altText || productName}
              width={80}
              height={80}
            />
          </button>
        ))}
      </div>

      {/* Стрілочка вниз */}
      {showScrollArrows && (
        <button
          className={`${styles.productGallery__scrollArrow} ${styles.productGallery__scrollArrowDown}`}
          onClick={onScrollDown}
          aria-label="Прокрутити вниз">
          ▼
        </button>
      )}
    </div>
  );
};
