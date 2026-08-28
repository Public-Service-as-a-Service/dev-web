import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppShell } from '../components/AppShell';
import { Parkeringstillstand } from '../pages/handskrivna/Parkeringstillstand';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppShell>
      <Parkeringstillstand />
    </AppShell>
  </React.StrictMode>,
);
