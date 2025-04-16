
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppProviders } from './providers/AppProviders';
import { publicRoutes, protectedRoutes } from './routes/routeConfig';

// Import emergency fix utilities
import './utils/admin/fixLabratAdmin';
import './utils/auth/breakLoginLoop';

function App() {
  return (
    <AppProviders>
      <Routes>
        {publicRoutes.map((route) => (
          <Route key={route.path} {...route} />
        ))}
        {protectedRoutes.map((route) => (
          <Route key={route.path} {...route} />
        ))}
      </Routes>
    </AppProviders>
  );
}

export default App;
