import { ThumbnailsList } from './ThumbnailsList';
import { MainImage } from './MainImage';
import { ImageNavigation } from './ImageNavigation';
import styles from './productGallery.module.scss';

interface ProductGalleryProps {
  images: any[];
  selectedImageIndex: number;
  showScrollArrows: boolean;
  productName: string;
  product: any;
  selectedVariant: any;
  onImageSelect: (index: number) => void;
  onPreviousImage: () => void;
  onNextImage: () => void;
  onScrollUp: () => void;
  onScrollDown: () => void;
}

export const ProductGallery = ({
  images,
  selectedImageIndex,
  showScrollArrows,
  productName,
  product,
  selectedVariant,
  onImageSelect,
  onPreviousImage,
  onNextImage,
  onScrollUp,
  onScrollDown,
}: ProductGalleryProps) => {
  const currentImage = images[selectedImageIndex] || images[0];

  return (
    <div className={styles.productGallery}>
      {/* Thumbnails зліва */}
      <ThumbnailsList
        images={images}
        selectedIndex={selectedImageIndex}
        productName={productName}
        showScrollArrows={showScrollArrows}
        onImageSelect={onImageSelect}
        onScrollUp={onScrollUp}
        onScrollDown={onScrollDown}
      />

      {/* Main Image справа від thumbnails */}
      <div className={styles.productGallery__main}>
        <MainImage image={currentImage} productName={productName} product={product} selectedVariant={selectedVariant} />

        {/* Navigation arrows та dots */}
        <ImageNavigation
          imagesCount={images.length}
          selectedIndex={selectedImageIndex}
          onPrevious={onPreviousImage}
          onNext={onNextImage}
          onDotClick={onImageSelect}
        />
      </div>
    </div>
  );
};
