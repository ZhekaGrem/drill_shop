import { Box, Badge, Menu, Button } from '@mantine/core';
import styles from '../../../../shared/styles/productDetails.module.scss';

interface VariantSelectorProps {
  product: any;
  sortedVariants: any[];
  selectedVariant: any;
  showVariantCheckboxes: boolean;
  onVariantChange: (variantId: string | null) => void;
  getVariantDisplayValue: (variant: any) => string;
  getVariantStock: (variant: any) => number;
  setSelectedVariant: (variant: any) => void;
  setIsMainProduct: (isMain: boolean) => void;
  setQuantity: (quantity: number) => void;
}

export const VariantSelector = ({
  product,
  sortedVariants,
  selectedVariant,
  showVariantCheckboxes,
  onVariantChange,
  getVariantDisplayValue,
  getVariantStock,
  setSelectedVariant,
  setIsMainProduct,
  setQuantity,
}: VariantSelectorProps) => {
  const hasVariants = product.variants && product.variants.length > 0;
  const hasOptions =
    product.options && typeof product.options === 'object' && Object.keys(product.options).length > 0;

  if (!hasVariants) return null;

  const createVariantDisplayLabel = (variant: any): string => {
    return variant.name || `Варіант ${variant.sku}`;
  };

  return (
    <div className={styles.productDetails__variants}>
      {/* Якщо варіанти мають size/color - показуємо чекбокси */}
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
                  className={`${styles.variantCheckbox} ${isOutOfStock ? styles.variantCheckbox_disabled : ''}`}>
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
        // Інакше - показуємо Menu
        <div>
          <label className={styles.variantLabel}>Варіант:</label>
          <Menu
            shadow="md"
            width={300}
            classNames={{
              dropdown: styles.variantDropdown,
              item: styles.variantMenuItem,
            }}>
            <Menu.Target>
              <Button
                variant="default"
                fullWidth
                styles={{
                  root: {
                    border: 'var(--border-width) solid var(--border-color)',
                    background: 'var(--background)',
                    color: 'var(--text-primary)',
                    fontWeight: 'var(--fw-lg)',
                    fontSize: 'var(--text-base)',
                    padding: '10px var(--spacing-md)',
                    borderRadius: 0,
                    height: 'auto',
                    '&:hover': {
                      background: 'var(--background-secondary)',
                    },
                  },
                }}>
                {selectedVariant
                  ? createVariantDisplayLabel(selectedVariant)
                  : !product.hasVariants
                    ? product.name
                    : 'Оберіть варіант'}
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              {!product.hasVariants && (
                <Menu.Item
                  onClick={() => {
                    onVariantChange('main');
                    setQuantity(1);
                  }}>
                  {product.name}
                </Menu.Item>
              )}
              {sortedVariants.map((variant: any) => (
                <Menu.Item
                  key={variant.id}
                  onClick={() => {
                    onVariantChange(variant.id);
                    setQuantity(1);
                  }}>
                  {createVariantDisplayLabel(variant)}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        </div>
      )}

      {/* Деталі обраного варіанта */}
      {selectedVariant && selectedVariant.options && (
        <Box mt={16}>
          <Box style={{ display: 'grid', gap: '8px' }}>
            {Object.keys(selectedVariant.options).length > 0 && (
              <Box mt={12}>
                <strong>Характеристики:</strong>
                <Box mt={8} style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
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
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Деталі головного товару */}
      {hasOptions && !selectedVariant && (
        <Box mt={hasVariants ? 0 : 16} mb={16}>
          <Box style={{ display: 'grid', gap: '8px' }}>
            <Box mt={28}>
              <strong>Характеристики:</strong>
              <Box mt={8} style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
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
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </div>
  );
};
