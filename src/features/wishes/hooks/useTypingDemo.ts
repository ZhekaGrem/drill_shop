// src/features/wishes/hooks/useTypingDemo.ts
// Програвач кадрів демо-набору (lib/typing-demo). Живе, поки `enabled` і не
// `suppressed` (людина щось увела); перший дотик людини — stop() — глушить
// демо до наступного увімкнення (нове відкриття шторки). Курсор «|» стоїть
// під час набору і блимає на паузах та після фіналу, як у редакторі.
// Reduced-motion: демо не стартує взагалі.
'use client';

import { useEffect, useState } from 'react';
import { TYPING_DEMO_SCRIPT, expandTypingScript, type DemoFrame } from '../lib/typing-demo';

const CARET = '|';
const CARET_OFF = ' ';
const CARET_BLINK_MS = 530;
// Перший кадр після того, як картка доїхала (--dur-sheet 300 мс) і око
// встигло її побачити
const START_DELAY_MS = 500;

export const useTypingDemo = (enabled: boolean, suppressed: boolean) => {
  const [stopped, setStopped] = useState(false);
  const [frame, setFrame] = useState<DemoFrame | null>(null);
  const [done, setDone] = useState(false);
  const [caretOn, setCaretOn] = useState(true);

  // Нове увімкнення знімає stop і старий кадр — під час рендера, як
  // seenRoute у Header: setState у тілі ефекту — помилка правила хуків.
  const [seenEnabled, setSeenEnabled] = useState(enabled);
  if (seenEnabled !== enabled) {
    setSeenEnabled(enabled);
    if (enabled) {
      setStopped(false);
      setFrame(null);
      setDone(false);
    }
  }

  const active = enabled && !stopped && !suppressed;

  useEffect(() => {
    if (!active) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const frames = expandTypingScript(TYPING_DEMO_SCRIPT);
    let i = 0;
    let timer = window.setTimeout(function show() {
      const next = frames[i];
      setFrame(next);
      setCaretOn(true);
      i += 1;
      if (i < frames.length) timer = window.setTimeout(show, next.delay);
      else setDone(true);
    }, START_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [active]);

  const blinking = active && frame !== null && (frame.kind === 'pause' || done);

  useEffect(() => {
    if (!blinking) return;
    const id = window.setInterval(() => setCaretOn((on) => !on), CARET_BLINK_MS);
    return () => window.clearInterval(id);
  }, [blinking]);

  return {
    /** Рядок для поля, або null — демо не показується */
    text: active && frame ? frame.text + (caretOn ? CARET : CARET_OFF) : null,
    stop: () => setStopped(true),
  };
};
