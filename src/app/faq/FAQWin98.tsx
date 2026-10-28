// src/app/faq/FAQWin98.tsx
// FAQ у дизайні Windows 98: кожен тематичний розділ — окреме вікно з піксельною іконкою й рядком стану, замість
// однакових сірих блоків одне в одному. Шапка з пошуком — теж вікно (смуга = h1), «Не знайшли відповідь?» — останнє.
// Від 1024 px вікна стоять у дві колонки, як на робочому столі. Решта дизайнів — FAQ.tsx без змін.
'use client';

import { IconMail, IconSearch, IconX } from '@tabler/icons-react';
import clsx from 'clsx';
import { Page } from '@/shared/components/Page/Page';
import { ListGroup, ListRow } from '@/shared/components/ListGroup/ListGroup';
import { IconTelegram } from '@/shared/components/Svg';
import { Win98Window } from '@/shared/components/Windows98/Win98Window';
import { Win98Icon, type Win98IconName } from '@/shared/components/Windows98/Win98Icons';
import { siteConfig } from '@/shared/config/site';
import { faqData } from './faq-data';
import { formatQuestions, type FaqSearch } from './useFaqSearch';
import styles from './faqWin98.module.scss';

// Значок вікна за назвою розділу (faq-data.ts); невідомий розділ — знак питання
const CATEGORY_ICONS: Record<string, Win98IconName> = {
  'Про артистів і бренди': 'user',
  Замовлення: 'doc',
  Доставка: 'truck',
  Оплата: 'card',
  'Якість товару': 'tee',
  'Повернення та обмін': 'calendar',
  'Акаунт та особисті дані': 'lock',
};

export function FAQWin98({ query, setQuery, filtered, totalQuestions }: FaqSearch) {
  const found = filtered.reduce((acc, category) => acc + category.questions.length, 0);

  return (
    <Page>
      <div className={styles.desk}>
        <Win98Window
          as="h1"
          title="Часті питання"
          icon={<Win98Icon name="help" />}
          className={clsx(styles.window, styles.wide)}
          status={
            query.trim()
              ? `Знайдено: ${formatQuestions(found)}`
              : `${totalQuestions} відповідей у ${faqData.length} розділах`
          }>
          <p className={styles.lead}>Замовлення, доставка, оплата, розміри та мерч.</p>
          <label className={styles.search}>
            <IconSearch size={20} stroke={1.5} className={styles.searchIcon} aria-hidden="true" />
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
                <IconX size={16} stroke={2} />
              </button>
            )}
          </label>
        </Win98Window>

        {filtered.map((category) => (
          <Win98Window
            key={category.category}
            title={category.category}
            icon={<Win98Icon name={CATEGORY_ICONS[category.category] ?? 'help'} />}
            className={styles.window}
            status={formatQuestions(category.questions.length)}>
            <ListGroup>
              {category.questions.map((item) => (
                <details key={item.question} className={styles.item}>
                  <summary className={styles.trigger}>
                    <span className={styles.question}>{item.question}</span>
                    <span className={styles.toggle} aria-hidden="true" />
                  </summary>
                  <p className={styles.answer}>{item.answer}</p>
                </details>
              ))}
            </ListGroup>
          </Win98Window>
        ))}

        {filtered.length === 0 && (
          <Win98Window
            title="Нічого не знайдено"
            icon={<Win98Icon name="error" />}
            className={clsx(styles.window, styles.wide)}>
            <p className={styles.lead}>За запитом «{query}» нічого не знайдено. Спробуйте інше слово.</p>
            <button type="button" className={styles.reset} onClick={() => setQuery('')}>
              Скинути пошук
            </button>
          </Win98Window>
        )}

        {/* Непарна кількість розділів — вікно стає в порожню клітинку поруч; парна — на всю ширину */}
        <Win98Window
          title="Не знайшли відповідь?"
          icon={<Win98Icon name="mail" />}
          className={clsx(styles.window, filtered.length % 2 === 0 && styles.wide)}>
          <p className={styles.lead}>Напишіть напряму — відповідаємо в робочі години.</p>
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
        </Win98Window>
      </div>
    </Page>
  );
}
