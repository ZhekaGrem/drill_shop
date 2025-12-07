// src/features/auth/hooks/authHooks.ts - SUPABASE VERSION
import { useAuthStore } from '@/shared/stores/auth';
import { useRouter } from 'next/navigation';
import { useLayoutEffect } from 'react';

export const useAdminGuard = () => {
  const { userProfile, isAuthenticated, isInitialized } = useAuthStore();
  const router = useRouter();

  const isAdmin = userProfile?.role === 'ADMIN' || userProfile?.role === 'SUPER_ADMIN';
  const isManager = userProfile?.role === 'MANAGER' || isAdmin;

  // Guard logic
  useLayoutEffect(() => {
    // Still initializing - wait
    if (!isInitialized) return;

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      router.replace('/');
      return;
    }

    // Authenticated but not manager - redirect to home
    if (isAuthenticated && !isManager) {
      router.replace('/');
    }
  }, [isAuthenticated, isManager, isInitialized, router]);

  return {
    isAdmin,
    isManager,
    user: userProfile,
    canManageOrders: isManager,
    canManageProducts: isManager,
    canManageUsers: isAdmin,
    isLoading: !isInitialized,
  };
};

export const useAuthGuard = (requiredAuth: boolean = true) => {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const router = useRouter();

  useLayoutEffect(() => {
    // Still initializing - wait
    if (!isInitialized) return;

    // Need auth but not authenticated
    if (requiredAuth && !isAuthenticated) {
      router.replace('/');
    }

    // Don't need auth but is authenticated
    if (!requiredAuth && isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, requiredAuth, isInitialized, router]);

  return {
    isLoading: !isInitialized,
    isAuthenticated,
  };
};
