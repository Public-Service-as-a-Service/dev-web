import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppShell } from '@sundsvall/chrome';
import { StartPage } from './StartPage';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppShell>
      <StartPage />
    </AppShell>
  </React.StrictMode>,
);
