import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createHash, timingSafeEqual } from 'node:crypto';

// ISR / revalidatePath підтримуються лише в Node.js runtime (не Edge)
export const runtime = 'nodejs';

type RevalidateEvent = 'create' | 'update' | 'delete';

interface RevalidateBody {
  event: RevalidateEvent;
  slug: string;
  oldSlug?: string;
}

// Спільний секрет ревалідації — захардкоджений (той самий, що в backend RevalidationService).
// Приватні репо; це серверний роут (значення в браузер не потрапляє). Якщо репо стане публічним — змінити.
const REVALIDATE_SECRET = '19f46aa17739250414bd7ae169030d88dcc44caf00780389750fa0fced4fcc5a';

// Constant-time звірка секрета (хешуємо обидва боки → стійко до різниці довжин)
function isValidSecret(received: string | null): boolean {
  const expected = REVALIDATE_SECRET;
  if (!expected || !received) return false;
  const a = createHash('sha256').update(received).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  if (!isValidSecret(request.headers.get('x-revalidate-secret'))) {
    return NextResponse.json({ revalidated: false, message: 'Unauthorized' }, { status: 401 });
  }

  let body: RevalidateBody;
  try {
    body = (await request.json()) as RevalidateBody;
  } catch {
    return NextResponse.json({ revalidated: false, message: 'Invalid JSON' }, { status: 400 });
  }

  const { event, slug, oldSlug } = body;
  if (!slug || !['create', 'update', 'delete'].includes(event)) {
    return NextResponse.json(
      { revalidated: false, message: 'Missing or invalid "event"/"slug"' },
      { status: 400 }
    );
  }

  const paths = new Set<string>([
    `/catalog/${slug}`,
    `/telegram/catalog/${slug}`,
    '/catalog',
    '/telegram/catalog',
  ]);
  if (oldSlug && oldSlug !== slug) {
    paths.add(`/catalog/${oldSlug}`);
    paths.add(`/telegram/catalog/${oldSlug}`);
  }

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: true, event, paths: [...paths] });
}
