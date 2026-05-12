import React from 'react';
import ReactDOM from 'react-dom/client';
import { ServerTimeProvider } from './context/ServerTimeContext';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <React.StrictMode>
    <ServerTimeProvider>
      <App />
    </ServerTimeProvider>
  </React.StrictMode>,
);
