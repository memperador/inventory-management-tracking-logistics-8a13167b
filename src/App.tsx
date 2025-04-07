
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { TenantProvider } from '@/contexts/TenantContext';
import { RoleProvider } from '@/contexts/RoleContext';
import { Toaster } from '@/components/ui/sonner';

// Pages
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Inventory from '@/pages/Inventory';
import Projects from '@/pages/Projects';
import ProjectDetail from '@/pages/ProjectDetail';
import Settings from '@/pages/Settings';
import AIAssistant from '@/pages/AIAssistant';
import Users from '@/pages/Users';
import NotFound from '@/pages/NotFound';
import Unauthorized from '@/pages/Unauthorized';
import ResetPassword from '@/pages/ResetPassword';
import Onboarding from '@/pages/Onboarding';
import AccountPage from '@/pages/AccountPage';
import Analytics from '@/pages/Analytics';
import GPSIntegration from '@/pages/GPSIntegration';
import WorkflowPage from '@/pages/WorkflowPage';
import PaymentPage from '@/pages/PaymentPage';

// Components
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { StripeProvider } from '@/components/payment/StripeProvider';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <TenantProvider>
            <RoleProvider>
              <StripeProvider>
                <Router>
                  <Routes>
                    <Route path="/login" element={<Auth />} />
                    <Route path="/signup" element={<Auth mode="signup" />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    
                    <Route 
                      path="/" 
                      element={
                        <ProtectedRoute>
                          <AppLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<Dashboard />} />
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="inventory" element={<Inventory />} />
                      <Route path="projects" element={<Projects />} />
                      <Route path="project/:id" element={<ProjectDetail />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="ai-assistant" element={<AIAssistant />} />
                      <Route path="users" element={<Users />} />
                      <Route path="account" element={<AccountPage />} />
                      <Route path="analytics" element={<Analytics />} />
                      <Route path="gps" element={<GPSIntegration />} />
                      <Route path="workflow" element={<WorkflowPage />} />
                      <Route path="payment" element={<PaymentPage />} />
                      <Route path="onboarding" element={<Onboarding />} />
                      <Route path="unauthorized" element={<Unauthorized />} />
                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Routes>
                </Router>
                <Toaster position="top-right" />
              </StripeProvider>
            </RoleProvider>
          </TenantProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
