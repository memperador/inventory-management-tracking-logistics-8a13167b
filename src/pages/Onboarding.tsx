
import React, { useState } from 'react';
import { OrganizationDetailsForm } from '@/components/tenant/OrganizationDetailsForm';
import { IndustryCodeCustomization } from '@/components/tenant/IndustryCodeCustomization';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { CheckCircle } from 'lucide-react';

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
