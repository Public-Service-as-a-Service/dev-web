import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppShell } from './components/AppShell';
import { DesignPrinciperPage } from './pages/DesignPrinciperPage';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppShell>
      <DesignPrinciperPage />
    </AppShell>
  </React.StrictMode>,
);
