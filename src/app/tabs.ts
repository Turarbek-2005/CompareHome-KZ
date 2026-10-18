import { useLocation } from 'react-router-dom';

export const TABS = ['catalog', 'map', 'compare', 'favorites', 'more'] as const;
export type Tab = (typeof TABS)[number];

export function currentTab(pathname: string): Tab {
  const first = pathname.split('/')[1] as Tab;
  return TABS.includes(first) ? first : 'catalog';
}

/**
 * Карточки открываются внутри текущей вкладки (/compare/apartment/…),
 * чтобы у каждой вкладки был свой стек и кнопка «Назад» вела куда ожидается.
 */
export function useTabHref() {
  const { pathname } = useLocation();
  const tab = currentTab(pathname);
  return (path: string) => `/${tab}${path}`;
}
