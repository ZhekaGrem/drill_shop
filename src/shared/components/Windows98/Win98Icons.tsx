// src/shared/components/Windows98/Win98Icons.tsx
// Піксельні іконки в манері Windows NT 4 / 95: сітка 16×16, стандартна 16-кольорова палітра Windows, чорний контур.
// Намальовані для єДріл (не копії растрів Microsoft). Показуються рівно вдвічі більшими (32 px), щоб пікселі
// лишались квадратними: дробове масштабування розмило б їх. Рядок малюнка — 16 символів, крапка — прозорий піксель.
import type { ReactElement } from 'react';

const PALETTE: Record<string, string> = {
  K: '#000000',
  W: '#ffffff',
  G: '#c0c0c0',
  D: '#808080',
  Y: '#ffff00',
  O: '#808000',
  R: '#ff0000',
  r: '#800000',
  N: '#000080',
  B: '#0000ff',
  T: '#008080',
};

type Art = readonly string[];

// Тека Провідника
const FOLDER: Art = [
  '................',
  '................',
  '..KKKK..........',
  '.KYYYYK.........',
  'KYYYYYYKKKKKKKK.',
  'KYWWWWWWWWWWWWYK',
  'KYWYYYYYYYYYYYOK',
  'KYWYYYYYYYYYYYOK',
  'KYWYYYYYYYYYYYOK',
  'KYWYYYYYYYYYYYOK',
  'KYWYYYYYYYYYYYOK',
  'KYWYYYYYYYYYYYOK',
  'KYOOOOOOOOOOOOOK',
  '.KKKKKKKKKKKKKKK',
  '................',
  '................',
];

// Лінійка — «Розміри»
const RULER: Art = [
  '................',
  '................',
  '................',
  '................',
  '................',
  'KKKKKKKKKKKKKKKK',
  'KYKYYKYYKYYKYYYK',
  'KYKYYYYYKYYYYYYK',
  'KYYYYYYYYYYYYYYK',
  'KYYYYYYYYYYYYYYK',
  'KOOOOOOOOOOOOOOK',
  'KKKKKKKKKKKKKKKK',
  '................',
  '................',
  '................',
  '................',
];

// Футболка з принтом
const TEE: Art = [
  '................',
  '................',
  '...KKK....KKK...',
  '..KWWWKKKKWWWK..',
  '.KWWWWWWWWWWWWK.',
  'KWWWWWWWWWWWWWWK',
  'KWWKWWWWWWWWKWWK',
  '.KKKWWWWWWWWKKK.',
  '...KWWRRRRWWK...',
  '...KWWRRRRWWK...',
  '...KWWWWWWWWK...',
  '...KWWWWWWWWK...',
  '...KGGGGGGGGK...',
  '...KKKKKKKKKK...',
  '................',
  '................',
];

// Худі з капюшоном і кишенею
const HOODIE: Art = [
  '................',
  '.....KKKKKK.....',
  '....KDDDDDDK....',
  '...KDDKKKKDDK...',
  '...KDK....KDK...',
  '.KKKDDKKKKDDKKK.',
  'KDDDDDDDDDDDDDDK',
  'KDDKDDDDDDDDKDDK',
  'KDDKDDDDDDDDKDDK',
  'KDDKDDKKKKDDKDDK',
  'KDDKDKDDDDKDKDDK',
  'KGGKDDDDDDDDKGGK',
  'KKKKDDDDDDDDKKKK',
  '...KGGGGGGGGK...',
  '...KKKKKKKKKK...',
  '................',
];

// Коробка з посилки — «Інше»
const BOX: Art = [
  '................',
  '................',
  '................',
  '..KKKKKKKKKKKK..',
  '.KOYYYYRRYYYYOK.',
  'KKKKKKKRRKKKKKKK',
  'KYYYYYYRRYYYYYOK',
  'KYYYYYYRRYYYYYOK',
  'KYYYYYYRRYYYYYOK',
  'KYYYYYYRRYYYYYOK',
  'KYYYYYYRRYYYYYOK',
  'KYYYYYYRRYYYYYOK',
  'KOOOOOORROOOOOOK',
  'KKKKKKKKKKKKKKKK',
  '................',
  '................',
];

// Вантажівка — доставка
const TRUCK: Art = [
  '................',
  '................',
  '................',
  '................',
  'KKKKKKKKK.......',
  'KRRRRRRRK.......',
  'KRRRRRRRKKKKK...',
  'KRRRRRRRKWWWKK..',
  'KRRRRRRRKWWWWWK.',
  'KRRRRRRRKKKKKKKK',
  'KRRRRRRRKDDDDDDK',
  'KKKKKKKKKKKKKKKK',
  '..KDK......KDK..',
  '..KKK......KKK..',
  '................',
  '................',
];

// Платіжна картка — оплата
const CARD: Art = [
  '................',
  '................',
  '................',
  '................',
  'KKKKKKKKKKKKKKKK',
  'KNNNNNNNNNNNNNNK',
  'KKKKKKKKKKKKKKKK',
  'KNNNNNNNNNNNNNNK',
  'KNYYNNNNNNNNNNNK',
  'KNYYNNNNNNNNNNNK',
  'KNNNNNNWWWWWWNNK',
  'KNNNNNNNNNNNNNNK',
  'KKKKKKKKKKKKKKKK',
  '................',
  '................',
  '................',
];

// Календар «14» — повернення
const CALENDAR: Art = [
  '................',
  '................',
  '...KK....KK.....',
  '.KKKKKKKKKKKKKK.',
  '.KRRRRRRRRRRRRK.',
  '.KRRRRRRRRRRRRK.',
  '.KKKKKKKKKKKKKK.',
  '.KWWWWWWWWWWWWK.',
  '.KWKKWWKWWKWWWK.',
  '.KWWKWWKWWKWWWK.',
  '.KWWKWWKKKKKWWK.',
  '.KWWKWWWWWKWWWK.',
  '.KWKKKWWWWKWWWK.',
  '.KWWWWWWWWWWWWK.',
  '.KKKKKKKKKKKKKK.',
  '................',
];

// Інформація — біле коло з синьою «i»
const INFO: Art = [
  '................',
  '.....KKKKKK.....',
  '...KKWWWWWWKK...',
  '..KWWWWNNWWWWK..',
  '.KWWWWWNNWWWWWK.',
  '.KWWWWWWWWWWWWK.',
  'KWWWWWNNNWWWWWWK',
  'KWWWWWWNNWWWWWWK',
  'KWWWWWWNNWWWWWWK',
  'KWWWWWWNNWWWWWWK',
  '.KWWWWWNNWWWWWK.',
  '.KWWWWNNNNWWWWK.',
  '..KWWWWWWWWWWK..',
  '...KKWWWWWWKK...',
  '.....KKKKKK.....',
  '................',
];

// Довідка — біле коло із синім «?»
const HELP: Art = [
  '................',
  '.....KKKKKK.....',
  '...KKWWWWWWKK...',
  '..KWWWNNNNWWWK..',
  '.KWWWNNWWNNWWWK.',
  '.KWWWWWWWNNWWWK.',
  'KWWWWWWWNNWWWWWK',
  'KWWWWWWNNWWWWWWK',
  'KWWWWWWNNWWWWWWK',
  'KWWWWWWWWWWWWWWK',
  '.KWWWWWNNWWWWWK.',
  '.KWWWWWNNWWWWWK.',
  '..KWWWWWWWWWWK..',
  '...KKWWWWWWKK...',
  '.....KKKKKK.....',
  '................',
];

// Документ із загнутим кутом
const DOC: Art = [
  '................',
  '..KKKKKKKKK.....',
  '..KWWWWWWWKK....',
  '..KWWWWWWWKWK...',
  '..KWWWWWWWKKKK..',
  '..KWDDDDDWWWWK..',
  '..KWWWWWWWWWWK..',
  '..KWDDDDDDDDWK..',
  '..KWWWWWWWWWWK..',
  '..KWDDDDDDDDWK..',
  '..KWWWWWWWWWWK..',
  '..KWDDDDDWWWWK..',
  '..KWWWWWWWWWWK..',
  '..KKKKKKKKKKKK..',
  '................',
  '................',
];

// Замок — конфіденційність
const LOCK: Art = [
  '................',
  '................',
  '.....KKKKKK.....',
  '....KGGGGGGK....',
  '...KGK....KGK...',
  '...KGK....KGK...',
  '...KGK....KGK...',
  '..KKKKKKKKKKKK..',
  '..KYYYYYYYYYYK..',
  '..KYYYYKKYYYYK..',
  '..KYYYYKKYYYYK..',
  '..KYYYYYYYYYYK..',
  '..KOOOOOOOOOOK..',
  '..KKKKKKKKKKKK..',
  '................',
  '................',
];

// Користувач — профіль
const USER: Art = [
  '................',
  '......KKKK......',
  '.....KWWWWK.....',
  '....KWWWWWWK....',
  '....KWWWWWWK....',
  '....KWWWWWWK....',
  '.....KWWWWK.....',
  '......KKKK......',
  '....KKBBBBKK....',
  '...KBBBBBBBBK...',
  '..KBBBBBBBBBBK..',
  '..KBBBBBBBBBBK..',
  '..KBBBBBBBBBBK..',
  '..KKKKKKKKKKKK..',
  '................',
  '................',
];

// Монітор із бірюзовим робочим столом — адмінпанель
const MONITOR: Art = [
  '................',
  '.KKKKKKKKKKKKKK.',
  '.KGGGGGGGGGGGGK.',
  '.KGKKKKKKKKKKGK.',
  '.KGKTTTTTTTTKGK.',
  '.KGKTTTTTTTTKGK.',
  '.KGKTTTTTTTTKGK.',
  '.KGKTTTTTTTTKGK.',
  '.KGKKKKKKKKKKGK.',
  '.KGGGGGGGGGGGGK.',
  '.KKKKKKKKKKKKKK.',
  '......KGGK......',
  '....KKGGGGKK....',
  '...KGGGGGGGGK...',
  '...KKKKKKKKKK...',
  '................',
];

// Двері зі стрілкою — вихід
const LOGOUT: Art = [
  '................',
  '...KKKKKKKK.....',
  '...KDDDDDDK.....',
  '...KDrrrrDK.....',
  '...KDrrrrDK.....',
  '...KDrrrrDK..K..',
  '...KDrrrrDK..KK.',
  '...KDrrYrDKKKKKK',
  '...KDrrrrDK..KK.',
  '...KDrrrrDK..K..',
  '...KDrrrrDK.....',
  '...KDrrrrDK.....',
  '...KDDDDDDK.....',
  '..KKKKKKKKKK....',
  '................',
  '................',
];

// Конверт — пошта
const MAIL: Art = [
  '................',
  '................',
  '................',
  '................',
  'KKKKKKKKKKKKKKKK',
  'KWKWWWWWWWWWWKWK',
  'KWWKWWWWWWWWKWWK',
  'KWWWKWWWWWWKWWWK',
  'KWWWWKWWWWKWWWWK',
  'KWWWWWKKKKWWWWWK',
  'KWWWWWWWWWWWWWWK',
  'KWWWWWWWWWWWWWWK',
  'KKKKKKKKKKKKKKKK',
  '................',
  '................',
  '................',
];

// Настільний телефон
const PHONE: Art = [
  '................',
  '................',
  '..KKKK....KKKK..',
  '.KGGGGKKKKGGGGK.',
  '.KGGGGGGGGGGGGK.',
  '.KKKKGGGGGGKKKK.',
  '....KKGGGGKK....',
  '...KGGGGGGGGK...',
  '..KGGKKGGKKGGK..',
  '..KGGKKGGKKGGK..',
  '..KGGGGGGGGGGK..',
  '..KGGKKGGKKGGK..',
  '..KGGGGGGGGGGK..',
  '..KKKKKKKKKKKK..',
  '................',
  '................',
];

// Годинник — графік роботи
const CLOCK: Art = [
  '................',
  '.....KKKKKK.....',
  '...KKWWWWWWKK...',
  '..KWWWWKWWWWWK..',
  '.KWWWWWKWWWWWWK.',
  '.KWWWWWKWWWWWWK.',
  'KWWWWWWKWWWWWWWK',
  'KWWWWWWKKKKWWWWK',
  'KWWWWWWWWWWWWWWK',
  'KWWWWWWWWWWWWWWK',
  '.KWWWWWWWWWWWWK.',
  '.KWWWWWWWWWWWWK.',
  '..KWWWWWWWWWWK..',
  '...KKWWWWWWKK...',
  '.....KKKKKK.....',
  '................',
];

// Фотоапарат — Instagram
const CAMERA: Art = [
  '................',
  '................',
  '...KKKKK........',
  'KKKKGGGGKKKKKKKK',
  'KGGGGGGGGGGGGGGK',
  'KGGGGGKKKKGGGRGK',
  'KGGGGKNNNNKGGGGK',
  'KGGGKNNBBNNKGGGK',
  'KGGGKNBWBBNKGGGK',
  'KGGGKNNBBNNKGGGK',
  'KGGGGKNNNNKGGGGK',
  'KGGGGGKKKKGGGGGK',
  'KGGGGGGGGGGGGGGK',
  'KKKKKKKKKKKKKKKK',
  '................',
  '................',
];

// Паперовий літачок — Telegram
const PLANE: Art = [
  '................',
  '................',
  '..............KK',
  '............KKWK',
  '..........KKWWWK',
  '........KKWWWWK.',
  '......KKWWWWWWK.',
  '....KKWWWWWWWK..',
  '..KKBBWWWWWWWK..',
  '.KBBBBKWWWWWK...',
  '..KKKKKKWWWWK...',
  '......KKWWWK....',
  '.......KKWK.....',
  '........KK......',
  '................',
  '................',
];

// Кошик (як на робочому столі Windows) — з паперами й порожній
const BIN_FULL: Art = [
  '................',
  '....KKKKKKKK....',
  '...KWWWWWWWWK...',
  '..KKKKKKKKKKKK..',
  '..KGWGGGGGGGDK..',
  '...KWGDGGDGDK...',
  '...KWGDGGDGDK...',
  '...KWGDGGDGDK...',
  '...KWGDGGDGDK...',
  '...KWGDGGDGDK...',
  '...KWGDGGDGDK...',
  '...KWGDGGDGDK...',
  '...KGGGGGGGDK...',
  '....KKKKKKKK....',
  '................',
  '................',
];

const BIN_EMPTY: Art = [
  '................',
  '................',
  '................',
  '..KKKKKKKKKKKK..',
  '..KGWGGGGGGGDK..',
  '...KWGDGGDGDK...',
  '...KWGDGGDGDK...',
  '...KWGDGGDGDK...',
  '...KWGDGGDGDK...',
  '...KWGDGGDGDK...',
  '...KWGDGGDGDK...',
  '...KWGDGGDGDK...',
  '...KGGGGGGGDK...',
  '....KKKKKKKK....',
  '................',
  '................',
];

// Помилка — червоне коло з білим хрестом
const ERROR: Art = [
  '................',
  '.....KKKKKK.....',
  '...KKRRRRRRKK...',
  '..KRRRRRRRRRRK..',
  '.KRRWWRRRRWWRRK.',
  '.KRRRWWRRWWRRRK.',
  'KRRRRRWWWWRRRRRK',
  'KRRRRRRWWRRRRRRK',
  'KRRRRRWWWWRRRRRK',
  'KRRRRWWRRWWRRRRK',
  '.KRRWWRRRRWWRRK.',
  '.KRRRRRRRRRRRRK.',
  '..KRRRRRRRRRRK..',
  '...KKRRRRRRKK...',
  '.....KKKKKK.....',
  '................',
];

function PixelIcon({ art }: { art: Art }): ReactElement {
  // Сусідні пікселі одного кольору в рядку зливаються в один прямокутник: менше вузлів у DOM
  const rects: ReactElement[] = [];
  art.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      let end = x + 1;
      while (end < row.length && row[end] === c) end++;
      if (c !== '.') {
        rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={end - x} height={1} fill={PALETTE[c]} />);
      }
      x = end;
    }
  });
  return (
    <svg
      data-pixel-icon=""
      width="32"
      height="32"
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false">
      {rects}
    </svg>
  );
}

export const Win98FolderIcon = () => <PixelIcon art={FOLDER} />;

/** Іконка категорії за її слагом у базі; невідома категорія — тека */
export function Win98CategoryIcon({ slug }: { slug: string }) {
  const art = { size: RULER, 't-shirt': TEE, 't-shirts': TEE, buba: HOODIE, hoodies: HOODIE, inshe: BOX }[
    slug
  ];
  return <PixelIcon art={art ?? FOLDER} />;
}

/** Іконка пункту «доставка / оплата / повернення» за його назвою з content.home.trust */
export function Win98TrustIcon({ label }: { label: string }) {
  const art = /пошт|доставк/i.test(label)
    ? TRUCK
    : /оплат/i.test(label)
      ? CARD
      : /поверн/i.test(label)
        ? CALENDAR
        : FOLDER;
  return <PixelIcon art={art} />;
}

const NAMED = {
  folder: FOLDER,
  ruler: RULER,
  tee: TEE,
  hoodie: HOODIE,
  box: BOX,
  truck: TRUCK,
  card: CARD,
  calendar: CALENDAR,
  info: INFO,
  help: HELP,
  doc: DOC,
  lock: LOCK,
  user: USER,
  monitor: MONITOR,
  logout: LOGOUT,
  mail: MAIL,
  phone: PHONE,
  clock: CLOCK,
  camera: CAMERA,
  plane: PLANE,
  binFull: BIN_FULL,
  binEmpty: BIN_EMPTY,
  error: ERROR,
} as const;

export type Win98IconName = keyof typeof NAMED;

/** Будь-яка піксельна іконка за назвою */
export function Win98Icon({ name }: { name: Win98IconName }) {
  return <PixelIcon art={NAMED[name]} />;
}
