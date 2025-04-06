
import React, { useState } from 'react';
import { OrganizationDetailsForm } from '@/components/tenant/OrganizationDetailsForm';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const Onboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tenantId, setTenantId] = useState<string | null>(null);

  React.useEffect(() => {
    const initializeOnboarding = async () => {
      try {
        // Fetch or create tenant for the current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('No user found');
        }

        const { data: existingTenant, error: tenantError } = await supabase
          .from('tenants')
          .select('*')
          .eq('name', user.email)
          .single();

        if (tenantError && tenantError.code !== 'PGRST116') {
          throw tenantError;
        }

        let tenantRecord;
        if (!existingTenant) {
          // Create a new tenant if not exists
          const { data, error } = await supabase
            .from('tenants')
            .insert({ 
              name: user.email || 'New Tenant',
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (error) throw error;
          tenantRecord = data;
        } else {
          tenantRecord = existingTenant;
        }

        setTenantId(tenantRecord.id);
      } catch (error) {
        console.error('Onboarding initialization error:', error);
        toast({
          title: 'Error',
          description: 'Failed to initialize onboarding process.',
          variant: 'destructive'
        });
      }
    };

    initializeOnboarding();
  }, []);

  const steps = [
    {
      component: OrganizationDetailsForm,
      title: 'Organization Details'
    },
    // Future steps will be added here
  ];

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {steps[currentStep].title}
        </h1>
        {tenantId && (
          <CurrentStepComponent 
            tenantId={tenantId} 
            onNextStep={handleNextStep} 
          />
        )}
      </div>
    </div>
  );
}

export default Onboarding;
