
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuthContext';
import { useTenant } from '@/hooks/useTenantContext';
import { useRole } from '@/hooks/useRoleContext';
import { UserRole } from '@/types/roles';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { checkUserSubscriptionAccess } from '@/utils/subscription/userMigrationUtils';

export const useProtectedRouteGuard = (requiredRoles: UserRole[] = []) => {
  const { user, loading } = useAuth();
  const { currentTenant, loading: tenantLoading } = useTenant();
  const { hasPermission, isRoleLoading } = useRole();
  const [checkedSubscription, setCheckedSubscription] = useState(false);
  const [needsSubscription, setNeedsSubscription] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Effect for subscription and onboarding checks
  useEffect(() => {
    const checkAccess = async () => {
      if (!user?.id || checkedSubscription) return;

      try {
        // Check if user needs subscription from metadata
        const needsSubscriptionFromMetadata = user.user_metadata?.needs_subscription === true;
        
        // Check onboarding status from tenant data
        const needsOnboardingFromTenant = currentTenant && currentTenant.onboarding_completed === false;
        
        // Check subscription access
        const subscriptionCheck = await checkUserSubscriptionAccess(user.id);
        
        logAuth('SUBSCRIPTION-CHECK', 'Subscription status check in protected route', {
          level: AUTH_LOG_LEVELS.INFO,
          data: {
            userId: user.id,
            fromMetadata: needsSubscriptionFromMetadata,
            needsOnboarding: needsOnboardingFromTenant,
            hasAccess: subscriptionCheck.hasAccess
          }
        });
        
        setNeedsSubscription(needsSubscriptionFromMetadata || !subscriptionCheck.hasAccess);
        setNeedsOnboarding(needsOnboardingFromTenant === true);
        
      } catch (error) {
        logAuth('SUBSCRIPTION-CHECK', 'Error checking subscription', {
          level: AUTH_LOG_LEVELS.ERROR,
          data: error
        });
      } finally {
        setCheckedSubscription(true);
      }
    };

    checkAccess();
  }, [user, currentTenant, checkedSubscription]);

  const hasRequiredRole = !requiredRoles.length || hasPermission(requiredRoles);

  return {
    isLoading: loading || isRoleLoading || tenantLoading || !checkedSubscription,
    isAuthenticated: !!user,
    needsSubscription,
    needsOnboarding,
    hasRequiredRole,
    user
  };
};
