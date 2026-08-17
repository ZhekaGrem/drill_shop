// src/widgets/HeroVisual/DisposeRenderer.tsx
// Прибирає за 3D-сценою, коли канвас іде з екрана. Живе всередині <Canvas>,
// бо тільки звідти видно `gl`.
//
// ЩО БУЛО. Кожен вихід зі сторінки з 3D залишав у памʼяті повну копію DOM цієї
// сторінки: 376 вузлів і ~70 слухачів за навігацію (заміряно на проді
// ye-dril.com і на локальному прод-білді, після примусового GC). Купа й обсяг
// роботи головного потоку росли лінійно, і на третьому переході сторінка
// перестававала відповідати. Це і був «сайт з часом лагає».
//
// ЧОМУ. Ланцюг утримання зі знімка купи, знизу вгору:
//   emptyTexture (модульний синглтон three, three.module.js:5081 — його
//   підставляють у кожен незаповнений сампler, :5614)
//     -> .source -> ключ у WeakMap `sourcesTextureCache` рендерера
//       -> значення тримає WebGLTexture -> WebGL2RenderingContext -> <canvas>
// Далі спрацьовує Blink: якщо у відчепленому дереві досяжна хоч одна вершина,
// живим лишається ВСЕ дерево. Канвас лежить усередині сторінки, тож разом із
// ним залишалася вся сторінка.
//
// ЧОМУ НЕ ЛІКУЄТЬСЯ «ПРАВИЛЬНО». R3F на розмонтуванні викликає лише
// `renderLists.dispose()` і `forceContextLoss()` (fiber/dist/events-*.js:
// 16008–16009), а `gl.dispose()` (three.module.js:17068) чистить `properties`,
// але НЕ `textures` — `textures.dispose()` у ньому не викликається зовсім.
// А `emptyTexture` з three не експортується, тож дістати й звільнити її запис
// із застосунку неможливо. Один мертвий контекст на візит лишиться; GPU-памʼять
// при цьому вже звільнена (`forceContextLoss` R3F робить), тож коштує це копійки.
//
// ЩО РОБИМО. Розриваємо не сам витік контексту, а його звʼязок зі сторінкою:
// виймаємо canvas із батьківського вузла. Тоді в памʼяті застрягає одне
// полотно, а решта дерева стає недосяжною і збирається.
//
// Компонент стоїть ПОЗА <Suspense>: усередині нього він розмонтовувався б на
// кожному підвисанні моделі й убивав би живий канвас.
'use client';

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

// Скільки кадрів чекаємо, доки React справді забере дерево з документа.
// Виймати canvas раніше не можна: <ViewTransition exit> у Page.tsx тримає
// сторінку на екрані під час анімації виходу, і сцена блимнула б посеред неї.
const MAX_FRAMES = 120;

const detachWhenGone = (canvas: HTMLCanvasElement, frame = 0) => {
  if (!canvas.isConnected) {
    canvas.remove();
    return;
  }
  // Страховка: якщо канвас чомусь так і лишився в документі, нічого не рухаємо —
  // краще змиритися з утриманням, ніж висмикнути живу сцену з-під користувача.
  if (frame >= MAX_FRAMES) return;
  requestAnimationFrame(() => detachWhenGone(canvas, frame + 1));
};

export const DisposeRenderer = () => {
  const gl = useThree((state) => state.gl);

  useEffect(
    () => () => {
      const canvas = gl.domElement;
      // Знімає з canvas слухачі webglcontextlost/restored і скидає WeakMap
      // `properties` (three.module.js:17070–17077) — це прибирає частину
      // шляхів утримання. R3F цього не робить.
      gl.dispose();
      detachWhenGone(canvas);
    },
    [gl]
  );

  return null;
};
