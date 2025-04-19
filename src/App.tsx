
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { publicRoutes, protectedRoutes } from './routes/routeConfig';
import { AppProviders } from './providers/AppProviders';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AppProviders>
      <Routes>
        {/* Public routes */}
        {publicRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={route.element}
          />
        ))}
        
        {/* Protected routes */}
        {protectedRoutes.map((route) => (
          <Route
            key={route.path || 'protected-parent'}
            path={route.path}
            element={route.element}
          >
            {route.children?.map((childRoute) => (
              <Route
                key={childRoute.path}
                path={childRoute.path}
                element={childRoute.element}
              />
            ))}
          </Route>
        ))}
        
        {/* Catch all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </AppProviders>
  );
}

export default App;
