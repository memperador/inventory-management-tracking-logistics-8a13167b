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
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';

const queryClient = new QueryClient();

const ProjectRedirect = () => {
  const { projectId } = useParams();
  return <Navigate to={`/projects/${projectId}`} replace />;
};

const RootRedirect = () => {
  return <Navigate to="/auth" replace />;
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
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/auth/reset-password" element={<ResetPassword />} />
                    <Route path="/auth/two-factor" element={<TwoFactorAuth />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route path="/login" element={<Navigate to="/auth" replace />} />
                    <Route path="/" element={<RootRedirect />} />
                    <Route path="/404" element={<NotFound />} />
                    <Route path="/onboarding" element={<ProtectedRoute redirectTo="/auth"><Onboarding /></ProtectedRoute>} />
                    <Route path="/project/:projectId" element={<ProjectRedirect />} />
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
                    <Route path="*" element={<NotFound />} />
                    <Route path="/terms-of-service" element={<TermsOfService />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
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
