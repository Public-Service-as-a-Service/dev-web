import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppShell } from '@sundsvall/chrome';
import { SwaggerPage, type SwaggerPageData } from '../pages/SwaggerPage';
import { readPageData } from '../types';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppShell>
      <SwaggerPage data={readPageData<SwaggerPageData>()} />
    </AppShell>
  </React.StrictMode>,
);
