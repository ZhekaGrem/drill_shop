// src/widgets/Footer/Footer.tsx
'use client';

import { Stack, Text } from '@mantine/core';
import { IconTelegram, IconInstagram } from '@/shared/components/Svg';
import Link from 'next/link';
import styles from './footer.module.scss';
import { siteConfig } from '@/shared/config/site';
import { Logo } from '@/shared/components/Logo';

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className={`${styles.footer} `} data-footer role="contentinfo" aria-label="Інформація про сайт">
      <div className={`${styles.container} ${styles.gridContainer}`}>
        {/* Головна сітка — тільки навігація магазину, за зразком diia.gov.ua:
            там верхній ярус футера це виключно колонки посилань, а контакти
            й соцмережі живуть окремо, у нижній службовій смузі.

            Нижче 1024px цей ярус ховається (див. .gridContainer): рівно ті самі
            посилання вже лежать на екрані «Меню» під нижньою панеллю, і
            показувати їх двічі — це змусити гортати довгий футер до того, що
            є за один тап (Occam's Razor). Брейкпоінт той самий, що й у
            SiteBottomNav, тому дубля немає на жодній ширині. */}
        <div className={styles.footerGrid}>
          <div className={styles.linksColumn}>
            <Text component="h2" className={styles.columnTitle}>
              Магазин
            </Text>
            <Stack gap="xs">
              <Link href="/catalog">Каталог</Link>
              <Link href="/about">Про нас</Link>
              <Link href="/orders/track">Відстежити замовлення</Link>
            </Stack>
          </div>

          <div className={styles.linksColumn}>
            <Text component="h2" className={styles.columnTitle}>
              Покупцю
            </Text>
            <Stack gap="xs">
              <Link href="/contact">Звʼязок з нами</Link>
              <Link href="/delivery-and-payment">Доставка та оплата</Link>
              <Link href="/returns-exchanges">Обмін та Повернення</Link>
              <Link href="/faq">Питання та відповіді</Link>
              <Link href="/public-offer">Публічний договір</Link>
              <Link href="/privacy-policy">Політика конфіденційності</Link>
            </Stack>
          </div>

          <div className={styles.linksColumn}>
            <Text component="h2" className={styles.columnTitle}>
              Час роботи
            </Text>
            {/* Було зашито в розмітці «Понеділок — Неділя з 8:00 до 23:00» —
                і це суперечило siteConfig.workingHours. Два різні графіки в
                одному репозиторії: джерело правди одне — конфіг. Розділювач
                ' | ' розгортаємо в перенос рядка (.workingHours має pre-line). */}
            <Text className={styles.workingHours}>{siteConfig.workingHours.split(' | ').join('\n')}</Text>
          </div>
        </div>
      </div>
      <div className={styles.line} />
      {/* Нижня службова смуга — бренд, контакти, кредити та соцмережі поруч,
          як у нижньому меню diia.gov.ua: там теж легальні посилання й
          «Слідкуй за нами тут:» стоять в одному тихому рядку під роздільником. */}
      <div className={styles.container}>
        <div className={styles.bottomSection}>
          <div className={styles.bottomBrand}>
            <div className={styles.footerLogo}>
              <Logo size="sm" inverse />
            </div>
            <Text className={styles.copyright}>© {currentYear} ye-dril.com</Text>
          </div>

          <div className={styles.bottomMeta}>
            <div className={styles.contactInfo}>
              <a href={`mailto:${siteConfig.contacts.email}`} className={styles.contactItem}>
                {siteConfig.contacts.email}
              </a>
              <a href={`tel:${siteConfig.contacts.phone.replace(/\s/g, '')}`} className={styles.contactItem}>
                {siteConfig.contacts.phone}
              </a>
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

          <div className={styles.socialSection}>
            <Text className={styles.socialLabel}>Стежте за нами:</Text>
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
    </footer>
  );
}
