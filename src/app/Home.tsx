// src/app/Home.tsx - REFACTORED
'use client';

import { HeroImageHome } from '@/widgets/HeroImage/HeroImage';
import styles from './home.module.scss';
import { Container, Text, Title, Group, Image, ActionIcon } from '@mantine/core';
import { Button } from '@/shared/components/Button/Button';
import { ImageTextSection } from '@/shared/components/ImageTextSection/ImageTextSection';
import { PopularProductsSlider } from '@/widgets/PopularProductsSlider/PopularProductsSlider';
import { siteConfig } from '@/shared/config/site';
import { content } from '@/shared/config/content';
import { assets } from '@/shared/config/assets';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useTimeout } from '@/shared/hooks';

const Home = () => {
  const router = useRouter();
  const { setTimeoutSafe } = useTimeout();

  const handleNavigation = useCallback(
    (href: string) => {
      router.push(href);
      setTimeoutSafe(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    },
    [router, setTimeoutSafe]
  );
  return (
    <>
      <HeroImageHome />

      <div className={styles.wrappingSection}>
        {/* Section 2: Two buttons */}
        <Container size="md" className={styles.buttonsSection}>
          <Group justify="space-between" className={styles.buttonGroup}>
            <Button size="xl" variant="primary" onClick={() => handleNavigation('/catalog')}>
              {content.home.buttons.freshProducts}
            </Button>
            <Button size="xl" variant="primary" onClick={() => handleNavigation('/catalog?promo=true')}>
              {content.home.buttons.specialOffers}
            </Button>
          </Group>
        </Container>
      </div>

      {/* Section 3: Parallax background with centered text */}
      <section className={styles.parallaxSection}>
        <div className={styles.parallaxContent}>
          <Title order={2} size="h1" className={styles.parallaxTitle}>
            {content.home.hero.title}
          </Title>
          <Text size="xl" className={styles.parallaxText}>
            {content.home.hero.description}
          </Text>
        </div>
      </section>

      {/* Section 4-5: Using unified ImageTextSection */}
      <ImageTextSection
        imageSrc={assets.home.sections.sausages}
        imageAlt="Доставка свіжих продуктів"
        imagePosition="left"
        subtitle={content.home.sections.freshness.subtitle}
        title={content.home.sections.freshness.title}
        titleColor="green"
        description={content.home.sections.freshness.description}
        buttonText={content.home.sections.freshness.buttonText}
        buttonOnClick={() => handleNavigation('/catalog')}
      />

      <ImageTextSection
        imageSrc={assets.home.sections.ribs}
        imageAlt="Гарантія якості від виробника"
        imagePosition="right"
        subtitle={content.home.sections.quality.subtitle}
        title={content.home.sections.quality.title}
        titleColor="primary"
        description={content.home.sections.quality.description}
        buttonText={content.home.sections.quality.buttonText}
        buttonOnClick={() => handleNavigation('/about')}
      />

      {/* Social media bar */}
      <section className={`${styles.socialBar} ${styles.wrappingSection}`}>
        <Container size="lg">
          <Title className={styles.socialTitle} order={2} ta="center" fw={700} mb="xl">
            {content.home.social.title}
          </Title>
          <Group gap="md" justify="center">
            <a href={siteConfig.socials.youtube} target="_blank" rel="noopener noreferrer">
              <ActionIcon
                size="2xl"
                variant="filled"
                color="rgba(255, 255, 255, 0)"
                className={styles.socialIcon}>
                <Image src={assets.social.youtube} alt="youtube" width={200} height={200} />
              </ActionIcon>
            </a>
            <a href={siteConfig.socials.tiktok} target="_blank" rel="noopener noreferrer">
              <ActionIcon
                size="2xl"
                variant="filled"
                color="rgba(255, 255, 255, 0)"
                className={styles.socialIcon}>
                <Image src={assets.social.tiktok} alt="tiktok" width={200} height={200} />
              </ActionIcon>
            </a>
            <a href={siteConfig.socials.instagram} target="_blank" rel="noopener noreferrer">
              <ActionIcon
                size="2xl"
                variant="filled"
                color="rgba(255, 255, 255, 0)"
                className={styles.socialIcon}>
                <Image src={assets.social.instagram} alt="instagram" width={200} height={200} />
              </ActionIcon>
            </a>
            <a href={siteConfig.socials.threads} target="_blank" rel="noopener noreferrer">
              <ActionIcon
                size="2xl"
                variant="filled"
                color="rgba(255, 255, 255, 0)"
                className={styles.socialIcon}>
                <Image src={assets.social.threads} alt="instagram" width={200} height={200} />
              </ActionIcon>
            </a>
          </Group>
        </Container>
      </section>

      {/* Product slider */}
      <PopularProductsSlider />
    </>
  );
};

export default Home;
