// src/app/returns-exchanges/ReturnsExchanges.tsx

import { Container, Box } from '@mantine/core';
import styles from './returnsExchanges.module.scss';
import { siteConfig } from '@/shared/config/site';

const ReturnsExchanges = () => {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Повернення та обмін товару</h1>
          <p className={styles.subtitle}>
            Умови повернення та обміну мерчу (одягу та аксесуарів) відповідно до законодавства України
          </p>
        </div>

        <div className={styles.content}>
          <div className={styles.blueAlert}>
            <strong className={styles.boldText}>КОРОТКО:</strong> Відповідно до ст. 13 Закону України «Про
            захист прав споживачів», ви можете повернути непоношений мерч належної якості протягом 14 днів з
            моменту отримання. Товар неналежної якості — протягом 14 днів з моменту виявлення недоліку.
          </div>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Законодавча база</h2>

            <p className={styles.textBlock}>
              Повернення та обмін товарів регулюється наступними нормативно-правовими актами України:
            </p>

            <ul className={styles.list}>
              <li>
                Закон України &quot;Про захист прав споживачів&quot; № 1023-XII від 12.05.1991 (ст. 8, 9, 13)
              </li>
              <li>Цивільний кодекс України № 435-IV від 16.01.2003 — ст. 678-680</li>
              <li>Постанова КМУ № 172 від 19.03.1994 (перелік товарів, що не підлягають обміну)</li>
            </ul>

            <div className={styles.infoBox}>
              Мерч (футболки, худі, аксесуари) не входить до переліку товарів, що не підлягають обміну, тож на
              нього поширюється право на повернення протягом 14 днів.
            </div>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Товар належної якості</h2>

            <h3 className={styles.subsectionTitle}>2.1. Право на повернення та обмін</h3>
            <p className={styles.textBlock}>
              Відповідно до ст. 9 Закону України «Про захист прав споживачів», покупець має право протягом 14
              днів з моменту отримання:
            </p>
            <ul className={styles.list}>
              <li>Повернути товар належної якості</li>
              <li>Обміняти його на аналогічний</li>
              <li>Отримати повернення коштів</li>
            </ul>

            <div className={styles.orangeAlert}>
              <strong>УВАГА:</strong> Товар має бути непоношеним, у заводській упаковці, зі збереженими
              етикетками та без ознак використання.
            </div>

            <h3 className={styles.subsectionTitle}>2.2. Відмова від замовлення до отримання</h3>
            <p className={styles.textBlock}>
              Ви можете відмовитися від замовлення до моменту його отримання. Зв&apos;яжіться з нами за
              телефоном {siteConfig.contacts.phone}.
            </p>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Товар неналежної якості</h2>

            <h3 className={styles.subsectionTitle}>3.1. Ознаки неналежної якості</h3>
            <p className={styles.textBlock}>Товар вважається неналежної якості, якщо виявлено:</p>

            <ul className={styles.list}>
              <li>Виробничий брак тканини чи друку (плями, дефекти принту)</li>
              <li>Розходження по швах, обірвані нитки, нерівне пошиття</li>
              <li>Невідповідність розміру чи кольору замовленому</li>
              <li>Порушення цілісності упаковки, що призвело до пошкодження</li>
              <li>Неповна комплектація замовлення</li>
            </ul>

            <h3 className={styles.subsectionTitle}>3.2. Права покупця</h3>
            <p className={styles.textBlock}>При виявленні недоліків покупець має право на вибір:</p>

            <ol className={styles.list}>
              <li>Заміна на аналогічний товар належної якості</li>
              <li>Заміна на подібний товар з перерахунком ціни</li>
              <li>Зменшення ціни пропорційно виявленим недолікам</li>
              <li>Розірвання договору та повернення коштів</li>
            </ol>

            <div className={styles.greenAlert}>
              <strong>Ваші права захищені законом!</strong> Продавець не має права відмовити у задоволенні
              обґрунтованих вимог щодо товару неналежної якості.
            </div>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Терміни для повернення</h2>

            <h3 className={styles.subsectionTitle}>4.1. Загальний термін</h3>
            <p className={styles.textBlock}>
              Повернути товар неналежної якості можна протягом 14 календарних днів з моменту отримання товару.
            </p>

            <h3 className={styles.subsectionTitle}>4.2. Термін для повернення належної якості</h3>
            <p className={styles.textBlock}>
              Повернути непоношений мерч належної якості можна протягом 14 днів з моменту отримання за умови,
              що збережено заводський вигляд, етикетки та упаковку.
            </p>

            <div className={styles.orangeAlert}>
              <strong>Важливо:</strong> Чим швидше ви повідомите про недоліки, тим простіше їх підтвердити.
              Зберігайте товар у заводській упаковці до звернення.
            </div>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>5. Процедура повернення</h2>

            <div className={styles.stepCard}>
              <div>
                <span className={styles.stepNumber}>1</span>
                <span className={styles.stepTitle}>Зафіксуйте недоліки</span>
              </div>
              <p className={styles.stepText}>
                Зробіть фото/відео товару з видимими недоліками: дефект тканини, принту чи шва, етикетка,
                упаковка, накладна.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div>
                <span className={styles.stepNumber}>2</span>
                <span className={styles.stepTitle}>Зв&apos;яжіться з продавцем</span>
              </div>
              <p className={styles.stepText}>
                Протягом 24 годин зв&apos;яжіться з нами:
                <br />
                Телефон: {siteConfig.contacts.phone}
                <br />
                Email: {siteConfig.contacts.email}
              </p>
            </div>

            <div className={styles.stepCard}>
              <div>
                <span className={styles.stepNumber}>3</span>
                <span className={styles.stepTitle}>Надішліть фото/відео</span>
              </div>
              <p className={styles.stepText}>
                Надішліть фото/відео недоліків на email {siteConfig.contacts.email} для попереднього
                підтвердження претензії.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div>
                <span className={styles.stepNumber}>4</span>
                <span className={styles.stepTitle}>Отримайте рішення</span>
              </div>
              <p className={styles.stepText}>
                Ми розглядаємо претензію протягом 3 робочих днів та повідомляємо рішення.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div>
                <span className={styles.stepNumber}>5</span>
                <span className={styles.stepTitle}>Поверніть товар</span>
              </div>
              <p className={styles.stepText}>
                Якщо недоліки підтверджено, відправте товар назад за наш рахунок (надамо інструкції).
              </p>
            </div>

            <div className={styles.stepCard}>
              <div>
                <span className={styles.stepNumber}>6</span>
                <span className={styles.stepTitle}>Отримайте заміну або кошти</span>
              </div>
              <p className={styles.stepText}>
                Протягом 14 календарних днів: відправимо новий товар безкоштовно або повернемо кошти на вашу
                банківську картку.
              </p>
            </div>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>6. Важливі умови</h2>

            <h3 className={styles.subsectionTitle}>6.1. Вимоги до товару</h3>
            <p className={styles.textBlock}>Для успішного повернення покупець повинен:</p>

            <ul className={styles.list}>
              <li>Зберегти товар у тому стані, в якому він був отриманий</li>
              <li>Зберігати в сухому місці, без впливу прямого сонця</li>
              <li>Не прати, не прасувати та не використовувати до звернення</li>
              <li>Зберегти упаковку, етикетки, документи</li>
            </ul>

            <h3 className={styles.subsectionTitle}>6.2. Коли ми НЕ зможемо прийняти повернення</h3>
            <p className={styles.textBlock}>Продавець має право відмовити, якщо:</p>

            <ul className={styles.list}>
              <li>Недоліки виникли через порушення правил зберігання покупцем</li>
              <li>Товар був пошкоджений покупцем після отримання</li>
              <li>Минув термін для повернення (14 днів)</li>
              <li>Покупець не надав доказів недоліків</li>
              <li>Відсутні документи (накладна, чек)</li>
              <li>Товар належної якості — навіть якщо він не сподобався</li>
            </ul>

            <div className={styles.redAlert}>
              <strong>ВАЖЛИВО:</strong> Претензії НЕ приймаються після підписання накладної без зауважень!
              Завжди перевіряйте товар при отриманні.
            </div>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>7. Відшкодування витрат</h2>

            <h3 className={styles.subsectionTitle}>7.1. Витрати на доставку</h3>
            <p className={styles.textBlock}>Якщо товар неналежної якості:</p>

            <ul className={styles.list}>
              <li>Доставка до покупця — відшкодовується Продавцем</li>
              <li>Доставка назад — за рахунок Продавця</li>
              <li>Повторна доставка (при заміні) — безкоштовно</li>
            </ul>

            <h3 className={styles.subsectionTitle}>7.2. Повернення коштів</h3>
            <p className={styles.textBlock}>При поверненні товару покупцю відшкодовується:</p>

            <ul className={styles.list}>
              <li>Повна вартість товару</li>
              <li>Вартість доставки</li>
              <li>Витрати на повернення</li>
            </ul>

            <p className={styles.textBlock}>
              Кошти повертаються протягом 14 календарних днів з моменту отримання товару назад.
            </p>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>8. Спірні ситуації</h2>

            <h3 className={styles.subsectionTitle}>8.1. Експертиза якості</h3>
            <p className={styles.textBlock}>
              Якщо сторони не можуть дійти згоди, проводиться незалежна експертиза:
            </p>

            <ul className={styles.list}>
              <li>Експертизу проводить незалежна акредитована лабораторія</li>
              <li>Витрати попередньо сплачує Продавець</li>
              <li>Якщо підтверджується вина Продавця — витрати несе Продавець</li>
              <li>Якщо підтверджується вина Покупця — витрати відшкодовує Покупець</li>
            </ul>

            <h3 className={styles.subsectionTitle}>8.2. Вирішення спорів</h3>
            <p className={styles.textBlock}>У разі незгоди покупець має право:</p>

            <ol className={styles.list}>
              <li>Звернутися до Товариства захисту прав споживачів</li>
              <li>Подати скаргу до Державної служби України з питань захисту прав споживачів</li>
              <li>Звернутися до суду за місцем проживання покупця</li>
            </ol>

            <p className={styles.textBlock}>Позовна давність — 1 рік з моменту виявлення недоліків.</p>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>9. Контактна інформація</h2>

            <p className={styles.textBlock}>Для повернення та обміну товару зв&apos;яжіться з нами:</p>

            <div className={styles.infoBox}>
              <Box component="ul" className={styles.list} mb={0}>
                <li>
                  <strong>Телефон:</strong> {siteConfig.contacts.phone}
                </li>
                {siteConfig.contacts.phone2 && (
                  <li>
                    <strong>Додатковий телефон:</strong> {siteConfig.contacts.phone2}
                  </li>
                )}
                <li>
                  <strong>Email:</strong> {siteConfig.contacts.email}
                </li>
                <li>
                  <strong>Адреса:</strong> {siteConfig.contacts.address}
                </li>
                <li>
                  <strong>Графік роботи:</strong> {siteConfig.workingHours}
                </li>
              </Box>
            </div>

            <Box component="p" className={styles.textBlock} mt="md">
              Ми завжди готові допомогти вирішити будь-які питання!
            </Box>
          </section>

          <div className={styles.blueAlert}>
            <strong>Пам&apos;ятайте:</strong> Ваші права як споживача захищені законодавством України. Ми
            дотримуємося всіх вимог закону та завжди йдемо назустріч покупцям при виявленні обґрунтованих
            недоліків товару.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnsExchanges;
