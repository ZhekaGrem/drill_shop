// Екран гри «Дріл Мото»: iframe з бандлом public/moto/ на весь вʼюпорт,
// скелетон до повідомлення ready, таймаут 8 с з повтором, вихід і події GA
// за повідомленнями гри (контракт — moto-bridge.ts; спека, секції 1 і 3).
'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { sendGAEvent } from '@next/third-parties/google';
import { Button } from '@/shared/components/Button/Button';
import { SiteLoader } from '@/shared/components/SiteLoader/SiteLoader';
import { content } from '@/shared/config/content';
import { buildMotoSrc, parseMotoMessage, readSiteTheme } from './moto-bridge';
import { useMotoCounter } from './useMotoCounter';
import styles from './moto.module.scss';

type Status = 'loading' | 'ready' | 'failed';
type AppRouter = ReturnType<typeof useRouter>;

const READY_TIMEOUT_MS = 8000;
const noopSubscribe = () => () => {};

// Спека (секція 3): назад, лише якщо попередній запис історії — сторінка сайту;
// /moto відкрили напряму чи прийшли з іншого сайту — на головну. Navigation API
// бачить лише записи нашого origin (history.length рахує й чужі); без нього —
// history.length і referrer документа з нашого origin.
const canGoBackInSite = () => {
  const nav = (window as Window & { navigation?: { canGoBack: boolean } }).navigation;
  if (nav) return nav.canGoBack;
  return window.history.length > 1 && document.referrer.startsWith(`${window.location.origin}/`);
};

const leaveGame = (router: AppRouter) => {
  if (canGoBackInSite()) router.back();
  else router.push('/');
};

export function MotoScreen() {
  const router = useRouter();
  const { total, record } = useMotoCounter();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const openSentRef = useRef(false);
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
  const [src] = useState(() => buildMotoSrc(readSiteTheme()));
  const [status, setStatus] = useState<Status>('loading');
  // Ключ iframe: «Спробувати ще раз» монтує новий елемент. Зміна src того ж
  // iframe додала б запис в історію, і «Вийти» повертало б у гру, а не назад.
  const [attempt, setAttempt] = useState(0);

  // Ref, а не просто []: StrictMode у dev монтує ефекти двічі — подія одна.
  useEffect(() => {
    if (openSentRef.current) return;
    openSentRef.current = true;
    sendGAEvent('event', 'moto_open');
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const frame = frameRef.current;
      if (event.origin !== window.location.origin || !frame || event.source !== frame.contentWindow) return;
      const message = parseMotoMessage(event.data);
      if (message?.type === 'ready') {
        setStatus('ready');
        // Фокус у гру: без нього стрілки на десктопі йдуть сторінці, а не грі.
        frame.contentWindow?.focus();
      } else if (message?.type === 'exit') {
        leaveGame(router);
      } else if (message?.type === 'finished') {
        const { league, track, timeMs, best } = message;
        sendGAEvent('event', 'moto_finish', { league, track, time_ms: timeMs, best });
        if (message.finishId) record({ id: message.finishId, league, track, timeMs: Math.round(timeMs) });
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [router, record]);

  useEffect(() => {
    if (!hydrated || status !== 'loading') return;
    const timer = window.setTimeout(() => setStatus('failed'), READY_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [hydrated, status, attempt]);

  const retry = () => {
    setStatus('loading');
    setAttempt((n) => n + 1);
  };

  return (
    <main className={styles.screen}>
      <div className={styles.counter} title={content.moto.counterDescription}>
        <span>{content.moto.counterLabel}</span>
        <output aria-live="polite" aria-atomic="true" aria-label={content.moto.counterDescription}>
          {total === null ? '…' : BigInt(total).toLocaleString('uk-UA')}
        </output>
      </div>
      <div className={styles.stage}>
        {hydrated && (
          <iframe
            key={attempt}
            ref={frameRef}
            className={styles.frame}
            src={src}
            title={content.moto.frameTitle}
            allow="fullscreen"
          />
        )}
        {status === 'loading' && (
          <div className={styles.overlay}>
            <SiteLoader fill />
          </div>
        )}
        {status === 'failed' && (
          <div className={styles.failed} role="alert">
            <p className={styles.failedText}>{content.moto.loadError}</p>
            <Button variant="primary" onClick={retry}>
              {content.moto.retry}
            </Button>
            <Button variant="ghost" onClick={() => leaveGame(router)}>
              {content.moto.exit}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
