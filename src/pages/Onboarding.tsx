
import React, { useState, useEffect } from 'react';
import { OrganizationDetailsForm } from '@/components/tenant/OrganizationDetailsForm';
import { IndustryCodeCustomization } from '@/components/tenant/IndustryCodeCustomization';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { CheckCircle } from 'lucide-react';
import { useTenant } from '@/hooks/useTenantContext';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

const Onboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { currentTenant } = useTenant();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeOnboarding = async () => {
      setIsInitializing(true);
      try {
        // Log component mount
        logAuth('ONBOARDING', 'Onboarding page mounted', {
          level: AUTH_LOG_LEVELS.INFO,
          force: true,
          data: {
            timestamp: new Date().toISOString(),
            currentPath: window.location.pathname,
            currentUrl: window.location.href,
            hasTenant: !!currentTenant?.id,
            tenantId: currentTenant?.id || 'none'
          }
        });

        // Check if we already have a tenant from context
        if (currentTenant?.id) {
          logAuth('ONBOARDING', `Using existing tenant from context: ${currentTenant.id}`, {
            level: AUTH_LOG_LEVELS.INFO,
            force: true
          });
          setTenantId(currentTenant.id);
          setIsInitializing(false);
          return;
        }

        // If no tenant in context, try to fetch the user's tenant
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('No user found');
        }

        logAuth('ONBOARDING', `Fetching tenant for user: ${user.id}`, {
          level: AUTH_LOG_LEVELS.INFO,
          force: true
        });

        const { data: userTenant, error: userTenantError } = await supabase
          .from('users')
          .select('tenant_id')
          .eq('id', user.id)
          .single();

        if (userTenantError) {
          logAuth('ONBOARDING', `Error fetching user tenant: ${userTenantError.message}`, {
            level: AUTH_LOG_LEVELS.ERROR,
            force: true,
            data: userTenantError
          });
          throw userTenantError;
        }

        if (userTenant?.tenant_id) {
          logAuth('ONBOARDING', `Found user tenant: ${userTenant.tenant_id}`, {
            level: AUTH_LOG_LEVELS.INFO,
            force: true
          });
          setTenantId(userTenant.tenant_id);
          setIsInitializing(false);
          return;
        }

        // If somehow we got here without a tenant, log an error
        logAuth('ONBOARDING', 'No tenant found for user, application should have redirected', {
          level: AUTH_LOG_LEVELS.ERROR,
          force: true
        });
        
        toast({
          title: 'Error',
          description: 'No organization found. Please contact support.',
          variant: 'destructive'
        });

      } catch (error) {
        console.error('Onboarding initialization error:', error);
        logAuth('ONBOARDING', 'Onboarding initialization error', {
          level: AUTH_LOG_LEVELS.ERROR,
          force: true,
          data: error
        });
        
        toast({
          title: 'Error',
          description: 'Failed to initialize onboarding process.',
          variant: 'destructive'
        });
      } finally {
        setIsInitializing(false);
      }
    };

    initializeOnboarding();
  }, [currentTenant]);

  const steps = [
    {
      component: OrganizationDetailsForm,
      title: 'Organization Details'
    },
    {
      component: IndustryCodeCustomization,
      title: 'Industry Code Customization'
    }
    // Future steps will be added here
  ];

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep].component;

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Loading Onboarding...</h2>
          <Progress value={100} className="h-2 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!tenantId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Organization Setup Required</h2>
          <p className="mb-4 text-muted-foreground">
            We couldn't find an organization associated with your account.
          </p>
          <Button 
            onClick={() => window.location.href = '/dashboard'}
            className="mt-4"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold">Onboarding Wizard</h1>
            <span className="text-sm text-gray-500">Step {currentStep + 1} of {steps.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
          
          <div className="flex justify-between mt-4">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`flex flex-col items-center ${
                  index === currentStep 
                    ? 'text-primary' 
                    : index < currentStep 
                      ? 'text-green-600' 
                      : 'text-gray-400'
                }`}
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 border ${
                    index === currentStep 
                      ? 'border-primary' 
                      : index < currentStep 
                        ? 'border-green-600 bg-green-100' 
                        : 'border-gray-300'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span className="text-xs text-center">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-6">
          {steps[currentStep].title}
        </h2>
        
        <CurrentStepComponent 
          tenantId={tenantId} 
          onNextStep={handleNextStep} 
        />
      </div>
    </div>
  );
}

export default Onboarding;
