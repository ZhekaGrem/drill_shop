import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
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
        // ✅ ЦЕ ОБОВ'ЯЗКОВО! Middleware оновлює токени
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
  const { data: { user } } = await supabase.auth.getUser();

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

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf)).*)',
  ],
};