
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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
import Auth from "./pages/Auth";
import { TenantProvider } from "./contexts/TenantContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { StripeProvider } from "./components/payment/StripeProvider";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TenantProvider>
            <ThemeProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/" element={<AppLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="equipment" element={<Equipment />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="users" element={<Users />} />
                    <Route path="gps-integration" element={<GPSIntegration />} />
                    <Route path="analytics" element={<Dashboard />} /> 
                    <Route path="reports" element={<Dashboard />} />
                    <Route path="scheduling" element={<Dashboard />} />
                    <Route path="maintenance" element={<Dashboard />} />
                    <Route path="fleet" element={<Dashboard />} />
                    <Route path="inventory" element={<Dashboard />} />
                    <Route path="settings" element={<Dashboard />} />
                    <Route path="notifications" element={<Dashboard />} />
                    <Route path="documentation" element={<Dashboard />} />
                    <Route path="support" element={<Dashboard />} />
                    <Route path="billing" element={<Dashboard />} />
                    <Route path="chat" element={<Dashboard />} />
                    <Route path="payments" element={
                      <StripeProvider>
                        <PaymentPage />
                      </StripeProvider>
                    } />
                    <Route path="workflow" element={<WorkflowPage />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TooltipProvider>
            </ThemeProvider>
          </TenantProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
