import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppShell } from '../components/AppShell';
import { MarkOchExploatering } from '../pages/handskrivna/MarkOchExploatering';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppShell>
      <MarkOchExploatering />
    </AppShell>
  </React.StrictMode>,
);
