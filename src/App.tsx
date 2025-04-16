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
import { AuthProvider } from '@/contexts/auth/AuthContext';
import { TenantProvider } from '@/contexts/TenantContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { RoleProvider } from '@/contexts/RoleContext';
import { AIAssistantProvider } from '@/components/layout/AIAssistantProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import { useState, useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import CustomerOnboarding from './pages/CustomerOnboarding';
import { AutoAdminRoleFixer } from './components/admin/AutoAdminRoleFixer';
import EmergencyLabratLogin from './components/admin/EmergencyLabratLogin';

// Import our emergency fix utilities
import './utils/admin/fixLabratAdmin';
import './utils/auth/breakLoginLoop';

// Create a new query client
const queryClient = new QueryClient();

// Special direct login page for Labrat user
const LabratLoginPage = () => {
  // Track page loads to detect potential issues
  useEffect(() => {
    console.log('[LABRAT-LOGIN] Page loaded at', new Date().toISOString());
    
    // Store login page visit in session
    const visits = parseInt(sessionStorage.getItem('login_page_visits') || '0') + 1;
    sessionStorage.setItem('login_page_visits', visits.toString());
    
    // Check for excessive visits (potential loop)
    if (visits > 5) {
      console.warn('[LABRAT-LOGIN] Multiple login page visits detected, possible loop');
      sessionStorage.setItem('potential_auth_loop', 'true');
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">FleetTrack Emergency Access</h1>
        <EmergencyLabratLogin />
        <p className="text-center mt-4">
          <a href="/auth" className="text-blue-600 hover:underline">
            Return to normal login
          </a>
        </p>
      </div>
    </div>
  );
};

const ProjectRedirect = () => {
  const { projectId } = useParams();
  return <Navigate to={`/projects/${projectId}`} replace />;
};

const RootRedirect = () => {
  console.log('[APP] RootRedirect component rendering');
  
  // Check for auth loop detection
  const potentialLoop = sessionStorage.getItem('potential_auth_loop') === 'true';
  const breakLoop = sessionStorage.getItem('break_auth_loop') === 'true';
  
  // If loop detected, force to auth directly
  if (potentialLoop || breakLoop) {
    console.log('[APP] Loop detected, redirecting to auth with bypass');
    return <Navigate to="/auth?bypass=loop&emergency=true" replace />;
  }
  
  // Otherwise, direct to labrat emergency login page
  return <Navigate to="/labrat-login" replace />;
};

// Log uncaught errors
const logError = (error: any, info: any) => {
  console.error('[APP-ERROR] Uncaught error:', error);
  console.error('[APP-ERROR] Component stack:', info.componentStack);
};

function App() {
  // Using state to hold user ID to pass to TenantProvider
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Log app initialization
  useEffect(() => {
    console.log('[APP] Initializing App component', {
      timestamp: new Date().toISOString(),
      currentPath: window.location.pathname,
      url: window.location.href,
      redirectCount: sessionStorage.getItem('redirect_count') || '0'
    });
    
    // Log any navigation state in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const returnTo = urlParams.get('returnTo');
    if (returnTo) {
      console.log(`[APP] Return URL detected in query params: ${returnTo}`);
    }
    
    // Log any auth-related URL parameters
    const authParams = [
      'email_confirmed', 'token', 'error_code', 'error_description', 
      'type', 'access_token', 'refresh_token', 'emergency', 'bypass', 'recovery'
    ];
    
    const foundAuthParams: Record<string, string> = {};
    authParams.forEach(param => {
      const value = urlParams.get(param);
      if (value) {
        foundAuthParams[param] = param.includes('token') ? 'REDACTED' : value;
      }
    });
    
    if (Object.keys(foundAuthParams).length > 0) {
      console.log('[APP] Auth-related URL parameters detected:', foundAuthParams);
    }
    
    // Self-healing: Check for too many redirects
    const redirectCount = parseInt(sessionStorage.getItem('redirect_count') || '0');
    if (redirectCount > 10) {
      console.warn('[APP] Too many redirects detected, resetting counters and breaking potential loop');
      sessionStorage.setItem('redirect_count', '0');
      sessionStorage.setItem('break_auth_loop', 'true');
    }
  }, []);
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider onUserChange={(userId) => {
            console.log(`[APP] Auth user change detected, userId: ${userId || 'null'}`);
            setCurrentUserId(userId);
          }}>
            <TenantProvider userId={currentUserId}>
              <ThemeProvider>
                <RoleProvider>
                  <NotificationProvider>
                    <AIAssistantProvider>
                      {/* Place AutoAdminRoleFixer at the top level to run on every page */}
                      <AutoAdminRoleFixer />
                      <Routes>
                        <Route path="/labrat-login" element={<LabratLoginPage />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/auth/reset-password" element={<ResetPassword />} />
                        <Route path="/auth/two-factor" element={<TwoFactorAuth />} />
                        <Route path="/unauthorized" element={<Unauthorized />} />
                        <Route path="/login" element={<Navigate to="/auth" replace />} />
                        <Route path="/" element={<RootRedirect />} />
                        <Route path="/404" element={<NotFound />} />
                        <Route path="/onboarding" element={<ProtectedRoute redirectTo="/auth"><Onboarding /></ProtectedRoute>} />
                        <Route path="/customer-onboarding" element={<ProtectedRoute redirectTo="/auth"><CustomerOnboarding /></ProtectedRoute>} />
                        <Route path="/project/:projectId" element={<ProjectRedirect />} />
                        <Route path="/payment" element={<PaymentPage />} />
                        <Route path="/" element={<ProtectedRoute redirectTo="/auth"><AppLayout>Outlet placeholder</AppLayout></ProtectedRoute>}>
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
                          <Route path="/ai-assistant" element={<AIAssistant />} />
                          <Route path="/workflow" element={<WorkflowPage />} />
                        </Route>
                        <Route path="*" element={<NotFound />} />
                        <Route path="/terms-of-service" element={<TermsOfService />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                      </Routes>
                      <Toaster />
                    </AIAssistantProvider>
                  </NotificationProvider>
                </RoleProvider>
              </ThemeProvider>
            </TenantProvider>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
