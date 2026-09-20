export type Completion = { id: string; league: number; track: number; timeMs: number };
type QueueStorage = Pick<Storage, 'getItem' | 'setItem'>;
const QUEUE_KEY = 'dril-moto:pending-completions:v1';

const isCompletion = (value: unknown): value is Completion => {
  if (!value || typeof value !== 'object') return false;
  const c = value as Completion;
  return (
    typeof c.id === 'string' &&
    /^[0-9a-f-]{36}$/i.test(c.id) &&
    Number.isInteger(c.league) &&
    c.league >= 0 &&
    c.league <= 2 &&
    Number.isInteger(c.track) &&
    c.track >= 0 &&
    c.track <= 2 &&
    Number.isInteger(c.timeMs) &&
    c.timeMs > 0 &&
    c.timeMs <= 86400000
  );
};

export function createMotoCounter(
  endpoint: string,
  onTotal: (total: string) => void,
  storage?: QueueStorage,
  request: typeof fetch = fetch
) {
  const readQueue = (): Completion[] => {
    try {
      const data: unknown = JSON.parse(storage?.getItem(QUEUE_KEY) ?? '[]');
      return Array.isArray(data) ? data.filter(isCompletion) : [];
    } catch {
      return [];
    }
  };
  const writeQueue = (items: Completion[]) => {
    try {
      storage?.setItem(QUEUE_KEY, JSON.stringify(items));
    } catch {
      /* In-memory retries still work. */
    }
  };
  const pending = new Map(readQueue().map((item) => [item.id, item]));
  let flushing = false;
  let refreshing = false;
  let latest = '0';

  const send = async (options: RequestInit) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      return await request(endpoint, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  };

  const acceptTotal = async (response: Response) => {
    if (!response.ok) throw new Error('Counter request failed');
    const data: unknown = await response.json();
    const total = (data as { total?: unknown } | null)?.total;
    if (typeof total !== 'string' || !/^\d{1,19}$/.test(total)) throw new Error('Invalid counter');
    // A delayed GET must not overwrite the newer total returned by a finish.
    if (BigInt(total) >= BigInt(latest)) {
      latest = total;
      onTotal(total);
    }
  };

  const refresh = async () => {
    if (refreshing) return;
    refreshing = true;
    try {
      await acceptTotal(await send({ cache: 'no-store' }));
    } catch {
      /* Keep the last confirmed total; retry on the next refresh. */
    } finally {
      refreshing = false;
    }
  };

  const flush = async () => {
    if (flushing) return;
    flushing = true;
    try {
      for (const item of readQueue()) pending.set(item.id, item);
      for (const [id, item] of pending) {
        const response = await send({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
          keepalive: true,
        });
        if (response.status !== 400 && response.status !== 415) await acceptTotal(response);
        pending.delete(id);
        writeQueue(readQueue().filter((entry) => entry.id !== id));
      }
    } catch {
      /* Keep the same IDs for retries, including after reload or loss of connectivity. */
    } finally {
      flushing = false;
    }
  };

  return {
    refresh,
    flush,
    record(item: Completion) {
      if (!isCompletion(item)) return;
      pending.set(item.id, item);
      writeQueue([
        ...new Map([...readQueue(), ...pending.values()].map((entry) => [entry.id, entry])).values(),
      ]);
      void flush();
    },
  };
}
