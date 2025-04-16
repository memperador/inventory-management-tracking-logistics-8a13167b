
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/auth/AuthContext';
import { TenantProvider } from '@/contexts/TenantContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { RoleProvider } from '@/contexts/RoleContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { AIAssistantProvider } from '@/components/layout/AIAssistantProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AutoAdminRoleFixer } from '@/components/admin/AutoAdminRoleFixer';
import { Toaster } from '@/components/ui/toaster';

const queryClient = new QueryClient();

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider onUserChange={(userId) => {
            console.log(`[APP] Auth user change detected, userId: ${userId || 'null'}`);
          }}>
            <TenantProvider>
              <ThemeProvider>
                <RoleProvider>
                  <NotificationProvider>
                    <AIAssistantProvider>
                      <AutoAdminRoleFixer />
                      {children}
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
};
