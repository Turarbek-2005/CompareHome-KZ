import { useFavorites } from '../store/favorites';
import { useAppToast } from './useAppToast';

export function FavoriteToggle({ id }: { id: string }) {
  const saved = useFavorites((s) => s.ids.includes(id));
  const toggle = useFavorites((s) => s.toggle);
  const say = useAppToast();
  return (
    <button
      type="button"
      className="btn btn-block"
      aria-pressed={saved}
      onClick={() => say(toggle(id) ? 'Сохранено в избранное' : 'Убрано из избранного')}
    >
      {saved ? 'В избранном' : 'Сохранить в избранное'}
    </button>
  );
}
