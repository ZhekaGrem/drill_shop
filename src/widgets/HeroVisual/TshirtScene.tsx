// src/widgets/HeroVisual/TshirtScene.tsx
// Локальна 3D-сцена футболки на React Three Fiber. Вантажиться окремим чанком
// через lazy() у <HeroVisual>, тому three не потрапляє в основний бандл.
//
// Кадрування тримає <Bounds fit clip observe>: камера сама підганяється під
// габарити моделі й перераховується на кожну зміну розміру полотна. Саме тому
// тут більше немає жодного CSS-масштабування — розмір обʼєкта задає камера,
// а не transform на батьківському контейнері.
'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Bounds, useAnimations, useCursor, useGLTF } from '@react-three/drei';
import { Box3 } from 'three';
import type { Group } from 'three';
import { DisposeRenderer } from './DisposeRenderer';
import { useJump } from './useJump';
import { useWind } from './useWind';
import { useIdleMotion } from './useIdleMotion';
import { useDesignMap } from './useDesignMap';
import { useSceneClone } from './useSceneClone';
import type { RefObject } from 'react';
import type { DragState } from './useDragRotation';

const MODEL_URL = '/3d/models/tshirt.glb?v=2';

useGLTF.preload(MODEL_URL);

type Props = {
  onReady: () => void;
  /** Стрибок-пасхалка по кліку. Вимкнено дефолтно; повернути — передати true */
  interactive?: boolean;
  /** URL basecolor-дизайну; без нього — запечена в GLB мапа */
  mapUrl?: string;
  /** GLB іншої моделі (худі тощо); без нього — дефолтна футболка */
  modelUrl?: string;
  /** Ref драг-обертання зі stage; сцена лише читає його покадрово */
  dragRef?: RefObject<DragState | null>;
};

const Tshirt = ({ onReady, interactive = false, mapUrl, modelUrl = MODEL_URL, dragRef }: Props) => {
  const { scene, animations } = useGLTF(modelUrl);
  const group = useRef<Group>(null);
  const jumpRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const { actions } = useAnimations(animations, group);

  // Курсор-pointer над футболкою: підказка «мене можна натиснути»
  useCursor(interactive && hovered);

  const hasBakedRotation = animations.length > 0;

  // Запечена в Blender анімація — задум автора моделі: граємо її, а не дублюємо
  useEffect(() => {
    if (!hasBakedRotation) return;
    const [firstAction] = Object.values(actions);
    firstAction?.reset().play();
  }, [actions, hasBakedRotation]);

  // Своя копія кешованої сцени (два герої на сторінці) + анізотропія на мапах
  const prepared = useSceneClone(scene);

  // Низ і висота моделі: pivot присідання і масштаб висоти стрибка. У шейдері
  // вітру position — у нормалізованому квантуванням просторі, константи звідти.
  const box = useMemo(() => {
    const b = new Box3().setFromObject(prepared);
    return { bottom: b.min.y, height: b.max.y - b.min.y };
  }, [prepared]);

  const jump = useJump(jumpRef, box.height);
  const windStep = useWind(prepared);
  const idleStep = useIdleMotion(dragRef);
  useDesignMap(prepared, mapUrl);

  // Стрибок — внутрішня група, idle/drag — зовнішня; baked-анімація вимикає idle
  useFrame((state, delta) => {
    if (interactive) jump.step(delta);
    if (hasBakedRotation || !group.current) {
      windStep(state.clock.elapsedTime, 0);
      return;
    }
    const lag = idleStep(group.current, delta, state.clock.elapsedTime);
    windStep(state.clock.elapsedTime, lag);
  });

  // useGLTF саспендиться до завантаження, тож монтування = модель готова
  useEffect(() => {
    onReady();
  }, [onReady]);

  // Перед моделі дивиться в +Z; обробники пасхалки — лише в interactive-режимі
  const jumpHandlers = interactive
    ? {
        onPointerDown: jump.onPointerDown,
        onPointerUp: jump.onPointerUp,
        onPointerLeave: jump.onPointerLeave,
        onPointerOver: () => setHovered(true),
        onPointerOut: () => setHovered(false),
      }
    : undefined;

  return (
    <group ref={group} {...jumpHandlers}>
      {/* Pivot на нижній межі: присідання тисне «в підлогу»; сумарний transform нульовий */}
      <group ref={jumpRef} position={[0, box.bottom, 0]}>
        <group position={[0, -box.bottom, 0]}>
          <primitive object={prepared} />
        </group>
      </group>
    </group>
  );
};

const TshirtScene = (props: Props) => {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true }}
      camera={{ fov: 35, position: [0, 0, 6] }}
      style={{ width: '100%', height: '100%' }}>
      {/* Поза <Suspense>: рендерер треба звільняти на смерть КАНВАСА, а не на
        кожне підвисання моделі. Без цього кожен візит лишав живий рендерер,
        а він через canvas → React-fiber тримав усе дерево сторінки. */}
      <DisposeRenderer />

      {/* Локальні джерела замість drei Environment (той тягне HDRI з CDN).
        Зустрічне й нижнє світло відбивають край чорної тканини від фону */}
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 6, 5]} intensity={2.4} />
      <directionalLight position={[-5, 2, -4]} intensity={1.2} />
      <directionalLight position={[0, -4, 3]} intensity={0.6} />

      <Suspense fallback={null}>
        {/* Запас у кадрі: силует міняє ширину в оберті — без запасу торкався б країв */}
        <Bounds fit clip observe margin={1.15}>
          <Tshirt {...props} />
        </Bounds>
      </Suspense>
    </Canvas>
  );
};

export default TshirtScene;
