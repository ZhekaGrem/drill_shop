// src/app/menu/MenuScreenWin98.tsx
// «Меню» в дизайні Windows 98 (сюди веде кнопка «Пуск» на панелі завдань). Ті самі розділи, що в MenuScreen, але
// кожна група — окреме вікно (Win98Window) з піксельними значками NT. Решта дизайнів рендерить незмінний MenuScreen.
'use client';

import { Page } from '@/shared/components/Page/Page';
import { ListGroup, ListRow } from '@/shared/components/ListGroup/ListGroup';
import { Win98Window } from '@/shared/components/Windows98/Win98Window';
import { Win98Icon } from '@/shared/components/Windows98/Win98Icons';
import { siteConfig } from '@/shared/config/site';
import styles from './menuWin98.module.scss';

interface MenuScreenWin98Props {
  /** Вікно облікового запису — лише для того, хто увійшов (і лише після ініціалізації auth) */
  account: { email?: string; isManager: boolean; onLogout: () => void } | null;
}

export function MenuScreenWin98({ account }: MenuScreenWin98Props) {
  return (
    <Page className={styles.page}>
      {/* Назва сторінки — для читачів екрана; на екрані «Меню» вже позначає кнопка «Пуск» на панелі завдань */}
      <h1 className={styles.srOnly}>Меню</h1>

      <div className={styles.grid}>
        {account && (
          <Win98Window title="Обліковий запис">
            <ListGroup>
              <ListRow
                title="Профіль"
                hint={account.email ?? 'Особисті дані та адреси'}
                media={<Win98Icon name="user" />}
                href="/profile"
              />
              <ListRow
                title="Мої замовлення"
                hint="Історія й статус доставки"
                media={<Win98Icon name="box" />}
                href="/profile/orders"
              />
              {account.isManager && (
                <ListRow
                  title="Адмінпанель"
                  hint="Товари, замовлення, клієнти"
                  media={<Win98Icon name="monitor" />}
                  href="/admin"
                />
              )}
              <ListRow
                title="Вийти"
                hint="Завершити сеанс на цьому пристрої"
                media={<Win98Icon name="logout" />}
                onClick={account.onLogout}
                arrow={false}
              />
            </ListGroup>
          </Win98Window>
        )}

        <Win98Window title="Магазин">
          <ListGroup>
            <ListRow
              title="Про нас"
              hint="Хто ми і звідки береться мерч"
              media={<Win98Icon name="info" />}
              href="/about"
            />
            <ListRow
              title="Доставка та оплата"
              hint="Нова Пошта, картка, накладений платіж"
              media={<Win98Icon name="truck" />}
              href="/delivery-and-payment"
            />
            <ListRow
              title="Обмін та повернення"
              hint="14 днів на непоношений мерч"
              media={<Win98Icon name="calendar" />}
              href="/returns-exchanges"
            />
            <ListRow
              title="Питання та відповіді"
              hint="Найчастіше запитують про розміри"
              media={<Win98Icon name="help" />}
              href="/faq"
            />
          </ListGroup>
        </Win98Window>

        <Win98Window title="Звʼязок">
          <ListGroup>
            <ListRow
              title="Написати нам"
              hint={siteConfig.contacts.email}
              media={<Win98Icon name="mail" />}
              href="/contact"
            />
            <ListRow
              title="Зателефонувати"
              hint={siteConfig.contacts.phone}
              media={<Win98Icon name="phone" />}
              href={`tel:${siteConfig.contacts.phone.replace(/\s/g, '')}`}
            />
            <ListRow
              title="Графік роботи"
              hint={siteConfig.workingHours}
              media={<Win98Icon name="clock" />}
              arrow={false}
            />
            <ListRow
              title="Instagram"
              hint="Нові дропи, бекстейдж і анонси"
              media={<Win98Icon name="camera" />}
              href={siteConfig.socials.instagram}
              external
            />
            <ListRow
              title="Telegram"
              hint="Питання про замовлення й наявність"
              media={<Win98Icon name="plane" />}
              href={siteConfig.socials.telegram}
              external
            />
          </ListGroup>
        </Win98Window>

        <Win98Window title="Правове">
          <ListGroup>
            <ListRow
              title="Публічний договір"
              hint="Умови покупки, оплати й доставки"
              media={<Win98Icon name="doc" />}
              href="/public-offer"
            />
            <ListRow
              title="Політика конфіденційності"
              hint="Які дані ми збираємо і навіщо"
              media={<Win98Icon name="lock" />}
              href="/privacy-policy"
            />
          </ListGroup>
        </Win98Window>
      </div>
    </Page>
  );
}
