// src/shared/api/helpers.ts
import { AxiosResponse } from 'axios';

/**
 * Обробляє відповідь API з перевіркою success
 * @param response - Axios response
 * @param errorMessage - Повідомлення за замовчуванням при помилці
 * @returns Дані з response.data
 * @throws Error якщо success: false
 */
export const handleApiResponse = <T = any>(
  response: AxiosResponse,
  errorMessage: string = 'Request failed'
): T => {
  if (!response.data.success) {
    throw new Error(response.data.message || errorMessage);
  }
  return response.data;
};

/**
 * Обробляє помилки API з форматуванням
 * @param error - Помилка з try/catch
 * @param defaultMessage - Повідомлення за замовчуванням
 * @throws Форматована помилка
 */
export const handleApiError = (error: any, defaultMessage: string): never => {
  const message = error.response?.data?.message || error.message || defaultMessage;
  throw new Error(message);
};
