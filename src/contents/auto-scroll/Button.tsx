import { StrictMode } from 'react'
import ReactDOM, { Container } from 'react-dom/client';
import MuiButton from '@mui/material/Button';
import PlayCircle from '@mui/icons-material/PlayCircle';
import Page from '@src/pages/layout/Page.tsx';

export function Button() {
  return (
    <MuiButton
      variant="contained"
      startIcon={<PlayCircle/>}>
      自动翻页
    </MuiButton>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function render(el: Container) {
  ReactDOM.createRoot(el).render(
    <StrictMode>
      <Page>
        <Button/>
      </Page>
    </StrictMode>
  );
}
