// src/app/privacy-policy/PrivacyPolicy.tsx

import { Container, Title, Text, Paper, Stack, Divider, List, ListItem } from '@mantine/core';

import styles from './privacyPolicy.module.scss';

const PrivacyPolicy = () => {
  return (
    <div className={styles.page}>
      <Container size="md" py="xl">
        <Stack align="center" mb="xl">
          <Title order={1} className={styles.title}>
            Політика конфіденційності
          </Title>
          <Text size="lg" className={styles.subtitle}>
            Ця політика описує, як ми збираємо, використовуємо та захищаємо ваші персональні дані відповідно
            до законодавства України
          </Text>
        </Stack>

        <Paper p="xl" withBorder radius="md">
          <Stack gap="xl">
            <div>
              <Text className={styles.textBlock}>
                Використовуючи наш веб-сайт та сервіси, ви погоджуєтеся з умовами цієї Політики
                конфіденційності.
              </Text>

              <Text className={styles.textBlock}>Ця політика розроблена відповідно до:</Text>

              <List spacing="xs" size="sm">
                <ListItem>Закону України "Про захист персональних даних"</ListItem>
                <ListItem>Загального регламенту про захист даних (GDPR)</ListItem>
                <ListItem>Закону України "Про електронну комерцію"</ListItem>
                <ListItem>Закону України "Про інформацію"</ListItem>
              </List>
            </div>

            <Divider />

            <div>
              <Title order={3} className={styles.sectionTitle}>
                {' '}
                Які дані ми збираємо
              </Title>

              <Text className={styles.textBlock}>
                Ми можемо збирати наступні категорії персональних даних:
              </Text>

              <Title order={4} size="md" className={styles.subsectionTitle}>
                {' '}
                Дані, які ви надаєте добровільно:
              </Title>
              <List spacing="xs" size="sm" className={styles.textBlock}>
                <ListItem>Ім'я та прізвище</ListItem>
                <ListItem>Адреса електронної пошти</ListItem>
                <ListItem>Номер телефону</ListItem>
                <ListItem>Адреса доставки</ListItem>
                <ListItem>Дата народження (за бажанням)</ListItem>
                <ListItem>Інформація про платежі (через захищені платіжні системи)</ListItem>
              </List>

              <Title order={4} size="md" className={styles.subsectionTitle}>
                {' '}
                Дані, які збираються автоматично:
              </Title>
              <List spacing="xs" size="sm" className={styles.textBlock}>
                <ListItem>IP-адреса</ListItem>
                <ListItem>Тип браузера та операційна система</ListItem>
                <ListItem>Сторінки, які ви відвідуєте на сайті</ListItem>
                <ListItem>Час та тривалість відвідування</ListItem>
                <ListItem>Файли cookies та подібні технології</ListItem>
              </List>
            </div>

            <Divider />

            <div>
              <Title order={3} className={styles.sectionTitle}>
                {' '}
                Як ми використовуємо ваші дані
              </Title>

              <Text className={styles.textBlock}>Ваші персональні дані використовуються для:</Text>

              <List spacing="sm" size="sm">
                <ListItem className={styles.listItem}>
                  <Text className={styles.boldText}>Обробки замовлень</Text>
                  <Text className={styles.dimmedText}>
                    Створення замовлення, обробка платежів, доставка товарів
                  </Text>
                </ListItem>
                <ListItem className={styles.listItem}>
                  <Text className={styles.boldText}>Зв'язку з клієнтами</Text>
                  <Text className={styles.dimmedText}>
                    Підтвердження замовлень, повідомлення про статус доставки
                  </Text>
                </ListItem>
                <ListItem className={styles.listItem}>
                  <Text className={styles.boldText}>Покращення сервісу</Text>
                  <Text className={styles.dimmedText}>
                    Аналіз використання сайту, персоналізація контенту
                  </Text>
                </ListItem>
                <ListItem className={styles.listItem}>
                  <Text className={styles.boldText}>Маркетингової діяльності</Text>
                  <Text className={styles.dimmedText}>Розсилка новин, пропозицій (лише за вашою згодою)</Text>
                </ListItem>
                <ListItem className={styles.listItem}>
                  <Text className={styles.boldText}>Забезпечення безпеки</Text>
                  <Text className={styles.dimmedText}>Запобігання шахрайству, захист від кібератак</Text>
                </ListItem>
                <ListItem className={styles.listItem}>
                  <Text className={styles.boldText}>Виконання правових зобов'язань</Text>
                  <Text className={styles.dimmedText}>Ведення обліку, податкова звітність</Text>
                </ListItem>
              </List>
            </div>

            <Divider />

            <div>
              <Title order={3} className={styles.sectionTitle}>
                {' '}
                Передача даних третім особам
              </Title>

              <Text className={styles.textBlock}>
                Ми можемо передавати ваші персональні дані третім особам лише у наступних випадках:
              </Text>

              <List spacing="sm" size="sm">
                <ListItem className={styles.listItem}>
                  <Text className={styles.boldText}>Сервісні партнери</Text>
                  <Text className={styles.dimmedText}>
                    Служби доставки, платіжні системи, хостинг-провайдери
                  </Text>
                </ListItem>
                <ListItem className={styles.listItem}>
                  <Text className={styles.boldText}>За вашою згодою</Text>
                  <Text className={styles.dimmedText}>Коли ви явно погоджуєтесь на передачу даних</Text>
                </ListItem>
                <ListItem className={styles.listItem}>
                  <Text className={styles.boldText}>Правові вимоги</Text>
                  <Text className={styles.dimmedText}>
                    За запитом органів державної влади відповідно до закону
                  </Text>
                </ListItem>
                <ListItem className={styles.listItem}>
                  <Text className={styles.boldText}>Захист прав</Text>
                  <Text className={styles.dimmedText}>
                    Для захисту наших прав, безпеки користувачів або суспільства
                  </Text>
                </ListItem>
              </List>

              <div className={styles.orangeAlert}>
                <Text size="sm">
                  <span className={styles.boldText}>Важливо:</span> Ми ніколи не продаємо ваші персональні
                  дані рекламодавцям або іншим комерційним організаціям.
                </Text>
              </div>
            </div>

            <Divider />

            <div>
              <Title order={3} className={styles.sectionTitle}>
                {' '}
                Захист ваших даних
              </Title>

              <Text className={styles.textBlock}>
                Ми застосовуємо сучасні технічні та організаційні заходи для захисту ваших персональних даних:
              </Text>

              <List spacing="sm" size="sm">
                <ListItem>SSL-шифрування для передачі даних</ListItem>
                <ListItem>Захищені сервери з обмеженим доступом</ListItem>
                <ListItem>Регулярне оновлення систем безпеки</ListItem>
                <ListItem>Навчання співробітників з питань конфіденційності</ListItem>
                <ListItem>Регулярний аудит безпеки</ListItem>
                <ListItem>Резервне копіювання даних</ListItem>
              </List>

              <div className={styles.redAlert}>
                <Text size="sm">
                  <span className={styles.boldText}>Зверніть увагу:</span> Жоден метод передачі або зберігання
                  даних не є на 100% безпечним. Хоча ми докладаємо всіх зусиль для захисту ваших даних, ми не
                  можемо гарантувати абсолютну безпеку.
                </Text>
              </div>
            </div>

            <Divider />

            <div>
              <Title order={3} className={styles.sectionTitle}>
                {' '}
                Ваші права
              </Title>

              <Text className={styles.textBlock}>
                Відповідно до законодавства України, ви маєте наступні права:
              </Text>

              <List spacing="sm" size="sm">
                <ListItem className={styles.listItem}>
                  <Text className={styles.boldText}>Право на доступ</Text>
                  <Text className={styles.dimmedText}>
                    Отримання інформації про те, які дані ми обробляємо
                  </Text>
                </ListItem>
                <ListItem className={styles.listItem}>
                  <Text className={styles.boldText}>Право на виправлення</Text>
                  <Text className={styles.dimmedText}>Коригування неточних або неповних даних</Text>
                </ListItem>
                <ListItem className={styles.listItem}>
                  <Text className={styles.boldText}>Право на видалення</Text>
                  <Text className={styles.dimmedText}>
                    Вимога видалити ваші персональні дані ("право на забуття")
                  </Text>
                </ListItem>
                <ListItem className={styles.listItem}>
                  <Text className={styles.boldText}>Право на обмеження обробки</Text>
                  <Text className={styles.dimmedText}>
                    Призупинення обробки ваших даних в певних обставинах
                  </Text>
                </ListItem>
                <ListItem className={styles.listItem}>
                  <Text className={styles.boldText}>Право на портативність</Text>
                  <Text className={styles.dimmedText}>Отримання копії ваших даних у зручному форматі</Text>
                </ListItem>
                <ListItem className={styles.listItem}>
                  <Text className={styles.boldText}>Право заперечення</Text>
                  <Text className={styles.dimmedText}>
                    Заперечення проти обробки ваших даних в певних цілях
                  </Text>
                </ListItem>
              </List>

              <div className={styles.infoBox}>
                <Text size="sm">
                  <span className={styles.boldText}>Як скористатися своїми правами:</span> Надішліть запит на
                  нашу електронну пошту з детальним описом вашого прохання. Ми розглянемо ваш запит протягом
                  30 днів.
                </Text>
              </div>
            </div>

            <Divider />

            <div>
              <Title order={3} className={styles.sectionTitle}>
                {' '}
                Використання cookies
              </Title>

              <Text className={styles.textBlock}>
                Наш веб-сайт використовує cookies для покращення вашого досвіду використання:
              </Text>

              <List spacing="sm" size="sm" className={styles.textBlock}>
                <ListItem className={styles.listItem}>
                  <Text className={styles.boldText}>Обов'язкові cookies</Text>
                  <Text className={styles.dimmedText}>Необхідні для роботи сайту (авторизація, кошик)</Text>
                </ListItem>
                <ListItem className={styles.listItem}>
                  <Text className={styles.boldText}>Функціональні cookies</Text>
                  <Text className={styles.dimmedText}>Запам'ятовування ваших налаштувань</Text>
                </ListItem>
                <ListItem className={styles.listItem}>
                  <Text className={styles.boldText}>Аналітичні cookies</Text>
                  <Text className={styles.dimmedText}>Аналіз використання сайту (Google Analytics)</Text>
                </ListItem>
                <ListItem className={styles.listItem}>
                  <Text className={styles.boldText}>Маркетингові cookies</Text>
                  <Text className={styles.dimmedText}>Персоналізація реклами (лише за згодою)</Text>
                </ListItem>
              </List>

              <Text size="sm" className={styles.dimmedText}>
                Ви можете налаштувати використання cookies у своєму браузері або скористатися нашим
                інструментом управління згодою.
              </Text>
            </div>

            <Divider />

            <div>
              <Title order={3} className={styles.sectionTitle}>
                {' '}
                Зберігання даних
              </Title>
              <Text className={styles.textBlock}>Ми зберігаємо ваші персональні дані протягом:</Text>
              <List spacing="sm" size="sm">
                <ListItem className={styles.listItem}>
                  <Text className={styles.boldText}>Дані акаунта</Text>
                  <Text className={styles.dimmedText}>До видалення акаунта або 3 роки неактивності</Text>
                </ListItem>
                <ListItem className={styles.listItem}>
                  <Text className={styles.boldText}>Дані замовлень</Text>
                  <Text className={styles.dimmedText}>5 років для бухгалтерського обліку</Text>
                </ListItem>
                <ListItem className={styles.listItem}>
                  <Text className={styles.boldText}>Маркетингові дані</Text>
                  <Text className={styles.dimmedText}>До відписки або 2 роки неактивності</Text>
                </ListItem>
                <ListItem className={styles.listItem}>
                  <Text className={styles.boldText}>Логи та технічні дані</Text>
                  <Text className={styles.dimmedText}>12 місяців для забезпечення безпеки</Text>
                </ListItem>
              </List>
            </div>

            <div className={styles.blueAlert}>
              <Text size="sm">
                Рекомендуємо періодично переглядати цю сторінку для отримання актуальної інформації про наші
                практики захисту конфіденційності.
              </Text>
            </div>
          </Stack>
        </Paper>
      </Container>
    </div>
  );
};

export default PrivacyPolicy;
