import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppShell } from '../components/AppShell';
import { AppPage, type AppPageData } from '../pages/AppPage';
import { readPageData } from '../types';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppShell>
      <AppPage data={readPageData<AppPageData>()} />
    </AppShell>
  </React.StrictMode>,
);
