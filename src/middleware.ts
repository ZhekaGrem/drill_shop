import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { SITE_CLOSED, isOpenWhileClosed } from '@/shared/config/site-closed';
import { siteClosedHtml } from '@/shared/utils/site-closed-page';

export async function middleware(request: NextRequest) {
  // 0. Сайт закрито (shared/config/site-closed.ts): одна відповідь одразу, без звертання до Supabase.
  // 503 + Retry-After — тимчасова перерва для пошуковиків; no-store — щоб CDN не тримав закриту сторінку після відкриття.
  if (SITE_CLOSED && !isOpenWhileClosed(request.nextUrl.pathname)) {
    return new NextResponse(siteClosedHtml(), {
      status: 503,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
        'retry-after': '86400',
        'x-robots-tag': 'noindex',
      },
    });
  }

  // 1. Створюємо відповідь одразу, щоб мати змогу писати в неї куки
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        // ✅ ЦЕ ОБОВʼЯЗКОВО! Middleware оновлює токени
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // 2. Оновлюємо сесію (це також викличе методи set/remove якщо треба)
  // getUser безпечніше ніж getSession, бо валідує юзера в БД, а не тільки JWT
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 3. Перевірка доступу до адмінки
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('from', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Опціонально: перевірка ролі (якщо вона в метаданих юзера, це швидко)
    // if (user.app_metadata.role !== 'admin') { ... }
  }

  // 4. Повертаємо response з оновленими куками
  return response;
}

// moto/ — бандл гри «Дріл Мото» (public/moto/: html, js, css, mrg, json, woff2):
// статика, якій сесія Supabase не потрібна. Сама сторінка /moto (без слеша)
// лишається під middleware, як і решта сторінок сайту.
export const config = {
  matcher: [
    '/((?!api|moto/|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf)).*)',
  ],
};
