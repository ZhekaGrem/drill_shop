import { useState, useEffect } from 'react';
import { productsApi, ProductResponse } from '../api/products';
import { ProductWithRelations } from '@/shared/types';

interface UseProductDetailsProps {
  slug: string;
  initialProduct?: ProductWithRelations;
}

export const useProductDetails = ({ slug, initialProduct }: UseProductDetailsProps) => {
  const [product, setProduct] = useState<ProductWithRelations | null>(initialProduct || null);
  const [relatedProducts, setRelatedProducts] = useState(initialProduct?.relatedProducts || []);
  const [isLoading, setIsLoading] = useState(!initialProduct);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!initialProduct && slug) {
      fetchProduct();
    }
  }, [slug, initialProduct]);

  return {
    product,
    relatedProducts,
    isLoading,
    error,
    refetch: fetchProduct,
  };
};
