'use client';

import { Suspense, useEffect, useMemo, useRef, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { DoubleSide, SRGBColorSpace, type Group, type ShaderMaterial } from 'three';
import scarf from '@/shared/config/scarf-oksana.json';
import { DisposeRenderer } from './DisposeRenderer';
import { scarfPrintAt } from './scarf-motion';
import type { DragState } from './useDragRotation';

const vertexShader = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.z += 0.11 * sin(p.x * 2.8 + uTime * 1.1)
         + 0.09 * sin(p.y * 3.2 - uTime * 1.35)
         + 0.035 * sin((p.x + p.y) * 6.0 - uTime * 1.7);
    p.x += 0.025 * sin(p.y * 4.0 + uTime);
    vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
    vPosition = viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uFront;
  uniform sampler2D uNext;
  uniform float uBlend;
  varying vec2 vUv;
  varying vec3 vPosition;
  void main() {
    vec3 ink = mix(texture2D(uFront, vUv).rgb, texture2D(uNext, vUv).rgb, uBlend);
    vec3 normal = normalize(cross(dFdx(vPosition), dFdy(vPosition)));
    float light = 0.78 + 0.22 * abs(dot(normal, normalize(vec3(0.4, 0.6, 1.0))));
    float weave = sin(vUv.x * 1600.0) * sin(vUv.y * 1600.0);
    // A thin textile: print remains visible through its reverse, slightly washed out.
    if (!gl_FrontFacing) ink = mix(ink, vec3(0.94), 0.15);
    float alpha = (gl_FrontFacing ? 0.85 : 0.73) + weave * 0.025;
    gl_FragColor = vec4(ink * light, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

type Props = {
  onReady: () => void;
  dragRef: RefObject<DragState | null>;
  paused?: boolean;
};

function Scarf({ onReady, dragRef, paused = false }: Props) {
  const gl = useThree((state) => state.gl);
  const textures = useTexture(scarf.textureUrls, (loaded) => {
    for (const texture of Array.isArray(loaded) ? loaded : [loaded]) {
      texture.colorSpace = SRGBColorSpace;
      texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
      texture.needsUpdate = true;
    }
  });
  const viewport = useThree((state) => state.viewport);
  const group = useRef<Group>(null);
  const material = useRef<ShaderMaterial>(null);
  const elapsed = useRef(0);
  const angle = useRef(0.28);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFront: { value: textures[0] },
      uNext: { value: textures[1] },
      uBlend: { value: 0 },
    }),
    [textures]
  );

  useEffect(() => {
    onReady();
  }, [onReady]);

  useFrame((_, delta) => {
    const mesh = group.current;
    const surface = material.current;
    if (!mesh || !surface || document.visibilityState !== 'visible') return;
    const dt = Math.min(delta, 1 / 15);
    const drag = dragRef.current;
    if (!paused && !drag?.active) {
      elapsed.current += dt;
      angle.current += dt * 0.34;
    }
    if (drag) {
      angle.current += drag.pendingAngle;
      // Shared input channel: consume drag exactly once, as the other 3D scenes do.
      drag.pendingAngle = 0;
    }
    const time = elapsed.current;
    const print = scarfPrintAt(time, textures.length);
    surface.uniforms.uTime.value = time;
    surface.uniforms.uFront.value = textures[print.current];
    surface.uniforms.uNext.value = textures[print.next];
    surface.uniforms.uBlend.value = print.blend;
    mesh.rotation.set(
      0.14 + Math.sin(time * 0.45) * 0.16,
      angle.current,
      -0.12 + Math.sin(time * 0.3) * 0.09
    );
    mesh.position.y = Math.sin(time * 0.8) * 0.08;
  });

  return (
    <group ref={group} scale={Math.min(viewport.width, viewport.height) / 3.6}>
      <mesh frustumCulled={false}>
        <planeGeometry args={[2.45, 2.35, 64, 64]} />
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          side={DoubleSide}
          transparent
          depthWrite={false}
          forceSinglePass
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export default function ScarfScene(props: Props) {
  return (
    <Canvas dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }} camera={{ fov: 35, position: [0, 0, 6] }}>
      <DisposeRenderer />
      <Suspense fallback={null}>
        <Scarf {...props} />
      </Suspense>
    </Canvas>
  );
}
