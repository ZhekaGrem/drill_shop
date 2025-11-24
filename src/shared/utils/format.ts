// src/shared/utils/format.ts
export const formatPrice = (price: number): string => {
  if (typeof price !== 'number') {
    return '';
  }
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
};

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('uk-UA').format(num);
};
