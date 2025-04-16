
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuthContext';
import { checkUserSubscriptionAccess } from '@/utils/subscription/userMigrationUtils';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

export const useSubscriptionCheck = () => {
  const { user } = useAuth();
  const [checkedSubscription, setCheckedSubscription] = useState(false);
  const [needsSubscription, setNeedsSubscription] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAccess = async () => {
      if (!user?.id) {
        // No user, no subscription needed
        setNeedsSubscription(false);
        setCheckedSubscription(true);
        setIsLoading(false);
        return;
      }
      
      if (checkedSubscription) {
        // Already checked for this session
        setIsLoading(false);
        return;
      }

      try {
        // Check if user needs subscription from metadata
        const needsSubscriptionFromMetadata = user.user_metadata?.needs_subscription === true;
        
        // Special case for labrat user
        if (user.email === 'labrat@iaware.com') {
          setNeedsSubscription(false);
          setCheckedSubscription(true);
          setIsLoading(false);
          return;
        }
        
        // Check subscription access
        const subscriptionCheck = await checkUserSubscriptionAccess(user.id);
        
        logAuth('SUBSCRIPTION-CHECK', 'Subscription status check', {
          level: AUTH_LOG_LEVELS.INFO,
          data: {
            userId: user.id,
            fromMetadata: needsSubscriptionFromMetadata,
            hasAccess: subscriptionCheck.hasAccess
          }
        });
        
        setNeedsSubscription(needsSubscriptionFromMetadata || !subscriptionCheck.hasAccess);
      } catch (error) {
        logAuth('SUBSCRIPTION-CHECK', 'Error checking subscription', {
          level: AUTH_LOG_LEVELS.ERROR,
          data: error
        });
        
        // Default to not requiring subscription on error to prevent blocking users
        setNeedsSubscription(false);
      } finally {
        setCheckedSubscription(true);
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [user, checkedSubscription]);

  return {
    checkedSubscription,
    needsSubscription,
    isLoading
  };
};
