// src/widgets/HeroVisual/useDesignMap.ts
// Рантайм-своп basecolor-мапи (дизайни футболки). Без Suspense: до готовності
// нової текстури висить чинна — сцена не блимає. Запечена мапа пам'ятається
// ПО МАТЕРІАЛУ (сцена вміє мінятись: худі ↔ футболка), кеш url→Texture —
// повтори миттєві.
'use client';

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { SRGBColorSpace, TextureLoader } from 'three';
import type { Group, Mesh, MeshStandardMaterial, Texture } from 'three';

export const useDesignMap = (scene: Group, mapUrl?: string) => {
  const gl = useThree((state) => state.gl);
  const cache = useRef(new Map<string, Texture>());
  const wanted = useRef<string | undefined>(undefined);

  useEffect(() => {
    const mesh = scene.getObjectByProperty('isMesh', true) as Mesh | undefined;
    const material = mesh?.material as MeshStandardMaterial | undefined;
    if (!material) return;
    // Оригінал — у userData, НЕ в React-рефі: зміна моделі ремонтує сцену
    // (рефи згорають), а матеріал живе в кеші drei з останньою мапою. Реф
    // після ремонту «запам'ятав» би дизайн як оригінал — і червона крапка
    // (mapUrl: undefined) показувала б чужу текстуру.
    if (!('originalMap' in material.userData)) material.userData.originalMap = material.map;
    wanted.current = mapUrl;

    if (!mapUrl) {
      material.map = (material.userData.originalMap as Texture | null) ?? null;
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
