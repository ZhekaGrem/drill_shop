'use client';
// Turntable-медіа картки каталогу: статичний постер (кадр 0, ~15 КБ)
// вантажиться одразу, а анімований WebP (~300 КБ) підвантажується лише
// коли картка реально у вьюпорті — трафік іде тільки за видиме.
// Анімація стартує з того ж кадру, що постер, тож підміна безшовна.
// prefers-reduced-motion: анімація не вмикається взагалі.
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface TurntableMediaProps {
  poster: string;
  animated: string;
  alt: string;
  className?: string;
}

export const TurntableMedia = ({ poster, animated, alt, className }: TurntableMediaProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLive(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {/* unoptimized: анімований webp оптимізатор Next однаково віддає as-is,
          а постер — крихітний перший кадр того самого рендера */}
      <Image
        src={live ? animated : poster}
        alt={alt}
        width={480}
        height={600}
        className={className}
        loading="lazy"
        unoptimized
      />
    </div>
  );
};
