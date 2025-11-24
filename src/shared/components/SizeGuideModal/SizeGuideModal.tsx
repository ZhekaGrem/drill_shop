'use client';

import { Modal, Image, Text, Stack } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.css';
import styles from './SizeGuideModal.module.scss';

interface CategoryGuide {
  categoryName: string;
  imageUrl: string | null;
  text: string | null;
}

interface SizeGuideModalProps {
  opened: boolean;
  onClose: () => void;
  categories: CategoryGuide[];
}

export const SizeGuideModal = ({ opened, onClose, categories }: SizeGuideModalProps) => {
  // Фільтруємо категорії - тільки ті що мають хоча б щось (image або text)
  const validCategories = categories.filter((cat) => cat.imageUrl || cat.text);

  if (validCategories.length === 0) {
    return null;
  }

  // Якщо тільки одна категорія - показуємо без каруселі
  if (validCategories.length === 1) {
    const category = validCategories[0];
    return (
      <Modal
        opened={opened}
        onClose={onClose}
        title={`Інформація - ${category.categoryName}`}
        size="lg"
        centered>
        <Stack gap="md">
          {category.imageUrl && (
            <div className={styles.imageWrapper}>
              <Image
                src={category.imageUrl}
                alt={`Інформація ${category.categoryName}`}
                fit="contain"
                className={styles.sizeGuideImage}
              />
            </div>
          )}

          {category.text && (
            <div className={styles.textWrapper}>
              <Text size="sm" style={{ whiteSpace: 'pre-line' }}>
                {category.text}
              </Text>
            </div>
          )}
        </Stack>
      </Modal>
    );
  }

  // Якщо кілька категорій - показуємо з каруселлю
  return (
    <Modal opened={opened} onClose={onClose} title="Інформація про категорії" size="lg" centered>
      <Carousel
        withIndicators
        height="auto"
        slideSize="100%"
        slideGap="md"
        emblaOptions={{
          loop: true,
          align: 'center',
          slidesToScroll: 1,
        }}>
        {validCategories.map((category, index) => (
          <Carousel.Slide key={index}>
            <Stack gap="md">
              <Text size="lg" fw={600} ta="center">
                {category.categoryName}
              </Text>

              {category.imageUrl && (
                <div className={styles.imageWrapper}>
                  <Image
                    src={category.imageUrl}
                    alt={`Інформація ${category.categoryName}`}
                    fit="contain"
                    className={styles.sizeGuideImage}
                  />
                </div>
              )}

              {category.text && (
                <div className={styles.textWrapper}>
                  <Text size="sm" style={{ whiteSpace: 'pre-line' }}>
                    {category.text}
                  </Text>
                </div>
              )}
            </Stack>
          </Carousel.Slide>
        ))}
      </Carousel>
    </Modal>
  );
};
