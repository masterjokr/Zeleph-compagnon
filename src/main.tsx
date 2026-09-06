import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { OAuthCallback } from './components/OAuthCallback.tsx';
import './index.css';

const isOAuthCallback = window.location.pathname.startsWith('/auth/callback');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isOAuthCallback ? <OAuthCallback /> : <App />}
  </StrictMode>,
);
