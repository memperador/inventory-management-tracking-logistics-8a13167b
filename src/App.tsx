
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Equipment from "./pages/Equipment";
import Projects from "./pages/Projects";
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
import { TenantProvider } from "./contexts/TenantContext";
import { AuthProvider } from "./contexts/AuthContext";
import { RoleProvider } from "./contexts/RoleContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { StripeProvider } from "./components/payment/StripeProvider";
import ProtectedRoute from "./components/auth/ProtectedRoute";

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
                        <Route index element={<Dashboard />} />
                        <Route path="equipment" element={<Equipment />} />
                        <Route path="projects" element={<Projects />} />
                        <Route path="account" element={<AccountPage />} />
                        
                        {/* Admin-only routes */}
                        <Route element={<ProtectedRoute requiredRoles={['admin']} redirectTo="/unauthorized" />}>
                          <Route path="users" element={<Users />} />
                        </Route>
                        
                        {/* Manager and above routes */}
                        <Route element={<ProtectedRoute requiredRoles={['manager', 'admin']} redirectTo="/unauthorized" />}>
                          <Route path="analytics" element={<Dashboard />} /> 
                          <Route path="reports" element={<Dashboard />} />
                          <Route path="billing" element={<Dashboard />} />
                        </Route>

                        {/* Operator and above routes */}
                        <Route element={<ProtectedRoute requiredRoles={['operator', 'manager', 'admin']} redirectTo="/unauthorized" />}>
                          <Route path="gps-integration" element={<GPSIntegration />} />
                          <Route path="scheduling" element={<Dashboard />} />
                          <Route path="maintenance" element={<Dashboard />} />
                          <Route path="fleet" element={<Dashboard />} />
                          <Route path="inventory" element={<Dashboard />} />
                          <Route path="workflow" element={<WorkflowPage />} />
                        </Route>
                        
                        {/* All authenticated users routes */}
                        <Route path="settings" element={<Settings />} />
                        <Route path="notifications" element={<Dashboard />} />
                        <Route path="documentation" element={<Dashboard />} />
                        <Route path="support" element={<Dashboard />} />
                        <Route path="chat" element={<Dashboard />} />
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
