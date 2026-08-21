// src/app/v2/dev/DesignSection.tsx
// Перемикач дизайну на дев-панелі: пише localStorage.design і атрибут
// data-design (палітри в globals.css, механіка героя в HomeHeroes).
// Після перемикання перераховує авто-тему за правилом обраного варіанта.
//
// Два різні за природою списки навмисно розведені:
//   • кольористики (В1–В3) міняють ТІЛЬКИ колір — механіка й розкладка ті самі,
//     тож їх можна порівнювати між собою чесно;
//   • концепції (К1–К3) міняють ще й механіку героя, скіни капсул і правило
//     авто-теми — це інший рівень рішення.
//
// Кнопки показують ВИБІР, а не те, що на екрані. З появою ротації це різні
// речі: у день Перегрузу «авто» світиться натиснутим, а сам Перегруз позначений
// підписом «зараз на екрані». Без цього розрізнення панель брехала б —
// підсвічувала б Перегруз так, ніби його хтось закріпив.
'use client';

import {
  DESIGN_CHOICE_AUTO,
  DESIGN_OPTIONS,
  PALETTE_IDS,
  setDesignChoice,
  type DesignChoice,
  type DesignId,
} from '@/shared/config/design';
import {
  ROTATION_ENABLED,
  ROTATION_ORDER,
  ROTATION_SLOT_DAYS,
  designForTime,
} from '@/shared/config/design-rotation';
import { applyTheme, autoTheme, readThemeChoice } from '@/shared/config/theme';
import { useDesign, useDesignChoice, useNextRotationAt } from '@/shared/hooks';
import styles from './dev.module.scss';

const labelOf = (id: DesignId) => DESIGN_OPTIONS.find((o) => o.id === id)?.label ?? id;

const whenLabel = (ms: number) =>
  new Date(ms).toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

export const DesignSection = () => {
  const design = useDesign(); // що на екрані
  const choice = useDesignChoice(); // що обрано — з ротацією це різні речі
  const nextAt = useNextRotationAt(); // 0 на сервері, момент межі в браузері

  const pick = (next: DesignChoice) => {
    // Стан не піднімаємо: setDesignChoice шле DESIGN_CHOICE_EVENT, на яку
    // підписаний useDesignChoice — сховище лишається єдиним джерелом правди.
    setDesignChoice(next);
    if (readThemeChoice() === 'auto') applyTheme(autoTheme());
  };

  const rows = (ids: DesignId[]) => (
    <div className={styles.designList} role="group" aria-label="Варіанти дизайну">
      {ids.map((id) => {
        const option = DESIGN_OPTIONS.find((o) => o.id === id);
        if (!option) return null;
        // «Зараз на екрані» має сенс тільки коли вибрано авто: при закріпленому
        // виборі кнопка і так натиснута, і підпис лише дублював би її.
        const live = choice === DESIGN_CHOICE_AUTO && option.id === design;
        return (
          <button
            key={option.id}
            type="button"
            className={option.id === choice ? styles.designRowActive : styles.designRow}
            aria-pressed={option.id === choice}
            onClick={() => pick(option.id)}>
            <strong>{option.label}</strong>
            <span>
              {option.hint}
              {live ? ' · зараз на екрані' : ''}
            </span>
          </button>
        );
      })}
    </div>
  );

  const conceptIds = DESIGN_OPTIONS.map((o) => o.id).filter(
    (id) => id !== 'diia' && !PALETTE_IDS.includes(id)
  );

  const rotating = nextAt > 0 && ROTATION_ENABLED;
  const nextDesign = rotating ? designForTime(nextAt) : null;

  return (
    <>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Кольористика</h2>
        <div className={styles.designList} role="group" aria-label="Режим вибору палітри">
          <button
            type="button"
            className={choice === DESIGN_CHOICE_AUTO ? styles.designRowActive : styles.designRow}
            aria-pressed={choice === DESIGN_CHOICE_AUTO}
            onClick={() => pick(DESIGN_CHOICE_AUTO)}>
            <strong>Авто · ротація</strong>
            <span>
              {!ROTATION_ENABLED
                ? 'ротацію вимкнено рубильником — сайт лишається на Дії'
                : !rotating
                  ? `кожні ${ROTATION_SLOT_DAYS} дні за календарем`
                  : `зараз ${labelOf(design)} · далі ${labelOf(nextDesign as DesignId)} з ${whenLabel(nextAt)}`}
            </span>
          </button>
        </div>
        {rows(ROTATION_ORDER)}
        <p className={styles.mono}>
          Порядок кнопок = порядок ротації. «Авто» віддає вибір календарю: палітра міняється кожні{' '}
          {ROTATION_SLOT_DAYS} дні й однакова для всіх відвідувачів, бо рахується з часу, а не зі сховища.
          Натиснута палітра закріплюється й ротацію ігнорує — це лише для тебе, у чужих браузерах далі
          крутиться. Обидві теми задані повністю, тож день/ніч далі за годинником.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Дизайн-концепції</h2>
        {rows(conceptIds)}
        <p className={styles.mono}>
          К1–К3 міняють ще й механіку героя, скіни позначок і правило авто-теми — тому їх не можна порівнювати
          з кольористиками напряму. У ротації вони не беруть участі: це вже інший сайт, а не інший колір
        </p>
      </section>
    </>
  );
};
