import { useState, type ReactNode } from 'react';
import styles from './RemoteImage.module.css';

interface Props {
  src: string;
  alt: string;
  /** Соотношение сторон блока — место занято заранее, вёрстка не прыгает. */
  ratio?: string;
  /** contain — для планировок: чертёж целиком, без обрезки. */
  fit?: 'cover' | 'contain';
  /** Белый лист под планировкой: застройщики рисуют их на белом фоне. */
  sheet?: boolean;
  /** Что показать, если сайт застройщика не отдал картинку. */
  fallback?: ReactNode;
  eager?: boolean;
  className?: string;
  /** Сообщить наверх, что картинки нет, — например, чтобы убрать обложку целиком. */
  onFailed?: () => void;
}

/** Изображение с сайта застройщика: по ссылке, без отправки Referer, с запасным вариантом. */
export function RemoteImage({
  src,
  alt,
  ratio = '4 / 3',
  fit = 'cover',
  sheet = false,
  fallback,
  eager,
  className,
  onFailed,
}: Props) {
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [prevSrc, setPrevSrc] = useState(src);
  if (src !== prevSrc) {
    setPrevSrc(src);
    setState('loading');
  }

  return (
    <span
      className={[styles.frame, sheet ? styles.sheet : '', className].filter(Boolean).join(' ')}
      style={{ aspectRatio: ratio }}
      data-state={state}
    >
      {state === 'error' ? (
        (fallback ?? <span className={styles.unavailable}>Изображение недоступно на сайте застройщика</span>)
      ) : (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
          className={styles.img}
          style={{ objectFit: fit }}
          onLoad={() => setState('loaded')}
          onError={() => {
            setState('error');
            onFailed?.();
          }}
        />
      )}
    </span>
  );
}
