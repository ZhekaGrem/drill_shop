// src/app/Home.tsx
'use client';

import { IconAward, IconCircleCheck, IconMail, IconMapPin, IconMessageCircle } from '@tabler/icons-react';
import { IconInstagram, IconTelegram } from '@/shared/components/Svg';
import { Page } from '@/shared/components/Page/Page';
import { Section } from '@/shared/components/Section/Section';
import { ListGroup, ListRow } from '@/shared/components/ListGroup/ListGroup';
import { ServicesGroup } from '@/shared/components/ServicesGroup/ServicesGroup';
import { HomeHeroes } from '@/widgets/HomeHeroes/HomeHeroes';
import { useCollections } from '@/widgets/ProductV2/useCollections';
import { isHiddenCollection } from '@/shared/config/hidden-collections';
import { orderForHome } from '@/shared/config/home-collections';
import { useCategoriesStore } from '@/shared/stores/categories';
import { CategoriesInitializer } from '@/shared/components/CategoriesInitializer/CategoriesInitializer';
import { content } from '@/shared/config/content';
import { siteConfig } from '@/shared/config/site';
import { faqData } from './faq/faq-data';
import styles from './home.module.scss';

// Рядки категорій ідуть без іконки (рішення власника, 2026-08-17). Слуги в БД
// не збігались із набором наявних ілюстрацій, тож усі чотири рядки показували
// одну сіру заглушку — а чотири однакові заглушки в ряд читаються як
// незавершена сторінка. Один шар деталей або є скрізь, або його немає.

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
  // активна дизайн-концепція (data-design, перемикач на /v2/dev).
  //
  // Приховані розділи (hidden-collections) на головну не потрапляють: у
  // «Мистецтво з війни» ведуть свайп навбару на «є. Олько» і прямий лінк.
  // Порядок бекенда тут не діє: черга задана слагами в home-collections.
  const { data: collections } = useCollections();
  const visibleCollections =
    collections && orderForHome(collections.filter((c) => !isHiddenCollection(c.key)));

  return (
    <Page>
      <CategoriesInitializer />

      <HomeHeroes collections={visibleCollections} />

      <ul className={styles.trust}>
        {content.home.trust.map((item) => (
          <li key={item.label} className={styles.trustItem}>
            <span className={styles.trustLabel}>{item.label}</span>
            <span className={styles.trustHint}>{item.hint}</span>
          </li>
        ))}
      </ul>

      {/* Секції-списки стоять парами: від 1024px пара лягає у дві доріжки,
          нижче — одна під одною, як і було. Пари складені за змістом, а не за
          висотою: навігація з аргументом, операційне з операційним. */}
      <div className={styles.listTracks}>
        {categories && categories.length > 0 && (
          <Section title="Категорії" action={{ href: '/catalog', label: 'Усі товари' }}>
            <ListGroup>
              {categories.slice(0, 4).map((cat) => (
                <ListRow
                  key={cat.id}
                  href={`/catalog/category/${cat.slug}`}
                  title={cat.name}
                  hint={cat.description || content.home.categoryHints[cat.slug]}
                />
              ))}
            </ListGroup>
          </Section>
        )}

        <Section title="Чому Є.Дріл" description="Що стоїть за кожним замовленням">
          <ListGroup>
            {REASONS.map((reason) => (
              <ListRow
                key={reason.title}
                media={reason.icon}
                title={reason.title}
                hint={reason.description}
              />
            ))}
          </ListGroup>
        </Section>
      </div>

      <div className={styles.listTracks}>
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
      </div>

      <Section title="Звʼязок">
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
