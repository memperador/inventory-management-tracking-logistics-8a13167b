
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { publicRoutes, protectedRoutes } from './routes/routeConfig';
import { AuthProvider } from '@/contexts/auth/AuthContext';
import { TenantProvider } from '@/contexts/TenantContext';
import { RoleProvider } from '@/contexts/RoleContext';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TenantProvider>
          <RoleProvider>
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
          </RoleProvider>
        </TenantProvider>
      </AuthProvider>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
