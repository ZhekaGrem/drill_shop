// src/features/wishes/lib/typing-demo.ts
// Демо-набір у полі побажання: сценарій (репліки власника дослівно) і чиста
// функція, що розгортає його в кадри «що показати + скільки тримати».
// Без імпортів — перевіряється звичайним node (scripts/check-typing-demo.mjs).

export type DemoStep =
  | { type: 'type'; text: string }
  | { type: 'pause'; ms: number }
  | { type: 'backspace'; count: number }
  | { type: 'clear' };

export type FrameKind = 'type' | 'erase' | 'pause';

export interface DemoFrame {
  /** Що показати в полі */
  text: string;
  /** Скільки тримати цей кадр до наступного, мс */
  delay: number;
  kind: FrameKind;
}

/** Репліки власника (2026-09-18). Голос бренду — правопис не правити. */
export const TYPING_DEMO_SCRIPT: DemoStep[] = [
  { type: 'type', text: 'хотів би шоб ви зробили камізельку таку файну з надписом дзідзьо бог' },
  { type: 'pause', ms: 700 },
  { type: 'clear' },
  { type: 'type', text: 'зробіть для мене сайт може шоб там було багато всього і кароче ' },
  { type: 'pause', ms: 1400 },
  { type: 'clear' },
  { type: 'type', text: 'кароче я б хотів шоб ви написали новий альбом для дзідз' },
  { type: 'pause', ms: 500 },
  { type: 'backspace', count: 5 },
  { type: 'type', text: 'океана ельзи' },
  { type: 'pause', ms: 1000 },
  { type: 'clear' },
  { type: 'type', text: 'зробіть будь ласка штани з підігрівом і туда блютуз модуль ' },
  { type: 'pause', ms: 900 },
  { type: 'clear' },
  { type: 'type', text: 'введи шоб ти хотів шоб ми зробили і ми може зробим, а шо' },
];

// Темп. Набір 35–75 мс на літеру з розкидом (людина, не робот), після пробілу
// чи коми довше — пауза між словами. Стирання «утриманим бекспейсом» 22 мс,
// перші дві літери повільніше, наче палець щойно ліг на клавішу. Точковий
// бекспейс (дзідз → океана ельзи) 70 мс: він свідомий, по одній літері.
const TYPE_MIN_MS = 35;
const TYPE_JITTER_MS = 40;
const WORD_GAP_MS = 60;
const BACKSPACE_MS = 70;
const CLEAR_MS = 22;
const CLEAR_RAMP_MS = [70, 45];

/** Сценарій → кадри. `random` передається явно, щоб перевірки були детерміновані. */
export const expandTypingScript = (script: DemoStep[], random: () => number = Math.random): DemoFrame[] => {
  const frames: DemoFrame[] = [];
  const current: string[] = [];
  const push = (kind: FrameKind, delay: number) => frames.push({ text: current.join(''), delay, kind });

  for (const step of script) {
    if (step.type === 'type') {
      for (const ch of Array.from(step.text)) {
        current.push(ch);
        const wordGap = ch === ' ' || ch === ',' ? WORD_GAP_MS : 0;
        push('type', TYPE_MIN_MS + Math.round(random() * TYPE_JITTER_MS) + wordGap);
      }
    } else if (step.type === 'pause') {
      push('pause', step.ms);
    } else if (step.type === 'backspace') {
      for (let i = 0; i < step.count && current.length > 0; i += 1) {
        current.pop();
        push('erase', BACKSPACE_MS);
      }
    } else {
      for (let i = 0; current.length > 0; i += 1) {
        current.pop();
        push('erase', CLEAR_RAMP_MS[i] ?? CLEAR_MS);
      }
    }
  }
  return frames;
};
