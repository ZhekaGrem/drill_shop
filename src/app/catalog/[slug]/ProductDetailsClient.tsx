'use client';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductCard } from '@/features/catalog/components/ProductCard/ProductCard';
import { ProductReviews } from '@/features/reviews/components/ProductReviews/ProductReviews';
import { productsApi, ProductResponse } from '@/features/catalog/api/products';
import { Product, ProductWithRelations } from '@/shared/types';
import { useAuthStore } from '@/shared/stores/auth';
import Link from 'next/link';
import { Select, Badge, Container } from '@mantine/core';
import { Button } from '@/shared/components/Button/Button';
import { useCart } from '@/features/cart/hooks/useCart';
import styles from './productDetails.module.scss';
import { getImageUrl } from '@/shared/utils/image';
import { ProductBadges } from '@/features/catalog/components/ProductBadges/ProductBadges';
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton/FavoriteButton';
import { calculatePromoPrice, calculateVariantPromoPrice } from '@/shared/utils/promo-calculator';
import { CloudinaryImage } from '@/shared/components/CloudinaryImage/CloudinaryImage';
import { sanitizeHTML } from '@/shared/utils/sanitize';
import { SizeGuideModal } from '@/shared/components/SizeGuideModal';
import { IconCart3 } from '@/shared/components/Svg';
import { sortVariantsBySize } from '@/shared/utils/size-sort';
import Image from 'next/image';
import { NotifyAvailabilityModal } from '@/features/notify-availability';

interface ProductDetailsProps {
  initialProduct?: ProductWithRelations;
}

export default function ProductDetailsClient({ initialProduct }: ProductDetailsProps) {
  const { addItem, isAddingItem } = useCart();
  const { isAuthenticated } = useAuthStore();
  const [product, setProduct] = useState<ProductWithRelations | null>(initialProduct || null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>(initialProduct?.relatedProducts || []);
  const [isLoading, setIsLoading] = useState(!initialProduct);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [isClicked, setIsClicked] = useState(false);
  const [isMainProduct, setIsMainProduct] = useState(true);
  const [sizeGuideOpened, setSizeGuideOpened] = useState(false);
  const [notifyModalOpened, setNotifyModalOpened] = useState(false);
  const [showScrollArrows, setShowScrollArrows] = useState(false);

  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  // Fetch product якщо немає initialProduct
  useEffect(() => {
    if (!initialProduct && slug) {
      fetchProduct();
    }
  }, [slug, initialProduct]);

  // ✅ Автоматично вибираємо перший варіант якщо hasVariants = true
  useEffect(() => {
    if (product?.hasVariants && product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
      setIsMainProduct(false);
    } else if (product && !product.hasVariants) {
      setSelectedVariant(null);
      setIsMainProduct(true);
    }
  }, [product?.hasVariants, product?.variants]);

  // Визначаємо чи показувати стрілочки скролу
  useEffect(() => {
    if (product?.images && product.images.length > 6) {
      setShowScrollArrows(true);
    } else {
      setShowScrollArrows(false);
    }
  }, [product?.images]);

  const fetchProduct = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response: ProductResponse = await productsApi.getProductBySlug(slug);
      setProduct(response.data);
      setRelatedProducts(response.data.relatedProducts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Товар не знайдено');
    } finally {
      setIsLoading(false);
    }
  };
  const basePromoData = product ? calculatePromoPrice(product) : null;

  const handleAddToCart = () => {
    if (!product) return;

    if (product.hasVariants && !selectedVariant) {
      alert('Оберіть варіант товару');
      return;
    }

    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 2000);

    const productData = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: selectedVariant?.price || product.price,
      unitValue: selectedVariant?.unitValue || product.unitValue,
      primaryImage: product.images?.find((img) => img.isPrimary) || product.images?.[0] || null,
      variants: product.variants,
      promoType: selectedVariant?.promoType || product.promoType,
      promoConfig: selectedVariant?.promoConfig || product.promoConfig,
      promoEndsAt: selectedVariant?.promoEndsAt || product.promoEndsAt,
    };

    if (selectedVariant) {
      addItem(product.id, quantity, selectedVariant.id, productData);
    } else {
      addItem(product.id, quantity, undefined, productData);
    }
  };

  const formatPrice = (price: number) => {
    const formatted = new Intl.NumberFormat('uk-UA', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

    return `${formatted} ₴`;
  };

  const formatVariantOptions = (options: Record<string, any>): string => {
    if (!options || typeof options !== 'object' || Object.keys(options).length === 0) {
      return '';
    }

    const parts: string[] = [];

    Object.entries(options).forEach(([key, value]) => {
      if (value && String(value).trim()) {
        parts.push(String(value).trim());
      }
    });

    return parts.join(', ');
  };

  const createVariantDisplayLabel = (variant: any): string => {
    // Показуємо тільки назву варіанту без опцій
    return variant.name || `Варіант ${variant.sku}`;
  };

  // ✅ Відсортовані варіанти за розміром
  const sortedVariants = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return [];
    return sortVariantsBySize(product.variants);
  }, [product?.variants]);

  // ✅ Перевіряємо чи показувати чекбокси для варіантів (size/color)
  const showVariantCheckboxes = useMemo(() => {
    if (!sortedVariants || sortedVariants.length === 0) return false;

    // Перевіряємо чи ХОЧА Б ОДИН варіант має size або color
    return sortedVariants.some((variant) => {
      const options = variant.options || {};
      const keys = Object.keys(options).map((k) => k.toLowerCase());
      return keys.includes('size') || keys.includes('color');
    });
  }, [sortedVariants]);

  // Отримати значення варіанту для відображення (size або color)
  const getVariantDisplayValue = (variant: any): string => {
    if (!variant || !variant.options) {
      return 'Варіант';
    }

    // Шукаємо саме 'size' або 'color'
    const optionsKeys = Object.keys(variant.options);
    const targetKey = optionsKeys.find((key) => {
      const lowerKey = key.toLowerCase();
      return lowerKey === 'size' || lowerKey === 'color';
    });

    // Якщо знайшли size або color — повертаємо його значення
    if (targetKey) {
      const value = variant.options[targetKey];
      return String(value);
    }

    // Якщо size/color немає, беремо першу доступну опцію
    const firstValue = Object.values(variant.options)[0];
    return firstValue ? String(firstValue) : 'Варіант';
  };

  // Отримати stock варіанту
  const getVariantStock = (variant: any) => {
    if (!variant) return 0;
    return (variant.quantity || 0) - (variant.reservedQuantity || 0);
  };

  // SIMPLIFIED: Calculate stock directly from product data
  const getCurrentStock = () => {
    if (selectedVariant) {
      // ✅ Обрано варіант - перевіряємо ТІЛЬКИ його
      const availableStock = (selectedVariant.quantity || 0) - (selectedVariant.reservedQuantity || 0);
      return {
        isInStock: availableStock > 0,
        availableQuantity: availableStock,
      };
    }

    // ✅ Обрано головний товар (або нічого не обрано) - перевіряємо ТІЛЬКИ його
    if (product) {
      const mainStock = (product.quantity || 0) - (product.reservedQuantity || 0);
      return {
        isInStock: mainStock > 0,
        availableQuantity: mainStock,
      };
    }

    return {
      isInStock: false,
      availableQuantity: 0,
    };
  };

  const { isInStock, availableQuantity } = getCurrentStock();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= availableQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handlePreviousImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1));
  };

  const handleScrollUp = () => {
    const container = document.querySelector(`.${styles.productGallery__thumbnails}`);
    if (container) {
      container.scrollBy({ top: -88, behavior: 'smooth' });
    }
  };

  const handleScrollDown = () => {
    const container = document.querySelector(`.${styles.productGallery__thumbnails}`);
    if (container) {
      container.scrollBy({ top: 88, behavior: 'smooth' });
    }
  };

  const getCurrentWeight = () => {
    return selectedVariant ? selectedVariant.unitValue : product?.unitValue;
  };

  const getButtonText = () => {
    if (isClicked) return 'Додано в кошик';
    if (isAddingItem) return 'Додавання...';
    if (!isInStock) return 'Немає в наявності';

    return 'Додати в кошик';
  };

  if (isLoading) {
    return (
      <div className={styles.productPage}>
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
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.productPage}>
        <div className={styles.container}>
          <div className={styles.productPage__error}>
            <h1>Товар не знайдено</h1>
            <p>{error || 'Товар з таким адресом не існує'}</p>
            <Button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => router.push('/catalog')}>
              Повернутися до каталогу
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const images = product.images || [];
  const sortedImages = [...images].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return (a.sortOrder || 0) - (b.sortOrder || 0);
  });
  const primaryImage = sortedImages[0] || images[0];
  const hasVariants = product.variants && product.variants.length > 0;
  const hasOptions =
    product.options && typeof product.options === 'object' && Object.keys(product.options).length > 0;

  // Отримуємо всі категорії з size guide
  const categoriesWithGuide =
    product.categories
      ?.map((cat) => ({
        categoryName: cat.name,
        imageUrl: cat.sizeGuideImage || null,
        text: cat.sizeGuideText || null,
      }))
      .filter((cat) => cat.imageUrl || cat.text) || [];
  const hasSizeGuide = categoriesWithGuide.length > 0;

  return (
    <div className={styles.productPage}>
      <Container size={1200}>
        {/* Breadcrumbs */}
        <nav className={styles.breadcrumbs}>
          <Link href="/" className={styles.breadcrumbs__link}>
            Головна
          </Link>
          <span className={styles.breadcrumbs__separator}>›</span>
          <Link href="/catalog" className={styles.breadcrumbs__link}>
            Каталог
          </Link>
          <span className={styles.breadcrumbs__separator}>›</span>

          <span className={styles.breadcrumbs__current}>{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className={styles.productDetails}>
          {/* Images */}
          <div className={styles.productDetails__images}>
            <div className={styles.productGallery}>
              {/* Thumbnails - тепер зліва */}
              {sortedImages.length > 1 && (
                <div className={styles.productGallery__thumbnailsWrapper}>
                  {/* Стрілочка вгору */}
                  {showScrollArrows && (
                    <button
                      className={`${styles.productGallery__scrollArrow} ${styles.productGallery__scrollArrowUp}`}
                      onClick={handleScrollUp}
                      aria-label="Прокрутити вгору">
                      ▲
                    </button>
                  )}

                  <div className={styles.productGallery__thumbnails}>
                    {sortedImages.map((image, index) => (
                      <button
                        key={image.id}
                        className={`${styles.productGallery__thumbnail} ${
                          index === selectedImageIndex ? styles.productGallery__thumbnailActive : ''
                        }`}
                        onClick={() => setSelectedImageIndex(index)}>
                        <CloudinaryImage
                          src={getImageUrl(image.url || image.publicId)}
                          alt={image.altText || product.name}
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
                      onClick={handleScrollDown}
                      aria-label="Прокрутити вниз">
                      ▼
                    </button>
                  )}
                </div>
              )}

              {/* Main Image справа від thumbnails */}
              <div className={styles.productGallery__main}>
                <div className={styles.productGallery__mainImageWrapper}>
                  <CloudinaryImage
                    src={getImageUrl(
                      sortedImages[selectedImageIndex]?.url ||
                        sortedImages[selectedImageIndex]?.publicId ||
                        primaryImage?.url ||
                        primaryImage?.publicId
                    )}
                    alt={product.name}
                    className={styles.productGallery__mainImage}
                    width={600}
                    height={600}
                  />

                  {/* Navigation arrows - показуємо тільки якщо є більше 1 зображення */}
                  {sortedImages.length > 1 && (
                    <>
                      <button
                        className={`${styles.productGallery__arrow} ${styles.productGallery__arrowLeft}`}
                        onClick={handlePreviousImage}
                        aria-label="Попереднє зображення">
                        <Image
                          src="/svg/pixelarticons_arrow-left-box.svg"
                          alt="Попереднє"
                          width={24}
                          height={24}
                        />
                      </button>
                      <button
                        className={`${styles.productGallery__arrow} ${styles.productGallery__arrowRight}`}
                        onClick={handleNextImage}
                        aria-label="Наступне зображення">
                        <Image
                          src="/svg/pixelarticons_arrow-right-box.svg"
                          alt="Наступне"
                          width={24}
                          height={24}
                        />
                      </button>
                    </>
                  )}
                </div>
                <ProductBadges product={product} selectedVariant={selectedVariant} />

                <div className={styles.favoriteButtonWrapper}>
                  <FavoriteButton product={product} />
                </div>

                {/* Dots для навігації по зображеннях */}
                {sortedImages.length > 1 && (
                  <div className={styles.productGallery__dots}>
                    {sortedImages.map((_, index) => (
                      <button
                        key={index}
                        className={`${styles.productGallery__dot} ${
                          index === selectedImageIndex ? styles.productGallery__dotActive : ''
                        }`}
                        onClick={() => setSelectedImageIndex(index)}
                        aria-label={`Зображення ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className={styles.productDetails__info}>
            <h1 className={styles.productDetails__title}>{product.name}</h1>

            <div className={styles.productDetails__price}>
              {selectedVariant ? (
                // Показуємо ціну обраного варіанту з акцією (якщо є)
                (() => {
                  const variantPriceData = calculateVariantPromoPrice(selectedVariant);
                  if (variantPriceData.hasDiscount) {
                    return (
                      <>
                        <span
                          className={styles.productDetails__originalPrice}
                          style={{ textDecoration: 'line-through', color: '#999', marginRight: '8px' }}>
                          {formatPrice(variantPriceData.originalPrice)}
                        </span>
                        <span
                          className={`${styles.productDetails__currentPrice} ${styles.productDetails__currentPrice_discount}`}>
                          {formatPrice(variantPriceData.finalPrice)}
                        </span>
                      </>
                    );
                  }
                  return (
                    <span className={styles.productDetails__currentPrice}>
                      {formatPrice(selectedVariant.price)}
                    </span>
                  );
                })()
              ) : basePromoData?.hasDiscount ? (
                // Показуємо знижену ціну (як в ProductCard)
                <>
                  <span
                    className={styles.productDetails__originalPrice}
                    style={{ textDecoration: 'line-through', color: '#999', marginRight: '8px' }}>
                    {formatPrice(basePromoData.originalPrice)}
                  </span>
                  <span
                    className={`${styles.productDetails__currentPrice} ${styles.productDetails__currentPrice_discount}`}>
                    {formatPrice(basePromoData.finalPrice)}
                  </span>
                </>
              ) : (
                // Показуємо звичайну ціну
                <span className={styles.productDetails__currentPrice}>{formatPrice(product?.price)}</span>
              )}
              {getCurrentWeight() && (
                <span className={styles.productDetails__pricePerKg}> / {getCurrentWeight()}</span>
              )}{' '}
              {product.unitDisplay}
            </div>

            {/* Size Guide Button */}

            {/* Variants Selector */}
            {hasVariants && sortedVariants.length > 0 && (
              <div className={styles.productDetails__variants}>
                {/* ✅ Якщо варіанти мають size/color - показуємо чекбокси */}
                {showVariantCheckboxes ? (
                  <div>
                    <label className={styles.variantLabel}>Варіант:</label>
                    <div className={styles.variantCheckboxes}>
                      {sortedVariants.map((variant: any) => {
                        const stock = getVariantStock(variant);
                        const isOutOfStock = stock <= 0;
                        const displayValue = getVariantDisplayValue(variant);

                        return (
                          <label
                            key={variant.id}
                            className={`${styles.variantCheckbox} ${
                              isOutOfStock ? styles.variantCheckbox_disabled : ''
                            }`}>
                            <input
                              type="checkbox"
                              checked={selectedVariant?.id === variant.id}
                              disabled={isOutOfStock}
                              onChange={(e) => {
                                e.stopPropagation();
                                if (!isOutOfStock) {
                                  setSelectedVariant(variant);
                                  setIsMainProduct(false);
                                  setQuantity(1);
                                }
                              }}
                            />
                            <span className={styles.variantCheckboxText}>{displayValue}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  // ✅ Інакше - показуємо Select
                  <Select
                    className={styles.productDetails__variants__select}
                    radius="xs"
                    label="Варіант:"
                    size="lg"
                    value={selectedVariant?.id || (!product.hasVariants ? 'main' : undefined)}
                    onChange={(value) => {
                      if (value === 'main') {
                        setSelectedVariant(null);
                        setIsMainProduct(true);
                      } else {
                        const variant = sortedVariants.find((v) => v.id === value);
                        setSelectedVariant(variant);
                        setIsMainProduct(false);
                      }
                      setQuantity(1);
                    }}
                    data={[
                      // Показуємо головний товар тільки якщо hasVariants = false
                      ...(!product.hasVariants
                        ? [
                            {
                              value: 'main',
                              label: `${product.name}`,
                            },
                          ]
                        : []),
                      ...(sortedVariants.map((variant: any) => ({
                        value: variant.id,
                        label: createVariantDisplayLabel(variant),
                      })) || []),
                    ]}
                    placeholder="Оберіть варіант"
                    style={{ marginTop: '8px' }}
                  />
                )}

                {/* Деталі обраного варіанта */}
                {selectedVariant && !isMainProduct && selectedVariant.options && (
                  <div
                    style={{
                      marginTop: '16px',
                      marginBottom:'16px'
                    }}>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {Object.keys(selectedVariant.options).length > 0 && (
                        <div >
                          <strong>Характеристики:</strong>
                          <div
                            style={{
                              marginTop: '8px',
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '6px',
                            }}>
                            {Object.entries(selectedVariant.options).map(([key, value]) => {
                              if (!value || !String(value).trim()) return null;

                              const optionLabels: Record<string, string> = {
                                color: 'Колір',
                                size: 'Розмір',
                                material: 'Матеріал',
                                brand: 'Бренд',
                                taste: 'Смак',
                                origin: 'Походження',
                              };

                              const label = optionLabels[key] || key.charAt(0).toUpperCase() + key.slice(1);

                              return (
                                <Badge
                                  key={key}
                                  variant="outline"
                                  color="red"
                                  size="lg"
                                  style={{ textTransform: 'none' }}>
                                  {label}: {String(value)}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Деталі головного товару */}
              </div>
            )}
            {hasOptions && !selectedVariant && (
              <div
                style={{
                  marginTop: hasVariants ? '0' : '16px',
                  marginBottom: '16px',
                }}>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ marginTop: '28px' }}>
                    <strong>Характеристики:</strong>
                    <div
                      style={{
                        marginTop: '8px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px',
                      }}>
                      {Object.entries(product.options as Record<string, any>).map(([key, value]) => {
                        if (!value || !String(value).trim()) return null;

                        const optionLabels: Record<string, string> = {
                          color: 'Колір',
                          size: 'Розмір',
                          material: 'Матеріал',
                          brand: 'Бренд',
                          taste: 'Смак',
                          origin: 'Походження',
                        };

                        const label = optionLabels[key] || key.charAt(0).toUpperCase() + key.slice(1);

                        return (
                          <Badge
                            key={key}
                            variant="outline"
                            color="red"
                            size="lg"
                            style={{ textTransform: 'none' }}>
                            {label}: {String(value)}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Add to Cart Section */}
            <div className={styles.productDetails__actions}>
              {isInStock ? (
                <div className={styles.actionButtons}>
                  <div className={styles.actionButtonsWrapper}>
                    <div className={styles.quantitySelector}>
                      <button
                        className={styles.quantitySelector__button}
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}>
                        −
                      </button>
                      <input
                        type="number"
                        className={styles.quantitySelector__input}
                        value={quantity}
                        onChange={(e) => handleQuantityChange(Number(e.target.value))}
                        min="1"
                        max={availableQuantity}
                      />
                      <button
                        className={styles.quantitySelector__button}
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= availableQuantity}>
                        +
                      </button>
                    </div>
                    {hasSizeGuide && (
                      <Button variant="ghost" onClick={() => setSizeGuideOpened(true)} p={0}>
                        <Image src="/assets/img/btnInfo.jpg" width={50} height={50} alt="btninfo" />
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="secondary"
                    size="lg"
                    className={styles.buyNowButton}
                    onClick={handleAddToCart}>
                    <IconCart3 /> {getButtonText()}
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    className={`${styles.addToCartButton} ${isClicked ? styles.addToCartButton__success : ''}`}
                    onClick={() => {
                      handleAddToCart();
                      setTimeout(() => router.push('/checkout'), 500);
                    }}>
                    КУПИТИ ЗАРАЗ
                  </Button>
                </div>
              ) : (
                <div className={styles.actionButtons}>
                  <Button variant="primary" size="lg" fullWidth onClick={() => setNotifyModalOpened(true)}>
                    Сповістити мене про появу товару
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className={styles.productDescription}>
            <h2 className={styles.productDescription__title}>Опис </h2>
            <div
              className={styles.productDescription__content}
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(product.description) }}
            />
          </div>
        )}

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
