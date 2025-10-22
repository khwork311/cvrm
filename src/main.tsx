import 'flatpickr/dist/flatpickr.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'swiper/swiper-bundle.css';
import App from './App.tsx';
import { AppWrapper } from './components/common/PageMeta.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import './i18n/config';
import './index.css';
import { AbilityProvider } from './lib/casl/index.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AbilityProvider userRole="admin">
        <AppWrapper>
          <App />
        </AppWrapper>
      </AbilityProvider>
    </ThemeProvider>
  </StrictMode>
);
