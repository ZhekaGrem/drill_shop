// src/features/notify-availability/api/notify-api.ts
export interface NotifyAvailabilityRequest {
  productName: string;
  productSlug: string;
  contactMethod: 'telegram' | 'email' | 'instagram';
  contactValue: string;
  variantName?: string;
}

export interface NotifyAvailabilityResponse {
  success: boolean;
  message: string;
}

export const notifyAvailabilityApi = {
  sendNotification: async (data: NotifyAvailabilityRequest): Promise<NotifyAvailabilityResponse> => {
    try {
      const response = await fetch('/api/telegram/notify-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Помилка відправлення');
      }

      return result;
    } catch (error) {
      console.error('Notify availability API error:', error);
      throw new Error(error instanceof Error ? error.message : 'Помилка мережі');
    }
  },
};
