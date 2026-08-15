// src/widgets/HeroVisual/useSceneClone.ts
// Незалежна копія кешованої drei-сцени. На сторінці два герої, а useGLTF
// повертає ОДИН спільний Group; three-об'єкт живе лише в одному графі, тож
// другий канвас «крав» би модель у першого. Клонуємо вузли і матеріали
// (геометрія та текстури лишаються спільними — GPU-пам'ять не дублюється),
// анізотропію ставимо на копії: без неї принт під ковзним кутом пливе в чорне.
'use client';

import { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import type { Group, Material, Mesh, MeshStandardMaterial } from 'three';

export const useSceneClone = (scene: Group) => {
  const gl = useThree((state) => state.gl);
  return useMemo(() => {
    const anisotropy = Math.min(16, gl.capabilities.getMaxAnisotropy());
    const prepareMaterial = (source: Material) => {
      const material = (source as MeshStandardMaterial).clone();
      [material.map, material.normalMap].forEach((texture) => {
        if (texture) Object.assign(texture, { anisotropy, needsUpdate: true });
      });
      return material;
    };
    const root = scene.clone(true);
    root.traverse((object) => {
      const mesh = object as Mesh;
      if (!mesh.isMesh) return;
      if (!mesh.geometry.getAttribute('normal')) mesh.geometry.computeVertexNormals();
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map(prepareMaterial)
        : prepareMaterial(mesh.material);
    });
    return root;
  }, [scene, gl]);
};
