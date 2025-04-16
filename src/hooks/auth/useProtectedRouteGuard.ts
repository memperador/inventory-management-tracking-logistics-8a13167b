
import { useAuth } from '@/hooks/useAuthContext';
import { useRole } from '@/hooks/useRoleContext';
import { UserRole } from '@/types/roles';
import { useSubscriptionCheck } from './useSubscriptionCheck';
import { useOnboardingCheck } from './useOnboardingCheck';
import { useEffect } from 'react';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

export const useProtectedRouteGuard = (requiredRoles: UserRole[] = []) => {
  const { user, loading: authLoading } = useAuth();
  const { hasPermission, isRoleLoading } = useRole();
  const { needsSubscription, isLoading: subscriptionLoading } = useSubscriptionCheck();
  const { needsOnboarding, isLoading: onboardingLoading } = useOnboardingCheck();

  const hasRequiredRole = !requiredRoles.length || hasPermission(requiredRoles);
  const isLoading = authLoading || isRoleLoading || subscriptionLoading || onboardingLoading;

  // Log protected route checks for debugging
  useEffect(() => {
    if (!isLoading && user) {
      logAuth('PROTECTED-ROUTE', 'Route guard check complete', {
        level: AUTH_LOG_LEVELS.INFO,
        data: {
          userId: user.id,
          email: user.email,
          isAuthenticated: !!user,
          needsSubscription,
          needsOnboarding,
          hasRequiredRole,
          requiredRoles: requiredRoles.join(', '),
          currentPath: window.location.pathname
        }
      });
    }
  }, [isLoading, user, needsSubscription, needsOnboarding, hasRequiredRole, requiredRoles]);

  return {
    isLoading,
    isAuthenticated: !!user,
    needsSubscription,
    needsOnboarding,
    hasRequiredRole,
    user
  };
};
