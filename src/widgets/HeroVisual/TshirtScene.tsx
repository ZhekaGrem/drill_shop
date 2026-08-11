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
import { Canvas, useFrame } from '@react-three/fiber';
import { Bounds, useAnimations, useCursor, useGLTF } from '@react-three/drei';
import { Box3 } from 'three';
import type { Group, Mesh } from 'three';
import { useJump } from './useJump';

const MODEL_URL = '/model/tshirt.glb';

// Оберт за ~21 секунду. Вмикається, коли в моделі немає власної анімації —
// у поточній її немає, тож рух задає саме цей код.
const ROTATION_SPEED = 0.3;

useGLTF.preload(MODEL_URL);

type Props = {
  onReady: () => void;
};

const Tshirt = ({ onReady }: Props) => {
  const { scene, animations } = useGLTF(MODEL_URL);
  const group = useRef<Group>(null);
  const jumpRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const { actions } = useAnimations(animations, group);

  // Курсор-pointer над футболкою: підказка «мене можна натиснути»
  useCursor(hovered);

  const hasBakedRotation = animations.length > 0;

  // Обертання, запечене в Blender, — це задум автора моделі: власна швидкість,
  // власна вісь. Програємо його замість того, щоб дублювати рух кодом.
  useEffect(() => {
    if (!hasBakedRotation) return;
    const [firstAction] = Object.values(actions);
    firstAction?.reset().play();
  }, [actions, hasBakedRotation]);

  // Страховка на випадок моделі без нормалей: без них матеріал нічим
  // освітлювати й тканина виходить пласкою плямою. У поточній вони є.
  const prepared = useMemo(() => {
    scene.traverse((object) => {
      const mesh = object as Mesh;
      if (mesh.isMesh && !mesh.geometry.getAttribute('normal')) {
        mesh.geometry.computeVertexNormals();
      }
    });
    return scene;
  }, [scene]);

  // Низ і висота моделі: pivot присідання і масштаб висоти стрибка
  const box = useMemo(() => {
    const b = new Box3().setFromObject(prepared);
    return { bottom: b.min.y, height: b.max.y - b.min.y };
  }, [prepared]);

  const jump = useJump(jumpRef, box.height);

  // Стрибок мутує внутрішню групу, оберт — зовнішню; в одному кадрі
  // вони не конфліктують. Фолбек-оберт лишається кодовим: камера належить
  // <Bounds>, і рух нею збив би підігнане кадрування.
  useFrame((_, delta) => {
    jump.step(delta);
    if (hasBakedRotation || !group.current) return;
    group.current.rotation.y += delta * ROTATION_SPEED;
  });

  // useGLTF саспендиться до завантаження, тож монтування = модель готова
  useEffect(() => {
    onReady();
  }, [onReady]);

  // Габарити: X 0.67 (ширина) · Y 0.74 (висота) · Z 0.36 (товщина). Перед уже
  // дивиться в +Z, тобто просто на камеру — доводити орієнтацію не треба.
  return (
    <group
      ref={group}
      onPointerDown={jump.onPointerDown}
      onPointerUp={jump.onPointerUp}
      onPointerLeave={jump.onPointerLeave}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}>
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

const TshirtScene = ({ onReady }: Props) => {
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
        {/* Запас у кадрі: силует змінює ширину під час обертання, і при
            щільній підгонці об'єкт торкався б країв полотна */}
        <Bounds fit clip observe margin={1.15}>
          <Tshirt onReady={onReady} />
        </Bounds>
      </Suspense>
    </Canvas>
  );
};

export default TshirtScene;
