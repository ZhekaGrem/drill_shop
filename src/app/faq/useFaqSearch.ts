// src/app/faq/useFaqSearch.ts
// Пошук по FAQ — спільний для звичайної сторінки (FAQ.tsx) і вікон Windows 98 (FAQWin98.tsx).
'use client';

import { useMemo, useState } from 'react';
import { faqData, type FaqCategory } from './faq-data';

const TOTAL_QUESTIONS = faqData.reduce((acc, category) => acc + category.questions.length, 0);

export interface FaqSearch {
  query: string;
  setQuery: (query: string) => void;
  /** Розділи з питаннями, що містять запит (без запиту — усі) */
  filtered: FaqCategory[];
  totalQuestions: number;
}

export function useFaqSearch(): FaqSearch {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqData;
    return faqData
      .map((category) => ({
        ...category,
        questions: category.questions.filter(
          (item) => item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)
        ),
      }))
      .filter((category) => category.questions.length > 0);
  }, [query]);

  return { query, setQuery, filtered, totalQuestions: TOTAL_QUESTIONS };
}

/** «1 питання» / «3 питання» / «5 питань» / «12 питань» */
export const formatQuestions = (count: number): string => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  return mod10 >= 1 && mod10 <= 4 && (mod100 < 11 || mod100 > 14) ? `${count} питання` : `${count} питань`;
};
