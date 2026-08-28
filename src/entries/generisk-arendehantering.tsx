import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppShell } from '../components/AppShell';
import { GeneriskArendehantering } from '../pages/handskrivna/GeneriskArendehantering';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppShell>
      <GeneriskArendehantering />
    </AppShell>
  </React.StrictMode>,
);
