'use client';
// Контрольний лист колекцій перед дропом: для кожного товару поруч рендер,
// текстура, свотч, бейдж і модель — усе живцем із GET /collections, щоб
// звірити звʼязки БД одним екраном. Внутрішня сторінка, у навігації її нема.
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Page } from '@/shared/components/Page/Page';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { apiClient } from '@/shared/api/client';
import { AuditFindings } from './AuditFindings';
import styles from './audit.module.scss';

interface AuditImage {
  url: string;
  kind: string;
  isPrimary: boolean;
}

interface AuditProduct {
  slug: string;
  name: string;
  collectionOrder: number;
  model3dPath: string | null;
  texture3dUrl: string | null;
  switcherSwatch: string | null;
  badgeText: string | null;
  badgeColor: string | null;
  images: AuditImage[];
}

interface AuditCollection {
  slug: string;
  title: string;
  archivedAt: string | null;
  products: AuditProduct[];
}

const useAudit = () =>
  useQuery({
    queryKey: ['collections-audit'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: AuditCollection[] }>('/collections');
      return data.data;
    },
    refetchOnWindowFocus: true,
  });

const Visual = ({ label, url }: { label: string; url?: string }) => (
  <figure className={styles.visual}>
    {url ? (
      <a href={url} target="_blank" rel="noreferrer">
        <Image src={url} alt={label} width={160} height={160} loading="lazy" />
      </a>
    ) : (
      <span className={styles.missing}>нема</span>
    )}
    <figcaption>{label}</figcaption>
  </figure>
);

export default function CollectionsAuditPage() {
  const { data: collections, isLoading } = useAudit();

  return (
    <Page>
      <PageHeader
        title="Аудит колекцій"
        description="Живі звʼязки з БД: товар → рендер → текстура → свотч. Тап по картинці відкриває оригінал."
      />

      {isLoading && <p className={styles.note}>Завантажуємо колекції…</p>}

      <AuditFindings collections={collections} />

      {collections?.map((col) => (
        <section key={col.slug} className={styles.collection}>
          <h2 className={styles.collectionTitle}>
            «{col.title}» · {col.products.length} тов.
            {col.archivedAt && <span className={styles.archived}>Архів</span>}
          </h2>

          {col.products.map((p) => {
            const render = p.images.find((i) => i.kind === 'render3d')?.url;
            const photo = p.images.find((i) => i.isPrimary)?.url ?? p.images[0]?.url;
            return (
              <article
                key={p.slug}
                className={`${styles.card} ${p.name.includes('чернетка') ? styles.draftCard : ''}`}>
                <header className={styles.cardHead}>
                  <span className={styles.order}>#{p.collectionOrder}</span>
                  <div>
                    <strong>{p.name}</strong>
                    <div className={styles.slug}>{p.slug}</div>
                  </div>
                  {p.badgeText && (
                    <span
                      className={styles.badge}
                      style={{ background: p.badgeColor ?? 'var(--text-primary)' }}>
                      {p.badgeText}
                    </span>
                  )}
                </header>

                <div className={styles.visuals}>
                  <Visual label="рендер" url={render} />
                  <Visual label="текстура" url={p.texture3dUrl ?? undefined} />
                  <figure className={styles.visual}>
                    {p.switcherSwatch ? (
                      <span className={styles.swatch} style={{ background: p.switcherSwatch }} />
                    ) : (
                      <span className={styles.missing}>нема</span>
                    )}
                    <figcaption>свотч</figcaption>
                  </figure>
                  <Visual label="фото" url={photo} />
                </div>

                <div className={styles.model}>
                  модель: {p.model3dPath ?? '—'}
                  {p.model3dPath === '/3d/models/tshirt.glb' && ' (базова футболка)'}
                </div>
              </article>
            );
          })}
        </section>
      ))}
    </Page>
  );
}
