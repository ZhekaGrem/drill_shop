import Image from 'next/image';
import { Page } from '@/shared/components/Page/Page';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import styles from './about.module.scss';

const About = () => {
  return (
    <Page>
      <PageHeader title="Про нас" description="Хто ми, що робимо і чому мерч саме такий." />

      <div className={styles.hero}>
        <Image src="/assets/img/about/hero.png" alt="" fill className={styles.heroImage} />
      </div>

      <section className={styles.contentGrid}>
        <div className={styles.textContent}>
          <h2 className={styles.sectionTitle}>shchilnui drill shop</h2>
          <p className={styles.description}>
            Робимо не тільки Дрілл випускаємо щільні футбокли, носки, піни. Нормальні такі на вигляд. дрільна
            суміш РЕПА прицепа котлети та якості. Бери в нас поки не дали в рот!
          </p>
          <p className={styles.description}>
            Хто ми? Пацани які вирішили шо треба щось своє мутити. Не якісь там офісні клерки шо в костюмах
            ходять, а реальні пацики з вулиці. Ми знаємо шо таке справжній андеграунд, бо самі звідти вилізли.
          </p>
          <p className={styles.description}>
            Футболки наші - це не просто тряпки. Це твій щит від цього сірого світу. Одягнув - і ти вже не
            просто чувак, а той хто має стиль. Той хто не боїться бути собою серед цих всіх манекенів.
          </p>
          <p className={styles.description}>
            Весь цей мерч - це наш fuck you системі. Кожен принт - це наша історія, наші базари, наші гони. Це
            для тих хто не хоче бути як всі ці клони шо по ТЦ шаряться.
          </p>
          <p className={styles.description}>
            Якість? Та братан, ми самі носимо це! Думаєш ми будемо якесь лайно продавати? Ні блін, ми ж не
            лохи. Кожна футболка пройшла тест-драйв у наших пацанів. Якщо витримала наші покатушки - значить
            годиться.
          </p>
          <p className={styles.description}>
            Тож якщо ти не якась маргариноська а реальний чувак шо розуміє шо до чого - то вітаємо в
            сім&apos;ї. Бери мерч, носи з гордістю і посилай нахуй всіх хто щось там каже. Ми за своїх!
          </p>
        </div>

        <div className={styles.imageContent}>
          <div className={styles.imageWrapper}>
            <Image src="/assets/img/about/topMen.png" alt="" fill className={styles.sideImage} />
          </div>
          <p className={styles.captionText}>Купуй футболку як ці фанати, всім щільного здоровля!</p>
        </div>
      </section>
    </Page>
  );
};

export default About;
