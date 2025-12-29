'use client';

import { Box, Container, Title, Text } from '@mantine/core';
import Image from 'next/image';
import styles from './about.module.scss';

const About = () => {
  return (
    <>
      <div className={styles.container}>
        <Title order={1} className={styles.pageTitle}>
          ПРО НАС
        </Title>
      </div>

      <Box className={styles.heroSection}>
        <Image src="/assets/img/about/hero.png" alt="Hero" fill className={styles.heroImage} />
      </Box>

      <Box className={styles.contentGrid}>
        <Box className={styles.textContent}>
          <div  >
            <Title className={styles.sectionTitle} >
              shchilnui drill shop
            </Title>
            <Text className={styles.description} mb="lg">
              Робимо не тільки Дрілл випускаємо щільні футбокли, носки, піни. Нормальні такі на вигляд.
              дрільна суміш РЕПА прицепа котлети та якості. Бери в нас поки не дали в рот!
            </Text>
            <Text className={styles.description} mb="lg">
              Хто ми? Пацани які вирішили шо треба щось своє мутити. Не якісь там офісні клерки шо в костюмах
              ходять, а реальні пацики з вулиці. Ми знаємо шо таке справжній андеграунд, бо самі звідти
              вилізли.
            </Text>
            <Text className={styles.description} mb="lg">
              Футболки наші - це не просто тряпки. Це твій щит від цього сірого світу. Одягнув - і ти вже не
              просто чувак, а той хто має стиль. Той хто не боїться бути собою серед цих всіх манекенів.
            </Text>
            <Text className={styles.description} mb="lg">
              Весь цей мерч - це наш fuck you системі. Кожен принт - це наша історія, наші базари, наші гони.
              Це для тих хто не хоче бути як всі ці клони шо по ТЦ шаряться.
            </Text>
            <Text className={styles.description} mb="lg">
              Якість? Та братан, ми самі носимо це! Думаєш ми будемо якесь лайно продавати? Ні блін, ми ж не
              лохи. Кожна футболка пройшла тест-драйв у наших пацанів. Якщо витримала наші покатушки - значить
              годиться.
            </Text>
            <Text className={styles.description}>
              Тож якщо ти не якась маргариноська а реальний чувак шо розуміє шо до чого - то вітаємо в сім'ї.
              Бери мерч, носи з гордістю і посилай нахуй всіх хто щось там каже. Ми за своїх!
            </Text>
          </div>
        </Box>
        <Box className={styles.imageContent}>
          <Box className={styles.imageWrapper}>
            <Image src="/assets/img/about/topMen.png" alt="Top Men" fill className={styles.sideImage} />
          </Box>
          <Box className={styles.imageCaption}>
            <Text className={styles.captionText}>Купуй футболку як ці фанати, всім щільного здоровля!</Text>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default About;
