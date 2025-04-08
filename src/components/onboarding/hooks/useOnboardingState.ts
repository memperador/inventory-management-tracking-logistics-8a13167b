
import { useState, useEffect } from 'react';
import { OnboardingStep, OnboardingState } from '../types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTenant } from '@/hooks/useTenantContext';

// Define the initial onboarding steps
const initialOnboardingSteps: OnboardingStep[] = [
  {
    id: 'organization-profile',
    title: 'Complete Organization Profile',
    description: 'Add your company details and logo to personalize your account.',
    completed: false,
    aiPrompt: 'I need help setting up my organization profile. What information should I include?'
  },
  {
    id: 'industry-codes',
    title: 'Configure Industry Codes',
    description: 'Set up the industry-specific codes you\'ll use for your inventory and assets.',
    completed: false,
    aiPrompt: 'How do I select the right industry codes for my business? I\'m in the construction industry.'
  },
  {
    id: 'import-inventory',
    title: 'Import Initial Inventory',
    description: 'Add your first items to the inventory system or import a spreadsheet.',
    completed: false,
    aiPrompt: 'What\'s the best way to start importing my inventory? Do you have a template spreadsheet I can use?'
  },
  {
    id: 'setup-alerts',
    title: 'Configure Inventory Alerts',
    description: 'Set up notifications for low stock, maintenance due dates, and compliance issues.',
    completed: false,
    aiPrompt: 'What kind of inventory alerts should I set up? What are the best practices?'
  },
  {
    id: 'invite-team',
    title: 'Invite Team Members',
    description: 'Add your colleagues to collaborate on inventory management.',
    completed: false,
    aiPrompt: 'How do I set appropriate access permissions when inviting my team members?'
  }
];

export const useOnboardingState = () => {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id || 'default';
  
  const [onboardingState, setOnboardingState] = useLocalStorage<OnboardingState>(
    `onboarding-state-${tenantId}`,
    {
      steps: initialOnboardingSteps,
      currentStepIndex: 0,
      isComplete: false
    }
  );

  const setStepCompleted = (stepId: string, isCompleted: boolean = true) => {
    setOnboardingState((prev) => {
      const updatedSteps = prev.steps.map((step) =>
        step.id === stepId ? { ...step, completed: isCompleted } : step
      );
      
      // Calculate if all steps are complete
      const allComplete = updatedSteps.every(step => step.completed);
      
      return {
        ...prev,
        steps: updatedSteps,
        isComplete: allComplete
      };
    });
  };

  const setCurrentStep = (index: number) => {
    if (index >= 0 && index < onboardingState.steps.length) {
      setOnboardingState((prev) => ({
        ...prev,
        currentStepIndex: index
      }));
    }
  };

  const resetOnboarding = () => {
    setOnboardingState({
      steps: initialOnboardingSteps,
      currentStepIndex: 0,
      isComplete: false
    });
  };

  const skipOnboarding = () => {
    const completedSteps = onboardingState.steps.map(step => ({
      ...step,
      completed: true
    }));
    
    setOnboardingState({
      steps: completedSteps,
      currentStepIndex: completedSteps.length - 1,
      isComplete: true
    });
  };

  return {
    onboardingState,
    currentStep: onboardingState.steps[onboardingState.currentStepIndex],
    setStepCompleted,
    setCurrentStep,
    resetOnboarding,
    skipOnboarding,
    goToNextStep: () => setCurrentStep(onboardingState.currentStepIndex + 1),
    goToPreviousStep: () => setCurrentStep(onboardingState.currentStepIndex - 1),
  };
};
