
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
        {publicRoutes.map((route) => {
          const { element, path, children } = route;
          return (
            <Route key={path} path={path} element={element}>
              {children?.map(child => (
                <Route key={child.path} path={child.path} element={child.element} />
              ))}
            </Route>
          );
        })}
        {protectedRoutes.map((route) => {
          const { element, path, children } = route;
          return (
            <Route key={path} path={path} element={element}>
              {children?.map(child => (
                <Route key={child.path} path={child.path} element={child.element} />
              ))}
            </Route>
          );
        })}
      </Routes>
    </AppProviders>
  );
}

export default App;
