// src/widgets/Footer/Footer.tsx
'use client';

import { useState, useEffect } from 'react';
import { Container, Stack, Text } from '@mantine/core';
import { IconBrandInstagram, IconBrandTelegram } from '@tabler/icons-react';
import Link from 'next/link';
import styles from './footer.module.scss';
import { siteConfig } from '@/shared/config/site';

const currentYear = new Date().getFullYear();

export function Footer() {
  const [isVisible, setIsVisible] = useState(false);

  // Scroll animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const footer = document.querySelector('[data-footer]');
    if (footer) observer.observe(footer);

    return () => {
      if (footer) observer.unobserve(footer);
    };
  }, []);

  return (
    <footer
      className={`${styles.footer} ${isVisible ? styles.visible : ''}`}
      data-footer
      role="contentinfo"
      aria-label="Інформація про сайт">
      <Container size="lg" className={styles.container}>
        {/* Main footer grid */}
        <div className={styles.footerGrid}>
          {/* Column 1: Час роботи */}
          <div className={styles.linksColumn}>
            <Text className={styles.columnTitle}>Час роботи</Text>
            <Text className={styles.socialDescription}>Понеділок - Неділя{'\n'}З 8:00 до 23:00</Text>
          </div>

          {/* Column 2: Про нас */}
          <div className={styles.linksColumn}>
            <Text className={styles.columnTitle}>Про нас</Text>
            <Stack gap="xs">
              <Link href="/about">Зв'язок з нами</Link>
              <Link href="/delivery">Доставка та оплата</Link>
              <Link href="/returns">Обмін та Повернення</Link>
              <Link href="/terms">Публічний договір</Link>
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
                <IconBrandInstagram size={20} />
                <span>Instagram</span>
              </a>
              <a
                href={siteConfig.socials.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}>
                <IconBrandTelegram size={20} />
                <span>Telegram</span>
              </a>
            </Stack>
          </div>
        </div>

        {/* Bottom section */}
        <div className={styles.bottomSection}>
          <Text className={styles.copyright}>© {currentYear} DrillShop.com</Text>

          <div className={styles.designerSection}>
            <span>Designed by</span>
            <a href="https://www.behance.net/d-okuniev" target="_blank" rel="noopener noreferrer">
              Danil Okuniev
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
