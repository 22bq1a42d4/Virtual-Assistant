import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import logger to ensure it's initialized
import logger from './utils/loggerMiddleware';

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', event => {
  logger.error('SYSTEM', 'Unhandled promise rejection', {
    reason: event.reason,
    promise: event.promise
  });
  console.error('Unhandled promise rejection:', event.reason);
});

// Global error handler for uncaught exceptions
window.addEventListener('error', event => {
  logger.error('SYSTEM', 'Uncaught error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error?.stack
  });
  console.error('Uncaught error:', event.error);
});

// Create root and render app
const root = ReactDOM.createRoot(document.getElementById('root'));

// Log application startup
logger.info('SYSTEM', 'React application mounting', {
  timestamp: new Date().toISOString(),
  userAgent: navigator.userAgent,
  url: window.location.href
});

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Log when app is fully loaded
window.addEventListener('load', () => {
  logger.info('SYSTEM', 'Application fully loaded', {
    loadTime: performance.now(),
    timestamp: new Date().toISOString()
  });
});

// Service worker registration (optional, for PWA capabilities)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        logger.info('SYSTEM', 'Service worker registered', {
          scope: registration.scope
        });
      })
      .catch((error) => {
        logger.error('SYSTEM', 'Service worker registration failed', {
          error: error.message
        });
      });
  });
}