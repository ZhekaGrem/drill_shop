// src/app/faq/FAQ.tsx
'use client';

import { useMemo, useState } from 'react';
import { IconMail, IconSearch, IconX } from '@tabler/icons-react';
import { Page } from '@/shared/components/Page/Page';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Section } from '@/shared/components/Section/Section';
import { ListGroup, ListRow } from '@/shared/components/ListGroup/ListGroup';
import { IconTelegram } from '@/shared/components/Svg';
import { siteConfig } from '@/shared/config/site';
import { faqData } from './faq-data';
import styles from './faq.module.scss';

const FAQ = () => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqData;
    return faqData
      .map((category) => ({
        ...category,
        questions: category.questions.filter(
          (item) => item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)
        ),
      }))
      .filter((category) => category.questions.length > 0);
  }, [query]);

  const totalQuestions = useMemo(
    () => faqData.reduce((acc, category) => acc + category.questions.length, 0),
    []
  );

  return (
    <Page>
      <PageHeader
        title="Часті питання"
        description={`Замовлення, доставка, оплата, розміри та мерч — ${totalQuestions} відповідей у ${faqData.length} розділах.`}
      />

      {/* Поле пошуку — біла pill-плашка, як «Пошук» у розділі «Сервіси» Дії */}
      <div className={styles.search}>
        <IconSearch size={20} stroke={1.5} className={styles.searchIcon} />
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Розмір, оплата, доставка…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Пошук по питаннях"
        />
        {query && (
          <button
            type="button"
            className={styles.searchClear}
            onClick={() => setQuery('')}
            aria-label="Очистити пошук">
            <IconX size={18} stroke={1.5} />
          </button>
        )}
      </div>

      {filtered.length > 0 ? (
        filtered.map((category) => (
          <Section
            key={category.category}
            title={category.category}
            description={`${category.questions.length} ${category.questions.length === 1 ? 'питання' : 'питань'}`}>
            <ListGroup>
              {category.questions.map((item) => (
                <details key={item.question} className={styles.item}>
                  <summary className={styles.trigger}>
                    <span className={styles.question}>{item.question}</span>
                    <span className={styles.chevron} aria-hidden="true" />
                  </summary>
                  <p className={styles.answer}>{item.answer}</p>
                </details>
              ))}
            </ListGroup>
          </Section>
        ))
      ) : (
        <div className={styles.empty}>
          <p className={styles.emptyText}>
            За запитом «{query}» нічого не знайдено. Спробуйте інше ключове слово.
          </p>
          <button type="button" className={styles.emptyReset} onClick={() => setQuery('')}>
            Скинути пошук
          </button>
        </div>
      )}

      <Section title="Не знайшли відповідь?" description="Напишіть напряму — відповідаємо в робочі години.">
        <ListGroup>
          <ListRow
            external
            href={siteConfig.socials.telegram}
            media={<IconTelegram />}
            title="Telegram"
            hint="Найшвидший спосіб отримати відповідь"
          />
          <ListRow
            href={`mailto:${siteConfig.contacts.email}`}
            media={<IconMail stroke={1.5} />}
            title="Пошта"
            hint={siteConfig.contacts.email}
          />
        </ListGroup>
      </Section>
    </Page>
  );
};

export default FAQ;
