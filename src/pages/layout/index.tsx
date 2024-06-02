import React from 'react';
import ReactDOM from 'react-dom/client';
import { Runtime } from '@src/core/runtime.ts';

import Page from './Page.tsx';
import './index.scss';

export async function render(App: React.FC<{ runtime: Runtime }>) {
  const runtime = await Runtime.getInstance();

  ReactDOM.createRoot(document.getElementById('app')!).render(
    <React.StrictMode>
      <Page>
        <App runtime={runtime} />
      </Page>
    </React.StrictMode>,
  );
}
