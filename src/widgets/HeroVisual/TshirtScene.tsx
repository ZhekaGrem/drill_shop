// src/widgets/HeroVisual/TshirtScene.tsx
// Локальна 3D-сцена футболки на React Three Fiber. Вантажиться окремим чанком
// через lazy() у <HeroVisual>, тому three не потрапляє в основний бандл.
//
// Кадрування тримає <Bounds fit clip observe>: камера сама підганяється під
// габарити моделі й перераховується на кожну зміну розміру полотна. Саме тому
// тут більше немає жодного CSS-масштабування — розмір об'єкта задає камера,
// а не transform на батьківському контейнері.
'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bounds, useAnimations, useCursor, useGLTF } from '@react-three/drei';
import { Box3 } from 'three';
import type { Group, Mesh, MeshStandardMaterial } from 'three';
import { useJump } from './useJump';
import { useWind } from './useWind';

const MODEL_URL = '/model/tshirt.glb';

// Оберт за ~21 секунду. Вмикається, коли в моделі немає власної анімації —
// у поточній її немає, тож рух задає саме цей код.
const ROTATION_SPEED = 0.3;

useGLTF.preload(MODEL_URL);

type Props = {
  onReady: () => void;
  /** Стрибок-пасхалка по кліку. Вимкнено дефолтно; повернути — передати true */
  interactive?: boolean;
};

const Tshirt = ({ onReady, interactive = false }: Props) => {
  const { scene, animations } = useGLTF(MODEL_URL);
  const group = useRef<Group>(null);
  const jumpRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const { actions } = useAnimations(animations, group);

  // Курсор-pointer над футболкою: підказка «мене можна натиснути»
  useCursor(interactive && hovered);

  const hasBakedRotation = animations.length > 0;

  // Обертання, запечене в Blender, — це задум автора моделі: власна швидкість,
  // власна вісь. Програємо його замість того, щоб дублювати рух кодом.
  useEffect(() => {
    if (!hasBakedRotation) return;
    const [firstAction] = Object.values(actions);
    firstAction?.reset().play();
  }, [actions, hasBakedRotation]);

  const gl = useThree((state) => state.gl);
  // Анізотропія обов'язкова: з дефолтом (=1) під ковзним кутом GPU бере глибокі
  // mip-рівні, де рідкий принт усереднюється в чорну тканину — по спині «пливли»
  // чорні плями. Плюс страховка нормалей для моделей без них.
  const prepared = useMemo(() => {
    const anisotropy = Math.min(16, gl.capabilities.getMaxAnisotropy());
    scene.traverse((object) => {
      const mesh = object as Mesh;
      if (!mesh.isMesh) return;
      if (!mesh.geometry.getAttribute('normal')) mesh.geometry.computeVertexNormals();
      const material = mesh.material as MeshStandardMaterial;
      [material.map, material.normalMap].forEach((texture) => {
        if (texture) Object.assign(texture, { anisotropy, needsUpdate: true });
      });
    });
    return scene;
  }, [scene, gl]);

  // Низ і висота моделі: pivot присідання і масштаб висоти стрибка.
  // Припущення: вузли GLB без власних трансформів — ці межі порівнюються
  // з сирими position у шейдері вітру (useWind), інакше ваги з'їдуть.
  const box = useMemo(() => {
    const b = new Box3().setFromObject(prepared);
    return { bottom: b.min.y, height: b.max.y - b.min.y };
  }, [prepared]);

  const jump = useJump(jumpRef, box.height);
  const windStep = useWind(prepared, box);

  // Стрибок мутує внутрішню групу, оберт — зовнішню; в одному кадрі
  // вони не конфліктують. Фолбек-оберт лишається кодовим: камера належить
  // <Bounds>, і рух нею збив би підігнане кадрування.
  useFrame((state, delta) => {
    windStep(state.clock.elapsedTime);
    if (interactive) jump.step(delta);
    if (hasBakedRotation || !group.current) return;
    group.current.rotation.y += delta * ROTATION_SPEED;
  });

  // useGLTF саспендиться до завантаження, тож монтування = модель готова
  useEffect(() => {
    onReady();
  }, [onReady]);

  // Габарити: X 0.67 (ширина) · Y 0.74 (висота) · Z 0.36 (товщина). Перед уже
  // дивиться в +Z, тобто просто на камеру — доводити орієнтацію не треба.
  // Обробники пасхалки чіпляються лише в interactive-режимі
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
      {/* Пара +bottom/−bottom переносить pivot масштабування на нижню межу:
          присідання тисне «в підлогу», а не стискає футболку в повітрі.
          Сумарний transform нульовий — кадрування Bounds не зсувається. */}
      <group ref={jumpRef} position={[0, box.bottom, 0]}>
        <group position={[0, -box.bottom, 0]}>
          <primitive object={prepared} />
        </group>
      </group>
    </group>
  );
};

const TshirtScene = ({ onReady, interactive }: Props) => {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true }}
      camera={{ fov: 35, position: [0, 0, 6] }}
      style={{ width: '100%', height: '100%' }}>
      {/* Три джерела замість <Environment preset>: пресети drei тягнуть HDRI
          зі стороннього CDN, а сенс міграції — прибрати зовнішні запити.
          Ключове світло дає об'єм, зустрічне й нижнє відбивають край, інакше
          чорна тканина зливається в силует. */}
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 6, 5]} intensity={2.4} />
      <directionalLight position={[-5, 2, -4]} intensity={1.2} />
      <directionalLight position={[0, -4, 3]} intensity={0.6} />

      <Suspense fallback={null}>
        {/* Запас у кадрі: силует міняє ширину в оберті — без запасу торкався б країв */}
        <Bounds fit clip observe margin={1.15}>
          <Tshirt onReady={onReady} interactive={interactive} />
        </Bounds>
      </Suspense>
    </Canvas>
  );
};

export default TshirtScene;
