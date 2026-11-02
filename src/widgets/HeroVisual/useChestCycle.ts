// Random chest colour (the Radio Tsybulia tees). The atlas from useDesignMap carries the first
// colour; this hook loads every colour as a small crop of the chest rectangle and crossfades
// them in the fragment shader on the print clock (print-cycle.ts). Crops instead of a full
// atlas per colour: five 4096² atlases would take ~450 MB of GPU memory per tee.
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { SRGBColorSpace, TextureLoader, Vector4 } from 'three';
import type { Group, Mesh, MeshStandardMaterial, Texture } from 'three';
import { printCycleAt, TEE_FADE_SECONDS, TEE_PRINT_SECONDS } from './print-cycle';
import type { ChestCycle } from './designs';

const CHEST_UNIFORMS = /* glsl */ `
#include <map_pars_fragment>
uniform sampler2D uChestA;
uniform sampler2D uChestB;
uniform float uChestBlend;
uniform vec4 uChestRect;
`;

// three's map_fragment with the chest rectangle swapped for the crossfaded crops
const CHEST_FRAGMENT = /* glsl */ `
#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D( map, vMapUv );
  vec2 chestUv = ( vMapUv - uChestRect.xy ) / ( uChestRect.zw - uChestRect.xy );
  // Sampled outside any branch: texture reads in a branch break mip derivatives at the seam
  vec4 chest = mix( texture2D( uChestA, chestUv ), texture2D( uChestB, chestUv ), uChestBlend );
  vec2 inside = step( vec2( 0.0 ), chestUv ) * step( chestUv, vec2( 1.0 ) );
  sampledDiffuseColor = mix( sampledDiffuseColor, chest, inside.x * inside.y );
  diffuseColor *= sampledDiffuseColor;
#endif
`;

const createUniforms = () => ({
  uChestA: { value: null as Texture | null },
  uChestB: { value: null as Texture | null },
  uChestBlend: { value: 0 },
  uChestRect: { value: new Vector4() },
});

const printableMaterial = (scene: Group) =>
  (scene.getObjectByProperty('isMesh', true) as Mesh | undefined)?.material as
    | MeshStandardMaterial
    | undefined;

/** Returns the per-frame step; a tee without a chest cycle gets a no-op. */
export const useChestCycle = (scene: Group, cycle?: ChestCycle) => {
  const gl = useThree((state) => state.gl);
  // Strings as effect keys: the arrays come from JSON and may change identity on refetch
  const urls = cycle?.urls.join('\n') ?? '';
  const rect = cycle?.rect.join(',') ?? '';
  const [loaded, setLoaded] = useState<{ urls: string; textures: Texture[] } | null>(null);
  const uniforms = useRef(createUniforms());
  const elapsed = useRef(0);

  useEffect(() => {
    if (!urls) return;
    let cancelled = false;
    const loader = new TextureLoader();
    Promise.all(urls.split('\n').map((url) => loader.loadAsync(url)))
      .then((textures) => {
        if (cancelled) return textures.forEach((texture) => texture.dispose());
        for (const texture of textures) {
          texture.flipY = false; // glTF convention, the same as the atlas (useDesignMap)
          texture.colorSpace = SRGBColorSpace;
          texture.anisotropy = Math.min(16, gl.capabilities.getMaxAnisotropy());
        }
        setLoaded({ urls, textures });
      })
      // Without the crops the tee keeps the first colour baked into its atlas
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [urls, gl]);

  const textures = loaded?.urls === urls ? loaded.textures : null;

  useEffect(() => {
    const material = printableMaterial(scene);
    if (!material || !textures) return;
    const chest = uniforms.current;
    const [u0, v0, u1, v1] = rect.split(',').map(Number);
    chest.uChestRect.value.set(u0, v0, u1, v1);
    chest.uChestA.value = textures[0];
    chest.uChestB.value = textures[1 % textures.length];
    const compile = material.onBeforeCompile;
    const cacheKey = material.customProgramCacheKey;
    material.onBeforeCompile = (shader, renderer) => {
      compile.call(material, shader, renderer);
      Object.assign(shader.uniforms, chest);
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <map_pars_fragment>', CHEST_UNIFORMS)
        .replace('#include <map_fragment>', CHEST_FRAGMENT);
    };
    material.customProgramCacheKey = () => `${cacheKey.call(material)}:chest-cycle`;
    material.needsUpdate = true;
    return () => {
      material.onBeforeCompile = compile;
      material.customProgramCacheKey = cacheKey;
      material.needsUpdate = true;
    };
  }, [scene, textures, rect]);

  return useCallback(
    (delta: number) => {
      if (!textures) return;
      elapsed.current += delta;
      const print = printCycleAt(elapsed.current, textures.length, TEE_PRINT_SECONDS, TEE_FADE_SECONDS);
      const chest = uniforms.current;
      chest.uChestA.value = textures[print.current];
      chest.uChestB.value = textures[print.next];
      chest.uChestBlend.value = print.blend;
    },
    [textures]
  );
};
