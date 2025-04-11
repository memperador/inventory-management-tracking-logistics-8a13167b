
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Tenant } from '@/types/tenant';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import OnboardingHeader from './OnboardingHeader';
import CompletionSteps from './CompletionSteps';
import WhatsNextSection from './WhatsNextSection';
import TermsCheckbox from './TermsCheckbox';

interface OnboardingInProgressViewProps {
  currentTenant: Tenant | null;
  setCurrentTenant: (tenant: Tenant) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  acceptTerms: boolean;
  setAcceptTerms: (terms: boolean) => void;
}

const OnboardingInProgressView: React.FC<OnboardingInProgressViewProps> = ({
  currentTenant,
  setCurrentTenant,
  isLoading,
  setIsLoading,
  acceptTerms,
  setAcceptTerms
}) => {
  const completionSteps = [
    { id: 'account', label: 'Account created', completed: true },
    { id: 'subscription', label: 'Subscription activated', completed: true },
    { id: 'tenant', label: 'Organization setup', completed: !!currentTenant?.id }
  ];
  
  const handleComplete = async () => {
    if (!acceptTerms) {
      toast({
        title: "Please accept the terms",
        description: "You must accept the terms and conditions to continue.",
        variant: "destructive"
      });
      return;
    }
    
    if (!currentTenant?.id) {
      toast({
        title: "Setup error",
        description: "There was an error with your account setup. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      logAuth('ONBOARDING', 'Completing customer onboarding', {
        level: AUTH_LOG_LEVELS.INFO,
        force: true,
        data: {
          tenantId: currentTenant.id,
          timestamp: new Date().toISOString()
        }
      });
      
      // Update tenant with onboarding completed
      const { error } = await supabase
        .from('tenants')
        .update({ onboarding_completed: true })
        .eq('id', currentTenant.id);
      
      if (error) {
        logAuth('ONBOARDING', `Error updating tenant onboarding status: ${error.message}`, {
          level: AUTH_LOG_LEVELS.ERROR,
          force: true,
          data: { error }
        });
        throw error;
      }
      
      // Update user metadata
      const { error: userError } = await supabase.auth.updateUser({
        data: { 
          onboarding_completed: true,
          needs_subscription: false
        }
      });
      
      if (userError) {
        logAuth('ONBOARDING', `Error updating user metadata: ${userError.message}`, {
          level: AUTH_LOG_LEVELS.ERROR,
          force: true,
          data: { userError }
        });
      }
      
      // Update tenant state
      if (currentTenant) {
        setCurrentTenant({
          ...currentTenant,
          onboarding_completed: true
        });
      }
      
      logAuth('ONBOARDING', 'Onboarding completed successfully, redirecting to dashboard', {
        level: AUTH_LOG_LEVELS.INFO,
        force: true
      });
      
      toast({
        title: "Setup Complete",
        description: "Your account has been fully configured, welcome!",
      });
      
      // Navigate to dashboard using React Router's navigate
      window.location.href = '/dashboard';
    } catch (error) {
      console.error("Error completing onboarding:", error);
      
      logAuth('ONBOARDING', 'Error completing onboarding', {
        level: AUTH_LOG_LEVELS.ERROR,
        force: true,
        data: error instanceof Error ? 
          { message: error.message, stack: error.stack } : 
          { error: String(error) }
      });
      
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-2xl">
      <OnboardingHeader isCompleted={false} />
      <CardContent className="pt-6">
        <div className="space-y-6">
          <CompletionSteps steps={completionSteps} />
          <WhatsNextSection />
          <TermsCheckbox 
            acceptTerms={acceptTerms} 
            setAcceptTerms={setAcceptTerms}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleComplete}
          disabled={isLoading || !acceptTerms}
          className="space-x-2"
        >
          <span>Continue to Dashboard</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OnboardingInProgressView;
