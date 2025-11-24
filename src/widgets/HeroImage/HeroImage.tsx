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
            <Title className={styles.title}>Відчуйте Справжній Смак Українського Села.</Title>

            <Text className={styles.description} mt={5}>
              <b>Уявіть собі: </b>насичений аромат копчення на фруктовій трісці, ніжна текстура, що тане в
              роті, та глибокий, чистий смак, який неможливо сплутати. Це смак нашого сала. Створене з
              найкращих інгредієнтів, за перевіреними часом технологіями, воно пробуджує найтепліші
              спогади.{' '}
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
              Маєте питання про наші продукти чи послуги? Наша команда готова допомогти вам обрати найкраще.
              Ми цінуємо кожного клієнта і гарантуємо швидку відповідь на ваше звернення.{' '}
            </Text>
          </div>
        </div>
      </Container>
    </section>
  );
};
