// src/shared/components/DesignClock/DesignClock.tsx
// Безголовий доглядач ротації кольористик — рідний брат ThemeClock.
// Інлайн-скрипт у layout.tsx ставить палітру лише на старті документа, а
// App Router далі ходить по сторінках без перезавантаження. Без цього
// компонента вкладка, відкрита через межу слоту, лишалась би на вчорашній
// палітрі скільки завгодно довго.
//
// На відміну від ThemeClock тут НЕ опитування щохвилини: подія рівно одна на
// дві доби, і її момент відомий наперед. Тому таймер зводиться точно на межу.
// Але довгий setTimeout не переживає засинання пристрою, тож підстраховкою
// йде звірка на visibilitychange — разом вони покривають і вкладку, що
// висіла всю ніч, і ноутбук, який закрили посеред слоту.
'use client';

import { useEffect } from 'react';
import { DESIGN_CHOICE_AUTO, applyDesign, readDesignChoice, resolveDesign } from '@/shared/config/design';
import { ROTATION_ENABLED, nextRotationAt } from '@/shared/config/design-rotation';
import { applyTheme, autoTheme, readThemeChoice } from '@/shared/config/theme';

export const DesignClock = () => {
  useEffect(() => {
    if (!ROTATION_ENABLED) return;

    let timer: ReturnType<typeof setTimeout>;

    const sync = () => {
      // Явний вибір із /v2/dev автоматика не чіпає — той самий контракт,
      // що й у теми: сховище перекриває календар.
      if (readDesignChoice() !== DESIGN_CHOICE_AUTO) return;
      applyDesign(resolveDesign(DESIGN_CHOICE_AUTO, Date.now()));
      // Правило авто-теми залежить від дизайну (autoTheme у theme.ts), тож
      // після зміни палітри тему треба перепитати. Для цих чотирьох правило
      // однакове — годинник, — але завʼязуватись на цей збіг не варто:
      // додадуть у ротацію концепцію з іншим правилом, і тема відстане.
      if (readThemeChoice() === 'auto') applyTheme(autoTheme());
    };

    // Зводимо таймер завжди, навіть коли зараз стоїть явний вибір: користувач
    // може повернути «авто» посеред слоту, і тоді наступна межа має спрацювати
    // без перезавантаження. Сама перевірка вибору — всередині sync.
    const arm = () => {
      // Нижня межа в секунду рятує від холостого циклу: якщо таймер прокинувся
      // рівно на межі, наступний розрахунок може дати нуль або відʼємне.
      // Максимум тут — дві доби, це вкладається в ліміт setTimeout (24.8 дня).
      const wait = Math.max(1000, nextRotationAt(Date.now()) - Date.now());
      timer = setTimeout(() => {
        sync();
        arm();
      }, wait);
    };

    // Негайний виклик обовʼязковий — з тієї ж причини, що й у ThemeClock:
    // інакше перша звірка була б аж через межу слоту.
    sync();
    arm();

    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      sync();
      clearTimeout(timer);
      arm();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return null;
};
