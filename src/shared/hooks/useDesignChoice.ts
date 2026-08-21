// src/shared/hooks/useDesignChoice.ts
// Що ОБРАНО, на відміну від useDesign, який каже, що на екрані. З ротацією це
// різні речі: у слот Перегрузу вибір лишається 'auto', а на екрані overdrive.
//
// useSyncExternalStore, а не useState+useEffect: localStorage не існує на
// сервері, і читати його треба саме як зовнішнє сховище. Третій аргумент —
// серверний знімок — повертає 'auto', що збігається з розміткою SSR, тож
// гідрація проходить без розбіжності. Побічно це знімає й помилку правила
// react-hooks/set-state-in-effect, яка з увімкненим ESLint у next.config
// ламала б прод-білд.
'use client';

import { useSyncExternalStore } from 'react';
import {
  DESIGN_CHOICE_AUTO,
  DESIGN_CHOICE_EVENT,
  readDesignChoice,
  type DesignChoice,
} from '@/shared/config/design';
import { nextRotationAt } from '@/shared/config/design-rotation';

const subscribe = (onChange: () => void) => {
  // Своя подія — для цієї ж вкладки (setDesignChoice), рідна `storage` —
  // для решти відкритих вкладок, куди своя не долітає.
  window.addEventListener(DESIGN_CHOICE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(DESIGN_CHOICE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
};

// Знімок — рядок, тобто стабільний за значенням. Повертати звідси обʼєкт не
// можна: новий екземпляр щоразу зациклив би useSyncExternalStore.
const serverSnapshot = (): DesignChoice => DESIGN_CHOICE_AUTO;

export const useDesignChoice = (): DesignChoice =>
  useSyncExternalStore(subscribe, readDesignChoice, serverSnapshot);

/**
 * Момент наступної зміни палітри (мс епохи), 0 на сервері.
 *
 * Чому саме ця величина, а не Date.now(): знімок для useSyncExternalStore
 * мусить бути СТАЛИМ між рендерами, поки нічого не змінилось. Date.now()
 * інший щоміллісекунди — React порівняв би через Object.is, побачив нове
 * значення і перемальовував би нескінченно. А nextRotationAt() — сходинка:
 * усередині слоту це та сама константа, і міняється вона рівно тоді, коли
 * має. Заразом це прямо те число, яке потрібне підпису «далі … з ...».
 *
 * Підписки нема навмисно: у момент межі DesignClock міняє data-design,
 * на це реагує useDesign, компонент перемальовується — і знімок перечитується
 * сам. Окремий таймер тут був би третім годинником на ту саму подію.
 */
const noopSubscribe = () => () => {};
export const useNextRotationAt = (): number =>
  useSyncExternalStore(
    noopSubscribe,
    () => nextRotationAt(Date.now()),
    () => 0
  );
