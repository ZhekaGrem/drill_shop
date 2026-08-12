# Перемикач дизайнів футболки — план імплементації

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. (Фактичне виконання: інлайн контролером — асетний конвеєр (Blender/sharp/glbtool) живе в session-scratchpad і недоступний свіжим сабагентам.)

**Goal:** фіолетовий дизайн другим варіантом у герої: свотчі-перемикач, спільна геометрія, рантайм-своп basecolor-мапи без перезапуску сцени.

**Architecture:** новий хук `useDesignMap` (TextureLoader без Suspense, кеш у ref, guard гонки, властивості glTF-текстури: flipY=false/sRGB/анізотропія); `TshirtScene` отримує прозорий проп `mapUrl`; UI свотчів і стан дизайну — у `HeroVisual` (WIP-файл, НЕ комітити); фолбек-фото свопаються разом із дизайном (працює і при reduced-motion).

**Tech Stack:** three TextureLoader, React Three Fiber. Нових залежностей немає.

**Спека:** `docs/superpowers/specs/2026-08-12-tshirt-design-switcher-design.md`

## Global Constraints

- GLB не змінюється; червоний дефолт запечений. Фіолет — окремий файл `public/textures/tshirt-no-violet.jpg` (2048² q88).
- `TshirtScene.tsx` ≤ 150 рядків (зараз 148; передбачені скорочення коментарів нижче); функції ≤ 50 рядків.
- Жодного setState на кадр; своп мапи — подієвий (useEffect), не покадровий.
- `HeroVisual.tsx` і `HeroVisual.module.scss` — незакомічений WIP користувача: редагувати, але НЕ КОМІТИТИ (міграція йде окремим комітом пізніше, рішення користувача). Комітяться лише: асети, `useDesignMap.ts`, `TshirtScene.tsx`.
- Коміти ТІЛЬКИ явним pathspec; повідомлення українською з трейлером `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Верифікація: `npx tsc --noEmit` + ESLint по змінених файлах (відома pre-existing помилка в useWind — не регресія) + `npm run build` наприкінці; браузерна перевірка за чеклістом спеки.

---

### Task 1: Асети — фіолетова текстура і фолбек

**Files:**

- Create: `public/textures/tshirt-no-violet.jpg` (sharp: 7936² PNG → 2048² JPEG q88)
- Create: `public/assets/img/tshirt-fallback-violet.webp` (Blender headless: рендер GLB з підміненою мапою → 1600² transparent PNG → sharp → 1200² webp q90)

**Steps:**

- [ ] sharp-конверсія `tshirt 3d/NO violet texture.png` → scratchpad → перевірити розмір/вагу
- [ ] розширити scratchpad `render_fallback.py` опційним аргументом `texture_override`: після імпорту GLB знайти image-ноду матеріалу і підмінити зображення на фіолетовий JPEG (bpy: `image.filepath` + reload або нова `bpy.data.images.load` у ноду Base Color)
- [ ] рендер фронту з прозорою плівкою, конверсія в webp, візуальна перевірка контролером (Read): фіолетовий принт на місці, фон прозорий
- [ ] задеплоїти обидва файли в `public/`, закомітити pathspec:

```bash
git add public/textures/tshirt-no-violet.jpg public/assets/img/tshirt-fallback-violet.webp
git commit -m "feat(v2): асети фіолетового дизайну — текстура 2048 і фолбек

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>" -- public/textures/tshirt-no-violet.jpg public/assets/img/tshirt-fallback-violet.webp
```

---

### Task 2: Хук `useDesignMap`

**Files:**

- Create: `src/widgets/HeroVisual/useDesignMap.ts`

**Interfaces:**

- Consumes: `Group` (prepared-сцена), `mapUrl?: string`, renderer із useThree (анізотропія).
- Produces: `useDesignMap(scene, mapUrl)` — side-effect хук без повернення; Task 3 викликає його в `Tshirt`.

- [ ] **Створити файл із повним кодом:**

```ts
// src/widgets/HeroVisual/useDesignMap.ts
// Рантайм-своп basecolor-мапи (дизайни футболки). Без Suspense: до готовності
// нової текстури висить чинна — сцена не блимає. Оригінальна запечена мапа
// запам'ятовується при першому свопі; кеш url→Texture робить повтори миттєвими.
'use client';

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { SRGBColorSpace, TextureLoader } from 'three';
import type { Group, Mesh, MeshStandardMaterial, Texture } from 'three';

export const useDesignMap = (scene: Group, mapUrl?: string) => {
  const gl = useThree((state) => state.gl);
  const cache = useRef(new Map<string, Texture>());
  const original = useRef<Texture | null>(null);
  const wanted = useRef<string | undefined>(undefined);

  useEffect(() => {
    const mesh = scene.getObjectByProperty('isMesh', true) as Mesh | undefined;
    const material = mesh?.material as MeshStandardMaterial | undefined;
    if (!material) return;
    original.current ??= material.map;
    wanted.current = mapUrl;

    if (!mapUrl) {
      material.map = original.current;
      return;
    }
    const cached = cache.current.get(mapUrl);
    if (cached) {
      material.map = cached;
      return;
    }
    new TextureLoader().load(
      mapUrl,
      (texture) => {
        // Класичні граблі glTF-мап: без цих трьох рядків текстура догори
        // дриґом, у неправильному колірному просторі й чорніє під кутом
        texture.flipY = false;
        texture.colorSpace = SRGBColorSpace;
        texture.anisotropy = Math.min(16, gl.capabilities.getMaxAnisotropy());
        cache.current.set(mapUrl, texture);
        // Guard гонки: застосовуємо, лише якщо вибір не змінився за час запиту
        if (wanted.current === mapUrl) material.map = texture;
      },
      undefined,
      () => console.warn('useDesignMap: не вдалося завантажити', mapUrl)
    );
  }, [scene, mapUrl, gl]);
};
```

- [ ] `npx tsc --noEmit && npx eslint src/widgets/HeroVisual/useDesignMap.ts` — чисто
- [ ] Коміт pathspec:

```bash
git add src/widgets/HeroVisual/useDesignMap.ts
git commit -m "feat(v2): хук useDesignMap — рантайм-своп дизайну футболки

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>" -- src/widgets/HeroVisual/useDesignMap.ts
```

---

### Task 3: Проп `mapUrl` у TshirtScene

**Files:**

- Modify: `src/widgets/HeroVisual/TshirtScene.tsx`

**Edits:**

- [ ] Імпорт: `import { useDesignMap } from './useDesignMap';` (після useIdleMotion)
- [ ] Props: додати `/** URL basecolor-дизайну; без нього — запечена мапа */` + `mapUrl?: string;`
- [ ] `Tshirt`: параметр `mapUrl`, виклик `useDesignMap(prepared, mapUrl);` одразу після `const idleStep = useIdleMotion();`
- [ ] Обгортка `TshirtScene`: прийняти і прокинути `mapUrl={mapUrl}` у `<Tshirt>`
- [ ] Бюджет рядків — двоскорочення коментарів: pivot-коментар у JSX (3 рядки «Пара +bottom/−bottom…») → 1 рядок `{/* Pivot на нижній межі: присідання тисне «в підлогу»; сумарний transform нульовий */}`; коментар анізотропії (3 рядки) → 2 (прибрати третій рядок «Плюс страховка нормалей…»)
- [ ] `npx tsc --noEmit && npx eslint src/widgets/HeroVisual/TshirtScene.tsx && wc -l …` — чисто, ≤ 150
- [ ] Коміт pathspec:

```bash
git add src/widgets/HeroVisual/TshirtScene.tsx
git commit -m "feat(v2): проп mapUrl на TshirtScene — дизайн задається ззовні

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>" -- src/widgets/HeroVisual/TshirtScene.tsx
```

---

### Task 4: Свотчі і стан у HeroVisual (WIP, БЕЗ коміту)

**Files:**

- Modify (не комітити): `src/widgets/HeroVisual/HeroVisual.tsx`, `src/widgets/HeroVisual/HeroVisual.module.scss`

**Edits (семантично; точні рядки — по факту читання файлу):**

- [ ] Конфіг дизайнів угорі файлу:

```tsx
const DESIGNS = {
  red: {
    label: 'червоний',
    swatch: '#c8102e',
    fallback: '/assets/img/tshirt-fallback.webp',
    mapUrl: undefined, // запечений дефолт
  },
  violet: {
    label: 'фіолетовий',
    swatch: '#8b2fc9',
    fallback: '/assets/img/tshirt-fallback-violet.webp',
    mapUrl: '/textures/tshirt-no-violet.jpg',
  },
} as const;
type DesignKey = keyof typeof DESIGNS;
```

- [ ] `const [design, setDesign] = useState<DesignKey>('red');`
- [ ] `<Image src={DESIGNS[design].fallback} …>` (alt доповнити словом дизайну)
- [ ] `<TshirtScene … mapUrl={DESIGNS[design].mapUrl} />`
- [ ] Префетч фіолету після готовності сцени: `useEffect(() => { if (isSceneReady) new window.Image().src = DESIGNS.violet.mapUrl!; }, [isSceneReady]);` (браузерний кеш → перший своп миттєвий)
- [ ] Свотчі під сценою (в `.stage` або одразу після): два `<button type="button">` з `aria-label={'Дизайн: ' + label}`, `aria-pressed={design === key}`, `onClick={() => setDesign(key)}`; стилі в module.scss:

```scss
.designSwitcher {
  display: flex;
  justify-content: center;
  gap: var(--space-3);
  margin-top: var(--space-4);
}

// Круглий свотч кольору дизайну; тап-зона 44px тримається розміром кнопки
.swatch {
  width: 44px;
  height: 44px;
  border: none;
  background: none;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: transform var(--dur-hover, 150ms) var(--ease-out);

  &:active {
    transform: scale(var(--motion-press-scale));
  }

  &::before {
    content: '';
    width: 26px;
    height: 26px;
    border-radius: var(--radius-pill);
    background: var(--swatch-color);
    border: 2px solid transparent;
    transition: border-color var(--dur-hover, 150ms) var(--ease-out);
  }

  &[aria-pressed='true']::before {
    border-color: var(--text-primary, #000);
    outline: 2px solid var(--background-primary, #fff);
    outline-offset: -4px;
  }
}
```

  (колір свотча — через inline `style={{ '--swatch-color': DESIGNS[key].swatch }}`; точні токени звірити з `globals.css` при виконанні)

- [ ] Reduced-motion шлях безкоштовний: свотчі свопають `fallback` навіть без сцени
- [ ] `npx tsc --noEmit` + eslint по обох файлах — чисто; `npm run build` зелений
- [ ] НЕ КОМІТИТИ ці два файли (WIP-міграція)

---

### Task 5: Браузерна перевірка (чекліст спеки)

- [ ] dev-сервер; Chrome спереду (не перекритий — rAF!)
- [ ] Своп червоний↔фіолетовий: миттєво після префетчу, без блимання; оберт/вітер/нахили безперервні
- [ ] Фіолетова спина: принт читається, чорних плям нема, кілька обертів
- [ ] Швидке клацання туди-сюди — застосовується останній вибір
- [ ] Reduced motion (DevTools → Rendering) — свотчі свопають статичні фолбеки
- [ ] Фінально: `npm run build` зелений

## Відомі дрібниці (свідомо прийняті)

- Префетч через `new Image()` гріє HTTP-кеш, а не GPU-пам'ять: перший своп
  включає decode+upload (~десятки мс) — невідчутно.
- Свотч-кольори — ручні наближення кольорів принтів; не беруться з текстур.
- `useDesignMap` не звільняє (dispose) старі текстури: їх максимум дві, свідомо.
