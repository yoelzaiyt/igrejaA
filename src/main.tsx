import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Totem / Kiosk Mode restrictions
if (typeof window !== 'undefined') {
  // Prevent context menu (right click / long press)
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  // Prevent dragging of images/links
  document.addEventListener('dragstart', (e) => e.preventDefault());
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
