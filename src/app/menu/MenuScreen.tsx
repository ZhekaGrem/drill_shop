// src/app/menu/MenuScreen.tsx
// Екран «Меню» — заміна мобільній бургер-шторці.
//
// У шторці було чотири голі слова й ~700px порожнечі: жодних іконок, підписів
// чи станів, хоча решта сайту говорить рядками ListRow. Тут те саме вторинне
// меню зібране мовою Дії — групи-картки з тихим підписом і стрілкою,
// а головні режими (Головна / Каталог / Кошик) лишились у нижній панелі.
//
// ПРАВИЛО РІВНЯ ДЕТАЛІЗАЦІЇ (тримати при кожній правці): всередині однієї
// групи всі рядки несуть однакові шари. Розділи сайту — підпис без media;
// канали звʼязку — media-іконка + підпис, бо там іконка це впізнаваний знак
// каналу, а не декор. Раніше було навпаки: «Профіль» з іконкою поруч із
// «Мої замовлення» без неї, а «Правове» — без підписів узагалі, і група
// читалась як недороблена.
'use client';

import { Page } from '@/shared/components/Page/Page';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Section } from '@/shared/components/Section/Section';
import { ListGroup, ListRow } from '@/shared/components/ListGroup/ListGroup';
import { IconClock, IconInstagram, IconMail, IconPhone, IconTelegram } from '@/shared/components/Svg';
import { useAuthStore } from '@/shared/stores/auth';
import { siteConfig } from '@/shared/config/site';
import styles from './menu.module.scss';

export default function MenuScreen() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const userProfile = useAuthStore((state) => state.userProfile);
  const logout = useAuthStore((state) => state.logout);

  const isManager =
    userProfile?.role === 'MANAGER' || userProfile?.role === 'ADMIN' || userProfile?.role === 'SUPER_ADMIN';

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <Page width="narrow" className={styles.page}>
      <PageHeader title="Меню" description="Замовлення, довідка та все про магазин" />

      {/* «Увійти» та «Створити акаунт» прибрані (рішення власника) — вхід
          лише прямими URL (/login, /profile, /admin), як і «Кабінет» у хедері.
          Гість не бачить цієї секції взагалі; до ініціалізації auth теж не
          показуємо нічого, щоб група профілю не зʼявлялась стрибком уже
          після кліку. */}
      {isInitialized && isAuthenticated && (
        <Section>
          <ListGroup>
            <ListRow title="Профіль" hint={userProfile?.email ?? 'Особисті дані та адреси'} href="/profile" />
            <ListRow title="Мої замовлення" hint="Історія й статус доставки" href="/profile/orders" />
            {isManager && <ListRow title="Адмінпанель" hint="Товари, замовлення, клієнти" href="/admin" />}
          </ListGroup>
          {/* «Вийти» окремою групою: це третинна дія іншого роду, ніж переходи
              вище, і єдиний рядок без підпису — у власній групі він не виглядає
              недоробленим сусідом, а читається як свідомо відділений. */}
          <ListGroup className={styles.logoutGroup}>
            <ListRow title="Вийти" onClick={handleLogout} arrow={false} />
          </ListGroup>
        </Section>
      )}

      <Section title="Магазин">
        <ListGroup>
          <ListRow title="Про нас" hint="Хто ми і звідки береться мерч" href="/about" />
          <ListRow
            title="Доставка та оплата"
            hint="Нова Пошта, картка, накладений платіж"
            href="/delivery-and-payment"
          />
          <ListRow title="Обмін та повернення" hint="14 днів на непоношений мерч" href="/returns-exchanges" />
          <ListRow title="Питання та відповіді" hint="Найчастіше запитують про розміри" href="/faq" />
        </ListGroup>
      </Section>

      <Section title="Звʼязок">
        <ListGroup>
          <ListRow
            title="Написати нам"
            hint={siteConfig.contacts.email}
            media={<IconMail />}
            href="/contact"
          />
          <ListRow
            title="Зателефонувати"
            hint={siteConfig.contacts.phone}
            media={<IconPhone />}
            href={`tel:${siteConfig.contacts.phone.replace(/\s/g, '')}`}
          />
          {/* Графік роботи доїхав сюди з футера: на мобільному колонок футера
              більше немає, а знати години варто саме поруч із дзвінком.
              Окремим рядком, а не приписом до телефону: у підказці рядок
              «+38 … · Пн-Пт: 08:00 - 20:00 | Сб-Нд: 09:00 - 18:00» ламався б
              на два рядки й губив і номер, і графік. */}
          <ListRow title="Графік роботи" hint={siteConfig.workingHours} media={<IconClock />} arrow={false} />
          <ListRow
            title="Instagram"
            hint="Нові дропи, бекстейдж і анонси"
            media={<IconInstagram />}
            href={siteConfig.socials.instagram}
            external
          />
          <ListRow
            title="Telegram"
            hint="Питання про замовлення й наявність"
            media={<IconTelegram />}
            href={siteConfig.socials.telegram}
            external
          />
        </ListGroup>
      </Section>

      <Section title="Правове">
        <ListGroup>
          <ListRow title="Публічний договір" hint="Умови покупки, оплати й доставки" href="/public-offer" />
          <ListRow
            title="Політика конфіденційності"
            hint="Які дані ми збираємо і навіщо"
            href="/privacy-policy"
          />
        </ListGroup>
      </Section>
    </Page>
  );
}
