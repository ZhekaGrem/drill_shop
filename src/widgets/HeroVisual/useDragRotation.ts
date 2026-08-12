// src/widgets/HeroVisual/useDragRotation.ts
// DOM-захоплення горизонтального драгу для обертання 3D-об'єкта. Стан у ref:
// сцена читає його покадрово, React не рендериться. Тільки primary-pointer.
'use client';

import { useMemo, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';

export type DragState = {
  active: boolean;
  /** накопичений неспожитий кут, рад (споживає idle-крок сцени) */
  pendingAngle: number;
  /** остання кутова швидкість руки, рад/с */
  velocity: number;
};

const SENSITIVITY = 0.01; // рад на піксель
const VELOCITY_SMOOTHING = 0.5; // згладження між pointermove-подіями

export const useDragRotation = (): {
  dragRef: RefObject<DragState>;
  handlers: {
    onPointerDown: (e: ReactPointerEvent) => void;
    onPointerMove: (e: ReactPointerEvent) => void;
    onPointerUp: (e: ReactPointerEvent) => void;
    onPointerCancel: (e: ReactPointerEvent) => void;
  };
} => {
  const dragRef = useRef<DragState>({ active: false, pendingAngle: 0, velocity: 0 });
  const last = useRef({ x: 0, t: 0, id: -1 });

  const handlers = useMemo(() => {
    const finish = (e: ReactPointerEvent) => {
      if (!dragRef.current.active || e.pointerId !== last.current.id) return;
      dragRef.current.active = false; // velocity лишається — momentum підхопить
    };
    return {
      onPointerDown: (e: ReactPointerEvent) => {
        if (!e.isPrimary) return;
        dragRef.current.active = true;
        dragRef.current.velocity = 0;
        last.current = { x: e.clientX, t: performance.now(), id: e.pointerId };
        e.currentTarget.setPointerCapture(e.pointerId);
      },
      onPointerMove: (e: ReactPointerEvent) => {
        if (!dragRef.current.active || e.pointerId !== last.current.id) return;
        const now = performance.now();
        const dx = e.clientX - last.current.x;
        const dt = (now - last.current.t) / 1000;
        const angle = dx * SENSITIVITY;
        dragRef.current.pendingAngle += angle;
        if (dt > 0) {
          const instant = angle / dt;
          dragRef.current.velocity += (instant - dragRef.current.velocity) * VELOCITY_SMOOTHING;
        }
        last.current.x = e.clientX;
        last.current.t = now;
      },
      onPointerUp: finish,
      onPointerCancel: finish,
    };
  }, []);

  return { dragRef, handlers };
};
