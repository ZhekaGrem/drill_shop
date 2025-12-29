// src/app/privacy-policy/PrivacyPolicy.tsx

import { Container, Box } from '@mantine/core';
import styles from './privacyPolicy.module.scss';
import { siteConfig } from '@/shared/config/site';

const PrivacyPolicy = () => {
  return (
    <div className={styles.page}>
      <Container size={900}>
        <div className={styles.header}>
          <h1 className={styles.title}>Політика конфіденційності</h1>
          <p className={styles.subtitle}>
            Ця політика описує, як ми збираємо, використовуємо та захищаємо ваші персональні дані відповідно
            до законодавства України
          </p>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <p className={styles.textBlock}>
              Використовуючи веб-сайт <strong>{siteConfig.url}</strong> та сервіси інтернет-магазину{' '}
              <strong>{siteConfig.name}</strong>, ви погоджуєтеся з умовами цієї Політики конфіденційності.
            </p>

            <p className={styles.textBlock}>Ця політика розроблена відповідно до:</p>

            <ul className={styles.list}>
              <li>Закону України "Про захист персональних даних" № 2297-VI від 01.06.2010</li>
              <li>Загального регламенту про захист даних (GDPR) ЄС 2016/679</li>
              <li>Закону України "Про електронну комерцію" № 675-VIII від 03.09.2015</li>
              <li>Закону України "Про інформацію" № 2657-XII від 02.10.1992</li>
              <li>Закону України "Про захист прав споживачів" № 1023-XII від 12.05.1991</li>
            </ul>

            <div className={styles.orangeAlert}>
              <strong className={styles.boldText}>Останнє оновлення:</strong>{' '}
              {new Date().toLocaleDateString('uk-UA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Володілець персональних даних</h2>

            <p className={styles.textBlock}>
              <strong>Володілець персональних даних (далі – Продавець):</strong>
            </p>

            <ul className={styles.list}>
              <li>Повна назва: {siteConfig.fullName}</li>
              <li>Адреса: {siteConfig.contacts.address}</li>
              <li>Телефон: {siteConfig.contacts.phone}</li>
              <li>Email: {siteConfig.contacts.email}</li>
              <li>Веб-сайт: {siteConfig.url}</li>
            </ul>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Категорії персональних даних</h2>

            <h3 className={styles.subsectionTitle}>2.1. Дані, які ви надаєте добровільно:</h3>
            <ul className={styles.list}>
              <li>Ім'я та прізвище</li>
              <li>Номер телефону</li>
              <li>Адреса електронної пошти</li>
              <li>Адреса доставки (місто, відділення Нової Пошти)</li>
              <li>Дата народження (за бажанням для участі в акціях)</li>
              <li>Історія замовлень та покупок</li>
            </ul>

            <h3 className={styles.subsectionTitle}>2.2. Дані, які збираються автоматично:</h3>
            <ul className={styles.list}>
              <li>IP-адреса пристрою</li>
              <li>Тип та версія браузера</li>
              <li>Операційна система пристрою</li>
              <li>Відвідані сторінки сайту</li>
              <li>Час та тривалість сеансів</li>
              <li>Файли cookies та аналогічні технології</li>
              <li>Реферальні посилання (звідки ви прийшли на сайт)</li>
            </ul>

            <h3 className={styles.subsectionTitle}>2.3. Платіжна інформація:</h3>
            <p className={styles.textBlock}>
              Дані платіжних карток обробляються безпосередньо платіжними системами (LiqPay, MonoBank) та{' '}
              <strong>НЕ зберігаються</strong> на серверах Продавця. Продавець отримує лише підтвердження про
              успішну оплату.
            </p>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Мета обробки персональних даних</h2>

            <p className={styles.textBlock}>
              Ваші персональні дані використовуються виключно для законних цілей:
            </p>

            <ul className={styles.list}>
              <li>
                <strong>Виконання договору:</strong> обробка та виконання замовлень, доставка товарів,
                оформлення документів
              </li>
              <li>
                <strong>Комунікація з клієнтом:</strong> підтвердження замовлення, повідомлення про статус
                доставки, відповіді на запитання
              </li>
              <li>
                <strong>Покращення якості сервісу:</strong> аналіз поведінки користувачів, персоналізація
                пропозицій, покращення зручності сайту
              </li>
              <li>
                <strong>Маркетингова діяльність:</strong> розсилка новин, спеціальних пропозицій, знижок (лише
                за вашою згодою)
              </li>
              <li>
                <strong>Захист від шахрайства:</strong> виявлення та запобігання незаконним діям, забезпечення
                безпеки платежів
              </li>
              <li>
                <strong>Виконання законних вимог:</strong> ведення бухгалтерського обліку, податкова
                звітність, виконання вимог державних органів
              </li>
            </ul>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Правова підстава обробки даних</h2>

            <p className={styles.textBlock}>
              Згідно зі ст. 11 Закону України "Про захист персональних даних", обробка ваших даних
              здійснюється на підставі:
            </p>

            <ul className={styles.list}>
              <li>Вашої добровільної згоди (при реєстрації та оформленні замовлення)</li>
              <li>Необхідності виконання договору купівлі-продажу</li>
              <li>Виконання законних вимог (бухгалтерський облік, податкова звітність)</li>
              <li>Законних інтересів Продавця (запобігання шахрайству, покращення сервісу)</li>
            </ul>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>5. Передача персональних даних третім особам</h2>

            <p className={styles.textBlock}>
              Продавець передає ваші персональні дані третім особам тільки у випадках, передбачених цією
              Політикою:
            </p>

            <h3 className={styles.subsectionTitle}>5.1. Партнери для виконання замовлень:</h3>
            <ul className={styles.list}>
              <li>
                <strong>Служби доставки (Нова Пошта, Укрпошта):</strong> ПІБ, номер телефону, адреса доставки
              </li>
              <li>
                <strong>Платіжні системи (LiqPay, MonoBank):</strong> інформація для проведення транзакції
              </li>
              <li>
                <strong>SMS-сервіси:</strong> номер телефону для повідомлень про статус замовлення
              </li>
            </ul>

            <h3 className={styles.subsectionTitle}>5.2. Технічні партнери:</h3>
            <ul className={styles.list}>
              <li>Хостинг-провайдери (для забезпечення роботи сайту)</li>
              <li>Сервіси аналітики (Google Analytics) — для аналізу відвідуваності сайту</li>
            </ul>

            <div className={styles.redAlert}>
              <strong className={styles.boldText}>ВАЖЛИВО:</strong> Продавець НІКОЛИ не продає, не обмінює та
              не передає ваші персональні дані третім особам для маркетингових цілей без вашої явної згоди.
            </div>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>6. Заходи захисту персональних даних</h2>

            <p className={styles.textBlock}>
              Відповідно до ст. 19 Закону України "Про захист персональних даних", Продавець застосовує
              технічні та організаційні заходи для захисту ваших даних:
            </p>

            <h3 className={styles.subsectionTitle}>Технічні заходи:</h3>
            <ul className={styles.list}>
              <li>SSL/TLS шифрування (HTTPS) для передачі даних</li>
              <li>Захищені сервери з обмеженим доступом</li>
              <li>Шифрування паролів користувачів (bcrypt)</li>
              <li>Регулярне оновлення систем безпеки та патчів</li>
              <li>Резервне копіювання даних</li>
              <li>Захист від DDoS-атак та зловмисного програмного забезпечення</li>
            </ul>

            <h3 className={styles.subsectionTitle}>Організаційні заходи:</h3>
            <ul className={styles.list}>
              <li>Обмеження доступу до персональних даних (тільки авторизований персонал)</li>
              <li>Регулярний аудит безпеки</li>
              <li>Навчання персоналу щодо захисту конфіденційності</li>
              <li>Контроль дотримання політики конфіденційності</li>
            </ul>

            <div className={styles.orangeAlert}>
              <strong className={styles.boldText}>Зверніть увагу:</strong> Незважаючи на всі вжиті заходи,
              жоден метод передачі або зберігання даних в Інтернеті не є на 100% безпечним. Ми докладаємо
              максимальних зусиль, але не можемо гарантувати абсолютну безпеку.
            </div>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>7. Ваші права як суб'єкта персональних даних</h2>

            <p className={styles.textBlock}>
              Згідно зі ст. 8 Закону України "Про захист персональних даних", ви маєте наступні права:
            </p>

            <ul className={styles.list}>
              <li>
                <strong>Право на інформацію (ст. 8.1):</strong> знати про джерела збирання, місцезнаходження
                своїх персональних даних, мету їх обробки
              </li>
              <li>
                <strong>Право на доступ (ст. 8.2):</strong> отримувати відомості про умови надання доступу до
                персональних даних
              </li>
              <li>
                <strong>Право на виправлення (ст. 8.3):</strong> виправляти неточні, неповні або застарілі
                дані
              </li>
              <li>
                <strong>Право на видалення (ст. 8.4):</strong> вимагати видалення своїх персональних даних
                ("право на забуття")
              </li>
              <li>
                <strong>Право на обмеження обробки:</strong> призупинити обробку даних в певних випадках
              </li>
              <li>
                <strong>Право на портативність даних:</strong> отримати копію своїх даних у зручному форматі
                (CSV, JSON)
              </li>
              <li>
                <strong>Право на заперечення:</strong> заперечити проти обробки ваших даних для прямого
                маркетингу
              </li>
              <li>
                <strong>Право на відкликання згоди:</strong> відкликати згоду на обробку даних у будь-який
                момент
              </li>
              <li>
                <strong>Право на скаргу:</strong> подати скаргу до Уповноваженого Верховної Ради України з
                прав людини
              </li>
            </ul>

            <div className={styles.infoBox}>
              <p>
                <strong className={styles.boldText}>Як скористатися своїми правами:</strong>
              </p>
              <Box component="p" mt={8}>
                1. Надішліть письмовий запит на email: {siteConfig.contacts.email}
                <br />
                2. Вкажіть в темі листа: "Запит щодо персональних даних"
                <br />
                3. Детально опишіть своє прохання
                <br />
                4. Ми розглянемо ваш запит протягом <strong>30 календарних днів</strong> (згідно ст. 16
                Закону)
              </Box>
            </div>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>8. Використання cookies</h2>

            <p className={styles.textBlock}>
              Наш веб-сайт використовує файли cookies для покращення функціональності та зручності:
            </p>

            <h3 className={styles.subsectionTitle}>Типи cookies:</h3>
            <ul className={styles.list}>
              <li>
                <strong>Обов'язкові cookies:</strong> необхідні для базової роботи сайту (авторизація, кошик,
                сесія)
              </li>
              <li>
                <strong>Функціональні cookies:</strong> запам'ятовування ваших налаштувань (мова, валюта)
              </li>
              <li>
                <strong>Аналітичні cookies:</strong> збір статистики відвідуваності (Google Analytics)
              </li>
              <li>
                <strong>Маркетингові cookies:</strong> персоналізація реклами (лише за вашою згодою)
              </li>
            </ul>

            <p className={styles.textBlock}>
              Ви можете налаштувати використання cookies у налаштуваннях свого браузера. Зверніть увагу, що
              відключення обов'язкових cookies може порушити роботу сайту.
            </p>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>9. Термін зберігання персональних даних</h2>

            <p className={styles.textBlock}>
              Згідно зі ст. 6 Закону України "Про захист персональних даних", персональні дані зберігаються не
              довше, ніж це необхідно:
            </p>

            <ul className={styles.list}>
              <li>
                <strong>Дані облікового запису:</strong> до видалення акаунта або 3 роки бездіяльності
              </li>
              <li>
                <strong>Історія замовлень:</strong> 3 роки (відповідно до Податкового кодексу України, ст. 44)
              </li>
              <li>
                <strong>Дані для маркетингу:</strong> до відписки від розсилки або 2 роки бездіяльності
              </li>
              <li>
                <strong>Технічні логи:</strong> 12 місяців для забезпечення безпеки
              </li>
              <li>
                <strong>Cookies:</strong> від сеансу до 2 років (залежно від типу)
              </li>
            </ul>

            <p className={styles.textBlock}>
              Після закінчення терміну зберігання персональні дані підлягають знеособленню або видаленню.
            </p>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>10. Права неповнолітніх</h2>

            <p className={styles.textBlock}>
              Наш інтернет-магазин призначений для осіб віком від <strong>18 років</strong>. Ми свідомо не
              збираємо персональні дані осіб віком до 18 років.
            </p>

            <p className={styles.textBlock}>
              Якщо нам стане відомо, що ми зібрали персональні дані неповнолітньої особи без згоди
              батьків/опікунів, ми негайно видалимо такі дані.
            </p>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>11. Зміни до Політики конфіденційності</h2>

            <p className={styles.textBlock}>
              Продавець залишає за собою право вносити зміни до цієї Політики конфіденційності в
              односторонньому порядку. Нова редакція набуває чинності з моменту розміщення на сайті.
            </p>

            <p className={styles.textBlock}>
              Про суттєві зміни ми повідомимо вас по електронній пошті (для зареєстрованих користувачів) або
              через повідомлення на сайті.
            </p>

            <p className={styles.textBlock}>
              Актуальна версія завжди доступна на сторінці: <strong>{siteConfig.url}/privacy-policy</strong>
            </p>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>12. Контактна інформація</h2>

            <p className={styles.textBlock}>
              Якщо у вас виникли питання щодо обробки персональних даних або ви хочете скористатися своїми
              правами, зв'яжіться з нами:
            </p>

            <ul className={styles.list}>
              <li>
                <strong>Email:</strong> {siteConfig.contacts.email}
              </li>
              <li>
                <strong>Телефон:</strong> {siteConfig.contacts.phone}
              </li>
              <li>
                <strong>Адреса:</strong> {siteConfig.contacts.address}
              </li>
            </ul>

            <p className={styles.textBlock}>
              Якщо ви вважаєте, що ваші права порушено, ви маєте право звернутися до:
            </p>

            <ul className={styles.list}>
              <li>
                <strong>Уповноважений Верховної Ради України з прав людини</strong>
                <br />
                <span className={styles.dimmedText}>
                  Адреса: 01008, м. Київ, вул. Інститутська, 21/8
                  <br />
                  Телефон: (044) 253-74-11
                  <br />
                  Email: hotline@ombudsman.gov.ua
                </span>
              </li>
            </ul>
          </section>

          <div className={styles.blueAlert}>
            <strong>Дата набрання чинності:</strong>{' '}
            {new Date().toLocaleDateString('uk-UA', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            <br />
            <br />
            Використовуючи сайт {siteConfig.url}, ви підтверджуєте, що ознайомлені з цією Політикою
            конфіденційності та погоджуєтеся з нею.
          </div>
        </div>
      </Container>
    </div>
  );
};

export default PrivacyPolicy;
