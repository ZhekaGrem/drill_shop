// src/features/wishes/api/wishes-api.ts
// Той самий контракт { success, message }, що в notify-availability.
export interface WishRequest {
  message: string;
  contact?: string;
  /** window.location.pathname — з якої сторінки написали */
  page: string;
  /** Honeypot — у людини завжди порожній рядок */
  website?: string;
}

export interface WishResponse {
  success: boolean;
  message?: string;
}

export const wishesApi = {
  sendWish: async (data: WishRequest): Promise<WishResponse> => {
    const response = await fetch('/api/telegram/wishes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = (await response.json().catch(() => ({}))) as WishResponse;
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Помилка відправлення');
    }
    return result;
  },
};
