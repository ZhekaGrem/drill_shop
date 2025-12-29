import { ProductHeader } from './ProductHeader';
import { PriceDisplay } from './PriceDisplay';
import { VariantSelector } from './VariantSelector';
import { ProductActions } from './ProductActions';
import styles from '../../../../shared/styles/productDetails.module.scss';

interface ProductInfoSectionProps {
  product: any;
  selectedVariant: any;
  sortedVariants: any[];
  showVariantCheckboxes: boolean;
  isInStock: boolean;
  availableQuantity: number;
  quantity: number;
  currentWeight: number | null;
  hasSizeGuide: boolean;
  isClicked: boolean;
  buttonText: string;
  onVariantChange: (variantId: string | null) => void;
  getVariantDisplayValue: (variant: any) => string;
  getVariantStock: (variant: any) => number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  onOpenSizeGuide: () => void;
  onOpenNotifyModal: () => void;
  setSelectedVariant: (variant: any) => void;
  setIsMainProduct: (isMain: boolean) => void;
  setQuantity: (quantity: number) => void;
}

export const ProductInfoSection = ({
  product,
  selectedVariant,
  sortedVariants,
  showVariantCheckboxes,
  isInStock,
  availableQuantity,
  quantity,
  currentWeight,
  hasSizeGuide,
  isClicked,
  buttonText,
  onVariantChange,
  getVariantDisplayValue,
  getVariantStock,
  onQuantityChange,
  onAddToCart,
  onBuyNow,
  onOpenSizeGuide,
  onOpenNotifyModal,
  setSelectedVariant,
  setIsMainProduct,
  setQuantity,
}: ProductInfoSectionProps) => {
  return (
    <div className={styles.productDetails__info}>
      <ProductHeader productName={product.name} />

      <PriceDisplay
        product={product}
        selectedVariant={selectedVariant}
        unitDisplay={product.unitDisplay}
        currentWeight={currentWeight}
      />

      <VariantSelector
        product={product}
        sortedVariants={sortedVariants}
        selectedVariant={selectedVariant}
        showVariantCheckboxes={showVariantCheckboxes}
        onVariantChange={onVariantChange}
        getVariantDisplayValue={getVariantDisplayValue}
        getVariantStock={getVariantStock}
        setSelectedVariant={setSelectedVariant}
        setIsMainProduct={setIsMainProduct}
        setQuantity={setQuantity}
      />

      <ProductActions
        isInStock={isInStock}
        quantity={quantity}
        availableQuantity={availableQuantity}
        hasSizeGuide={hasSizeGuide}
        isClicked={isClicked}
        buttonText={buttonText}
        onQuantityChange={onQuantityChange}
        onAddToCart={onAddToCart}
        onBuyNow={onBuyNow}
        onOpenSizeGuide={onOpenSizeGuide}
        onOpenNotifyModal={onOpenNotifyModal}
      />
    </div>
  );
};
