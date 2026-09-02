import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppShell } from './components/AppShell';
import { EkosystemetPage } from './pages/EkosystemetPage';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppShell>
      <EkosystemetPage />
    </AppShell>
  </React.StrictMode>,
);
