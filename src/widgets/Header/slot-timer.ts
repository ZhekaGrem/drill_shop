// Один таймер на слот. Тривалість зростає тільки після повного кола:
// 1, 1, 2, 3, 5, 8… секунд на КОЖНУ фазу. Паузи зберігають залишок.
export const MAX_SLOT_TIMEOUT_MS = 2_147_483_647;

interface SlotClock {
  now: () => number;
  schedule: (callback: () => void, delay: number) => number;
  cancel: (id: number) => void;
}

export function createSlotTimer(phaseCount: number, onPhase: (index: number) => void, clock: SlotClock) {
  let index = 0;
  let currentSeconds = 1;
  let nextSeconds = 1;
  let remaining = 1000;
  let startedAt = 0;
  let timeout: number | undefined;
  let disposed = false;
  const holds = new Set<string>();

  const suspend = () => {
    if (timeout === undefined) return;
    clock.cancel(timeout);
    timeout = undefined;
    remaining = Math.max(0, remaining - (clock.now() - startedAt));
  };

  const schedule = () => {
    if (disposed || timeout !== undefined || holds.size || phaseCount === 0) return;
    startedAt = clock.now();
    // Великі числа Фібоначчі не повинні переповнювати браузерний timeout.
    timeout = clock.schedule(
      () => {
        timeout = undefined;
        remaining = Math.max(0, remaining - (clock.now() - startedAt));
        if (remaining > 0) {
          schedule();
          return;
        }
        index += 1;
        if (index === phaseCount) {
          index = 0;
          [currentSeconds, nextSeconds] = [nextSeconds, currentSeconds + nextSeconds];
        }
        remaining = currentSeconds * 1000;
        onPhase(index);
        schedule();
      },
      Math.min(remaining, MAX_SLOT_TIMEOUT_MS)
    );
  };

  return {
    start: schedule,
    hold(reason: string, held: boolean) {
      if (disposed) return;
      if (held) {
        suspend();
        holds.add(reason);
      } else {
        holds.delete(reason);
        schedule();
      }
    },
    setPhaseCount(count: number) {
      if (disposed || count === phaseCount) return;
      suspend();
      phaseCount = count;
      index = 0;
      remaining = currentSeconds * 1000;
      schedule();
    },
    dispose() {
      suspend();
      disposed = true;
    },
  };
}
