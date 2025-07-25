import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Runtime } from '@src/core/runtime.ts';

import Page from './Page.tsx';
import './index.scss';
import { RuntimeContext } from '@src/pages/hooks/useRuntime.tsx';

// eslint-disable-next-line react-refresh/only-export-components
function Main({ App }: { App: React.FC<{ runtime: Runtime | null }> }) {
  const [runtime, updateRuntime] = useState<Runtime | null>(null);

  useEffect(() => {
    Runtime.getInstance().then(runtime => updateRuntime(runtime));
  }, []);

  return (
    <React.StrictMode>
      <Page>
        <RuntimeContext.Provider value={runtime}>
          <App runtime={runtime} />
        </RuntimeContext.Provider>
      </Page>
    </React.StrictMode>
  );
}

export async function render(App: React.FC<{ runtime: Runtime | null }>) {
  ReactDOM.createRoot(document.getElementById('app')!).render(<Main App={App} />);
}
