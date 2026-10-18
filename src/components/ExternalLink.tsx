import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import type { ReactNode } from 'react';

/** Ссылка на внешний сайт: в приложении открывается во встроенном браузере, а не вместо приложения. */
export function ExternalLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={className}
      onClick={(e) => {
        if (!Capacitor.isNativePlatform()) return;
        e.preventDefault();
        void Browser.open({ url: href });
      }}
    >
      {children}
    </a>
  );
}
