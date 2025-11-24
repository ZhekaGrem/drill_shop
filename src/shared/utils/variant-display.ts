// src/shared/utils/variant-display.ts

export interface VariantBadge {
  key: string;
  label: string;
  value: string;
}

// Мап для українських назв опцій
const OPTION_LABELS: Record<string, string> = {
  size: 'Розмір',
  color: 'Колір',
  material: 'Матеріал',
  brand: 'Бренд',
  taste: 'Смак',
  origin: 'Походження',
};

/**
 * Форматує опції варіанта в строку (для компактного відображення)
 * Приклад: "M, Синій" або "100г"
 */
export const formatVariantOptions = (options: Record<string, any> | null | undefined): string => {
  if (!options || Object.keys(options).length === 0) {
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

/**
 * Отримує масив Badge-ів для відображення опцій варіанта
 * Приклад: [{key: 'size', label: 'Розмір', value: 'M'}, {key: 'color', label: 'Колір', value: 'Синій'}]
 */
export const getVariantDisplayBadges = (options?: any): VariantBadge[] => {
  if (!options || typeof options !== 'object') return [];

  return Object.entries(options)
    .filter(([_, value]) => value && String(value).trim())
    .map(([key, value]) => ({
      key,
      label: OPTION_LABELS[key.toLowerCase()] || key.charAt(0).toUpperCase() + key.slice(1),
      value: String(value),
    }));
};

/**
 * Перевіряє чи варіант має size або color опції (для відображення в каталозі)
 */
export const hasDisplayableOptions = (options: Record<string, any> | null | undefined): boolean => {
  if (!options) return false;

  const keys = Object.keys(options).map((k) => k.toLowerCase());
  return keys.includes('size') || keys.includes('color');
};

/**
 * Отримує значення для відображення в каталозі (пріоритет: size > color > інше)
 */
export const getVariantDisplayValue = (options: Record<string, any> | null | undefined): string => {
  if (!options) return '';

  // Пріоритет для size
  const sizeKey = Object.keys(options).find((k) => k.toLowerCase() === 'size');
  if (sizeKey && options[sizeKey]) return String(options[sizeKey]);

  // Потім color
  const colorKey = Object.keys(options).find((k) => k.toLowerCase() === 'color');
  if (colorKey && options[colorKey]) return String(options[colorKey]);

  // Інше
  const firstValue = Object.values(options).find((v) => v && String(v).trim());
  return firstValue ? String(firstValue) : '';
};
