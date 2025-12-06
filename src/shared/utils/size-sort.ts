// src/shared/utils/size-sort.ts

/**
 * Правильний порядок для літерних розмірів
 */
const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '3XL', '4XL'];

/**
 * Визначає тип розміру
 */
function getSizeType(size: string): 'letter' | 'number' | 'other' {
  const normalized = size.trim().toUpperCase();

  // Літерні розміри
  if (SIZE_ORDER.includes(normalized)) {
    return 'letter';
  }

  // Числові розміри (46, 47, 48 або 46-48)
  if (/^\d+(-\d+)?$/.test(normalized)) {
    return 'number';
  }

  return 'other';
}

/**
 * Отримує числове значення для сортування розміру
 */
function getSizeSortValue(size: string): number {
  const normalized = size.trim().toUpperCase();
  const type = getSizeType(size);

  if (type === 'letter') {
    const index = SIZE_ORDER.indexOf(normalized);
    return index !== -1 ? index : 999;
  }

  if (type === 'number') {
    // Для розмірів типу "46-48" беремо перше число
    const match = normalized.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : 999;
  }

  return 1000; // Інші розміри - в кінець
}

/**
 * Порівнює два розміри для сортування
 */
export function compareSizes(a: string, b: string): number {
  const valueA = getSizeSortValue(a);
  const valueB = getSizeSortValue(b);

  if (valueA !== valueB) {
    return valueA - valueB;
  }

  // Якщо однакові значення - алфавітне сортування
  return a.localeCompare(b, 'uk-UA');
}

/**
 * Сортує масив розмірів в правильному порядку
 * @example
 * sortSizes(['L', 'XS', 'M', 'XL']) // => ['XS', 'M', 'L', 'XL']
 * sortSizes(['48', '46', '47']) // => ['46', '47', '48']
 */
export function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort(compareSizes);
}

/**
 * Сортує варіанти продукту за розміром
 * Шукає поле 'size' в options і сортує по ньому
 */
export function sortVariantsBySize<T extends { options?: Record<string, any> }>(variants: T[]): T[] {
  return [...variants].sort((a, b) => {
    const aSize = getSizeFromOptions(a.options);
    const bSize = getSizeFromOptions(b.options);

    // Якщо обидва мають розмір - сортуємо
    if (aSize && bSize) {
      return compareSizes(aSize, bSize);
    }

    // Якщо тільки один має розмір - він йде першим
    if (aSize && !bSize) return -1;
    if (!aSize && bSize) return 1;

    // Якщо обидва без розміру - не змінюємо порядок
    return 0;
  });
}

/**
 * Допоміжна функція - дістає розмір з options
 */
function getSizeFromOptions(options?: Record<string, any>): string | null {
  if (!options) return null;

  // Шукаємо ключ 'size' (case-insensitive)
  const sizeKey = Object.keys(options).find(key => key.toLowerCase() === 'size');

  if (sizeKey && options[sizeKey]) {
    return String(options[sizeKey]);
  }

  return null;
}

/**
 * Сортує варіанти за кольором або іншою опцією (алфавітно)
 */
export function sortVariantsByOption<T extends { options?: Record<string, any> }>(
  variants: T[],
  optionKey: string
): T[] {
  return [...variants].sort((a, b) => {
    const aValue = getOptionValue(a.options, optionKey);
    const bValue = getOptionValue(b.options, optionKey);

    if (!aValue && !bValue) return 0;
    if (!aValue) return 1;
    if (!bValue) return -1;

    return aValue.localeCompare(bValue, 'uk-UA');
  });
}

function getOptionValue(options: Record<string, any> | undefined, key: string): string | null {
  if (!options) return null;

  const foundKey = Object.keys(options).find(k => k.toLowerCase() === key.toLowerCase());
  return foundKey && options[foundKey] ? String(options[foundKey]) : null;
}
