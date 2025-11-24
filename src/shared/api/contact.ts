// src/shared/api/contact.ts
interface ContactFormData {
  name: string;
  phone?: string;
  message: string;
}

interface ContactResponse {
  success: boolean;
  message: string;
}

export const sendContactMessage = async (data: ContactFormData): Promise<ContactResponse> => {
  try {
    const response = await fetch('/api/telegram', {
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
    console.error('Contact API error:', error);
    throw new Error(error instanceof Error ? error.message : 'Помилка мережі');
  }
};
