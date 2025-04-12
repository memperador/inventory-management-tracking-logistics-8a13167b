
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Import emergency login functionality for global availability
import './utils/auth/emergencyLabratLogin';

// Make emergencyLabratLogin available in the window object
if (typeof window !== 'undefined') {
  try {
    const { emergencyLabratLogin } = require('./utils/auth/emergencyLabratLogin');
    (window as any).emergencyLabratLogin = emergencyLabratLogin;
  } catch (e) {
    console.error('Failed to set up emergency login:', e);
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
