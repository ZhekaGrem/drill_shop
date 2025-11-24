// src/shared/components/ImageTextSection/ImageTextSection.tsx
import { Title, Text, Image } from '@mantine/core';
import { Button } from '@/shared/components/Button/Button';
import styles from './imageTextSection.module.scss';
import Link from 'next/link';
interface ImageTextSectionProps {
  // Image props
  imageSrc: string;
  imageAlt: string;
  imagePosition?: 'left' | 'right';

  // Text content
  subtitle?: string;
  title: string;
  description: string;

  // Button (optional)
  buttonText?: string;
  buttonOnClick?: () => void;
  buttonHref?: string;

  // Styling
  backgroundColor?: string;
  titleColor?: 'primary' | 'secondary' | 'yellow' | 'green';
  className?: string;
}

export const ImageTextSection = ({
  imageSrc,
  imageAlt,
  imagePosition = 'left',
  subtitle,
  title,
  description,
  buttonText,
  buttonOnClick,
  buttonHref,
  backgroundColor = '#f8f9fa',
  titleColor = 'secondary',
  className = '',
}: ImageTextSectionProps) => {
  const titleColorClass = {
    primary: styles.titlePrimary,
    secondary: styles.titleSecondary,
    yellow: styles.titleYellow,
    green: styles.titleGreen,
  }[titleColor];

  const isImageLeft = imagePosition === 'left';

  return (
    <section className={`${styles.section} ${className}`} style={{ backgroundColor }}>
      <div className={`${styles.grid} ${isImageLeft ? '' : styles.gridReverse}`}>
        {/* Image Container */}
        <div className={styles.imageContainer}>
          <Image
            src={imageSrc}
            alt={imageAlt}
            className={styles.image}
            fallbackSrc="https://via.placeholder.com/600x500/ff6b6b/ffffff?text=Image"
          />
        </div>

        {/* Text Container */}
        <div className={styles.textContainer}>
          {subtitle && (
            <Title order={4} ta="center" fw={600} className={styles.subtitle}>
              {subtitle}
            </Title>
          )}

          <Title order={3} ta="center" fw={700} className={`${styles.title} ${titleColorClass}`}>
            {title}
          </Title>

          <Text className={styles.description}>{description}</Text>

          {buttonText && (
            <div className={styles.buttonContainer}>
              {buttonHref ? (
                <Link href={buttonHref}>
                  <Button variant="primary" color="red" size="lg" mt="lg" onClick={buttonOnClick}>
                    {buttonText}
                  </Button>
                </Link>
              ) : (
                <Button variant="primary" color="red" size="lg" mt="lg" onClick={buttonOnClick}>
                  {buttonText}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
