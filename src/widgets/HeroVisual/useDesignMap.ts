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
