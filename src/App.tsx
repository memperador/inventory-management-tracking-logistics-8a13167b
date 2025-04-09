
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { NotificationProvider } from '@/contexts/NotificationContext';
import Dashboard from '@/pages/Dashboard';
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Projects from '@/pages/Projects';
import ProjectDetail from '@/pages/ProjectDetail';
import Inventory from '@/pages/Inventory';
import AccountPage from '@/pages/AccountPage';
import Settings from '@/pages/Settings';
import Unauthorized from '@/pages/Unauthorized';
import GPSIntegration from '@/pages/GPSIntegration';
import RequestManagement from '@/pages/RequestManagement';
import RFIDetail from '@/pages/RFIDetail';
import Analytics from '@/pages/Analytics';
import Onboarding from '@/pages/Onboarding';
import ResetPassword from '@/pages/ResetPassword';
import TwoFactorAuth from '@/pages/TwoFactorAuth';
import Users from '@/pages/Users';
import PaymentPage from '@/pages/PaymentPage';
import AIAssistant from '@/pages/AIAssistant';
import WorkflowPage from '@/pages/WorkflowPage';
import Notifications from '@/pages/Notifications';
import { RoleProvider } from '@/contexts/RoleContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { TenantProvider } from '@/contexts/TenantContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

// Helper component to handle project redirect
const ProjectRedirect = () => {
  const { projectId } = useParams();
  return <Navigate to={`/projects/${projectId}`} replace />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <TenantProvider>
            <ThemeProvider>
              <RoleProvider>
                <NotificationProvider>
                  <Routes>
                    {/* Auth Routes - Accessible without authentication */}
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/auth/reset-password" element={<ResetPassword />} />
                    <Route path="/auth/two-factor" element={<TwoFactorAuth />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route path="/login" element={<Navigate to="/auth" replace />} />
                    
                    {/* Root redirects to dashboard if authenticated, otherwise to auth page */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/404" element={<NotFound />} />
                    
                    <Route path="/onboarding" element={<ProtectedRoute redirectTo="/auth"><Onboarding /></ProtectedRoute>} />

                    {/* Add redirect for incorrect "project" (singular) URL to "projects" (plural) */}
                    <Route path="/project/:projectId" element={<ProjectRedirect />} />

                    {/* Protected routes that require authentication */}
                    <Route element={<ProtectedRoute redirectTo="/auth"><AppLayout /></ProtectedRoute>}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/projects/:projectId" element={<ProjectDetail />} />
                      <Route path="/inventory" element={<Inventory />} />
                      <Route path="/account" element={<AccountPage />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/gps" element={<GPSIntegration />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/requests" element={<RequestManagement />} />
                      <Route path="/requests/:requestId" element={<RFIDetail />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="/payment" element={<PaymentPage />} />
                      <Route path="/ai-assistant" element={<AIAssistant />} />
                      <Route path="/workflow" element={<WorkflowPage />} />
                    </Route>

                    {/* Add a catch-all 404 route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Toaster />
                </NotificationProvider>
              </RoleProvider>
            </ThemeProvider>
          </TenantProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
