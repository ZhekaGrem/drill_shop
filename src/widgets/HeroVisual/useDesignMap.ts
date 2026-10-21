// Apply the selected print, preserving baked UV transforms. Report readiness only
// after application; cancelled loads cannot overwrite the current selection.
'use client';

import { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { SRGBColorSpace, TextureLoader } from 'three';
import type { Group, Mesh, MeshStandardMaterial, Texture } from 'three';

export const useDesignMap = (scene: Group, mapUrl?: string) => {
  const gl = useThree((state) => state.gl);
  const cache = useRef(new Map<string, Texture>());
  const [applied, setApplied] = useState<{ scene: Group; mapUrl?: string; error?: Error } | null>(null);

  useEffect(() => {
    const mesh = scene.getObjectByProperty('isMesh', true) as Mesh | undefined;
    const material = mesh?.material as MeshStandardMaterial | undefined;
    let cancelled = false;
    const complete = (error?: Error) => {
      if (!cancelled) setApplied({ scene, mapUrl, error });
    };
    if (!material) {
      complete(mapUrl ? new Error('Model has no printable material') : undefined);
      return;
    }
    // Оригінал — у userData, НЕ в React-рефі: зміна моделі ремонтує сцену
    // (рефи згорають), а матеріал живе в кеші drei з останньою мапою. Реф
    // після ремонту «запамʼятав» би дизайн як оригінал — і червона крапка
    // (mapUrl: undefined) показувала б чужу текстуру.
    if (!('originalMap' in material.userData)) material.userData.originalMap = material.map;

    if (!mapUrl) {
      material.map = (material.userData.originalMap as Texture | null) ?? null;
      material.needsUpdate = true;
      complete();
      return;
    }
    const cached = cache.current.get(mapUrl);
    if (cached) {
      material.map = cached;
      material.needsUpdate = true;
      complete();
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
        // Моделі після gltfpack квантують UV і тримають масштаб у
        // KHR_texture_transform запеченої мапи (у hoodie.glb scale ≈15.7).
        // Без перенесення нова текстура бере лише лівий верхній кут 1/16 —
        // принта не видно. Для моделей без трансформації це дефолти, нуль змін.
        const base = material.userData.originalMap as Texture | null;
        if (base) {
          texture.offset.copy(base.offset);
          texture.repeat.copy(base.repeat);
          texture.rotation = base.rotation;
          texture.center.copy(base.center);
          texture.channel = base.channel;
        }
        cache.current.set(mapUrl, texture);
        // Guard гонки: застосовуємо, лише якщо вибір не змінився за час запиту
        if (!cancelled) {
          material.map = texture;
          material.needsUpdate = true;
          complete();
        }
      },
      undefined,
      () => complete(new Error('Не вдалося завантажити текстуру 3D-моделі'))
    );
    return () => {
      cancelled = true;
    };
  }, [scene, mapUrl, gl]);

  const isCurrent = applied?.scene === scene && applied?.mapUrl === mapUrl;
  if (isCurrent && applied?.error) throw applied.error;
  return isCurrent;
};
