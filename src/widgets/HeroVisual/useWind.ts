// src/widgets/HeroVisual/useWind.ts
// Вітер тканини: вершинний шейдер поверх наявного матеріалу футболки.
// Вага руху рахується з локальних координат (поділ і рукави гойдаються,
// плечі стоять), зміщення — дві октави синусоїд уздовж нормалі + повільний
// X-погойд. Патч ідемпотентний: useGLTF кешує сцену між маунтами, тому
// guard і uniform часу живуть у material.userData, а не в замиканні хука.
'use client';

import { useMemo } from 'react';
import type { Group, Mesh, MeshStandardMaterial } from 'three';

// Орієнтири руху — зі спеки (docs/superpowers/specs/2026-08-11-tshirt-wind-design.md).
// Тюняться на око, не втрачаючи характеру «легко».
const WIND_AMPLITUDE = 0.01; // ≈1.35 % висоти моделі (0.74) на подолі
const WAVE1_FREQ = 9.0; // просторова частота першої октави, 1/юніт
const WAVE1_SPEED = 1.6; // рад/с
const WAVE2_FREQ = 16.0;
const WAVE2_SPEED = 2.3;
const SWAY_SPEED = 0.7; // повільний загальний погойд по X
const SWAY_RATIO = 0.6; // частка амплітуди для погойду
const TOP_QUIET = 0.8; // вище цієї частки висоти вага 0 (плечі/комір)
const HEM_FULL = 0.1; // нижче цієї частки — повна вага (поділ)
const SLEEVE_START = 0.18; // |x|, з якого починається вага рукава
const SLEEVE_FULL = 0.3; // |x| повної ваги рукава

const glslFloat = (n: number) => n.toFixed(4);

// Вставка в begin_vertex: мутуємо `transformed` до modelMatrix, тому вітер
// обертається разом із футболкою і стискається разом зі стрибком
const windChunk = (bottom: number, height: number) => /* glsl */ `
#include <begin_vertex>
{
  float windH = (position.y - ${glslFloat(bottom)}) / ${glslFloat(height)};
  float windW = min(
    1.0,
    smoothstep(${glslFloat(TOP_QUIET)}, ${glslFloat(HEM_FULL)}, windH)
      + 0.5 * smoothstep(${glslFloat(SLEEVE_START)}, ${glslFloat(SLEEVE_FULL)}, abs(position.x))
  );
  float windWave =
    sin(position.y * ${glslFloat(WAVE1_FREQ)} + uWindTime * ${glslFloat(WAVE1_SPEED)}) * 0.6
      + sin((position.x + position.y) * ${glslFloat(WAVE2_FREQ)} + uWindTime * ${glslFloat(WAVE2_SPEED)}) * 0.4;
  transformed += objectNormal * windWave * windW * ${glslFloat(WIND_AMPLITUDE)};
  transformed.x += sin(uWindTime * ${glslFloat(SWAY_SPEED)}) * windW * ${glslFloat(WIND_AMPLITUDE * SWAY_RATIO)};
}
`;

const patchMaterial = (material: MeshStandardMaterial, bottom: number, height: number) => {
  material.userData.uWindTime ??= { value: 0 };
  if (material.userData.windPatched) return;
  material.userData.windPatched = true;
  material.customProgramCacheKey = () => 'tshirt-wind';
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uWindTime = material.userData.uWindTime;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uWindTime;')
      .replace('#include <begin_vertex>', windChunk(bottom, height));
  };
  material.needsUpdate = true;
};

export const useWind = (scene: Group, box: { bottom: number; height: number }) => {
  return useMemo(() => {
    const mesh = scene.getObjectByProperty('isMesh', true) as Mesh | undefined;
    const material = mesh?.material as MeshStandardMaterial | undefined;
    if (!material) return () => {};
    patchMaterial(material, box.bottom, box.height);
    const uniform = material.userData.uWindTime as { value: number };
    return (elapsedTime: number) => {
      uniform.value = elapsedTime;
    };
  }, [scene, box.bottom, box.height]);
};
