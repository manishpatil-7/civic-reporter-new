import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#FFFFFF',
          color: '#111827',
          border: '1px solid #E5E7EB',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        },
        success: {
          iconTheme: { primary: '#10B981', secondary: '#FFFFFF' },
        },
        error: {
          iconTheme: { primary: '#DC2626', secondary: '#FFFFFF' },
        },
      }}
    />
  </StrictMode>,
);
