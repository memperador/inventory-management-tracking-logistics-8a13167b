
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Projects from "./pages/Projects";
import Analytics from "./pages/Analytics";
import Users from "./pages/Users";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import GPSIntegration from "./pages/GPSIntegration";
import PaymentPage from "./pages/PaymentPage";
import WorkflowPage from "./pages/WorkflowPage";
import AccountPage from "./pages/AccountPage";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Unauthorized from "./pages/Unauthorized";
import ApplicationDocumentation from "./docs/ApplicationDocumentation";
import { TenantProvider } from "./contexts/TenantContext";
import { AuthProvider } from "./contexts/AuthContext";
import { RoleProvider } from "./contexts/RoleContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { StripeProvider } from "./components/payment/StripeProvider";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import UnderConstruction from "./components/common/UnderConstruction";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TenantProvider>
            <RoleProvider>
              <ThemeProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <Routes>
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/auth/reset-password" element={<ResetPassword />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    
                    {/* Base protected route - requires authentication */}
                    <Route element={<ProtectedRoute />}>
                      <Route element={<AppLayout />}>
                        {/* Dashboard as the main page */}
                        <Route index element={<Dashboard />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        {/* Redirect /equipment to /inventory */}
                        <Route path="equipment" element={<Navigate to="/inventory" replace />} />
                        <Route path="inventory" element={<Inventory />} />
                        <Route path="projects" element={<Projects />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="account" element={<AccountPage />} />
                        <Route path="documentation" element={<ApplicationDocumentation />} />
                        
                        {/* Admin-only routes */}
                        <Route element={<ProtectedRoute requiredRoles={['admin']} redirectTo="/unauthorized" />}>
                          <Route path="users" element={<Users />} />
                        </Route>
                        
                        {/* Manager and above routes */}
                        <Route element={<ProtectedRoute requiredRoles={['manager', 'admin']} redirectTo="/unauthorized" />}>
                          <Route path="reports" element={<UnderConstruction pageName="Reports" />} />
                          <Route path="billing" element={<UnderConstruction pageName="Billing" />} />
                        </Route>

                        {/* Operator and above routes */}
                        <Route element={<ProtectedRoute requiredRoles={['operator', 'manager', 'admin']} redirectTo="/unauthorized" />}>
                          <Route path="gps-integration" element={<GPSIntegration />} />
                          <Route path="scheduling" element={<UnderConstruction pageName="Scheduling" />} />
                          <Route path="maintenance" element={<UnderConstruction pageName="Maintenance" />} />
                          <Route path="fleet" element={<UnderConstruction pageName="Fleet" />} />
                          <Route path="materials" element={<UnderConstruction pageName="Materials" />} />
                          <Route path="workflow" element={<WorkflowPage />} />
                        </Route>
                        
                        {/* All authenticated users routes */}
                        <Route path="settings" element={<Settings />} />
                        <Route path="notifications" element={<UnderConstruction pageName="Notifications" />} />
                        <Route path="support" element={<UnderConstruction pageName="Support" />} />
                        <Route path="chat" element={<UnderConstruction pageName="Chat" />} />
                        <Route path="payments" element={
                          <StripeProvider>
                            <PaymentPage />
                          </StripeProvider>
                        } />
                      </Route>
                    </Route>
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </TooltipProvider>
              </ThemeProvider>
            </RoleProvider>
          </TenantProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
