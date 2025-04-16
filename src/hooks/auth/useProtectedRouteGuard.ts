
import { useAuth } from '@/hooks/useAuthContext';
import { useRole } from '@/hooks/useRoleContext';
import { UserRole } from '@/types/roles';
import { useSubscriptionCheck } from './useSubscriptionCheck';
import { useOnboardingCheck } from './useOnboardingCheck';

export const useProtectedRouteGuard = (requiredRoles: UserRole[] = []) => {
  const { user, loading } = useAuth();
  const { hasPermission, isRoleLoading } = useRole();
  const { needsSubscription, isLoading: subscriptionLoading } = useSubscriptionCheck();
  const { needsOnboarding, isLoading: onboardingLoading } = useOnboardingCheck();

  const hasRequiredRole = !requiredRoles.length || hasPermission(requiredRoles);

  return {
    isLoading: loading || isRoleLoading || subscriptionLoading || onboardingLoading,
    isAuthenticated: !!user,
    needsSubscription,
    needsOnboarding,
    hasRequiredRole,
    user
  };
};
