'use client';
import { useEffect, useState, useMemo, useRef, ViewTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductCard } from '@/features/catalog/components/ProductCard/ProductCard';
import { productsApi, ProductResponse } from '@/features/catalog/api/products';
import { Product, ProductWithRelations } from '@/shared/types';
import { Select } from '@mantine/core';
import { IconChevronDown, IconChevronUp, IconRuler } from '@tabler/icons-react';
import { Button } from '@/shared/components/Button/Button';
import { Page } from '@/shared/components/Page/Page';
import { Breadcrumbs } from '@/shared/components/Breadcrumbs';
import { Section } from '@/shared/components/Section/Section';
import { ListGroup, ListRow } from '@/shared/components/ListGroup/ListGroup';
import { ServicesGroup } from '@/shared/components/ServicesGroup/ServicesGroup';
import { ArrowLeft, ArrowRight } from '@/shared/components/Svg';
import { useCart } from '@/features/cart/hooks/useCart';
import styles from './productDetails.module.scss';
import { getImageUrl } from '@/shared/utils/image';
import { ProductBadges } from '@/features/catalog/components/ProductBadges/ProductBadges';
import { calculatePromoPrice, calculateVariantPromoPrice } from '@/shared/utils/promo-calculator';
import { CloudinaryImage } from '@/shared/components/CloudinaryImage/CloudinaryImage';
import { SizeGuideModal } from '@/shared/components/SizeGuideModal';
import { IconCart3 } from '@/shared/components/Svg';
import { sortVariantsBySize } from '@/shared/utils/size-sort';
import { NotifyAvailabilityModal } from '@/features/notify-availability';
import { ImageGalleryModal } from '@/shared/components/ImageGalleryModal';

interface ProductDetailsProps {
  initialProduct?: ProductWithRelations;
  basePath?: string;
}

// Людські назви для ключів options. Раніше цей словник був продубльований
// двома копіями всередині JSX — по одній на варіант і на головний товар.
const OPTION_LABELS: Record<string, string> = {
  color: 'Колір',
  size: 'Розмір',
  material: 'Матеріал',
  brand: 'Бренд',
  taste: 'Смак',
  origin: 'Походження',
};

// Показуємо залишок тільки коли він справді малий — інакше це не терміновість,
// а шум. Поріг збігається з тим, що менеджер вважає «закінчується».
const LOW_STOCK_THRESHOLD = 5;

const toSpecRows = (options?: Record<string, unknown> | null) =>
  Object.entries(options || {})
    .filter(([, value]) => value && String(value).trim())
    .map(([key, value]) => ({
      label: OPTION_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1),
      value: String(value),
    }));

export default function ProductDetailsClient({ initialProduct, basePath = '' }: ProductDetailsProps) {
  const { addItem, isAddingItem } = useCart();
  const [product, setProduct] = useState<ProductWithRelations | null>(initialProduct || null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>(initialProduct?.relatedProducts || []);
  const [isLoading, setIsLoading] = useState(!initialProduct);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [isClicked, setIsClicked] = useState(false);
  const [sizeGuideOpened, setSizeGuideOpened] = useState(false);
  const [notifyModalOpened, setNotifyModalOpened] = useState(false);
  const [showScrollArrows, setShowScrollArrows] = useState(false);
  const [galleryOpened, setGalleryOpened] = useState(false);
  const [variantError, setVariantError] = useState<string | null>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const variantsRef = useRef<HTMLDivElement>(null);

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
    } else if (product && !product.hasVariants) {
      setSelectedVariant(null);
    }
  }, [product?.hasVariants, product?.variants]);

  // Стрілки скролу потрібні рівно тоді, коли список мініатюр справді не влазить
  // у свою колонку. Раніше порогом було «більше 6 фото», хоча висота колонки
  // вміщала 3–4: на 5 фото частина списку була невидима, скролбар прихований
  // css-ом, стрілок немає — і жодного натяку, що там ще щось є.
  useEffect(() => {
    const list = thumbnailsRef.current;
    if (!list) {
      setShowScrollArrows(false);
      return;
    }

    const update = () => setShowScrollArrows(list.scrollHeight > list.clientHeight + 1);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(list);
    return () => observer.disconnect();
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

    // Повідомлення стоїть біля самих чіпів варіантів, а не нативним alert()
    // посеред екрана (Nielsen #9: помилку показуємо там, де вона сталась)
    if (product.hasVariants && !selectedVariant) {
      setVariantError('Оберіть варіант товару');
      // Дію можна натиснути з липкої панелі, а чіпи варіантів на той момент
      // уже за кадром — сам напис про помилку людина б не побачила.
      variantsRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }

    setVariantError(null);
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

    // Кількість зі сторінки товару прибрана (рішення власника) — завжди 1;
    // докупити більше можна степером у кошику
    if (selectedVariant) {
      addItem(product.id, 1, selectedVariant.id, productData);
    } else {
      addItem(product.id, 1, undefined, productData);
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

  // Характеристики: обраний варіант перекриває базові опції товару
  const specRows = useMemo(
    () => toSpecRows(selectedVariant?.options ?? product?.options),
    [selectedVariant, product?.options]
  );

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

  // Архівна колекція: товар лишається на вітрині, але контролі покупки
  // не рендеряться. Бекенд-гард у кошику дублює це для прямих викликів API.
  const collectionArchived = Boolean(product?.collection?.archivedAt);

  // Статус наявності словами, а не тільки кольором кнопки: людині перед покупкою
  // важливо бачити, що саме її чекає — і чи варто поспішати
  const stockLabel = collectionArchived
    ? 'Продаж завершено'
    : !isInStock
      ? 'Немає в наявності'
      : availableQuantity <= LOW_STOCK_THRESHOLD
        ? `Залишилось ${availableQuantity} шт`
        : 'Виготовлення і доставка — до 7 днів';

  const handlePreviousImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1));
  };

  // Крок скролу = мініатюра (88px) + проміжок (8px), тобто рівно одна картка.
  // Через ref, а не document.querySelector по згенерованому класу.
  const scrollThumbnails = (direction: 1 | -1) => {
    thumbnailsRef.current?.scrollBy({ top: direction * 96, behavior: 'smooth' });
  };

  const getCurrentWeight = () => {
    return selectedVariant ? selectedVariant.unitValue : product?.unitValue;
  };

  const getButtonText = () => {
    if (isClicked) return 'Додано в кошик';
    if (isAddingItem) return 'Додавання…';
    if (!isInStock) return 'Немає в наявності';

    return 'Додати в кошик';
  };

  // Скелетон повторює фінальний каркас (крихти, дві картки, фото 3:4), щоб
  // підміна не зсувала макет. Раніше це були сірі прямокутники іншої форми.
  if (isLoading) {
    return (
      <Page className={styles.productPage}>
        <div className={styles.productPage__loading} aria-busy="true" aria-label="Завантаження товару">
          <div className={styles.productSkeleton__crumbs} />
          <div className={styles.productSkeleton}>
            <div className={styles.productSkeleton__images}>
              <div className={styles.productSkeleton__photo} />
            </div>
            <div className={styles.productSkeleton__content}>
              <div className={styles.productSkeleton__title} />
              <div className={styles.productSkeleton__meta} />
              <div className={styles.productSkeleton__price} />
              <div className={styles.productSkeleton__description} />
              <div className={styles.productSkeleton__actions} />
            </div>
          </div>
        </div>
      </Page>
    );
  }

  if (error || !product) {
    return (
      <Page className={styles.productPage}>
        <div className={styles.productPage__error}>
          <h1>Товар не знайдено</h1>
          <p>{error || 'Товар за цією адресою не існує'}</p>
          <Button onClick={() => router.push(`${basePath}/catalog`)}>Повернутися до каталогу</Button>
        </div>
      </Page>
    );
  }

  // Turntable-рендери (webp-оберти для карток каталогу) — не фото товару:
  // у галереї їм не місце, тож відсіюємо за Cloudinary-папкою
  const images = (product.images || []).filter((i) => !i.url?.includes('/turntable'));
  const sortedImages = [...images].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return (a.sortOrder || 0) - (b.sortOrder || 0);
  });
  const primaryImage = sortedImages[0] || images[0];
  const hasVariants = product.variants && product.variants.length > 0;

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
    <Page className={styles.productPage}>
      <div>
        {/* Крихти — спільний <Breadcrumbs>, а не власна розмітка сторінки:
            раніше вони існували тільки тут і тільки в цьому вигляді */}
        <Breadcrumbs
          items={[
            { label: 'Головна', href: `${basePath}/` },
            { label: 'Каталог', href: `${basePath}/catalog` },
            { label: product.name },
          ]}
        />

        {/* Product Details */}
        <div className={styles.productDetails}>
          {/* Images */}
          <div className={styles.productDetails__images}>
            <div className={styles.productGallery}>
              {/* Thumbnails - тепер зліва */}
              {sortedImages.length > 1 && (
                <div className={styles.productGallery__thumbnailsWrapper}>
                  <div className={styles.productGallery__thumbnails} ref={thumbnailsRef}>
                    {sortedImages.map((image, index) => (
                      <button
                        key={image.id}
                        type="button"
                        className={`${styles.productGallery__thumbnail} ${
                          index === selectedImageIndex ? styles.productGallery__thumbnailActive : ''
                        }`}
                        aria-label={`Показати зображення ${index + 1}`}
                        aria-current={index === selectedImageIndex}
                        onClick={() => setSelectedImageIndex(index)}>
                        <CloudinaryImage
                          src={getImageUrl(image.url || image.publicId)}
                          alt={image.altText || product.name}
                          width={88}
                          height={88}
                        />
                      </button>
                    ))}
                  </div>

                  {showScrollArrows && (
                    <>
                      <button
                        type="button"
                        className={`${styles.productGallery__scrollArrow} ${styles.productGallery__scrollArrowUp}`}
                        onClick={() => scrollThumbnails(-1)}
                        aria-label="Прокрутити мініатюри вгору">
                        <IconChevronUp size={20} stroke={1.5} />
                      </button>
                      <button
                        type="button"
                        className={`${styles.productGallery__scrollArrow} ${styles.productGallery__scrollArrowDown}`}
                        onClick={() => scrollThumbnails(1)}
                        aria-label="Прокрутити мініатюри вниз">
                        <IconChevronDown size={20} stroke={1.5} />
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Main Image справа від thumbnails */}
              <div className={styles.productGallery__main}>
                <div
                  className={styles.productGallery__mainImageWrapper}
                  role="button"
                  tabIndex={0}
                  aria-label="Відкрити фото на весь екран"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setGalleryOpened(true);
                    }
                  }}
                  onClick={() => setGalleryOpened(true)}>
                  {/* Пара до фото в ProductCard (однаковий name) — фото картки
                      перетікає сюди при переході з каталогу. */}
                  <ViewTransition name={`product-${product.id}`} share="morph" default="none">
                    <CloudinaryImage
                      src={getImageUrl(
                        sortedImages[selectedImageIndex]?.url ||
                          sortedImages[selectedImageIndex]?.publicId ||
                          primaryImage?.url ||
                          primaryImage?.publicId
                      )}
                      alt={product.name}
                      className={styles.productGallery__mainImage}
                      width={390}
                      height={580}
                    />
                  </ViewTransition>

                  {/* Іконка збільшення */}
                  <div className={styles.productGallery__zoomIcon}>
                    <svg
                      width="20"
                      height="16"
                      viewBox="0 0 20 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M0 0H20V16H0V0ZM2 14H18V2H2V14ZM6 4H8V6H6V8H4V4H6ZM14 12H12V10H14V8H16V12H14Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>

                  {/* Navigation arrows - показуємо тільки якщо є більше 1 зображення */}
                  {sortedImages.length > 1 && (
                    <>
                      <button
                        className={`${styles.productGallery__arrow} ${styles.productGallery__arrowLeft}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviousImage();
                        }}
                        aria-label="Попереднє зображення">
                        <ArrowLeft size={20} />
                      </button>
                      <button
                        className={`${styles.productGallery__arrow} ${styles.productGallery__arrowRight}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNextImage();
                        }}
                        aria-label="Наступне зображення">
                        <ArrowRight size={20} />
                      </button>
                    </>
                  )}

                  {/* Крапки — навігація для екранів, де мініатюр не видно.
                      CSS показує їх тільки на мобільному: на десктопі вони були
                      четвертим способом гортати ту саму галерею. */}
                  {sortedImages.length > 1 && (
                    <div className={styles.productGallery__dots}>
                      {sortedImages.map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          className={`${styles.productGallery__dot} ${
                            index === selectedImageIndex ? styles.productGallery__dotActive : ''
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex(index);
                          }}
                          aria-label={`Зображення ${index + 1}`}
                          aria-current={index === selectedImageIndex}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Бейджі й обране — один ряд, вирівняний по центру. Кожен з
                    них раніше був приклеєний до свого кута окремо, тож плашка
                    24px і кнопка 44px розходились низами. */}
                <div className={styles.galleryOverlayTop}>
                  <ProductBadges
                    product={product}
                    selectedVariant={selectedVariant}
                    className={styles.galleryBadges}
                  />
                  {/* Сердечко-обране прибране з клієнтської сторінки (рішення власника) */}
                </div>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className={styles.productDetails__info}>
            <div className={styles.productDetails__container}>
              <h1 className={styles.productDetails__title}>{product.name}</h1>

              {/* Артикул і рейтинг клієнтам не показуємо (відгуки прибрані зі
                  сторінки — рейтинг-плашка вела б на якір, якого нема) */}
              <div className={styles.productDetails__meta}>
                <span
                  className={`${styles.productDetails__availability} ${
                    isInStock && !collectionArchived ? '' : styles.productDetails__availability_out
                  }`}>
                  {stockLabel}
                </span>
              </div>

              {product.shortDescription && (
                <p className={styles.productDetails__shortDescription}>{product.shortDescription}</p>
              )}

              <div className={styles.productDetails__price}>
                {selectedVariant ? (
                  // Показуємо ціну обраного варіанту з акцією (якщо є)
                  (() => {
                    const variantPriceData = calculateVariantPromoPrice(selectedVariant);
                    if (variantPriceData.hasDiscount) {
                      return (
                        <>
                          {/* Було style={{ color: '#999' }} інлайном — 2.85:1 на
                              білому при потрібних 4.5:1 (WCAG 1.4.3 AA). Вигляд
                              задає клас, який бере --text-secondary (6.29:1). */}
                          <span className={styles.productDetails__originalPrice}>
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
                    <span className={styles.productDetails__originalPrice}>
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
                )}
                {product.unitDisplay && (
                  <span className={styles.productDetails__unit}>{product.unitDisplay}</span>
                )}
              </div>

              {/* Variants Selector */}
              {!collectionArchived && hasVariants && sortedVariants.length > 0 && (
                <div className={styles.productDetails__variants} ref={variantsRef}>
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
                              {/* radio, а не checkbox: вибір варіанта
                                  взаємовиключний. У картці каталогу цей самий
                                  контрол уже radio — скрінрідер оголошував два
                                  різні контроли для однієї сутності. */}
                              <input
                                type="radio"
                                name={`variant-${product.id}`}
                                checked={selectedVariant?.id === variant.id}
                                disabled={isOutOfStock}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  if (!isOutOfStock) {
                                    setSelectedVariant(variant);
                                    setVariantError(null);
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
                        } else {
                          const variant = sortedVariants.find((v) => v.id === value);
                          setSelectedVariant(variant);
                        }
                        setVariantError(null);
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
                </div>
              )}

              {variantError && (
                <p className={styles.variantError} role="alert">
                  {variantError}
                </p>
              )}

              {/* Add to Cart Section */}
              <div className={styles.productDetails__actions}>
                {collectionArchived ? (
                  <p className={styles.archivedNotice}>
                    Архівна колекція «{product.collection?.title}» — лишається на вітрині, але купити її вже
                    не можна.
                  </p>
                ) : isInStock ? (
                  <>
                    {/* Кількість зі сторінки прибрана (рішення власника):
                        купується завжди 1 шт, докупити більше — у кошику */}
                    {/* «Купити зараз» і липка панель-дублер прибрані (рішення
                        власника) — головна дія одна: «Додати в кошик» у картці */}
                    <div className={styles.actionButtons}>
                      <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        className={styles.addToCartButton}
                        onClick={handleAddToCart}>
                        <IconCart3 /> {getButtonText()}
                      </Button>
                    </div>
                  </>
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
        </div>

        {/* Те, що людина шукає ПЕРЕД покупкою: склад, розмір, доставка, повернення.
            Раніше цього на сторінці не було взагалі — після кнопки одразу йшов опис.
            Групи лежать НА фоні сторінки, а не всередині білої інфо-картки:
            біле на білому не читається як окремий блок. */}
        <div className={styles.productInfoGroups}>
          {specRows.length > 0 && (
            <ListGroup>
              {specRows.map((spec) => (
                <ListRow key={spec.label} title={spec.label} value={spec.value} />
              ))}
            </ListGroup>
          )}

          {hasSizeGuide && (
            <ListGroup>
              <ListRow
                onClick={() => setSizeGuideOpened(true)}
                media={<IconRuler stroke={1.5} />}
                title="Розмірна сітка"
                hint="Заміри та посадка для цієї категорії"
              />
            </ListGroup>
          )}

          <ServicesGroup />
        </div>

        {/* Опис на всю ширину. Раніше він лежав у правій колонці сітки — вузька
            колонка розтягувалась на кілька екранів, поки ліва (галерея)
            закінчувалась угорі, і сторінка ставала кривою. */}
        {/* Опис прибраний з клієнтської сторінки (рішення власника) */}

        {/* Схожі товари. Верхній відступ секції дає сам <Section>
            (--section-gap) — власного класу тут не було в модулі взагалі,
            тобто на компонент летіло className={undefined} */}
        {relatedProducts.length > 0 && (
          <Section title="Схожі товари" action={{ href: `${basePath}/catalog`, label: 'Весь каталог' }}>
            <div className={styles.relatedProducts__grid}>
              {relatedProducts.slice(0, 4).map((relatedProduct, index) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  className={index === 3 ? styles.mobileOnly : undefined}
                />
              ))}
            </div>
          </Section>
        )}

        {/* Відгуки прибрані з клієнтської сторінки (рішення власника).
            ВАЖЛИВО: JSON-LD (page.tsx → structuredData) НЕ має віддавати
            aggregateRating/review — розмітка невидимого контенту порушує
            вимоги rich results. */}

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

        {/* Image Gallery Modal */}
        <ImageGalleryModal
          images={sortedImages}
          opened={galleryOpened}
          onClose={() => setGalleryOpened(false)}
          initialIndex={selectedImageIndex}
          productName={product.name}
        />

      </div>
    </Page>
  );
}
