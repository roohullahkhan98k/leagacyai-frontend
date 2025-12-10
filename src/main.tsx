// Import i18n config first to ensure it's initialized before React components use it
import './i18n/config';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Import and render app
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
