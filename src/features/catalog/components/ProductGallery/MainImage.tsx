import { CloudinaryImage } from '@/shared/components/CloudinaryImage/CloudinaryImage';
import { getImageUrl } from '@/shared/utils/image';
import { ProductBadges } from '@/features/catalog/components/ProductBadges/ProductBadges';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton/FavoriteButton';
import styles from './productGallery.module.scss';

interface MainImageProps {
  image: any;
  productName: string;
  product: any;
  selectedVariant: any;
}

export const MainImage = ({ image, productName, product, selectedVariant }: MainImageProps) => {
  return (
    <div className={styles.productGallery__mainImageWrapper}>
      <CloudinaryImage
        src={getImageUrl(image?.url || image?.publicId)}
        alt={productName}
        className={styles.productGallery__mainImage}
        width={600}
        height={600}
      />

      <ProductBadges product={product} selectedVariant={selectedVariant} />

      {/* <div className={styles.favoriteButtonWrapper}>
        <FavoriteButton product={product} />
      </div> */}
    </div>
  );
};
