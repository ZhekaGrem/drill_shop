import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ✅ КРИТИЧНИЙ ФІКС: matcher виключає статичні файли
export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, sitemap.xml
     * - public files (images, fonts)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf)).*)',
  ],
};

export function middleware(request: NextRequest) {
  // Redirects для старих URL
  const redirects: Record<string, string> = {
    '/delivery': '/delivery-and-payment',
    '/returns': '/returns-exchanges',
    '/terms': '/public-offer',
  };

  const redirect = redirects[request.nextUrl.pathname];
  if (redirect) {
    return NextResponse.redirect(new URL(redirect, request.url));
  }

  // CSRF protection для форм
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const token = request.headers.get('X-CSRF-Token');
    const cookie = request.cookies.get('csrf-token');

    if (!token || token !== cookie?.value) {
      // Дозволяємо API routes (вони мають свою auth)
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.next();
      }
      // ❌ КРИТИЧНИЙ ФІКС БЕЗПЕКИ: блокуємо запит з недійсним CSRF-токеном
      return new NextResponse('Invalid CSRF token', { status: 403 });
    }
  }

  return NextResponse.next();
}
