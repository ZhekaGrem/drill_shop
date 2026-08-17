// src/widgets/Footer/Footer.tsx
'use client';

import { Text } from '@mantine/core';
import { IconTelegram, IconInstagram } from '@/shared/components/Svg';
import styles from './footer.module.scss';
import { siteConfig } from '@/shared/config/site';
import { Logo } from '@/shared/components/Logo';

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className={`${styles.footer} `} data-footer role="contentinfo" aria-label="Інформація про сайт">
      {/* Верхній ярус посилань (Магазин / Покупцю / Час роботи) видалений
          (рішення власника): ті самі сторінки доступні з екрана «Меню».
          Лишилась тільки службова смуга — бренд, контакти, кредити та соцмережі поруч,
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
