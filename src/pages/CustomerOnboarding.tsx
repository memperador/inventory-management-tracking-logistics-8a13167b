
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useTenant } from '@/hooks/useTenantContext';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import OnboardingCompletedView from '@/components/onboarding/OnboardingCompletedView';
import OnboardingInProgressView from '@/components/onboarding/OnboardingInProgressView';

const CustomerOnboarding: React.FC = () => {
  const { currentTenant, setCurrentTenant } = useTenant();
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Log when component mounts to verify redirection works
    logAuth('ONBOARDING', 'CustomerOnboarding page mounted', {
      level: AUTH_LOG_LEVELS.INFO,
      force: true,
      data: {
        timestamp: new Date().toISOString(),
        currentPath: window.location.pathname,
        currentUrl: window.location.href,
        referrer: document.referrer,
        hasTenant: !!currentTenant?.id,
        tenantId: currentTenant?.id || 'none',
        tenantSubscriptionStatus: currentTenant?.subscription_status || 'none',
        tenantOnboardingStatus: currentTenant?.onboarding_completed
      }
    });
    
    // Check actual onboarding status from database if we have a tenant
    const verifyOnboardingStatus = async () => {
      if (currentTenant?.id) {
        try {
          const { data, error } = await supabase
            .from('tenants')
            .select('onboarding_completed')
            .eq('id', currentTenant.id)
            .single();
          
          if (error) {
            throw error;
          }
          
          // Log the actual value from database for debugging
          logAuth('ONBOARDING', `Database onboarding status: ${data.onboarding_completed}`, {
            level: AUTH_LOG_LEVELS.INFO,
            force: true,
            data: {
              fromDb: data.onboarding_completed,
              fromContext: currentTenant?.onboarding_completed,
              tenantId: currentTenant.id
            }
          });
          
          // Set the onboarding status - explicitly store null, true, or false
          setOnboardingStatus(data.onboarding_completed === true ? true : data.onboarding_completed === false ? false : null);
          
          // If tenant is already onboarded but the context doesn't reflect it, update the context
          if (data.onboarding_completed === true && currentTenant.onboarding_completed !== true) {
            setCurrentTenant({
              ...currentTenant,
              onboarding_completed: true
            });
          }
        } catch (error) {
          console.error("Error fetching onboarding status:", error);
        }
      }
    };
    
    verifyOnboardingStatus();
    
    // Check if we need to show a notification for successful trial start
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('trial') === 'started') {
      toast({
        title: "Free Trial Started",
        description: "Your 7-day Premium tier trial has begun. Enjoy all Premium features!",
      });
    }
  }, [currentTenant?.id, currentTenant?.subscription_status, currentTenant?.onboarding_completed, setCurrentTenant]);
  
  // If onboarding is already completed, show alternate view
  if (onboardingStatus === true) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <OnboardingCompletedView />
      </div>
    );
  }
  
  // Standard view for uncompleted onboarding
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <OnboardingInProgressView 
        currentTenant={currentTenant}
        setCurrentTenant={setCurrentTenant}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        acceptTerms={acceptTerms}
        setAcceptTerms={setAcceptTerms}
      />
    </div>
  );
};

export default CustomerOnboarding;
