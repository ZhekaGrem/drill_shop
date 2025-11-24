// src/app/public-offer/PublicOffer.tsx

import { Container, Title, Text, Paper, Stack, Divider, List, ListItem } from '@mantine/core';

import styles from './publicOffer.module.scss';
import { siteConfig } from '@/shared/config/site';

const PublicOffer = () => {
  const currentDate = new Date().toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className={styles.page}>
      <Container size="md" py="xl">
        <Stack align="center" mb="xl">
          <Title order={1} className={styles.title}>
            Договір публічної оферти
          </Title>
          <Text size="lg" className={styles.subtitle}>
            Про надання послуг з продажу товарів через інтернет-магазин
          </Text>
        </Stack>

        <Paper p="xl" withBorder radius="md">
          <Stack gap="xl">
            <div>
              <Title order={3} className={styles.sectionTitle}>
                1. Загальні положення
              </Title>

              <Text className={styles.textBlock}>
                Цей документ є офіційною публічною пропозицією (офертою) фізичної особи-підприємця (далі —
                Продавець) укласти договір купівлі-продажу товарів дистанційним способом (далі — Договір).
              </Text>

              <Text className={styles.textBlock}>
                Даний Договір є публічним, тобто відповідно до статті 633 Цивільного кодексу України, його
                умови є однаковими для всіх покупців незалежно від їх статусу (фізична особа, юридична особа,
                фізична особа-підприємець) без надання переваги одному покупцю перед іншим.
              </Text>

              <Text className={styles.textBlock}>
                Моментом повного і безумовного прийняття Покупцем пропозиції Продавця укласти електронний
                договір купівлі-продажу товару (акцептом оферти) вважається факт оплати Покупцем замовлення на
                умовах цього Договору, у строки та за цінами, вказаними на сайті Продавця.
              </Text>

              <div className={styles.orangeAlert}>
                <Text size="sm">
                  <span className={styles.boldText}>Важливо:</span> Розміщуючи замовлення на сайті, ви
                  підтверджуєте, що повністю ознайомлені з умовами цього Договору та приймаєте їх
                  беззастережно.
                </Text>
              </div>
            </div>

            <Divider />

            <div>
              <Title order={3} className={styles.sectionTitle}>
                2. Терміни та визначення
              </Title>

              <List spacing="sm" size="sm">
                <ListItem className={styles.listItem}>
                  <Text className={styles.boldText}>Продавець</Text>
                  <Text className={styles.dimmedText}>
                    Фізична особа-підприємець, яка здійснює продаж товарів через інтернет-магазин{' '}
                    {siteConfig.name}
                  </Text>
                </ListItem>
                <ListItem className={styles.listItem}>
                  <Text className={styles.boldText}>Покупець</Text>
                  <Text className={styles.dimmedText}>
                    Дієздатна фізична особа, яка оформила замовлення на сайті та прийняла умови цього Договору
                  </Text>
                </ListItem>
                <ListItem className={styles.listItem}>
                  <Text className={styles.boldText}>Інтернет-магазин</Text>
                  <Text className={styles.dimmedText}>
                    Веб-сайт {siteConfig.url}, що є власністю Продавця
                  </Text>
                </ListItem>
                <ListItem className={styles.listItem}>
                  <Text className={styles.boldText}>Товар</Text>
                  <Text className={styles.dimmedText}>
                    М'ясні вироби, представлені в асортименті інтернет-магазину
                  </Text>
                </ListItem>
                <ListItem className={styles.listItem}>
                  <Text className={styles.boldText}>Замовлення</Text>
                  <Text className={styles.dimmedText}>
                    Належно оформлена заявка Покупця на купівлю товару через інтернет-магазин
                  </Text>
                </ListItem>
              </List>
            </div>

            <Divider />

            <div>
              <Title order={3} className={styles.sectionTitle}>
                3. Предмет договору
              </Title>

              <Text className={styles.textBlock}>
                3.1. Продавець зобов'язується передати у власність Покупця товар, а Покупець зобов'язується
                прийняти та оплатити товар на умовах цього Договору.
              </Text>

              <Text className={styles.textBlock}>
                3.2. Цей Договір регулює купівлю-продажу товарів в інтернет-магазині, у тому числі:
              </Text>

              <List spacing="xs" size="sm">
                <ListItem>Добровільний вибір Покупцем товарів в інтернет-магазині</ListItem>
                <ListItem>Самостійне оформлення Покупцем замовлення в інтернет-магазині</ListItem>
                <ListItem>Оплату Покупцем замовлення, оформленого в інтернет-магазині</ListItem>
                <ListItem>
                  Обробку та доставку замовлення Покупцю в строки та за адресою, погоджені при оформленні
                  замовлення
                </ListItem>
              </List>
            </div>

            <Divider />

            <div>
              <Title order={3} className={styles.sectionTitle}>
                4. Оформлення та обробка замовлення
              </Title>

              <Text className={styles.textBlock}>
                4.1. Покупець самостійно оформлює замовлення в інтернет-магазині через форму замовлення.
              </Text>

              <Text className={styles.textBlock}>4.2. При оформленні замовлення Покупець зобов'язаний:</Text>

              <List spacing="xs" size="sm">
                <ListItem>Надати достовірні персональні дані</ListItem>
                <ListItem>Вказати контактний номер телефону та адресу електронної пошти</ListItem>
                <ListItem>Вказати адресу доставки товару</ListItem>
                <ListItem>Обрати зручний спосіб оплати та доставки</ListItem>
              </List>

              <Text className={styles.textBlock}>
                4.3. Продавець має право відмовити Покупцю в обробці замовлення у випадку:
              </Text>

              <List spacing="xs" size="sm">
                <ListItem>Надання Покупцем недостовірних даних</ListItem>
                <ListItem>Неможливості зв'язатися з Покупцем за вказаними контактами</ListItem>
                <ListItem>Відсутності товару на складі</ListItem>
                <ListItem>Виявлення технічної помилки в ціні товару</ListItem>
              </List>

              <Text className={styles.textBlock}>
                4.4. Продавець зобов'язується повідомити Покупця про зміни в замовленні або неможливість його
                виконання телефоном або електронною поштою.
              </Text>
            </div>

            <Divider />

            <div>
              <Title order={3} className={styles.sectionTitle}>
                5. Ціна товару та порядок оплати
              </Title>

              <Text className={styles.textBlock}>
                5.1. Ціни на товари визначаються Продавцем самостійно та вказуються на сторінках
                інтернет-магазину.
              </Text>

              <Text className={styles.textBlock}>
                5.2. Ціни вказуються в гривнях (UAH) з урахуванням ПДВ (якщо Продавець є платником ПДВ).
              </Text>

              <Text className={styles.textBlock}>
                5.3. Продавець має право змінювати ціни на товари в односторонньому порядку. При цьому ціна на
                товар, щодо якого оформлено замовлення, зміні не підлягає.
              </Text>

              <Text className={styles.textBlock}>
                5.4. Покупець може здійснити оплату наступними способами:
              </Text>

              <List spacing="xs" size="sm">
                <ListItem>Готівкою при отриманні товару (у відділенні перевізника)</ListItem>
                <ListItem>Карткою Visa/MasterCard через платіжну систему LiqPay</ListItem>
                <ListItem>Онлайн-оплата через сервіс plata by mono</ListItem>
              </List>

              <Text className={styles.textBlock}>
                5.5. Оплата замовлення Покупцем означає його повну згоду з умовами цього Договору.
              </Text>
            </div>

            <Divider />

            <div>
              <Title order={3} className={styles.sectionTitle}>
                6. Доставка товару
              </Title>

              <Text className={styles.textBlock}>6.1. Продавець здійснює доставку товарів:</Text>

              <List spacing="xs" size="sm">
                <ListItem>До відділення служби доставки "Нова Пошта"</ListItem>
                <ListItem>Іншими службами доставки (Укрпошта, Містекспрес тощо) за домовленістю</ListItem>
              </List>

              <Text className={styles.textBlock}>
                6.2. Строки доставки залежать від обраного способу доставки та географічного розташування
                Покупця.
              </Text>

              <Text className={styles.textBlock}>
                6.3. Вартість доставки сплачується Покупцем за тарифами перевізника та не входить у вартість
                товару.
              </Text>

              <Text className={styles.textBlock}>
                6.4. Ризик випадкового пошкодження або втрати товару переходить до Покупця з моменту передачі
                товару перевізнику.
              </Text>

              <Text className={styles.textBlock}>6.5. При отриманні товару Покупець зобов'язаний:</Text>

              <List spacing="xs" size="sm">
                <ListItem>Перевірити цілісність упаковки</ListItem>
                <ListItem>Звірити найменування та кількість товару з даними накладної</ListItem>
                <ListItem>
                  При виявленні пошкоджень або розбіжностей – скласти акт у присутності представника
                  перевізника
                </ListItem>
              </List>

              <div className={styles.redAlert}>
                <Text size="sm">
                  <span className={styles.boldText}>Увага:</span> Претензії щодо товару не приймаються після
                  підписання накладної без зауважень.
                </Text>
              </div>
            </div>

            <Divider />

            <div>
              <Title order={3} className={styles.sectionTitle}>
                7. Якість товару
              </Title>

              <Text className={styles.textBlock}>
                7.1. Продавець гарантує, що товар відповідає вимогам чинного законодавства України.
              </Text>

              <Text className={styles.textBlock}>
                7.2. Товар має супроводжуватися документами, що підтверджують його якість (сертифікати
                відповідності, санітарно-епідеміологічні висновки тощо).
              </Text>

              <Text className={styles.textBlock}>
                7.3. Термін придатності товару вказується на упаковці або в супровідних документах.
              </Text>

              <Text className={styles.textBlock}>
                7.4. Покупець зобов'язаний дотримуватися умов зберігання товару, вказаних на упаковці.
              </Text>
            </div>

            <Divider />

            <div>
              <Title order={3} className={styles.sectionTitle}>
                8. Повернення та обмін товару
              </Title>

              <Text className={styles.textBlock}>
                8.1. Повернення товару належної якості здійснюється відповідно до Закону України "Про захист
                прав споживачів" та Правил продажу товарів дистанційним способом.
              </Text>

              <Text className={styles.textBlock}>
                8.2. Покупець має право відмовитися від товару належної якості протягом 14 днів з моменту
                отримання, якщо:
              </Text>

              <List spacing="xs" size="sm">
                <ListItem>Товар не втратив товарний вигляд</ListItem>
                <ListItem>Збережено упаковку та документи</ListItem>
                <ListItem>Товар не був у вжитку</ListItem>
              </List>

              <div className={styles.orangeAlert}>
                <Text size="sm">
                  <span className={styles.boldText}>Важливо:</span> Продовольчі товари належної якості
                  поверненню та обміну не підлягають відповідно до законодавства України.
                </Text>
              </div>

              <Text className={styles.textBlock}>
                8.3. У разі виявлення недоліків товару (невідповідність якості, комплектності) Покупець має
                право:
              </Text>

              <List spacing="xs" size="sm">
                <ListItem>Вимагати заміни на аналогічний товар належної якості</ListItem>
                <ListItem>Вимагати повернення коштів</ListItem>
                <ListItem>Вимагати зменшення ціни</ListItem>
              </List>
            </div>

            <Divider />

            <div>
              <Title order={3} className={styles.sectionTitle}>
                9. Відповідальність сторін
              </Title>

              <Text className={styles.textBlock}>9.1. Продавець не несе відповідальності за:</Text>

              <List spacing="xs" size="sm">
                <ListItem>Затримки доставки з вини перевізника</ListItem>
                <ListItem>
                  Неможливість доставки через недостовірність даних, наданих Покупцем при оформленні
                  замовлення
                </ListItem>
                <ListItem>Порушення умов зберігання товару після передачі Покупцю</ListItem>
              </List>

              <Text className={styles.textBlock}>
                9.2. Покупець несе відповідальність за достовірність інформації, наданої при оформленні
                замовлення.
              </Text>

              <Text className={styles.textBlock}>
                9.3. У разі порушення умов цього Договору, сторони несуть відповідальність згідно з чинним
                законодавством України.
              </Text>
            </div>

            <Divider />

            <div>
              <Title order={3} className={styles.sectionTitle}>
                10. Захист персональних даних
              </Title>

              <Text className={styles.textBlock}>
                10.1. Оформлюючи замовлення, Покупець надає згоду на обробку своїх персональних даних
                відповідно до{' '}
                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                  Політики конфіденційності
                </a>
                .
              </Text>

              <Text className={styles.textBlock}>
                10.2. Продавець зобов'язується не розголошувати персональні дані Покупця третім особам, крім
                випадків, передбачених законодавством України.
              </Text>

              <Text className={styles.textBlock}>
                10.3. Передача персональних даних партнерам (служби доставки, платіжні системи) здійснюється
                виключно для виконання замовлення.
              </Text>
            </div>

            <Divider />

            <div>
              <Title order={3} className={styles.sectionTitle}>
                11. Форс-мажорні обставини
              </Title>

              <Text className={styles.textBlock}>
                11.1. Сторони звільняються від відповідальності за повне або часткове невиконання своїх
                зобов'язань, якщо невиконання є наслідком форс-мажорних обставин.
              </Text>

              <Text className={styles.textBlock}>
                11.2. До форс-мажорних обставин відносяться: стихійні лиха, війна, теракти, страйки, дії
                органів влади, аварії, відключення електроенергії, інші обставини непереборної сили.
              </Text>

              <Text className={styles.textBlock}>
                11.3. При настанні форс-мажорних обставин, сторона повідомляє іншу сторону протягом 3 робочих
                днів.
              </Text>
            </div>

            <Divider />

            <div>
              <Title order={3} className={styles.sectionTitle}>
                12. Вирішення спорів
              </Title>

              <Text className={styles.textBlock}>
                12.1. Всі спори та розбіжності, що виникають при виконанні цього Договору, вирішуються шляхом
                переговорів.
              </Text>

              <Text className={styles.textBlock}>
                12.2. У разі неможливості вирішення спору шляхом переговорів, спір передається на розгляд до
                суду за місцем знаходження Продавця відповідно до чинного законодавства України.
              </Text>

              <Text className={styles.textBlock}>
                12.3. До відносин між Покупцем та Продавцем застосовується право України.
              </Text>
            </div>

            <Divider />

            <div>
              <Title order={3} className={styles.sectionTitle}>
                13. Заключні положення
              </Title>

              <Text className={styles.textBlock}>
                13.1. Цей Договір набирає чинності з моменту оформлення Покупцем замовлення та діє до повного
                виконання зобов'язань сторонами.
              </Text>

              <Text className={styles.textBlock}>
                13.2. Продавець має право вносити зміни до умов цього Договору в односторонньому порядку,
                розмістивши нову редакцію на сайті.
              </Text>

              <Text className={styles.textBlock}>
                13.3. Зміни набувають чинності з моменту їх публікації на сайті інтернет-магазину.
              </Text>

              <Text className={styles.textBlock}>
                13.4. Чинна редакція Договору завжди знаходиться на сторінці {siteConfig.url}/public-offer
              </Text>

              <div className={styles.infoBox}>
                <Text size="sm">
                  <span className={styles.boldText}>Реквізити Продавця:</span>
                </Text>
                <Text size="sm" mt="xs">
                  Назва: {siteConfig.fullName}
                </Text>
                <Text size="sm">Адреса: {siteConfig.contacts.address}</Text>
                <Text size="sm">Телефон: {siteConfig.contacts.phone}</Text>
                <Text size="sm">Email: {siteConfig.contacts.email}</Text>
              </div>
            </div>

            <Divider />

            <div className={styles.blueAlert}>
              <Text size="sm">
                Оформлюючи замовлення на сайті, ви підтверджуєте, що ознайомлені з умовами цього Договору
                публічної оферти та повністю з ними згодні.
              </Text>
            </div>
          </Stack>
        </Paper>
      </Container>
    </div>
  );
};

export default PublicOffer;
