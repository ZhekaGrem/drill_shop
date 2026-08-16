// src/app/Home.tsx
'use client';

import Image from 'next/image';
import { IconAward, IconCircleCheck, IconMail, IconMapPin, IconMessageCircle } from '@tabler/icons-react';
import { IconInstagram, IconTelegram } from '@/shared/components/Svg';
import { Page } from '@/shared/components/Page/Page';
import { Section } from '@/shared/components/Section/Section';
import { ListGroup, ListRow } from '@/shared/components/ListGroup/ListGroup';
import { ServicesGroup } from '@/shared/components/ServicesGroup/ServicesGroup';
import { PopularProductsSlider } from '@/widgets/PopularProductsSlider/PopularProductsSlider';
import { HomeHeroes } from '@/widgets/HomeHeroes/HomeHeroes';
import { useCollections } from '@/widgets/ProductV2/useCollections';
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
  const categories = useCategoriesStore((s) => s.categories);
  // Герої = колекції з БД (GET /collections); механіку розкладки вибирає
  // активна дизайн-концепція (data-design, перемикач на /v2/dev)
  const { data: collections } = useCollections();

  return (
    <Page>
      <CategoriesInitializer />

      <HomeHeroes collections={collections} />

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
