// src/shared/hooks/useDesign.ts
// Активна дизайн-концепція для клієнтських гілок рендера (механіка героя).
// На сервері та до маунта — 'diia' (збіг із SSR-розміткою), після маунта —
// значення атрибута data-design; спостерігач ловить перемикання з /v2/dev.
'use client';

import { useEffect, useState } from 'react';
import { DESIGN_FALLBACK, readDesignAttr, type DesignId } from '@/shared/config/design';

export const useDesign = (): DesignId => {
  const [design, setDesign] = useState<DesignId>(DESIGN_FALLBACK);

  useEffect(() => {
    const sync = () => setDesign(readDesignAttr());
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-design'] });
    return () => observer.disconnect();
  }, []);

  return design;
};
