'use client';

import { useState, useEffect, useTransition } from 'react';
import { ActionIcon, Container, Group, Image, Text, Stack, Flex } from '@mantine/core';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './footer.module.scss';
import { siteConfig, footerLinks, footerCategories } from '@/shared/config/site';
import { content } from '@/shared/config/content';
import { assets } from '@/shared/config/assets';

const currentYear = new Date().getFullYear();

export function Footer() {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

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

  // Scroll to top on link click
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();

    startTransition(() => {
      router.push(href);
      // Скрол вгору після навігації з невеликою затримкою
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    });
  };

  return (
    <footer
      className={`${styles.footer} ${isVisible ? styles.visible : ''}`}
      data-footer
      role="contentinfo"
      aria-label="Інформація про сайт">
      <div className={styles.topLine} />

      <Container size="lg" className={styles.container}>
        {/* Trust badges bar */}

        {/* Main footer grid */}
        <div className={styles.footerGrid}>
          {/* Company info */}
          <div className={styles.companySection}>
            <Image src={siteConfig.logo} alt={siteConfig.name} className={styles.logo} />
            <Text className={styles.companyDescription}>{content.footer.description}</Text>

            {/* Contact info */}
            <Stack gap="xs" className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <a href={`tel:${siteConfig.contacts.phone.replace(/\s/g, '')}`}>
                  {siteConfig.contacts.phone}
                </a>
              </div>
              {/* <div className={styles.contactItem}>
                <IconClock size={16} />
                <span>Пн-Нд: 8:00 - 20:00</span>
              </div>
              <div className={styles.contactItem}>
                <IconMapPin size={16} />
                <span>По всій Україні</span>
              </div> */}
            </Stack>
          </div>

          {/* Quick links */}
          <div className={styles.linksColumn}>
            <Text className={styles.columnTitle}>{content.footer.sections.customers}</Text>
            <Stack gap="xs">
              {footerLinks.map((link) => (
                <Link key={link.link} href={link.link} onClick={(e) => handleLinkClick(e, link.link)}>
                  {link.label}
                </Link>
              ))}
            </Stack>
          </div>

          {/* Product categories */}
          {/* <div className={styles.linksColumn}>
            <Text className={styles.columnTitle}>{content.footer.sections.categories}</Text>
            <Stack gap="xs">
              {footerCategories.map((category) => (
                <Link
                  key={category.link}
                  href={category.link}
                  onClick={(e) => handleLinkClick(e, category.link)}>
                  {category.label}
                </Link>
              ))}
            </Stack>
          </div> */}

          {/* Newsletter & Social */}
          <div className={styles.socialSection}>
            <Text className={styles.columnTitle}>{content.footer.sections.social}</Text>
            <Text size="sm" className={styles.socialDescription}>
              {content.footer.socialDescription}
            </Text>

            <Group gap="sm" className={styles.socialIcons}>
              <a
                href={siteConfig.socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube канал"
                className={styles.socialLink}>
                <ActionIcon size="lg" className={styles.socialIcon}>
                  <Image src={assets.social.youtube} alt="" width={20} height={20} />
                </ActionIcon>
              </a>
              <a
                href={siteConfig.socials.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok профіль"
                className={styles.socialLink}>
                <ActionIcon size="lg" className={styles.socialIcon}>
                  <Image src={assets.social.tiktok} alt="" width={20} height={20} />
                </ActionIcon>
              </a>
              <a
                href={siteConfig.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram профіль"
                className={styles.socialLink}>
                <ActionIcon size="lg" className={styles.socialIcon}>
                  <Image src={assets.social.instagram} alt="" width={20} height={20} />
                </ActionIcon>
              </a>
              <a
                href={siteConfig.socials.threads}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="threads профіль"
                className={styles.socialLink}>
                <ActionIcon size="lg" className={styles.socialIcon}>
                  <Image src={assets.social.threads} alt="" width={20} height={20} />
                </ActionIcon>
              </a>
            </Group>

            <div className={styles.blogLinks}>
              <a href={siteConfig.socials.youtube} target="_blank" rel="noopener noreferrer">
                {content.footer.blog}
              </a>
              <a
                href="https://www.instagram.com/stories/highlights/18255125920123857/"
                target="_blank"
                rel="noopener noreferrer">
                {content.footer.reviews}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className={styles.bottomSection}>
          <div className={styles.legalLinks}>
            <Link href="/privacy-policy" onClick={(e) => handleLinkClick(e, '/privacy-policy')}>
              {content.footer.privacyPolicy}
            </Link>
            {/* <Link href="/terms">Умови використання</Link> */}
          </div>

          <Text className={styles.copyright}>
            © {currentYear} {content.footer.copyright}
          </Text>
        </div>
      </Container>
    </footer>
  );
}
