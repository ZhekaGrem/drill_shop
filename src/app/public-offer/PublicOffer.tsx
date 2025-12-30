// src/app/public-offer/PublicOffer.tsx

import { Box } from '@mantine/core';
import styles from './publicOffer.module.scss';
import { siteConfig } from '@/shared/config/site';

const PublicOffer = () => {
  return (
    <div className={styles.page}>
      <div>
        <div className={styles.header}>
          <h1 className={styles.title}>Договір публічної оферти</h1>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <p className={styles.textBlock}>
              Цей документ є офіційною публічною пропозицією (офертою) для укладення договору купівлі-продажу
              товарів дистанційним способом між Продавцем та Покупцем.
            </p>

            <p className={styles.textBlock}>
              <strong>Правова основа:</strong> Цивільний кодекс України (ст. 633, 641, 644), Закон України
              "Про захист прав споживачів" (ст. 10-1), Закон України "Про електронну комерцію".
            </p>

            <div className={styles.orangeAlert}>
              <strong className={styles.boldText}>УВАГА:</strong> Оформлення замовлення на сайті означає ваше
              повне і беззастережне прийняття умов цього Договору (акцепт оферти). Якщо ви не згодні з
              будь-яким пунктом — не оформлюйте замовлення.
            </div>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Терміни та визначення</h2>

            <ul className={styles.list}>
              <li>
                <strong>Продавець</strong> — {siteConfig.fullName}, що здійснює продаж товарів через
                інтернет-магазин {siteConfig.url}
              </li>
              <li>
                <strong>Покупець</strong> — дієздатна фізична особа (від 18 років) або юридична особа, яка
                прийняла умови цього Договору шляхом оформлення замовлення
              </li>
              <li>
                <strong>Товар</strong> — м'ясні вироби (ковбаси, м'ясо, сало, деліkatesy), представлені в
                каталозі інтернет-магазину
              </li>
              <li>
                <strong>Замовлення</strong> — належно оформлена заявка Покупця на придбання Товару через
                інтернет-магазин із зазначенням найменування, кількості, ціни та способу доставки
              </li>
              <li>
                <strong>Акцепт</strong> — повне і беззастережне прийняття Покупцем умов Договору шляхом
                оформлення замовлення або оплати
              </li>
            </ul>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Загальні положення</h2>

            <p className={styles.textBlock}>
              2.1. Цей Договір є публічною офертою відповідно до{' '}
              <strong>статті 633 Цивільного кодексу України</strong> та діє для необмеженого кола осіб.
            </p>

            <p className={styles.textBlock}>2.2. Моментом укладення Договору (акцептом оферти) вважається:</p>
            <ul className={styles.list}>
              <li>Натискання кнопки "Підтвердити замовлення" на сайті</li>
              <li>Здійснення оплати замовлення (для онлайн-оплати)</li>
              <li>Підтвердження замовлення по телефону або email</li>
            </ul>

            <p className={styles.textBlock}>2.3. Укладаючи цей Договір, Покупець підтверджує, що:</p>
            <ul className={styles.list}>
              <li>Ознайомився з умовами Договору та повністю їх приймає</li>
              <li>Є дієздатною особою віком від 18 років</li>
              <li>Надав достовірні персональні дані</li>
              <li>Погоджується з обробкою персональних даних згідно Політики конфіденційності</li>
            </ul>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Предмет договору</h2>

            <p className={styles.textBlock}>
              3.1. Продавець зобов'язується передати у власність Покупця Товар, а Покупець зобов'язується
              прийняти та оплатити Товар на умовах цього Договору.
            </p>

            <p className={styles.textBlock}>3.2. Договір регулює відносини щодо:</p>
            <ul className={styles.list}>
              <li>Вибору та замовлення Товару в інтернет-магазині</li>
              <li>Оплати Товару зручним способом</li>
              <li>Доставки Товару за вказаною адресою</li>
              <li>Повернення та обміну Товару (у випадках, передбачених законом)</li>
            </ul>

            <p className={styles.textBlock}>
              3.3. Продавець не несе відповідальності за зміст та зовнішній вигляд сайту, який може
              відрізнятись у різних браузерах та на різних пристроях.
            </p>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Оформлення та підтвердження замовлення</h2>

            <h3 className={styles.subsectionTitle}>4.1. Процес оформлення</h3>
            <p className={styles.textBlock}>Покупець самостійно оформлює замовлення через сайт, вказуючи:</p>
            <ul className={styles.list}>
              <li>Ім'я та прізвище</li>
              <li>Контактний телефон та email</li>
              <li>Спосіб доставки (Нова Пошта, Укрпошта, інше)</li>
              <li>Адресу доставки (місто, відділення)</li>
              <li>Спосіб оплати (готівка при отриманні, LiqPay, MonoBank)</li>
            </ul>

            <h3 className={styles.subsectionTitle}>4.2. Підтвердження замовлення</h3>
            <p className={styles.textBlock}>
              Після оформлення замовлення Продавець зв'язується з Покупцем протягом <strong>24 годин</strong>{' '}
              (у робочі дні) для підтвердження деталей замовлення.
            </p>

            <h3 className={styles.subsectionTitle}>4.3. Відмова від замовлення</h3>
            <p className={styles.textBlock}>Продавець має право відмовити в обробці замовлення у разі:</p>
            <ul className={styles.list}>
              <li>Надання Покупцем недостовірних контактних даних</li>
              <li>Неможливості зв'язатися з Покупцем протягом 3 діб</li>
              <li>Відсутності Товару на складі</li>
              <li>Виявлення технічної помилки в ціні (більше ніж на 10%)</li>
              <li>Форс-мажорних обставин</li>
            </ul>

            <div className={styles.infoBox}>
              <strong>Важливо:</strong> Продавець зобов'язується повідомити Покупця про неможливість виконання
              замовлення протягом 24 годин телефоном або email.
            </div>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>5. Ціна товару та порядок оплати</h2>

            <h3 className={styles.subsectionTitle}>5.1. Ціноутворення</h3>
            <p className={styles.textBlock}>
              Ціни на Товари вказуються в гривнях (UAH) з урахуванням ПДВ (за наявності). Ціна Товару
              фіксується на момент оформлення замовлення та не підлягає зміні після підтвердження.
            </p>

            <h3 className={styles.subsectionTitle}>5.2. Способи оплати</h3>
            <ul className={styles.list}>
              <li>
                <strong>Готівка при отриманні</strong> — оплата готівкою або карткою у відділенні Нової Пошти.
                Комісія перевізника за накладений платіж сплачується Покупцем.
              </li>
              <li>
                <strong>LiqPay</strong> — онлайн-оплата картками Visa/MasterCard через захищену платіжну
                систему LiqPay. Оплата здійснюється до відправки Товару.
              </li>
              <li>
                <strong>Plata by mono</strong> — онлайн-оплата через MonoBank. Оплата здійснюється до
                відправки Товару.
              </li>
            </ul>

            <h3 className={styles.subsectionTitle}>5.3. Акції та знижки</h3>
            <p className={styles.textBlock}>
              Продавець має право проводити акції та надавати знижки. Умови акцій публікуються на сайті.
              Акційні пропозиції не сумуються, якщо інше не зазначено в умовах акції.
            </p>

            <div className={styles.greenAlert}>
              <strong>Безпека платежів:</strong> Всі онлайн-платежі здійснюються через захищені платіжні
              системи з використанням протоколу SSL/TLS. Дані платіжних карток НЕ зберігаються на серверах
              Продавця.
            </div>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>6. Доставка товару</h2>

            <h3 className={styles.subsectionTitle}>6.1. Способи доставки</h3>
            <ul className={styles.list}>
              <li>
                <strong>Нова Пошта</strong> — до відділення або поштомату (за вибором Покупця)
              </li>
              <li>
                <strong>Укрпошта</strong> — до відділення зв'язку
              </li>
              <li>
                <strong>Інші перевізники</strong> — Містекспрес, Meest Express (за домовленістю)
              </li>
            </ul>

            <h3 className={styles.subsectionTitle}>6.2. Вартість та терміни доставки</h3>
            <p className={styles.textBlock}>
              Вартість доставки сплачується Покупцем за тарифами перевізника та НЕ входить у вартість Товару.
              Орієнтовні терміни доставки:
            </p>
            <ul className={styles.list}>
              <li>Нова Пошта: 1-3 дні з моменту відправки</li>
              <li>Укрпошта: 3-7 днів з моменту відправки</li>
            </ul>

            <h3 className={styles.subsectionTitle}>6.3. Відправка замовлення</h3>
            <p className={styles.textBlock}>
              Товар відправляється протягом <strong>1-3 робочих днів</strong> після підтвердження замовлення
              та оплати (для онлайн-оплати). Покупець отримує SMS та email з номером накладної.
            </p>

            <h3 className={styles.subsectionTitle}>6.4. Отримання товару</h3>
            <p className={styles.textBlock}>При отриманні Товару Покупець зобов'язаний:</p>
            <ol className={styles.list}>
              <li>Пред'явити документ, що посвідчує особу</li>
              <li>Перевірити цілісність упаковки</li>
              <li>Перевірити найменування, кількість та вагу Товару відповідно до накладної</li>
              <li>Перевірити термін придатності (для продовольчих товарів)</li>
              <li>
                При виявленні пошкоджень або невідповідностей — скласти акт у присутності представника
                перевізника ДО оплати
              </li>
            </ol>

            <div className={styles.redAlert}>
              <strong>ВАЖЛИВО:</strong> Претензії щодо кількості, ваги, зовнішнього вигляду Товару НЕ
              приймаються після підписання накладної без зауважень та оплати замовлення.
            </div>

            <h3 className={styles.subsectionTitle}>6.5. Відповідальність за доставку</h3>
            <p className={styles.textBlock}>
              Ризик випадкового пошкодження або втрати Товару переходить до Покупця з моменту передачі Товару
              перевізнику (відповідно до <strong>ст. 668 ЦКУ</strong>).
            </p>

            <p className={styles.textBlock}>
              Якщо Покупець не забрав Товар протягом терміну безкоштовного зберігання у перевізника (зазвичай
              5 днів), замовлення вважається скасованим. Витрати на доставку туди-назад покриває Покупець.
            </p>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>7. Якість та безпека товару</h2>

            <h3 className={styles.subsectionTitle}>7.1. Гарантії якості</h3>
            <p className={styles.textBlock}>Продавець гарантує, що Товар:</p>
            <ul className={styles.list}>
              <li>Відповідає вимогам ДСТУ та санітарно-епідеміологічним нормам України</li>
              <li>Має чинні сертифікати якості та безпеки</li>
              <li>Має термін придатності не менше 50% від загального на момент відправки</li>
              <li>Правильно зберігається (холодильник, температурний режим)</li>
              <li>Упакований належним чином для забезпечення свіжості</li>
            </ul>

            <h3 className={styles.subsectionTitle}>7.2. Документація</h3>
            <p className={styles.textBlock}>До Товару додаються:</p>
            <ul className={styles.list}>
              <li>Товарна накладна</li>
              <li>Фіскальний чек (для зареєстрованих ФОП)</li>
              <li>Інформація про склад, термін придатності, умови зберігання</li>
            </ul>

            <h3 className={styles.subsectionTitle}>7.3. Умови зберігання</h3>
            <p className={styles.textBlock}>
              Після отримання Покупець зобов'язаний зберігати Товар згідно з рекомендаціями на упаковці
              (зазвичай холодильник +2...+6°C). Продавець НЕ несе відповідальності за якість Товару при
              порушенні умов зберігання Покупцем.
            </p>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>8. Повернення та обмін товару</h2>

            <div className={styles.orangeAlert}>
              <strong>УВАГА:</strong> Відповідно до <strong>Постанови КМУ №1769 від 19.12.1994</strong> (зі
              змінами), продовольчі товари належної якості поверненню та обміну НЕ підлягають.
            </div>

            <h3 className={styles.subsectionTitle}>8.1. Товар належної якості</h3>
            <p className={styles.textBlock}>
              М'ясні вироби та інші продовольчі товари належної якості <strong>НЕ підлягають</strong>{' '}
              поверненню та обміну відповідно до законодавства України.
            </p>

            <h3 className={styles.subsectionTitle}>8.2. Товар неналежної якості</h3>
            <p className={styles.textBlock}>
              Відповідно до <strong>ст. 8 Закону України "Про захист прав споживачів"</strong>, у разі
              виявлення істотних недоліків Товару (неналежна якість, псування, невідповідність складу)
              Покупець має право протягом <strong>14 днів</strong> з моменту отримання:
            </p>
            <ul className={styles.list}>
              <li>Вимагати заміни на аналогічний Товар належної якості</li>
              <li>Вимагати повернення коштів</li>
              <li>Вимагати зменшення ціни</li>
            </ul>

            <h3 className={styles.subsectionTitle}>8.3. Порядок повернення</h3>
            <p className={styles.textBlock}>Для повернення Товару неналежної якості Покупець повинен:</p>
            <ol className={styles.list}>
              <li>Зв'язатися з Продавцем протягом 24 годин з моменту виявлення недоліку (email, телефон)</li>
              <li>Надіслати фото/відео Товару з видимими недоліками</li>
              <li>Зберегти Товар в оригінальній упаковці до вирішення питання</li>
              <li>Надіслати Товар назад (за рахунок Продавця, якщо брак підтверджено)</li>
            </ol>

            <p className={styles.textBlock}>
              Продавець розглядає претензію протягом <strong>3 робочих днів</strong> та повідомляє рішення
              Покупцю.
            </p>

            <h3 className={styles.subsectionTitle}>8.4. Повернення коштів</h3>
            <p className={styles.textBlock}>
              У разі підтвердження недоліків Товару кошти повертаються протягом{' '}
              <strong>14 календарних днів</strong> з моменту отримання Товару назад:
            </p>
            <ul className={styles.list}>
              <li>Готівковий розрахунок — повернення на банківську картку Покупця</li>
              <li>Онлайн-оплата — повернення на ту ж картку, з якої здійснювалася оплата</li>
            </ul>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>9. Права та обов'язки сторін</h2>

            <h3 className={styles.subsectionTitle}>9.1. Продавець зобов'язується</h3>
            <ul className={styles.list}>
              <li>Надавати достовірну інформацію про Товар на сайті</li>
              <li>Забезпечити якість Товару відповідно до стандартів</li>
              <li>Відправити замовлення у встановлені терміни</li>
              <li>Проінформувати Покупця про зміни в замовленні</li>
              <li>Захищати персональні дані Покупця</li>
            </ul>

            <h3 className={styles.subsectionTitle}>9.2. Продавець має право</h3>
            <ul className={styles.list}>
              <li>Змінювати ціни на Товар в односторонньому порядку</li>
              <li>Відмовити в обробці замовлення за обґрунтованих причин</li>
              <li>Проводити акції та встановлювати знижки</li>
              <li>Вносити зміни до цього Договору</li>
            </ul>

            <h3 className={styles.subsectionTitle}>9.3. Покупець зобов'язується</h3>
            <ul className={styles.list}>
              <li>Надати достовірні контактні дані</li>
              <li>Оплатити замовлення у встановлені терміни</li>
              <li>Забрати Товар у перевізника вчасно</li>
              <li>Дотримуватись умов зберігання Товару</li>
            </ul>

            <h3 className={styles.subsectionTitle}>9.4. Покупець має право</h3>
            <ul className={styles.list}>
              <li>Отримувати повну інформацію про Товар</li>
              <li>Відмовитись від замовлення до його відправки</li>
              <li>Повернути Товар неналежної якості</li>
              <li>Вимагати компенсації збитків у встановлених законом випадках</li>
            </ul>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>10. Відповідальність сторін</h2>

            <h3 className={styles.subsectionTitle}>10.1. Продавець НЕ несе відповідальності за:</h3>
            <ul className={styles.list}>
              <li>Затримки доставки з вини служби доставки</li>
              <li>Неможливість доставки через недостовірні дані Покупця</li>
              <li>Псування Товару через невчасне забирання у перевізника</li>
              <li>Псування Товару через порушення умов зберігання Покупцем</li>
              <li>Збитки, спричинені діями третіх осіб (перевізник, платіжна система)</li>
            </ul>

            <h3 className={styles.subsectionTitle}>10.2. Обмеження відповідальності</h3>
            <p className={styles.textBlock}>
              Відповідальність Продавця за неналежне виконання зобов'язань обмежується вартістю конкретного
              замовлення. Продавець НЕ відшкодовує непрямі збитки, упущену вигоду, моральну шкоду.
            </p>

            <h3 className={styles.subsectionTitle}>10.3. Форс-мажор</h3>
            <p className={styles.textBlock}>
              Сторони звільняються від відповідальності за невиконання зобов'язань, якщо це сталося внаслідок
              форс-мажорних обставин: стихійні лиха, військові дії, страйки, епідемії, рішення органів влади,
              відключення електроенергії, збої в роботі служб доставки тощо.
            </p>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>11. Захист персональних даних</h2>

            <p className={styles.textBlock}>
              Оформлюючи замовлення, Покупець надає згоду на обробку своїх персональних даних відповідно до
              Закону України "Про захист персональних даних" № 2297-VI.
            </p>

            <p className={styles.textBlock}>
              Детальна інформація про обробку персональних даних викладена в{' '}
              <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                Політиці конфіденційності
              </a>
              .
            </p>

            <p className={styles.textBlock}>Продавець зобов'язується:</p>
            <ul className={styles.list}>
              <li>Не розголошувати персональні дані третім особам (крім випадків, передбачених законом)</li>
              <li>Використовувати дані тільки для виконання замовлення</li>
              <li>Забезпечити захист даних технічними засобами</li>
              <li>Видалити дані на вимогу Покупця (з урахуванням законодавчих вимог)</li>
            </ul>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>12. Вирішення спорів</h2>

            <p className={styles.textBlock}>
              12.1. Всі спори та розбіжності вирішуються шляхом переговорів між Продавцем та Покупцем.
            </p>

            <p className={styles.textBlock}>
              12.2. У разі неможливості врегулювання спору шляхом переговорів, спір передається на розгляд до
              суду за місцем знаходження Продавця або Покупця (на вибір Покупця) відповідно до{' '}
              <strong>процесуального законодавства України</strong>.
            </p>

            <p className={styles.textBlock}>
              12.3. До відносин між Продавцем та Покупцем застосовується{' '}
              <strong>законодавство України</strong>.
            </p>

            <p className={styles.textBlock}>12.4. Покупець також має право звернутися до:</p>
            <ul className={styles.list}>
              <li>
                <strong>Державної служби України з питань безпечності харчових продуктів</strong> (при
                виявленні проблем з якістю продуктів)
              </li>
              <li>
                <strong>Товариства захисту прав споживачів</strong> (для медіації та консультацій)
              </li>
              <li>
                <strong>Платформи онлайн-врегулювання спорів ЄС</strong> (якщо застосовно)
              </li>
            </ul>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>13. Заключні положення</h2>

            <p className={styles.textBlock}>
              13.1. Цей Договір набирає чинності з моменту оформлення Покупцем замовлення та діє до повного
              виконання зобов'язань сторонами.
            </p>

            <p className={styles.textBlock}>
              13.2. Продавець має право вносити зміни до умов Договору в односторонньому порядку, розмістивши
              оновлену версію на сайті. Зміни набувають чинності з моменту публікації.
            </p>

            <p className={styles.textBlock}>
              13.3. Замовлення, оформлені до внесення змін, виконуються за умовами, діючими на момент
              оформлення замовлення.
            </p>

            <p className={styles.textBlock}>
              13.4. Актуальна редакція Договору завжди доступна на сторінці:{' '}
              <strong>{siteConfig.url}/public-offer</strong>
            </p>

            <p className={styles.textBlock}>
              13.5. Якщо будь-яке положення цього Договору визнається недійсним, решта положень залишаються
              чинними.
            </p>
          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>14. Реквізити продавця</h2>

            <div className={styles.infoBox}>
              <Box component="ul" className={styles.list} mb={0}>
                <li>
                  <strong>Повна назва:</strong> {siteConfig.fullName}
                </li>
                <li>
                  <strong>Адреса:</strong> {siteConfig.contacts.address}
                </li>
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
                  <strong>Веб-сайт:</strong> {siteConfig.url}
                </li>
                <li>
                  <strong>Графік роботи:</strong> {siteConfig.workingHours}
                </li>
              </Box>
            </div>
          </section>

          <div className={styles.blueAlert}>
            <Box component="p" mb={8}>
              <strong>Дата набрання чинності:</strong>{' '}
              {new Date().toLocaleDateString('uk-UA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Box>
            <Box component="p" mb={0}>
              Оформлюючи замовлення на сайті <strong>{siteConfig.url}</strong>, ви підтверджуєте, що
              ознайомлені з умовами цього Договору публічної оферти та повністю з ними згодні.
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicOffer;
