import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

/** useFrame runs before rendering: the second tick confirms one completed frame. */
export function useSceneReady(assetsReady: boolean, onReady: () => void) {
  const progress = useRef({ callback: onReady, frames: 0, notified: false });
  useFrame(() => {
    const current = progress.current;
    if (current.callback !== onReady || !assetsReady) {
      current.callback = onReady;
      current.frames = 0;
      current.notified = false;
    }
    if (!assetsReady || current.notified) return;
    current.frames += 1;
    if (current.frames < 2) return;
    current.notified = true;
    onReady();
  });
}
