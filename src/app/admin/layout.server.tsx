import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export default async function AdminLayoutServer({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login?from=/admin');
  }

  // Перевірка ролі через API
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      // Додаємо cache: 'no-store' для забезпечення актуальної перевірки
      cache: 'no-store',
    });

    // ❌ ФІКС: Перевіряємо статус відповіді
    if (!response.ok) {
      console.error(`❌ Admin profile fetch failed with status: ${response.status}`);
      redirect('/');
    }

    const profile = await response.json();

    if (!['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(profile?.data?.role)) {
      redirect('/');
    }
  } catch (error) {
    // ❌ ФІКС: Обробка помилок мережі або парсингу
    console.error('❌ Admin profile fetch exception:', error);
    redirect('/');
  }

  return children;
}
