import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import App from './App';
import './index.css';
import './App.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css'; 
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <BrowserRouter>
        <Notifications />
        <App />
      </BrowserRouter>
    </MantineProvider>
  </StrictMode>
);
