import React from 'react'
import ReactDOM from 'react-dom/client'

import Page from './Page.tsx'

import './index.scss';

export function render(app: React.ReactNode):void {
  ReactDOM.createRoot(document.getElementById('app')!).render(
    <React.StrictMode>
      <Page>
        {app}
      </Page>
    </React.StrictMode>,
  )
}
