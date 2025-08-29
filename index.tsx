import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Construct the URL to the service worker from the origin to avoid path resolution issues in sandboxed environments.
    const swUrl = `${window.location.origin}/sw.js`;
    navigator.serviceWorker.register(swUrl).then(registration => {
      console.log('Service Worker registered: ', registration);
    }).catch(registrationError => {
      console.log('Service Worker registration failed: ', registrationError);
    });
  });
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);