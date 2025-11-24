// src/shared/hooks/useDebounce.ts
import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook для debounce функцій з автоматичним cleanup
 *
 * @example
 * const debouncedSearch = useDebounce((value: string) => {
 *   performSearch(value);
 * }, 300);
 *
 * // Використання
 * debouncedSearch('query');
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Оновлюємо callback ref при зміні
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
};
