'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container } from '@mantine/core';
import { ProductCard } from '@/features/catalog/components/ProductCard/ProductCard';
import { ProductReviews } from '@/features/reviews/components/ProductReviews/ProductReviews';
import { ProductWithRelations } from '@/shared/types';
import { useAuthStore } from '@/shared/stores/auth';
import { Button } from '@/shared/components/Button/Button';
import { SizeGuideModal } from '@/shared/components/SizeGuideModal';
import { NotifyAvailabilityModal } from '@/features/notify-availability';

// Hooks
import { useProductDetails } from '@/features/catalog/hooks/useProductDetails';
import { useProductVariants } from '@/features/catalog/hooks/useProductVariants';
import { useProductStock } from '@/features/catalog/hooks/useProductStock';
import { useProductImages } from '@/features/catalog/hooks/useProductImages';
import { useProductCart } from '@/features/catalog/hooks/useProductCart';

// Components
import { ProductGallery } from '@/features/catalog/components/ProductGallery/ProductGallery';
import { ProductInfoSection } from '@/features/catalog/components/ProductInfo/ProductInfoSection';
import { ProductDescription } from '@/features/catalog/components/ProductInfo/ProductDescription';

import styles from './productDetails.module.scss';

interface ProductDetailsProps {
  initialProduct?: ProductWithRelations;
}

export default function ProductDetailsClient({ initialProduct }: ProductDetailsProps) {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const { isAuthenticated } = useAuthStore();

  // Modals state
  const [sizeGuideOpened, setSizeGuideOpened] = useState(false);
  const [notifyModalOpened, setNotifyModalOpened] = useState(false);

  // Custom hooks
  const { product, relatedProducts, isLoading, error } = useProductDetails({ slug, initialProduct });

  const {
    selectedVariant,
    isMainProduct,
    sortedVariants,
    showVariantCheckboxes,
    handleVariantChange,
    getVariantDisplayValue,
    getVariantStock,
    setSelectedVariant,
    setIsMainProduct,
  } = useProductVariants(product);

  const { isInStock, availableQuantity, getCurrentWeight } = useProductStock(product, selectedVariant);

  const {
    sortedImages,
    selectedImageIndex,
    showScrollArrows,
    setSelectedImageIndex,
    handlePreviousImage,
    handleNextImage,
    handleScrollUp,
    handleScrollDown,
  } = useProductImages(product);

  const { quantity, isClicked, handleQuantityChange, handleAddToCart, handleBuyNow, getButtonText, setQuantity } =
    useProductCart(product, selectedVariant, isInStock);

  // Size guide data
  const categoriesWithGuide =
    product?.categories
      ?.map((cat) => ({
        categoryName: cat.name,
        imageUrl: cat.sizeGuideImage || null,
        text: cat.sizeGuideText || null,
      }))
      .filter((cat) => cat.imageUrl || cat.text) || [];
  const hasSizeGuide = categoriesWithGuide.length > 0;

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.productPage}>
        <div className={styles.productPage__loading}>
          <div className={styles.productSkeleton}>
            <div className={styles.productSkeleton__images}></div>
            <div className={styles.productSkeleton__content}>
              <div className={styles.productSkeleton__title}></div>
              <div className={styles.productSkeleton__price}></div>
              <div className={styles.productSkeleton__description}></div>
              <div className={styles.productSkeleton__actions}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className={styles.productPage}>
        <Container size={1200}>
          <div className={styles.productPage__error}>
            <h1>Товар не знайдено</h1>
            <p>{error || 'Товар з таким адресом не існує'}</p>
            <Button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => router.push('/catalog')}>
              Повернутися до каталогу
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className={styles.productPage}>
      <Container size={1200}>
        {/* Product Details */}
        <div className={styles.productDetails}>
          {/* Images Gallery */}
          <div className={styles.productDetails__images}>
            <ProductGallery
              images={sortedImages}
              selectedImageIndex={selectedImageIndex}
              showScrollArrows={showScrollArrows}
              productName={product.name}
              product={product}
              selectedVariant={selectedVariant}
              onImageSelect={setSelectedImageIndex}
              onPreviousImage={handlePreviousImage}
              onNextImage={handleNextImage}
              onScrollUp={handleScrollUp}
              onScrollDown={handleScrollDown}
            />
          </div>

          {/* Product Info */}
          <ProductInfoSection
            product={product}
            selectedVariant={selectedVariant}
            sortedVariants={sortedVariants}
            showVariantCheckboxes={showVariantCheckboxes}
            isInStock={isInStock}
            availableQuantity={availableQuantity}
            quantity={quantity}
            currentWeight={getCurrentWeight()}
            hasSizeGuide={hasSizeGuide}
            isClicked={isClicked}
            buttonText={getButtonText()}
            onVariantChange={handleVariantChange}
            getVariantDisplayValue={getVariantDisplayValue}
            getVariantStock={getVariantStock}
            onQuantityChange={(newQty) => handleQuantityChange(newQty, availableQuantity)}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onOpenSizeGuide={() => setSizeGuideOpened(true)}
            onOpenNotifyModal={() => setNotifyModalOpened(true)}
            setSelectedVariant={setSelectedVariant}
            setIsMainProduct={setIsMainProduct}
            setQuantity={setQuantity}
          />
        </div>

        {/* Description */}
        <ProductDescription description={product.description || ''} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className={styles.relatedProducts}>
            <h2 className={styles.relatedProducts__title}>ЩЕ ТОВАРИ</h2>
            <div className={styles.relatedProducts__grid}>
              {relatedProducts.slice(0, 3).map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}

        {/* Reviews Section */}
        {/* <ProductReviews productId={product.id} canReview={isAuthenticated} /> */}

        {/* Size Guide Modal */}
        {hasSizeGuide && (
          <SizeGuideModal
            opened={sizeGuideOpened}
            onClose={() => setSizeGuideOpened(false)}
            categories={categoriesWithGuide}
          />
        )}

        {/* Notify Availability Modal */}
        <NotifyAvailabilityModal
          opened={notifyModalOpened}
          onClose={() => setNotifyModalOpened(false)}
          productName={product.name}
          productSlug={product.slug}
          variantName={selectedVariant?.name}
        />
      </Container>
    </div>
  );
}
