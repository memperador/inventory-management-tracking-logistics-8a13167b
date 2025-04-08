
import React, { useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOnboardingState } from './hooks/useOnboardingState';
import OnboardingProgress from './OnboardingProgress';
import { Bot, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

interface OnboardingAssistantProps {
  onOpenAIAssistant: (prompt?: string) => void;
}

const OnboardingAssistant: React.FC<OnboardingAssistantProps> = ({ onOpenAIAssistant }) => {
  const {
    onboardingState,
    currentStep,
    setStepCompleted,
    goToNextStep,
    goToPreviousStep,
    skipOnboarding,
  } = useOnboardingState();

  const handleCompleteStep = () => {
    if (currentStep) {
      setStepCompleted(currentStep.id, true);
      if (onboardingState.currentStepIndex < onboardingState.steps.length - 1) {
        goToNextStep();
      }
    }
  };

  const handleAskAssistant = () => {
    if (currentStep && currentStep.aiPrompt) {
      onOpenAIAssistant(currentStep.aiPrompt);
    } else {
      onOpenAIAssistant(`I need help with the "${currentStep?.title}" step of onboarding.`);
    }
  };

  // Get navigation state
  const isFirstStep = onboardingState.currentStepIndex === 0;
  const isLastStep = onboardingState.currentStepIndex === onboardingState.steps.length - 1;

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle>Welcome to Your Onboarding Guide</CardTitle>
        <CardDescription>
          Follow these steps to set up your account and get the most out of our platform.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <OnboardingProgress
          steps={onboardingState.steps}
          currentIndex={onboardingState.currentStepIndex}
        />
        
        <div className="bg-muted/50 rounded-lg p-4 border">
          <h3 className="text-lg font-medium mb-2">{currentStep?.title}</h3>
          <p className="text-muted-foreground mb-4">{currentStep?.description}</p>
          
          <Button
            variant="outline"
            className="flex items-center gap-2 mb-4"
            onClick={handleAskAssistant}
          >
            <Bot size={16} />
            <span>Ask AI Assistant for help</span>
          </Button>
          
          {currentStep?.id === 'organization-profile' && (
            <Button variant="default" asChild className="w-full">
              <a href="/settings" className="flex items-center justify-center gap-2">
                Go to Organization Settings <ExternalLink size={16} />
              </a>
            </Button>
          )}
          
          {currentStep?.id === 'industry-codes' && (
            <Button variant="default" asChild className="w-full">
              <a href="/onboarding" className="flex items-center justify-center gap-2">
                Configure Industry Codes <ExternalLink size={16} />
              </a>
            </Button>
          )}
          
          {currentStep?.id === 'import-inventory' && (
            <Button variant="default" asChild className="w-full">
              <a href="/inventory" className="flex items-center justify-center gap-2">
                Go to Inventory <ExternalLink size={16} />
              </a>
            </Button>
          )}
          
          {currentStep?.id === 'setup-alerts' && (
            <Button variant="default" asChild className="w-full">
              <a href="/inventory?tab=alerts" className="flex items-center justify-center gap-2">
                Configure Alerts <ExternalLink size={16} />
              </a>
            </Button>
          )}
          
          {currentStep?.id === 'invite-team' && (
            <Button variant="default" asChild className="w-full">
              <a href="/users" className="flex items-center justify-center gap-2">
                Invite Team Members <ExternalLink size={16} />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <div>
          {!isFirstStep && (
            <Button 
              variant="outline" 
              onClick={goToPreviousStep}
              className="flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="ghost" onClick={skipOnboarding} className="text-muted-foreground">
            Skip
          </Button>
          
          <Button 
            onClick={handleCompleteStep} 
            disabled={currentStep?.completed && !isLastStep}
            className="flex items-center"
          >
            {currentStep?.completed ? (Completed) : "Mark as Complete"} 
            {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default OnboardingAssistant;
