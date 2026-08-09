// src/widgets/Footer/Footer.tsx
'use client';

import { Container, Stack, Text } from '@mantine/core';
import { IconTelegram, IconInstagram } from '@/shared/components/Svg';
import Link from 'next/link';
import styles from './footer.module.scss';
import { siteConfig } from '@/shared/config/site';
import { Logo } from '@/shared/components/Logo';

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className={`${styles.footer} `} data-footer role="contentinfo" aria-label="Інформація про сайт">
      <div className={styles.container}>
        {/* Main footer grid */}
        {/* Чотири колонки, і в КОЖНОЇ є заголовок одного класу. Раніше третя
            (контакти) заголовка не мала взагалі, а перші дві мали два різні
            класи — .columnTitle і .columnTitle__about, — які відрізнялись лише
            відсутнім margin-bottom, тож їхні перші рядки стояли на різній висоті. */}
        <div className={styles.footerGrid}>
          {/* Column 1: Магазин — у футері не було посилань на те, заради чого
              сайт існує: каталог і розпродаж */}
          <div className={styles.linksColumn}>
            <Text component="h2" className={styles.columnTitle}>
              Магазин
            </Text>
            <Stack gap="xs">
              <Link href="/catalog">Каталог</Link>
              <Link href="/catalog?promo=true">Розпродаж</Link>
              <Link href="/about">Про нас</Link>
              <Link href="/orders/track">Відстежити замовлення</Link>
            </Stack>
          </div>

          {/* Column 2: Покупцю */}
          <div className={styles.linksColumn}>
            <Text component="h2" className={styles.columnTitle}>
              Покупцю
            </Text>
            <Stack gap="xs">
              <Link href="/contact">Зв'язок з нами</Link>
              <Link href="/delivery-and-payment">Доставка та оплата</Link>
              <Link href="/returns-exchanges">Обмін та Повернення</Link>
              <Link href="/faq">Питання та відповіді</Link>
              <Link href="/public-offer">Публічний договір</Link>
              <Link href="/privacy-policy">Політика конфіденційності</Link>
            </Stack>
          </div>

          {/* Column 3: Час роботи */}
          <div className={styles.linksColumn}>
            <Text component="h2" className={styles.columnTitle}>
              Час роботи
            </Text>
            <Text className={styles.workingHours}>Понеділок — Неділя{'\n'}з 8:00 до 23:00</Text>
          </div>

          {/* Column 4: Контакти + Соцмережі */}
          <div className={styles.socialSection}>
            <Text component="h2" className={styles.columnTitle}>
              Контакти
            </Text>
            <div className={styles.contactInfo}>
              <a href={`mailto:${siteConfig.contacts.email}`} className={styles.contactItem}>
                {siteConfig.contacts.email}
              </a>
              <a href={`tel:${siteConfig.contacts.phone.replace(/\s/g, '')}`} className={styles.phoneNumber}>
                {siteConfig.contacts.phone}
              </a>
            </div>

            <div className={styles.socialIcons}>
              <a
                href={siteConfig.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className={styles.socialLink}>
                <IconInstagram />
                <span className="sr-only">Instagram</span>
              </a>
              <a
                href={siteConfig.socials.telegram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className={styles.socialLink}>
                <IconTelegram />
                <span className="sr-only">Telegram</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.line} />
      {/* Bottom section */}
      <div className={styles.container}>
        {/* Кредити були набрані 20px medium — тобто більшими й важчими за
            навігацію магазину (16px light) і за копірайт (14px). У футері
            магазину найпомітнішим виявлялось те, що потрібне найменше.
            Тепер це один тихий рядок 14px поруч з копірайтом. */}
        <div className={styles.bottomSection}>
          <div className={styles.bottomBrand}>
            <div className={styles.footerLogo}>
              <Logo size="sm" />
            </div>
            <Text className={styles.copyright}>© {currentYear} ye-dril.com</Text>
          </div>

          <div className={styles.credits}>
            <span>
              Розробка{' '}
              <a href="https://galychyna.online/" target="_blank" rel="noopener noreferrer">
                Galychyna
              </a>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Дизайн{' '}
              <a href="https://d-okuniev.framer.website/" target="_blank" rel="noopener noreferrer">
                Danil Okuniev
              </a>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Шрифт{' '}
              <a href="https://thedigital.gov.ua/fonts" target="_blank" rel="noopener noreferrer">
                e-Ukraine
              </a>{' '}
              © Мінцифра, CC BY 4.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
