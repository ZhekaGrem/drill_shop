import { Container, Text, Title } from '@mantine/core';
import styles from './heroImageRight.module.scss';
import { Button } from '@/shared/components/Button/Button';
import Link from 'next/link';
export const HeroImageHome = () => {
  return (
    <section className={styles.root}>
      <Container size="lg">
        <div className={styles.inner}>
          <div className={styles.content}>
            <Title className={styles.title}>Офіційний мерч Щільного Drill.</Title>

            <Text className={styles.description} mt={5}>
              <b>Носи своє: </b>футболки, худі, постери та аксесуари, виготовлені у Львові лімітованими
              тиражами. Щільна бавовна, точний друк, без перепродажу та fan-made копій — лише офіційний
              мерч від бренду.{' '}
            </Text>
            <Link href="/catalog">
              <Button mt={15}>купити зараз</Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
};

export const HeroImageContact = () => {
  return (
    <section className={`${styles.root} ${styles.contact}`}>
      <Container size="lg">
        <div className={`${styles.inner} ${styles.innerContact}`}>
          <div className={`${styles.content} ${styles.contentContact}`}>
            <Title className={styles.title}>Завжди на зв'язку</Title>

            <Text className={styles.description} mt={5}>
              Маєте питання про мерч, розмір чи доставку? Наша команда готова підказати, що обрати, та
              гарантує швидку відповідь на ваше звернення.{' '}
            </Text>
          </div>
        </div>
      </Container>
    </section>
  );
};
