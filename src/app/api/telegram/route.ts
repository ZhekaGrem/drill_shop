// src/app/api/telegram/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface ContactFormData {
  name: string;
  phone?: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const { name, phone, message }: ContactFormData = await request.json();

    // Validate required fields
    if (!name || !message) {
      return NextResponse.json({ success: false, message: "Заповніть обов'язкові поля" }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error('Missing Telegram configuration');
      return NextResponse.json({ success: false, message: 'Помилка конфігурації' }, { status: 500 });
    }

    // Format message
    const telegramMessage = `
 *Нове звернення з сайту*

 *Ім'я:* ${name}
${phone ? ` *Телефон:* ${phone}` : ''}

💬 *Повідомлення:*
${message}

 *Час відправки:* ${new Date().toLocaleString('uk-UA')}
    `.trim();

    // Send to Telegram
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
      message: 'Повідомлення надіслано успішно',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { success: false, message: 'Помилка відправлення повідомлення' },
      { status: 500 }
    );
  }
}
