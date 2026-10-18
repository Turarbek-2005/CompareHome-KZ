import { Component, type ReactNode } from 'react';

interface State {
  error: Error | null;
}

/** Последний рубеж: вместо пустого экрана — объяснение и способ продолжить. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error(error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="page" style={{ paddingTop: 48, display: 'grid', gap: 12, justifyItems: 'start' }}>
        <h1 style={{ fontSize: 'var(--t-l)' }}>Экран не открылся</h1>
        <p className="secondary">Произошла ошибка в приложении. Перезапустите его — сравнение и избранное сохранены.</p>
        <button type="button" className="btn btn-primary" onClick={() => window.location.assign('/catalog')}>
          Перезапустить
        </button>
      </div>
    );
  }
}
