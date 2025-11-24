// src/shared/hooks/useTimeout.ts
import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook для безпечного setTimeout з автоматичним cleanup
 *
 * @example
 * const setTimeoutSafe = useTimeout();
 *
 * setTimeoutSafe(() => {
 *   console.log('Delayed action');
 * }, 1000);
 */
export const useTimeout = () => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const setTimeoutSafe = useCallback((callback: () => void, delay: number) => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(callback, delay);
  }, []);

  const clearTimeoutSafe = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return { setTimeoutSafe, clearTimeoutSafe };
};
