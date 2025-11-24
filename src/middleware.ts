import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
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
