// src/app/api/telegram/wishes/route.ts
// Побажання зі шторки (features/wishes) → адмін-чат Telegram. Той самий бот
// і чат, що в ../route.ts і ../notify-availability/route.ts. Відмінності
// свідомі: honeypot, серверні ліміти довжини (логіка у features/wishes/lib),
// текст без parse_mode (Markdown у сусідніх роутах ламається на зірочці
// в тексті користувача) і явний київський час (Vercel живе в UTC).
import { NextRequest, NextResponse } from 'next/server';
import { validateWish, formatWishMessage } from '@/features/wishes/lib/wish-message';
import { siteConfig } from '@/shared/config/site';

const TELEGRAM_API = 'https://api.telegram.org';

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Напиши хоч кілька слів' }, { status: 400 });
  }

  // Honeypot: поле бачать лише боти. Відповідаємо як на успіх —
  // бот не має дізнатись, що його впіймали.
  const website = (body as { website?: unknown } | null)?.website;
  if (typeof website === 'string' && website.trim() !== '') {
    return NextResponse.json({ success: true });
  }

  const validation = validateWish(body);
  if (!validation.ok) {
    return NextResponse.json({ success: false, message: validation.error }, { status: 400 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) {
    console.error('Wishes: missing Telegram configuration');
    return NextResponse.json({ success: false, message: 'Помилка конфігурації' }, { status: 500 });
  }

  try {
    const response = await fetch(`${TELEGRAM_API}/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: formatWishMessage(validation.wish, siteConfig.url, new Date()),
      }),
    });
    if (!response.ok) {
      console.error('Wishes: Telegram API error', await response.text());
      throw new Error('telegram');
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    // Сирий error не логуємо: ланцюжок помилок undici може нести URL
    // запиту, а в ньому — токен бота.
    console.error('Wishes: send failed', error instanceof Error ? error.name : 'unknown');
    return NextResponse.json({ success: false, message: 'Помилка відправлення' }, { status: 500 });
  }
}
