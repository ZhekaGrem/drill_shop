'use client';
// Галерея лоадерів: картка = живе прев'ю у рамці з фоном сторінки + «Ще раз»
// (перемонтовує анімацію ключем) + «На весь екран» (оверлей, закривається
// Esc або кнопкою). Обраний варіант потім переїде в app/loading.tsx.
import { useEffect, useState } from 'react';
import { Page } from '@/shared/components/Page/Page';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Button } from '@/shared/components/Button/Button';
import { LOADERS } from './Loaders';
import styles from './loaders.module.scss';

export const LoaderGallery = () => {
  // Лічильник перезапусків на варіант: зміна ключа перемонтовує компонент,
  // і всі його CSS-анімації стартують з нуля
  const [runs, setRuns] = useState<Record<string, number>>({});
  const [fullscreen, setFullscreen] = useState<string | null>(null);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen]);

  const fsExample = LOADERS.find((l) => l.id === fullscreen);

  return (
    <Page>
      <PageHeader
        title="Завантажувальні екрани"
        description="Живі приклади замість голого спінера. Обраний варіант поставимо в app/loading.tsx. Сторінка існує лише в DEV_MODE."
      />

      <div className={styles.grid}>
        {LOADERS.map(({ id, title, hint, Comp }) => (
          <section key={id} className={styles.card}>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}>{title}</h2>
            </div>
            <p className={styles.cardHint}>{hint}</p>
            <div className={styles.frame}>
              <div key={`${id}:${runs[id] ?? 0}`} className={styles.stage}>
                <Comp />
              </div>
            </div>
            <div className={styles.cardActions}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRuns((r) => ({ ...r, [id]: (r[id] ?? 0) + 1 }))}>
                Ще раз
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setFullscreen(id)}>
                На весь екран
              </Button>
            </div>
          </section>
        ))}
      </div>

      {fsExample && (
        <div className={styles.overlay} role="dialog" aria-label={`Лоадер «${fsExample.title}» на весь екран`}>
          <div className={styles.stage}>
            <fsExample.Comp />
          </div>
          <div className={styles.overlayClose}>
            <Button variant="ghost" size="sm" onClick={() => setFullscreen(null)}>
              Закрити (Esc)
            </Button>
          </div>
        </div>
      )}
    </Page>
  );
};
