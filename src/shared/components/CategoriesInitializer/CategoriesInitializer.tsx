// src/shared/components/CategoriesInitializer.tsx - INITIALIZE CATEGORIES ON APP START
'use client';

import { useEffect } from 'react';
import { useCategoriesStore } from '@/shared/stores/categories';

export const CategoriesInitializer = () => {
  const { fetchCategories, isInitialized, isLoading } = useCategoriesStore();

  useEffect(() => {
    // Initialize categories on app start if not already loaded
    if (!isInitialized && !isLoading) {
      fetchCategories();
    }
  }, [fetchCategories, isInitialized, isLoading]);

  // This component doesn't render anything
  return null;
};
