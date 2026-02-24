import React from 'react';
import ReactDOM from 'react-dom/client';
import { ServerTimeProvider } from './context/ServerTimeContext';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <ServerTimeProvider>
        <App />
      </ServerTimeProvider>
    </AuthProvider>
  </React.StrictMode>,
);
