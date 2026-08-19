'use client';
// Кожен стиль — рядок з кружечками в реальних кольорових парах товарів:
// великий (64px, роздивитись) і маленький (28px, як у героя на головній).
import { Page } from '@/shared/components/Page/Page';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import styles from './swatches.module.scss';

// Живі пари з БД (switcherSwatch реальних товарів) + третій/четвертий кольори
// з самих артів — для стилів на 3–4 кольори
const PAIRS: Array<{ label: string; c1: string; c2: string; c3: string; c4: string }> = [
  { label: 'Культурний Фронт', c1: '#101413', c2: '#e0b23a', c3: '#c23b2e', c4: '#f2f2f2' },
  { label: 'Teleclectica', c1: '#b6d39a', c2: '#f2b8c0', c3: '#1a1a1a', c4: '#ffffff' },
  { label: 'Олько Козачок', c1: '#2b6cb0', c2: '#f6c94a', c3: '#d0342c', c4: '#f5f5f5' },
  { label: 'Нірвана Рунічна', c1: '#404040', c2: '#cfcd46', c3: '#efefef', c4: '#8a8a8a' },
  { label: 'Щільний ***', c1: '#d0d0d0', c2: '#a03040', c3: '#202020', c4: '#f0f0f0' },
];

interface SwatchStyle {
  id: string;
  title: string;
  hint: string;
  css: (c1: string, c2: string, c3: string, c4: string) => string;
}

const STYLES: SwatchStyle[] = [
  {
    id: 'pie4-plus',
    title: 'Піца 4 (як зараз)',
    hint: 'межі хрестом «+» — на малому розмірі читається квадратиками',
    css: (a, b) => `conic-gradient(from 0deg, ${a} 0 25%, ${b} 25% 50%, ${a} 50% 75%, ${b} 75% 100%)`,
  },
  {
    id: 'pie4-x',
    title: 'Піца 4 ромбом «×»',
    hint: 'ті самі чверті, але межі по діагоналях — квадратність зникає',
    css: (a, b) => `conic-gradient(from 45deg, ${a} 0 25%, ${b} 25% 50%, ${a} 50% 75%, ${b} 75% 100%)`,
  },
  {
    id: 'pie6',
    title: 'Піца 6 шматків',
    hint: 'тонші сектори — виразніше «колесо»',
    css: (a, b) =>
      `conic-gradient(from 0deg, ${a} 0 60deg, ${b} 60deg 120deg, ${a} 120deg 180deg, ${b} 180deg 240deg, ${a} 240deg 300deg, ${b} 300deg 360deg)`,
  },
  {
    id: 'pie8',
    title: 'Піца 8 шматків',
    hint: 'дрібна нарізка, здалеку зливається в шум',
    css: (a, b) =>
      `conic-gradient(from 22.5deg, ${a} 0 45deg, ${b} 45deg 90deg, ${a} 90deg 135deg, ${b} 135deg 180deg, ${a} 180deg 225deg, ${b} 225deg 270deg, ${a} 270deg 315deg, ${b} 315deg 360deg)`,
  },
  {
    id: 'half-diag',
    title: 'Половинки діагональні',
    hint: 'класика два-в-одному (так було до піци)',
    css: (a, b) => `linear-gradient(135deg, ${a} 50%, ${b} 50%)`,
  },
  {
    id: 'half-vert',
    title: 'Половинки вертикальні',
    hint: 'поділ по вертикалі, спокійний і чіткий',
    css: (a, b) => `linear-gradient(90deg, ${a} 50%, ${b} 50%)`,
  },
  {
    id: 'quarter',
    title: 'Чверть-акцент',
    hint: 'основний колір + чверть другого — тихіше за піцу',
    css: (a, b) => `conic-gradient(from 315deg, ${b} 0 25%, ${a} 25% 100%)`,
  },
  {
    id: 'donut',
    title: 'Кільце з центром',
    hint: 'другий колір обіймає перший — жодних прямих ліній',
    css: (a, b) => `radial-gradient(circle, ${a} 0 52%, ${b} 52% 100%)`,
  },
  {
    id: 'badge-dot',
    title: 'Крапка-супутник',
    hint: 'основний колір і маленька крапка другого у кутику',
    css: (a, b) => `radial-gradient(circle at 68% 30%, ${b} 0 20%, ${a} 21% 100%)`,
  },
  {
    id: 'stripes',
    title: 'Смужки діагональні',
    hint: 'тканинний ритм; на 28px стає дрібним',
    css: (a, b) => `repeating-linear-gradient(45deg, ${a} 0 5px, ${b} 5px 10px)`,
  },
  {
    id: 'pie3-colors',
    title: 'Піца 3 кольори',
    hint: 'три сектори по 120° — базова пара + акцент арту',
    css: (a, b, c) => `conic-gradient(from 90deg, ${a} 0 120deg, ${b} 120deg 240deg, ${c} 240deg 360deg)`,
  },
  {
    id: 'pie4-colors',
    title: 'Піца 4 кольори ромбом',
    hint: 'чотири чверті — кожна своїм кольором, межі по діагоналях',
    css: (a, b, c, d) => `conic-gradient(from 45deg, ${a} 0 25%, ${b} 25% 50%, ${c} 50% 75%, ${d} 75% 100%)`,
  },
  {
    id: 'rings3',
    title: 'Кільця 3 кольори',
    hint: 'центр + два кільця, жодних прямих ліній',
    css: (a, b, c) => `radial-gradient(circle, ${a} 0 36%, ${b} 36% 68%, ${c} 68% 100%)`,
  },
  {
    id: 'stripes3',
    title: 'Прапор з трьох смуг',
    hint: 'три горизонтальні смуги — читається як прапорець',
    css: (a, b, c) => `linear-gradient(180deg, ${a} 0 33.3%, ${b} 33.3% 66.6%, ${c} 66.6% 100%)`,
  },
  {
    id: 'pie6-colors3',
    title: 'Піца 6 × 3 кольори',
    hint: 'шість секторів, три кольори по колу двічі — «вертушка»',
    css: (a, b, c) =>
      `conic-gradient(from 0deg, ${a} 0 60deg, ${b} 60deg 120deg, ${c} 120deg 180deg, ${a} 180deg 240deg, ${b} 240deg 300deg, ${c} 300deg 360deg)`,
  },
  {
    id: 'polka',
    title: 'Горошок',
    hint: 'кружечки другого кольору по базовому — грайливо',
    css: (a, b) =>
      `radial-gradient(circle at 4.5px 4.5px, ${b} 2.2px, transparent 2.8px) 0 0 / 9px 9px, linear-gradient(${a}, ${a})`,
  },
  {
    id: 'bunting',
    title: 'Трикутнички-гірлянда',
    hint: 'ряди трикутників, як прапорці на святі',
    css: (a, b) =>
      `conic-gradient(from 150deg at 50% 62%, ${b} 0 60deg, transparent 60deg) 0 0 / 11px 10px, linear-gradient(${a}, ${a})`,
  },
  {
    id: 'checker',
    title: 'Шахматка',
    hint: 'класична клітинка двох кольорів',
    css: (a, b) => `conic-gradient(${b} 25%, ${a} 0 50%, ${b} 0 75%, ${a} 0) 0 0 / 12px 12px`,
  },
  {
    id: 'rays',
    title: 'Промені',
    hint: '12 промінчиків від центру — сонечко/вертушка',
    css: (a, b) => `repeating-conic-gradient(${a} 0 15deg, ${b} 15deg 30deg)`,
  },
  {
    id: 'offset-circle',
    title: 'Кружечок усередині',
    hint: 'зміщене коло другого кольору — просто і впізнавано',
    css: (a, b) => `radial-gradient(circle at 35% 35%, ${b} 0 42%, ${a} 45%)`,
  },
  {
    id: 'offset-circle-soft',
    title: 'Кружечок усередині + блюр',
    hint: 'та сама композиція, межа розмита широким переходом',
    css: (a, b) => `radial-gradient(circle at 35% 35%, ${b} 0 25%, ${a} 62%)`,
  },
  {
    id: 'offset-circle-glow',
    title: 'Кружечок-сяйво (сильний блюр)',
    hint: 'колір тане від центру до краю — виглядає як підсвітка',
    css: (a, b) => `radial-gradient(circle at 35% 35%, ${b} 0 8%, ${a} 85%)`,
  },
];

export const SwatchExamples = () => (
  <Page>
    <PageHeader
      title="Свотчі — приклади"
      description="Стилі поділу кружечка на живих парах кольорів товарів. Великий — роздивитись, маленький — реальний розмір у героя. Сторінка існує лише в DEV_MODE."
    />

    <div className={styles.list}>
      {STYLES.map((s) => (
        <section key={s.id} className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>{s.title}</h2>
            <p className={styles.cardHint}>{s.hint}</p>
          </div>
          <div className={styles.row}>
            {PAIRS.map((p) => (
              <figure key={p.label} className={styles.cell}>
                <span className={styles.big} style={{ background: s.css(p.c1, p.c2, p.c3, p.c4) }} />
                <span className={styles.small} style={{ background: s.css(p.c1, p.c2, p.c3, p.c4) }} />
                <figcaption>{p.label}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}
    </div>
  </Page>
);
