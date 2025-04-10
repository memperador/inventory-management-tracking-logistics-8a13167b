
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import OnboardingAssistant from '@/components/onboarding/OnboardingAssistant';
import TieredAIAssistant from '@/components/ai/TieredAIAssistant';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useOnboardingState } from '@/components/onboarding/hooks/useOnboardingState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OnboardingWorkflow from '@/components/onboarding/OnboardingWorkflow';
import { useAuth } from '@/hooks/useAuthContext';
import { useTenant } from '@/hooks/useTenantContext';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

const CustomerOnboarding: React.FC = () => {
  const { onboardingState } = useOnboardingState();
  const [aiInput, setAiInput] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('guide');
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  
  // Check if this is a first-time setup
  useEffect(() => {
    if (user && currentTenant) {
      logAuth('ONBOARDING', 'User accessed onboarding page', {
        level: AUTH_LOG_LEVELS.INFO,
        force: true,
        data: {
          userId: user.id,
          tenantId: currentTenant.id,
          tenantName: currentTenant.name,
          isFirstVisit: !currentTenant.onboarding_completed
        }
      });
    }
  }, [user, currentTenant]);
  
  // Function to be passed to OnboardingAssistant to set AI prompt
  const handleOpenAIAssistant = (prompt?: string) => {
    if (prompt) {
      setAiInput(prompt);
      toast({
        title: "AI Assistant",
        description: "Your question has been sent to the AI Assistant. You can modify it if needed.",
      });
    }
  };

  // When onboarding is complete
  const handleOnboardingComplete = () => {
    logAuth('ONBOARDING', 'User completed onboarding', {
      level: AUTH_LOG_LEVELS.INFO,
      force: true,
      data: {
        userId: user?.id,
        tenantId: currentTenant?.id
      }
    });
    
    toast({
      title: "Onboarding Complete!",
      description: "You've successfully completed the onboarding process. Enjoy using our platform!",
    });
    navigate('/dashboard');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Customer Onboarding"
        description="Let's get your account set up and ready to use"
      />
      
      {onboardingState.isComplete ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Onboarding Complete! 🎉</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            You've successfully set up your account. You can now start using all the features of our platform.
          </p>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </div>
      ) : (
        <>
          <Tabs 
            defaultValue="guide" 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="guide">Step-by-Step Guide</TabsTrigger>
              <TabsTrigger value="workflow">Workflow View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="guide">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <OnboardingAssistant onOpenAIAssistant={handleOpenAIAssistant} />
                </div>
                
                <div>
                  <TieredAIAssistant initialInput={aiInput} />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="workflow">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <OnboardingWorkflow />
                </div>
                
                <div>
                  <TieredAIAssistant initialInput={aiInput} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default CustomerOnboarding;
