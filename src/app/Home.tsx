// src/app/Home.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { IconAward, IconCircleCheck, IconMail, IconMapPin, IconMessageCircle } from '@tabler/icons-react';
import { Button } from '@/shared/components/Button/Button';
import { ArrowRight, IconInstagram, IconTelegram } from '@/shared/components/Svg';
import { Page } from '@/shared/components/Page/Page';
import { Section } from '@/shared/components/Section/Section';
import { ListGroup, ListRow } from '@/shared/components/ListGroup/ListGroup';
import { ServicesGroup } from '@/shared/components/ServicesGroup/ServicesGroup';
import { PopularProductsSlider } from '@/widgets/PopularProductsSlider/PopularProductsSlider';
import { HeroVisual } from '@/widgets/HeroVisual/HeroVisual';
import { DRIL_DESIGNS, TEST_COLLECTION } from '@/widgets/HeroVisual/designs';
import { useCollections } from '@/widgets/ProductV2/useCollections';
import { HeroShop } from '@/widgets/HeroShop/HeroShop';
import { HeroLab } from '@/widgets/HeroLab/HeroLab';
import { HeroTiles } from '@/widgets/HeroTiles/HeroTiles';
import { BadgeLab } from '@/widgets/BadgeLab/BadgeLab';
import { useCategoriesStore } from '@/shared/stores/categories';
import { CategoriesInitializer } from '@/shared/components/CategoriesInitializer/CategoriesInitializer';
import { content } from '@/shared/config/content';
import { siteConfig } from '@/shared/config/site';
import { faqData } from './faq/faq-data';
import styles from './home.module.scss';

// Slug'и з власною ілюстрацією (public/assets/img/categories/).
// Решта показує category-generic.webp — без runtime 404.
const KNOWN_ILLUSTRATIONS = new Set(['t-shirts', 'hoodies', 'caps', 'accessories']);

const getCategoryIllustration = (slug: string) =>
  `/assets/img/categories/${KNOWN_ILLUSTRATIONS.has(slug) ? slug : 'category-generic'}.webp`;

const REASONS = [
  { ...content.home.sections.freshness, icon: <IconCircleCheck stroke={1.5} /> },
  { ...content.home.sections.quality, icon: <IconAward stroke={1.5} /> },
  { ...content.about.sections.service, icon: <IconMessageCircle stroke={1.5} /> },
];

// Перше питання з кожної з трьох перших категорій FAQ — джерело правди одне (faq-data)
const FAQ_PREVIEW = faqData.slice(0, 3).map((category) => category.questions[0]);

const Home = () => {
  const router = useRouter();
  const categories = useCategoriesStore((s) => s.categories);
  // Герой 1 живе з GET /collections: дизайни = товари першої колекції з БД.
  // Вибраний дизайн (slug товару) і веде «До колекції» на свою сторінку.
  const { data: collections } = useCollections();
  const heroCollection = collections?.[0];
  const [heroDesign, setHeroDesign] = useState<string | null>(null);
  const activeSlug = heroDesign ?? heroCollection?.items[0]?.slug;

  // Герой «Гонорове вар'ятство»: різнорідні 3D-моделі (дизайн запечений у GLB),
  // тому перемикач — міні-фото, а не кольорові крапки
  const varCollection = collections?.find((c) => c.key === 'honorove-varyatstvo');
  const [varDesign, setVarDesign] = useState<string | null>(null);
  const varSlug = varDesign ?? varCollection?.items[0]?.slug;

  return (
    <Page>
      <CategoriesInitializer />

      <section className={styles.hero}>
        <div className={styles.heroText}>
          {/* Назва й опис — із БД колекції; поки вантажиться, копі з content
              як заглушка тієї ж довжини (без стрибка макета) */}
          <h1 className={styles.heroTitle}>{heroCollection?.title ?? content.home.hero.title}</h1>
          <p className={styles.heroSubtitle}>
            {heroCollection?.description ?? content.home.hero.description}
          </p>
          <div className={styles.heroActions}>
            <Button
              size="lg"
              variant="primary"
              disabled={!activeSlug}
              onClick={() => activeSlug && router.push(`/v2/a/${activeSlug}`)}>
              До колекції <ArrowRight size={20} />
            </Button>
            <Button size="lg" variant="secondary" onClick={() => router.push('/about')}>
              Про бренд
            </Button>
          </div>
        </div>
        <div className={styles.heroVisualWrap}>
          <span className={`${styles.heroBadgeDot} ${styles.heroBadgeOnStage}`}>
            <span className={styles.heroPulseDot} aria-hidden="true" />
            новинка
          </span>
          {heroCollection ? (
            <HeroVisual designs={heroCollection.designs} value={activeSlug} onChange={setHeroDesign} />
          ) : (
            <div className={styles.heroStageSkeleton} aria-busy="true" aria-label="Завантаження колекції" />
          )}
        </div>
      </section>

      {/* Герой «Гонорове вар'ятство»: колекція 3D-моделей із БД */}
      {varCollection && (
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <h2 className={styles.heroTitle}>{varCollection.title}</h2>
            <p className={styles.heroSubtitle}>{varCollection.description}</p>
            <div className={styles.heroActions}>
              <Button
                size="lg"
                variant="primary"
                disabled={!varSlug}
                onClick={() => varSlug && router.push(`/v2/a/${varSlug}`)}>
                До колекції <ArrowRight size={20} />
              </Button>
            </div>
          </div>
          <HeroVisual
            designs={varCollection.designs}
            switcher="thumbs"
            value={varSlug}
            onChange={setVarDesign}
          />
        </section>
      )}

      {/* Другий герой: колекція «Дріл» — свій набір дизайнів, та сама сцена */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h2 className={styles.heroTitle}>{content.home.hero2.title}</h2>
          <p className={styles.heroSubtitle}>{content.home.hero2.description}</p>
          <div className={styles.heroActions}>
            <Button size="lg" variant="primary" onClick={() => router.push('/catalog')}>
              До каталогу <ArrowRight size={20} />
            </Button>
          </div>
        </div>
        <HeroVisual designs={DRIL_DESIGNS} />
      </section>

      {/* Герой 3: комерційний — вибір дизайну = вибір товару, кошик поруч */}
      <HeroShop />

      {/* Герой 4 (ТЕСТ): колекція різнорідних 3D-предметів, перемикач-мініатюри */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h2 className={styles.heroTitle}>{content.home.heroTest.title}</h2>
          <p className={styles.heroSubtitle}>{content.home.heroTest.description}</p>
        </div>
        <HeroVisual designs={TEST_COLLECTION} switcher="thumbs" />
      </section>

      {/* ТИМЧАСОВО: лабораторія №2 — механіки перемикання МІЖ колекціями */}
      <HeroLab />

      {/* Герой-кандидат: плитки колекцій + сторіз 5с (механіка власника) */}
      <HeroTiles />

      {/* Герой 6 (ДЕМО): копія першого героя з бейджем «Новинка» */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <span className={styles.heroBadge}>Новинка</span>
          <h2 className={styles.heroTitle}>{content.home.hero.title}</h2>
          <p className={styles.heroSubtitle}>{content.home.hero.description}</p>
          <div className={styles.heroActions}>
            <Button size="lg" variant="primary" onClick={() => router.push('/catalog')}>
              До каталогу <ArrowRight size={20} />
            </Button>
            <Button size="lg" variant="secondary" onClick={() => router.push('/about')}>
              Про бренд
            </Button>
          </div>
        </div>
        <HeroVisual />
      </section>

      {/* ТИМЧАСОВО: лабораторія №3 — варіанти бейджа «Новинка» (2–5) */}
      <BadgeLab />

      <ul className={styles.trust}>
        {content.home.trust.map((item) => (
          <li key={item.label} className={styles.trustItem}>
            <span className={styles.trustLabel}>{item.label}</span>
            <span className={styles.trustHint}>{item.hint}</span>
          </li>
        ))}
      </ul>

      {categories && categories.length > 0 && (
        <Section title="Категорії" action={{ href: '/catalog', label: 'Усі товари' }}>
          <ListGroup>
            {categories.slice(0, 4).map((cat) => (
              <ListRow
                key={cat.id}
                href={`/catalog/category/${cat.slug}`}
                title={cat.name}
                hint={cat.description || content.home.categoryHints[cat.slug]}
                media={
                  <Image
                    src={getCategoryIllustration(cat.slug)}
                    alt=""
                    width={40}
                    height={40}
                    loading="lazy"
                  />
                }
              />
            ))}
          </ListGroup>
        </Section>
      )}

      <Section title="Популярне" action={{ href: '/catalog', label: 'Весь каталог' }}>
        <PopularProductsSlider />
      </Section>

      <Section title="Чому Є.Дріл" description="Що стоїть за кожним замовленням">
        <ListGroup>
          {REASONS.map((reason) => (
            <ListRow key={reason.title} media={reason.icon} title={reason.title} hint={reason.description} />
          ))}
        </ListGroup>
      </Section>

      <Section title="Доставка й оплата" action={{ href: '/delivery-and-payment', label: 'Деталі' }}>
        <ServicesGroup />
      </Section>

      <Section title="Часті питання" action={{ href: '/faq', label: 'Усі питання' }}>
        <ListGroup>
          {FAQ_PREVIEW.map((item) => (
            <ListRow key={item.question} href="/faq" title={item.question} hint={item.answer} />
          ))}
        </ListGroup>
      </Section>

      <Section title="Зв'язок">
        <ListGroup>
          <ListRow
            external
            href={siteConfig.socials.instagram}
            media={<IconInstagram />}
            title="Instagram"
            hint="Нові дропи, бекстейдж і анонси"
          />
          <ListRow
            external
            href={siteConfig.socials.telegram}
            media={<IconTelegram />}
            title="Telegram"
            hint="Питання про замовлення й наявність"
          />
          <ListRow
            href={`mailto:${siteConfig.contacts.email}`}
            media={<IconMail stroke={1.5} />}
            title="Пошта"
            hint={siteConfig.contacts.email}
          />
          <ListRow
            media={<IconMapPin stroke={1.5} />}
            title={siteConfig.contacts.city}
            hint={siteConfig.workingHours}
          />
        </ListGroup>
      </Section>
    </Page>
  );
};

export default Home;
