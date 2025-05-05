
import React, { useEffect } from 'react';
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
import { ErrorPanel } from '@/components/debug/ErrorPanel';
import { DebugPanel } from '@/components/debug/DebugPanel';
import { SecureCache } from '@/contexts/auth/utils/secureCache';
import { cleanSessionCache } from '@/contexts/auth/utils/sessionUtils';

// Configure the query client with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30 * 1000, // 30 seconds
      refetchOnWindowFocus: false,
      meta: {
        onError: (error) => {
          console.error('Query error:', error);
        }
      }
    },
    mutations: {
      retry: 1,
      meta: {
        onError: (error) => {
          console.error('Mutation error:', error);
        }
      }
    },
  },
});

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize secure services and cleanup on component unmount
  useEffect(() => {
    // Initialize secure cache
    SecureCache.init();
    
    // Set up periodic cleanup for session cache
    const sessionCacheInterval = setInterval(() => {
      cleanSessionCache();
    }, 5 * 60 * 1000); // Every 5 minutes
    
    return () => {
      // Clean up when component unmounts
      SecureCache.stop();
      clearInterval(sessionCacheInterval);
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
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
                    <ErrorPanel />
                    <DebugPanel />
                  </AIAssistantProvider>
                </NotificationProvider>
              </RoleProvider>
            </ThemeProvider>
          </TenantProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};
