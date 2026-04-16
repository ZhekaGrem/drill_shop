// src/app/faq/FAQ.tsx
'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { faqData } from './faq-data';
import styles from './faq.module.scss';

const TICKER_ITEMS = ['FAQ', 'ВІДПОВІДІ', 'MERCH', 'ЩІЛЬНИЙ DRILL', 'SUPPORT', 'ZINE VOL.01'];

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
    <div className={styles.page}>
      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.marqueeTrack}>
          {Array.from({ length: 3 }).flatMap((_, loop) =>
            TICKER_ITEMS.map((label, i) => (
              <span key={`${loop}-${i}`}>
                <i>✦</i>
                {label}
              </span>
            ))
          )}
        </div>
      </div>

      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroMeta}>
            <span>№ 001</span>
            <span>VOL. DRILL</span>
            <span>LVIV / UA</span>
            <span>{new Date().getFullYear()}</span>
          </div>

          <h1 className={styles.heroTitle}>
            <span className={styles.heroTitleLine}>часті</span>
            <span className={styles.heroTitleLine}>
              питання<em className={styles.heroMark}>?</em>
            </span>
          </h1>

          <p className={styles.heroSub}>
            Тут усе, що треба знати про замовлення, доставку, оплату, розміри й мерч <b>Щільного Drill</b>. Не
            знайшов відповіді — писни нам напряму, ми на зв&apos;язку.
          </p>

          <div className={styles.heroStats}>
            <div>
              <span className={styles.statNum}>{totalQuestions}</span>
              <span className={styles.statLabel}>відповідей</span>
            </div>
            <div>
              <span className={styles.statNum}>{faqData.length}</span>
              <span className={styles.statLabel}>розділів</span>
            </div>
            <div>
              <span className={styles.statNum}>24/7</span>
              <span className={styles.statLabel}>архів</span>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.toolbar}>
        <label className={styles.search}>
          <span className={styles.searchLabel}>SEARCH /</span>
          <input
            type="text"
            placeholder="введи ключове слово — розмір, оплата, доставка..."
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
              ×
            </button>
          )}
        </label>
      </div>

      <main className={styles.content}>
        {filtered.length > 0 ? (
          filtered.map((category, categoryIndex) => (
            <section key={category.category} className={styles.category}>
              <header className={styles.categoryHead}>
                <span className={styles.categoryIndex}>{String(categoryIndex + 1).padStart(2, '0')}</span>
                <h2 className={styles.categoryTitle}>{category.category}</h2>
                <span className={styles.categoryCount}>
                  [{String(category.questions.length).padStart(2, '0')} Q]
                </span>
              </header>

              <ul className={styles.qList}>
                {category.questions.map((item, index) => (
                  <li key={item.question}>
                    <details className={styles.qItem}>
                      <summary className={styles.qTrigger}>
                        <span className={styles.qNum}>Q.{String(index + 1).padStart(2, '0')}</span>
                        <span className={styles.qText}>{item.question}</span>
                        <span className={styles.qToggle} aria-hidden="true">
                          <span className={styles.qToggleBar} />
                          <span className={styles.qToggleBar} />
                        </span>
                      </summary>
                      <div className={styles.qAnswer}>
                        <span className={styles.qAnswerTag}>A —</span>
                        <p>{item.answer}</p>
                      </div>
                    </details>
                  </li>
                ))}
              </ul>
            </section>
          ))
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptySticker}>
              <Image
                src="/assets/img/rage.png"
                alt=""
                width={160}
                height={160}
                className={styles.emptyStickerImg}
              />
            </div>
            <span className={styles.emptyStamp}>NO MATCH</span>
            <p>
              За запитом &laquo;{query}&raquo; нічого не знайдено.
              <br />
              Спробуй інше ключове слово або обнули пошук.
            </p>
            <button type="button" className={styles.emptyReset} onClick={() => setQuery('')}>
              скинути пошук →
            </button>
          </div>
        )}
      </main>

      <footer className={styles.cta}>
        <div className={styles.ctaSticker}>
          <span className={styles.ctaStickerLabel}>ASK US</span>
          <Image
            src="/assets/img/smile.png"
            alt=""
            width={220}
            height={220}
            className={styles.ctaStickerImg}
          />
        </div>

        <div className={styles.ctaBody}>
          <span className={styles.ctaTag}>SUPPORT / ПИШИ НАМ</span>
          <h3 className={styles.ctaTitle}>
            не знайшов відповідь?
            <br />
            <span>пиши напряму.</span>
          </h3>

          <ul className={styles.ctaLinks}>
            <li>
              <a href="https://t.me/makaron_gang" target="_blank" rel="noopener noreferrer">
                <span>telegram</span>
                <b>@makaron_gang</b>
                <i aria-hidden="true">→</i>
              </a>
            </li>
            <li>
              <a href="mailto:team@shchilnuidrill.com">
                <span>email</span>
                <b>team@shchilnuidrill.com</b>
                <i aria-hidden="true">→</i>
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
};

export default FAQ;
