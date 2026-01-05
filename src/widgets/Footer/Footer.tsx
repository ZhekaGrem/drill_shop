// src/widgets/Footer/Footer.tsx
'use client';

import { Container, Stack, Text } from '@mantine/core';
import { IconTelegram, IconInstagram } from '@/shared/components/Svg';
import Link from 'next/link';
import styles from './footer.module.scss';
import { siteConfig } from '@/shared/config/site';

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className={`${styles.footer} `} data-footer role="contentinfo" aria-label="Інформація про сайт">
      <div className={styles.container}>
        {/* Main footer grid */}
        <div className={styles.footerGrid}>
          {/* Column 1: Час роботи */}
          <div className={styles.linksColumn}>
            <Text className={styles.columnTitle}>Час роботи</Text>
            <Text className={styles.socialDescription}>Понеділок - Неділя{'\n'}З 8:00 до 23:00</Text>
          </div>

          {/* Column 2: Про нас */}
          <div className={styles.linksColumn}>
            <Text className={styles.columnTitle__about}>Про нас</Text>
            <Stack gap="xs">
              <Link href="/about">Зв'язок з нами</Link>
              <Link href="/delivery-and-payment">Доставка та оплата</Link>
              <Link href="/returns-exchanges">Обмін та Повернення</Link>
              <Link href="/public-offer">Публічний договір</Link>
            </Stack>
          </div>

          {/* Column 3: Контакти + Соцмережі */}
          <div className={styles.socialSection}>
            <div className={styles.contactInfo}>
              <a href={`mailto:${siteConfig.contacts.email}`} className={styles.contactItem}>
                {siteConfig.contacts.email}
              </a>
              <a href={`tel:${siteConfig.contacts.phone.replace(/\s/g, '')}`} className={styles.phoneNumber}>
                {siteConfig.contacts.phone}
              </a>
            </div>

            <Stack gap="sm" mt="md">
              <a
                href={siteConfig.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}>
                <IconInstagram />
                <span>Instagram</span>
              </a>
              <a
                href={siteConfig.socials.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}>
                <IconTelegram />
                <span>Telegram</span>
              </a>
            </Stack>
          </div>
        </div>
      </div>
      <div className={styles.line} />
      {/* Bottom section */}
      <div className={styles.container}>
        <div className={styles.bottomSection}>
          <Text className={styles.copyright}>© {currentYear} shchilnuidrill.com</Text>

          <div className={styles.designerSection}>
            <span>Developed</span>
            <p>L&H.STUDIO</p>
          </div>
          <div className={styles.designerSection}>
            <span>Designed by</span>
            <a href="https://d-okuniev.framer.website/" target="_blank" rel="noopener noreferrer">
              <svg width="20" height="20" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M17.6162 3.4668C21.3429 3.4668 24.5089 4.60698 26.46 7.0293C28.393 9.42923 28.8048 12.5904 28.2295 15.8623C27.448 20.3069 24.9372 23.1129 22.041 24.7109C19.2699 26.2398 16.2902 26.6806 13.8945 26.6807H0.473633L2.0293 22.5488H6.38281V15.0889H10.7021V22.5488H13.8945C16.4478 22.5488 18.2168 21.9356 19.791 20.8955C21.3651 19.8554 23.0432 18.0025 23.5479 15.1328C23.9499 12.8462 23.6454 11.0123 22.7793 9.68457C21.9129 8.3568 20.2557 7.60254 17.6162 7.60254H15.0225V15.0889H10.7021V7.60254H4.88867L6.45605 3.4668H17.6162Z"
                  fill="currentColor"
                />
              </svg>
              <span>Danil Okuniev</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
