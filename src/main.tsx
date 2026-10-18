import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

/* Ionic: только базовые стили, нужные компонентам. */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';

/* Geologica с осями веса и резкости, локально — работает без сети. */
import '@fontsource-variable/geologica/shrp.css';

import './theme/tokens.css';
import './theme/ionic-overrides.css';
import './theme/global.css';
import './theme/ui.css';

import { App } from './app/App';
import { ErrorBoundary } from './app/ErrorBoundary';
import { initNative } from './app/native';
import { persistMaxAge, persister, queryClient } from './data/queryClient';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: persistMaxAge, buster: 'v2' }}
    >
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </PersistQueryClientProvider>
  </StrictMode>,
);

void initNative();
