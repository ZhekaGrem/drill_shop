// src/app/api/telegram/notify-availability/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface NotifyAvailabilityData {
  productName: string;
  productSlug: string;
  contactMethod: 'telegram' | 'email' | 'instagram';
  contactValue: string;
  variantName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { productName, productSlug, contactMethod, contactValue, variantName }: NotifyAvailabilityData =
      await request.json();

    if (!productName || !contactMethod || !contactValue) {
      return NextResponse.json(
        { success: false, message: "Заповніть всі обов'язкові поля" },
        { status: 400 }
      );
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error('Missing Telegram configuration');
      return NextResponse.json({ success: false, message: 'Помилка конфігурації' }, { status: 500 });
    }

    const contactMethodLabels = {
      telegram: 'Telegram',
      email: 'Email',
      instagram: 'Instagram',
    };

    const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://shop.com'}/catalog/${productSlug}`;

    const telegramMessage = `
#чекаю

 *Очікування товару*

 *Товар:* ${productName}
${variantName ? `🏷 *Варіант:* ${variantName}` : ''}
 *Посилання:* [Переглянути товар](${productUrl})

 *Спосіб зв'язку:* ${contactMethodLabels[contactMethod]}
 *Контакт:* ${contactValue}

 *Час запиту:* ${new Date().toLocaleString('uk-UA')}
    `.trim();

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramMessage,
        parse_mode: 'Markdown',
      }),
    });

    if (!telegramResponse.ok) {
      const errorData = await telegramResponse.json();
      console.error('Telegram API error:', errorData);
      throw new Error('Failed to send Telegram message');
    }

    return NextResponse.json({
      success: true,
      message: "Ваш запит успішно відправлено. Ми зв'яжемось з вами, коли товар з'явиться.",
    });
  } catch (error) {
    console.error('Notify availability error:', error);
    return NextResponse.json({ success: false, message: 'Помилка відправлення запиту' }, { status: 500 });
  }
}
