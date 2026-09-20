// src/features/news/components/NewsSheet.tsx
// Шторка новин із дзвіночка в хедері. Список статичний (shared/config/news),
// тож ні станів завантаження, ні помилок тут нема — лише вміст.
//
// Мітку «прочитано» ставить не ця шторка, а той, хто її відкриває (Header):
// дзвіночок має зникати в момент тапа, ще до появи шторки.
'use client';

import { useRouter } from 'next/navigation';
import { Sheet } from '@/shared/components/Sheet';
import { Button } from '@/shared/components/Button/Button';
import { RichDescription } from '@/shared/components/RichDescription/RichDescription';
import { content } from '@/shared/config/content';
import { NEWS, formatNewsDate } from '@/shared/config/news';
import styles from './NewsSheet.module.scss';

interface NewsSheetProps {
  opened: boolean;
  onClose: () => void;
}

export function NewsSheet({ opened, onClose }: NewsSheetProps) {
  const router = useRouter();
  // Перехід і закриття разом: інакше шторка лишалась би поверх нової сторінки
  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    // returnFocus=false: тригер — кнопка-дзвіночок у MenuSlot — на момент
    // закриття вже inert (такт слота), фокус після шторки веде сам слот
    <Sheet opened={opened} onClose={onClose} title={content.news.title} returnFocus={false}>
      <div className={styles.list}>
        {NEWS.map((item) => (
          <article key={item.id} className={styles.item}>
            <p className={styles.meta}>
              <span className={styles.date}>{formatNewsDate(item.date)}</span>
              {item.label && (
                // Капсула та сама, що біля колекцій: клас designCapsule віддає
                // її скінам концепцій, інлайн лишається лише колір із даних
                <span
                  className={`${styles.capsule} designCapsule`}
                  style={item.labelColor ? { background: item.labelColor } : undefined}>
                  {item.label}
                </span>
              )}
            </p>
            <h3 className={styles.title}>{item.title}</h3>
            <p className={styles.text}>
              <RichDescription text={item.text} />
            </p>
            {item.href && item.hrefLabel && (
              <Button variant="secondary" size="sm" onClick={() => go(item.href as string)}>
                {item.hrefLabel}
              </Button>
            )}
          </article>
        ))}

        <Button variant="ghost" fullWidth onClick={onClose}>
          {content.news.close}
        </Button>
      </div>
    </Sheet>
  );
}
