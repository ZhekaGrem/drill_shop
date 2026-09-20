'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createMotoCounter, type Completion } from './moto-counter';

export function useMotoCounter() {
  const [total, setTotal] = useState<string | null>(null);
  const counter = useRef<ReturnType<typeof createMotoCounter> | null>(null);

  useEffect(() => {
    let active = true;
    let storage: Storage | undefined;
    try {
      storage = window.localStorage;
    } catch {
      /* Storage can be disabled. */
    }
    const base = process.env.NODE_ENV === 'development' ? '/api/v1' : process.env.NEXT_PUBLIC_API_URL;
    if (!base) return;
    const client = createMotoCounter(
      `${base.replace(/\/$/, '')}/moto/completions`,
      (value) => {
        if (active) setTotal(value);
      },
      storage
    );
    counter.current = client;
    const sync = () => {
      if (document.visibilityState !== 'hidden') {
        void client.refresh();
        void client.flush();
      }
    };
    const flush = () => {
      void client.flush();
    };
    sync();
    const timer = window.setInterval(sync, 15000);
    window.addEventListener('online', sync);
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', sync);
    return () => {
      active = false;
      counter.current = null;
      window.clearInterval(timer);
      window.removeEventListener('online', sync);
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  const record = useCallback((completion: Completion) => counter.current?.record(completion), []);
  return { total, record };
}
